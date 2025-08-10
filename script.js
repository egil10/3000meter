// Global variables and state management
let currentPaceData = null;
let paceChart = null;
let deltaChart = null;
let currentLane = 1;
let currentStrategy = 'even';
let surges = [];
let isProMode = false;
let isNorwegian = true;
let debounceTimer = null;

// Animation state variables
let animationState = {
    isPlaying: false,
    currentTime: 0,
    totalTime: 0,
    speed: 1, // 1x, 2x, 4x, 8x
    currentDistance: 0,
    currentLap: 0,
    lapProgress: 0,
    animationId: null,
    startTime: 0,
    lastUpdateTime: 0
};

// Animation speeds
const ANIMATION_SPEEDS = [1, 2, 4, 8];
const SPEED_LABELS = ['1x', '2x', '4x', '8x'];

// Track geometry constants
const TRACK_CONSTANTS = {
    LANE_WIDTH: 1.22, // meters
    STRAIGHT_LENGTH: 84.39, // meters
    CURVE_RADIUS_LANE1: 36.5, // meters
    TOTAL_DISTANCE: 3000, // meters
    LAPS: 7.5
};

// Lane distances (precomputed)
const LANE_DISTANCES = {
    1: 400.0,
    2: 407.04,
    3: 414.08,
    4: 421.12,
    5: 428.16,
    6: 435.20,
    7: 442.24,
    8: 449.28
};

// Track visualization variables
let lanePaths = [];
let totalLen = 0;
let lane1 = null;

// DOM elements
const elements = {
    goalTime: document.getElementById('goalTime'),
    laneSelect: document.getElementById('laneSelect'),
    strategyButtons: document.querySelectorAll('.strategy-btn'),
    progressiveSection: document.getElementById('progressiveSection'),
    startPace: document.getElementById('startPace'),
    endPace: document.getElementById('endPace'),
    curveType: document.getElementById('curveType'),
    addSurgeBtn: document.getElementById('addSurgeBtn'),
    surgeList: document.getElementById('surgeList'),
    calculateBtn: document.getElementById('calculateBtn'),
    printBtn: document.getElementById('printBtn'),
    shareBtn: document.getElementById('shareBtn'),
    languageToggle: document.getElementById('languageToggle'),
    proModeToggle: document.getElementById('proModeToggle'),
    toggleCharts: document.getElementById('toggleCharts'),
    chartsContainer: document.getElementById('chartsContainer'),
    paceChart: document.getElementById('paceChart'),
    deltaChart: document.getElementById('deltaChart'),
    splitsTable: document.getElementById('splitsTable'),
    tabButtons: document.querySelectorAll('.tab-btn'),
    targetTimeDisplay: document.getElementById('targetTimeDisplay'),
    overallPace: document.getElementById('overallPace'),
    avgSpeed: document.getElementById('avgSpeed'),
    lapCount: document.getElementById('lapCount'),
    runnerDot: document.getElementById('runner-dot'),
    roundIndicators: document.getElementById('round-indicators'),
    lapProgressFill: document.getElementById('lap-progress-fill'),
    currentLap: document.getElementById('currentLap'),
    currentDistance: document.getElementById('currentDistance'),
    currentTime: document.getElementById('currentTime'),
    progressPercent: document.getElementById('progressPercent'),
    roundList: document.getElementById('roundList'),
    playPauseBtn: document.getElementById('playPauseBtn'),
    resetBtn: document.getElementById('resetBtn'),
    speedBtn: document.getElementById('speedBtn'),
    speedDisplay: document.getElementById('speedDisplay'),
    restoreSession: document.getElementById('restoreSession')
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadFromURL();
    restoreSession();
    calculatePace();
});

// Initialize application
function initializeApp() {
    drawTrack();
    setupServiceWorker();
    updateLanguageUI();
    updateProModeUI();
    
    // Initialize animation controls
    elements.speedBtn.innerHTML = `<i class="fas fa-tachometer-alt"></i> ${SPEED_LABELS[0]}`;
    elements.speedDisplay.textContent = `${SPEED_LABELS[0]}x Speed`;
    resetAnimation();
}

// Setup event listeners
function setupEventListeners() {
    // Time input controls
    elements.goalTime.addEventListener('input', validateTimeInput);
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const adjust = parseInt(e.target.dataset.adjust);
            const shift = e.shiftKey ? adjust * 5 : adjust;
            adjustTime(shift);
        });
    });

    // Strategy buttons
    document.querySelectorAll('.strategy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.strategy-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentStrategy = e.target.dataset.strategy;
            updateProgressiveSection();
            debouncedCalculate();
        });
    });

    // Lane selection
    elements.laneSelect.addEventListener('change', (e) => {
        currentLane = parseInt(e.target.value);
        drawTrack();
        debouncedCalculate();
    });

    // Progressive pace inputs
    elements.startPace.addEventListener('input', debouncedCalculate);
    elements.endPace.addEventListener('input', debouncedCalculate);
    elements.curveType.addEventListener('change', debouncedCalculate);

    // Surge designer
    elements.addSurgeBtn.addEventListener('click', showSurgeModal);
    document.getElementById('saveSurge').addEventListener('click', saveSurge);
    document.getElementById('cancelSurge').addEventListener('click', hideSurgeModal);

    // Split tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            if (currentPaceData) {
                updateSplitsTable(currentPaceData);
            }
        });
    });

    // Animation controls
    elements.playPauseBtn.addEventListener('click', toggleAnimation);
    elements.resetBtn.addEventListener('click', resetAnimation);
    elements.speedBtn.addEventListener('click', changeAnimationSpeed);

    // Action buttons
    elements.calculateBtn.addEventListener('click', calculatePace);
    elements.printBtn.addEventListener('click', printPaceBand);
    elements.shareBtn.addEventListener('click', shareLink);
    elements.languageToggle.addEventListener('click', toggleLanguage);
    elements.proModeToggle.addEventListener('click', toggleProMode);
    elements.toggleCharts.addEventListener('click', toggleCharts);
    elements.restoreSession.addEventListener('click', restoreSession);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);

    // URL state management
    window.addEventListener('popstate', loadFromURL);
}

// Validate inputs
function validateInputs() {
    const timeStr = elements.goalTime.value;
    const totalMs = parseTimeToMs(timeStr);
    
    if (!totalMs) {
        alert(isNorwegian ? 'Vennligst skriv inn en gyldig tid i mm:ss format' : 'Please enter a valid time in mm:ss format');
        return false;
    }
    
    return true;
}

// Debounced calculation
function debouncedCalculate() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        calculatePace();
        updateURL();
    }, 300);
}

// Time input validation and formatting
function validateTimeInput(e) {
    let value = e.target.value;
    
    // Remove any non-digit characters except colon and period
    value = value.replace(/[^\d:.]/g, '');
    
    // Ensure proper format (mm:ss or mm:ss.s)
    if (value.length > 7) {
        value = value.substring(0, 7);
    }
    
    // Auto-insert colon if needed
    if (value.length === 2 && !value.includes(':')) {
        value += ':';
    }
    
    e.target.value = value;
    debouncedCalculate();
}

// Adjust time with keyboard controls
function adjustTime(seconds) {
    const currentTime = parseTimeToMs(elements.goalTime.value);
    if (currentTime !== null) {
        const newTime = Math.max(0, currentTime + (seconds * 1000));
        elements.goalTime.value = formatTimeFromMs(newTime);
        debouncedCalculate();
    }
}

// Parse time string to milliseconds
function parseTimeToMs(timeStr) {
    if (!timeStr || !timeStr.includes(':')) return null;
    
    const parts = timeStr.split(':');
    if (parts.length !== 2) return null;
    
    const minutes = parseInt(parts[0]);
    const seconds = parseFloat(parts[1]);
    
    if (isNaN(minutes) || isNaN(seconds) || seconds >= 60) return null;
    
    return (minutes * 60 + seconds) * 1000;
}

// Format milliseconds to time string
function formatTimeFromMs(ms) {
    if (!ms || ms < 0) return '--:--';
    
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const tenths = Math.floor((ms % 1000) / 100);
    
    if (tenths > 0) {
        return `${minutes}:${seconds.toString().padStart(2, '0')}.${tenths}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Format time for display
function formatTime(seconds) {
    if (!seconds || seconds < 0) return '--:--';
    
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Update progressive section visibility
function updateProgressiveSection() {
    if (currentStrategy === 'custom') {
        elements.progressiveSection.style.display = 'block';
    } else {
        elements.progressiveSection.style.display = 'none';
    }
}

// ====== Track Visualization ======

// Geometry helpers
function roundedRectPath(x, y, w, h, r) {
    return `M ${x+r} ${y}
            H ${x+w-r}
            A ${r} ${r} 0 0 1 ${x+w} ${y+r}
            V ${y+h-r}
            A ${r} ${r} 0 0 1 ${x+w-r} ${y+h}
            H ${x+r}
            A ${r} ${r} 0 0 1 ${x} ${y+h-r}
            V ${y+r}
            A ${r} ${r} 0 0 1 ${x+r} ${y}
            Z`;
}

// Helper to create a path at an inset (0 = lane 1 centerline; positive moves outward; negative moves inward)
function pathAtInset(inset) {
    const inner = {
        x: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--inner-x')),
        y: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--inner-y')),
        w: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--inner-w')),
        h: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--inner-h')),
        r: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--inner-r')),
    };
    return roundedRectPath(inner.x - inset, inner.y - inset, inner.w + inset*2, inner.h + inset*2, inner.r + inset);
}

// Draw SVG track
function drawTrack() {
    const svg = document.querySelector('svg');
    const stadiumG = document.getElementById('stadium');
    const trackBaseG = document.getElementById('track-base');
    const boundariesG = document.getElementById('lane-boundaries');
    const markersG = document.getElementById('markers');
    const numbersG = document.getElementById('lane-numbers');
    const infieldG = document.getElementById('infield');

    // Clear existing elements
    stadiumG.innerHTML = '';
    trackBaseG.innerHTML = '';
    boundariesG.innerHTML = '';
    markersG.innerHTML = '';
    numbersG.innerHTML = '';
    infieldG.innerHTML = '';

    const LANE_W = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--lane-w'));

    // Build stadium apron behind the track (a larger rounded rect)
    const outerBoundaryInset = 7.5 * LANE_W; // outer white line relative to lane1 center
    const pad = 60; // extra apron thickness
    const inner = {
        x: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--inner-x')),
        y: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--inner-y')),
        w: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--inner-w')),
        h: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--inner-h')),
        r: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--inner-r')),
    };
    
    const x = inner.x - (outerBoundaryInset + pad);
    const y = inner.y - (outerBoundaryInset + pad);
    const w = inner.w + 2*(outerBoundaryInset + pad);
    const h = inner.h + 2*(outerBoundaryInset + pad);
    const r = inner.r + (outerBoundaryInset + pad);
    
    const apron = document.createElementNS('http://www.w3.org/2000/svg','path');
    apron.setAttribute('d', roundedRectPath(x, y, w, h, r));
    apron.setAttribute('fill', getComputedStyle(document.documentElement).getPropertyValue('--apron'));
    stadiumG.appendChild(apron);

    // Infield fill (slightly inside the inner edge to avoid covering white boundary)
    const infieldInset = -LANE_W/2 - 2; // a touch smaller than inner edge
    const infieldPath = document.createElementNS('http://www.w3.org/2000/svg','path');
    infieldPath.setAttribute('d', pathAtInset(infieldInset));
    infieldPath.setAttribute('fill', getComputedStyle(document.documentElement).getPropertyValue('--field'));
    infieldG.appendChild(infieldPath);

    // Track band using 8 centerline strokes (gives realistic red surface without colored lanes)
    lanePaths = [];
    for(let i=1; i<=8; i++){
        const inset = (i - 1) * LANE_W; // Lane 1 innermost
        const p = document.createElementNS('http://www.w3.org/2000/svg','path');
        p.setAttribute('d', pathAtInset(inset));
        p.setAttribute('fill','none');
        p.setAttribute('stroke', getComputedStyle(document.documentElement).getPropertyValue('--track'));
        p.setAttribute('stroke-width', LANE_W);
        p.setAttribute('opacity', 0.98);
        p.setAttribute('id', `lane-${i}`);
        trackBaseG.appendChild(p);
        lanePaths[i] = p; // 1-indexed
    }

    // White lane boundary lines: inner edge, 6 separators, outer edge (total 9)
    for(let j=0; j<=8; j++){
        const inset = (j - 0.5) * LANE_W; // boundaries sit between lane centerlines
        const b = document.createElementNS('http://www.w3.org/2000/svg','path');
        b.setAttribute('d', pathAtInset(inset));
        b.setAttribute('fill','none');
        b.setAttribute('stroke','#ffffff');
        b.setAttribute('stroke-width','3');
        boundariesG.appendChild(b);
    }

    // Reference path for the runner (Lane 1 innermost)
    lane1 = lanePaths[1];
    totalLen = lane1.getTotalLength();

    // Draw markers
    drawMarkers();

    // Add round indicators
    addRoundIndicators();
    updateRoundList();
}

// Draw markers with proper positioning across the track
function drawMarkers() {
    const markersG = document.getElementById('markers');
    const numbersG = document.getElementById('lane-numbers');
    const LANE_W = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--lane-w'));

    // Utility: draw a perpendicular line from the INNER white boundary to the OUTER white boundary at distance s along lane1
    function drawPerpMarker(s, label, opts={}){
        const sNorm = (s % totalLen + totalLen) % totalLen;
        const p0 = lane1.getPointAtLength(sNorm);
        const p1 = lane1.getPointAtLength((sNorm + 0.01) % totalLen);
        const dx = p1.x - p0.x, dy = p1.y - p0.y;
        const mag = Math.hypot(dx, dy) || 1;
        const tx = dx / mag, ty = dy / mag; // unit tangent (clockwise)
        const nx = -ty, ny = tx;            // outward normal

        const innerOff = -0.5 * LANE_W;  // inner white boundary relative to lane1 center
        const outerOff =  7.5 * LANE_W;  // outer white boundary relative to lane1 center

        // Endpoints exactly across the TRACK width (no overshoot)
        const x1 = p0.x + nx * innerOff;
        const y1 = p0.y + ny * innerOff;
        const x2 = p0.x + nx * outerOff;
        const y2 = p0.y + ny * outerOff;

        const drawSingle = (ox=0, oy=0) => {
            const line = document.createElementNS('http://www.w3.org/2000/svg','line');
            line.setAttribute('x1', x1 + ox);
            line.setAttribute('y1', y1 + oy);
            line.setAttribute('x2', x2 + ox);
            line.setAttribute('y2', y2 + oy);
            line.setAttribute('stroke', '#ffffff');
            line.setAttribute('stroke-width', 4);
            markersG.appendChild(line);
        };

        if(opts.start){
            // Double start line: two parallels offset slightly backward along the tangent
            const sep = 8; // pixels
            drawSingle(0, 0);
            drawSingle(-tx * sep, -ty * sep);

            // Lane numbers 1..8 near the start line inside each lane
            for(let i=1; i<=8; i++){
                const laneOff = (i-1) * LANE_W; // center of lane i relative to lane1 center
                const cx = p0.x + nx * laneOff - tx * 25; // a bit before the line
                const cy = p0.y + ny * laneOff - ty * 25;
                const t = document.createElementNS('http://www.w3.org/2000/svg','text');
                t.textContent = i;
                t.setAttribute('x', cx);
                t.setAttribute('y', cy);
                t.setAttribute('fill', '#ffffff');
                t.setAttribute('font-size', '16');
                t.setAttribute('font-weight', '800');
                t.setAttribute('text-anchor', 'middle');
                t.setAttribute('dominant-baseline', 'middle');
                numbersG.appendChild(t);
            }

            if(label){
                const t = document.createElementNS('http://www.w3.org/2000/svg','text');
                t.textContent = label;
                t.setAttribute('x', p0.x - tx * 40 + nx * 15);
                t.setAttribute('y', p0.y - ty * 40 + ny * 15);
                t.setAttribute('fill', '#ffffff');
                t.setAttribute('font-size', '16');
                t.setAttribute('font-weight', '700');
                markersG.appendChild(t);
            }
        } else {
            drawSingle(0, 0);
            if(label){
                const t = document.createElementNS('http://www.w3.org/2000/svg','text');
                t.textContent = label;
                // Put labels slightly outside the outer boundary
                t.setAttribute('x', p0.x + nx * (outerOff + 20));
                t.setAttribute('y', p0.y + ny * (outerOff + 20));
                t.setAttribute('fill', '#111827');
                t.setAttribute('font-size', '14');
                t.setAttribute('font-weight', '700');
                markersG.appendChild(t);
            }
        }
    }

    // Place markers. NOTE: Path is clockwise; requested clockwise order is START, 300, 200, 100
    drawPerpMarker(0, 'START', {start:true});
    drawPerpMarker(totalLen * 0.25, '300m');
    drawPerpMarker(totalLen * 0.50, '200m');
    drawPerpMarker(totalLen * 0.75, '100m');
}

// Add round indicators for elliptical track
function addRoundIndicators() {
    const roundIndicators = elements.roundIndicators;
    roundIndicators.innerHTML = '';
    
    const laneDistance = LANE_DISTANCES[currentLane];
    const totalLaps = TRACK_CONSTANTS.TOTAL_DISTANCE / laneDistance;
    
    for (let lap = 1; lap <= Math.ceil(totalLaps); lap++) {
        const lapProgress = 0.5; // Bottom of ellipse for lap completion
        const position = calculateTrackPosition(lapProgress);
        
        // Create round indicator
        const indicator = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        indicator.setAttribute('cx', position.x);
        indicator.setAttribute('cy', position.y);
        indicator.setAttribute('r', 8);
        indicator.setAttribute('class', 'round-indicator');
        indicator.setAttribute('data-lap', lap);
        indicator.setAttribute('data-distance', lap * laneDistance);
        
        // Add lap number label
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', position.x + 20);
        label.setAttribute('y', position.y + 5);
        label.setAttribute('font-size', '14');
        label.setAttribute('font-weight', '600');
        label.setAttribute('fill', '#374151');
        label.textContent = lap;
        
        roundIndicators.appendChild(indicator);
        roundIndicators.appendChild(label);
    }
}

// Calculate position on track
function calculateTrackPosition(lapProgress) {
    if (!lane1) return { x: 600, y: 400 };
    
    const s = lapProgress * totalLen;
    const pt = lane1.getPointAtLength((s % totalLen + totalLen) % totalLen);
    return { x: pt.x, y: pt.y };
}

// Calculate pace based on strategy
function calculatePace() {
    if (!validateInputs()) {
        return;
    }
    
    const timeStr = elements.goalTime.value;
    const totalMs = parseTimeToMs(timeStr);
    
    const laneDistance = LANE_DISTANCES[currentLane];
    const totalLaps = TRACK_CONSTANTS.TOTAL_DISTANCE / laneDistance;
    
    // Calculate base pace per km
    const basePacePerKm = totalMs / (TRACK_CONSTANTS.TOTAL_DISTANCE / 1000);
    
    // Generate pace data based on strategy
    const paceData = generatePaceData(totalMs, laneDistance, totalLaps, basePacePerKm);
    
    // Store current pace data
    currentPaceData = paceData;
    
    // Reset animation state for new calculation
    resetAnimation();
    animationState.totalTime = totalMs;
    
    // Update UI
    updateResults(paceData);
    updateSplitsTable(paceData);
    updateCharts(paceData);
    updateTrackVisualization(paceData);
    
    // Save to localStorage
    saveToLocalStorage();
}

// Generate pace data based on strategy
function generatePaceData(totalMs, laneDistance, totalLaps, basePacePerKm) {
    const data = {
        strategy: currentStrategy,
        totalTime: totalMs,
        totalDistance: TRACK_CONSTANTS.TOTAL_DISTANCE,
        laneDistance: laneDistance,
        totalLaps: totalLaps,
        segments: [],
        surges: surges
    };
    
    const segmentCount = 30; // 100m segments
    const segmentDistance = TRACK_CONSTANTS.TOTAL_DISTANCE / segmentCount;
    
    for (let i = 0; i < segmentCount; i++) {
        const segmentIndex = i + 1;
        const distance = segmentIndex * segmentDistance;
        
        let segmentPace;
        let segmentTime;
        
        switch (currentStrategy) {
            case 'even':
                segmentPace = basePacePerKm;
                segmentTime = (distance / 1000) * basePacePerKm;
                break;
                
            case 'neg1':
                // 1% negative split
                segmentPace = basePacePerKm * (1.005 - (0.01 * (i / segmentCount)));
                segmentTime = (distance / 1000) * segmentPace;
                break;
                
            case 'neg2':
                // 2.5% negative split
                segmentPace = basePacePerKm * (1.0125 - (0.025 * (i / segmentCount)));
                segmentTime = (distance / 1000) * segmentPace;
                break;
                
            case 'custom':
                // Progressive pace
                const startPaceMs = parseTimeToMs(elements.startPace.value);
                const endPaceMs = parseTimeToMs(elements.endPace.value);
                const curveType = elements.curveType.value;
                
                if (startPaceMs && endPaceMs) {
                    const progress = i / segmentCount;
                    let factor;
                    
                    switch (curveType) {
                        case 'linear':
                            factor = progress;
                            break;
                        case 'exponential':
                            factor = Math.pow(progress, 2);
                            break;
                        case 'sigmoidal':
                            factor = 1 / (1 + Math.exp(-10 * (progress - 0.5)));
                            break;
                        default:
                            factor = progress;
                    }
                    
                    segmentPace = startPaceMs + (endPaceMs - startPaceMs) * factor;
                    segmentTime = (distance / 1000) * segmentPace;
                } else {
                    segmentPace = basePacePerKm;
                    segmentTime = (distance / 1000) * basePacePerKm;
                }
                break;
        }
        
        // Apply surges
        const surgeAdjustment = calculateSurgeAdjustment(distance, segmentDistance);
        segmentPace += surgeAdjustment;
        segmentTime += (segmentDistance / 1000) * surgeAdjustment;
        
        data.segments.push({
            distance: Math.round(distance),
            time: segmentTime,
            pace: segmentPace,
            lap: Math.ceil(distance / laneDistance),
            paceZone: calculatePaceZone(segmentPace, basePacePerKm)
        });
    }
    
    return data;
}

// Calculate surge adjustment
function calculateSurgeAdjustment(distance, segmentDistance) {
    let adjustment = 0;
    
    surges.forEach(surge => {
        if (distance >= surge.start && distance <= surge.end) {
            // Convert s/km to ms/km
            const surgeAdjustmentMs = surge.paceAdjustment * 1000;
            adjustment += surgeAdjustmentMs;
        }
    });
    
    return adjustment;
}

// Calculate pace zone
function calculatePaceZone(segmentPace, basePace) {
    const percentageDiff = (segmentPace - basePace) / basePace * 100;
    
    if (percentageDiff <= -0.5) return 'fast';
    if (percentageDiff <= 0.5) return 'on-pace';
    if (percentageDiff <= 2.0) return 'slow';
    return 'very-slow';
}

// Update results display
function updateResults(data) {
    const totalTime = data.totalTime;
    const totalDistance = data.totalDistance;
    
    // Overall pace per km
    const overallPacePerKm = totalTime / (totalDistance / 1000);
    elements.overallPace.textContent = formatTimeFromMs(overallPacePerKm);
    
    // Target time
    elements.targetTimeDisplay.textContent = formatTimeFromMs(totalTime);
    
    // Average speed in km/h
    const avgSpeedKmh = (totalDistance / 1000) / (totalTime / 3600000);
    elements.avgSpeed.textContent = `${avgSpeedKmh.toFixed(1)} km/h`;
    
    // Lap count
    elements.lapCount.textContent = data.totalLaps.toFixed(1);
}

// Update splits table
function updateSplitsTable(data) {
    if (!data) return;
    
    const splits = [];
    const totalDistance = data.totalDistance;
    const laneDistance = data.laneDistance;
    
    // Generate splits for the specified distance
    for (let d = 100; d <= totalDistance; d += 100) {
        const segment = data.segments.find(s => s.distance >= d);
        if (segment) {
            const lap = Math.ceil(d / laneDistance);
            const lapDistance = d % laneDistance;
            
            let lapDescription;
            if (lapDistance === 0) {
                lapDescription = `Lap ${lap}`;
            } else {
                lapDescription = `Lap ${lap} + ${lapDistance}m`;
            }
            
            splits.push({
                distance: d,
                time: segment.time,
                pace: segment.pace,
                lap: lap,
                lapDescription: lapDescription,
                paceZone: segment.paceZone
            });
        }
    }
    
    // Create table
    const tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Distance</th>
                    <th>Time</th>
                    <th>Pace/km</th>
                    <th>Lap</th>
                    <th>Zone</th>
                </tr>
            </thead>
            <tbody>
                ${splits.map(split => `
                    <tr class="pace-zone-${split.paceZone}">
                        <td>${split.distance}m</td>
                        <td>${formatTimeFromMs(split.time)}</td>
                        <td>${formatTimeFromMs(split.pace)}</td>
                        <td>${split.lapDescription}</td>
                        <td><span class="pace-zone ${split.paceZone}">${split.paceZone}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    elements.splitsTable.innerHTML = tableHTML;
}

// Update track visualization
function updateTrackVisualization(data) {
    if (!data) return;
    
    // Update lane distance display
    const laneDistance = LANE_DISTANCES[currentLane];
    elements.lapCount.textContent = (TRACK_CONSTANTS.TOTAL_DISTANCE / laneDistance).toFixed(1);
    
    // Redraw track with new lane selection
    drawTrack();
    
    // Reset animation state
    resetAnimation();
    animationState.totalTime = data.totalTime;
}

// Update charts
function updateCharts(data) {
    if (!data) return;
    
    updatePaceChart(data);
    updateDeltaChart(data);
}

// Update pace chart
function updatePaceChart(data) {
    const ctx = elements.paceChart.getContext('2d');
    
    if (paceChart) {
        paceChart.destroy();
    }
    
    const labels = data.segments.map(s => `${s.distance}m`);
    const paceData = data.segments.map(s => s.pace / 1000); // Convert to seconds
    
    paceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pace (s/km)',
                data: paceData,
                borderColor: '#dc2626',
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Pace Progression'
                }
            },
            scales: {
                y: {
                    reverse: true,
                    title: {
                        display: true,
                        text: 'Pace (s/km)'
                    }
                }
            }
        }
    });
}

// Update delta chart
function updateDeltaChart(data) {
    const ctx = elements.deltaChart.getContext('2d');
    
    if (deltaChart) {
        deltaChart.destroy();
    }
    
    const labels = data.segments.map(s => `${s.distance}m`);
    const basePace = data.totalTime / (data.totalDistance / 1000);
    const deltaData = data.segments.map(s => {
        const expectedTime = (s.distance / 1000) * basePace;
        return (s.time - expectedTime) / 1000; // Convert to seconds
    });
    
    deltaChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Time Delta (s)',
                data: deltaData,
                borderColor: '#059669',
                backgroundColor: 'rgba(5, 150, 105, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Time vs Even Pace'
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Seconds Ahead/Behind'
                    }
                }
            }
        }
    });
}

// Toggle charts visibility
function toggleCharts() {
    const isVisible = elements.chartsContainer.style.display !== 'none';
    
    if (isVisible) {
        elements.chartsContainer.style.display = 'none';
        elements.toggleCharts.innerHTML = '<i class="fas fa-chart-line"></i> Show Charts';
    } else {
        elements.chartsContainer.style.display = 'block';
        elements.toggleCharts.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Charts';
        if (currentPaceData) {
            updateCharts(currentPaceData);
        }
    }
}

// Calculate surge adjustment
function calculateSurgeAdjustment(distance, segmentDistance) {
    let adjustment = 0;
    
    surges.forEach(surge => {
        if (distance >= surge.start && distance <= surge.end) {
            // Convert s/km to ms/km
            const surgeAdjustmentMs = surge.paceAdjustment * 1000;
            adjustment += surgeAdjustmentMs;
        }
    });
    
    return adjustment;
}

// Calculate pace zone
function calculatePaceZone(segmentPace, basePace) {
    const percentageDiff = (segmentPace - basePace) / basePace * 100;
    
    if (percentageDiff <= -0.5) return 'fast';
    if (percentageDiff <= 0.5) return 'on-pace';
    if (percentageDiff <= 2.0) return 'slow';
    return 'very-slow';
}

// Update results display
function updateResults(data) {
    const totalTime = data.totalTime;
    const totalDistance = data.totalDistance;
    
    // Overall pace per km
    const overallPacePerKm = totalTime / (totalDistance / 1000);
    elements.overallPace.textContent = formatTimeFromMs(overallPacePerKm);
    
    // Target time
    elements.targetTimeDisplay.textContent = formatTimeFromMs(totalTime);
    
    // Average speed in km/h
    const avgSpeedKmh = (totalDistance / 1000) / (totalTime / 3600000);
    elements.avgSpeed.textContent = `${avgSpeedKmh.toFixed(1)} km/h`;
    
    // Lap count
    elements.lapCount.textContent = data.totalLaps.toFixed(1);
}

// Update splits table
function updateSplitsTable(data) {
    if (!data) return;
    
    const splits = [];
    const totalDistance = data.totalDistance;
    const laneDistance = data.laneDistance;
    
    // Generate splits for the specified distance
    for (let d = 100; d <= totalDistance; d += 100) {
        const segment = data.segments.find(s => s.distance >= d);
        if (segment) {
            const lap = Math.ceil(d / laneDistance);
            const lapDistance = d % laneDistance;
            
            let lapDescription;
            if (lapDistance === 0) {
                lapDescription = `Lap ${lap}`;
            } else {
                lapDescription = `Lap ${lap} + ${lapDistance}m`;
            }
            
            splits.push({
                distance: d,
                time: segment.time,
                pace: segment.pace,
                lap: lap,
                lapDescription: lapDescription,
                paceZone: segment.paceZone
            });
        }
    }
    
    // Create table
    const tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Distance</th>
                    <th>Time</th>
                    <th>Pace/km</th>
                    <th>Lap</th>
                    <th>Zone</th>
                </tr>
            </thead>
            <tbody>
                ${splits.map(split => `
                    <tr class="pace-zone-${split.paceZone}">
                        <td>${split.distance}m</td>
                        <td>${formatTimeFromMs(split.time)}</td>
                        <td>${formatTimeFromMs(split.pace)}</td>
                        <td>${split.lapDescription}</td>
                        <td><span class="pace-zone ${split.paceZone}">${split.paceZone}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    elements.splitsTable.innerHTML = tableHTML;
}

// Update track visualization
function updateTrackVisualization(data) {
    if (!data) return;
    
    // Update lane distance display
    const laneDistance = LANE_DISTANCES[currentLane];
    elements.lapCount.textContent = (TRACK_CONSTANTS.TOTAL_DISTANCE / laneDistance).toFixed(1);
    
    // Redraw track with new lane selection
    drawTrack();
    
    // Reset animation state
    resetAnimation();
    animationState.totalTime = data.totalTime;
}

// Update charts
function updateCharts(data) {
    if (!data) return;
    
    updatePaceChart(data);
    updateDeltaChart(data);
}

// Update pace chart
function updatePaceChart(data) {
    const ctx = elements.paceChart.getContext('2d');
    
    if (paceChart) {
        paceChart.destroy();
    }
    
    const labels = data.segments.map(s => `${s.distance}m`);
    const paceData = data.segments.map(s => s.pace / 1000); // Convert to seconds
    
    paceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pace (s/km)',
                data: paceData,
                borderColor: '#dc2626',
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Pace Progression'
                }
            },
            scales: {
                y: {
                    reverse: true,
                    title: {
                        display: true,
                        text: 'Pace (s/km)'
                    }
                }
            }
        }
    });
}

// Update delta chart
function updateDeltaChart(data) {
    const ctx = elements.deltaChart.getContext('2d');
    
    if (deltaChart) {
        deltaChart.destroy();
    }
    
    const labels = data.segments.map(s => `${s.distance}m`);
    const basePace = data.totalTime / (data.totalDistance / 1000);
    const deltaData = data.segments.map(s => {
        const expectedTime = (s.distance / 1000) * basePace;
        return (s.time - expectedTime) / 1000; // Convert to seconds
    });
    
    deltaChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Time Delta (s)',
                data: deltaData,
                borderColor: '#059669',
                backgroundColor: 'rgba(5, 150, 105, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Time vs Even Pace'
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Seconds Ahead/Behind'
                    }
                }
            }
        }
    });
}

// Toggle charts visibility
function toggleCharts() {
    const isVisible = elements.chartsContainer.style.display !== 'none';
    
    if (isVisible) {
        elements.chartsContainer.style.display = 'none';
        elements.toggleCharts.innerHTML = '<i class="fas fa-chart-line"></i> Show Charts';
    } else {
        elements.chartsContainer.style.display = 'block';
        elements.toggleCharts.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Charts';
        if (currentPaceData) {
            updateCharts(currentPaceData);
        }
    }
}

// Surge modal functions
function showSurgeModal() {
    elements.surgeModal.style.display = 'flex';
}

function hideSurgeModal() {
    elements.surgeModal.style.display = 'none';
    // Clear form
    document.getElementById('surgeStart').value = '';
    document.getElementById('surgeEnd').value = '';
    document.getElementById('surgePace').value = '';
}

function saveSurge() {
    const start = parseInt(document.getElementById('surgeStart').value);
    const end = parseInt(document.getElementById('surgeEnd').value);
    const paceAdjustment = parseFloat(document.getElementById('surgePace').value);
    
    if (isNaN(start) || isNaN(end) || isNaN(paceAdjustment)) {
        alert(isNorwegian ? 'Vennligst fyll ut alle feltene' : 'Please fill in all fields');
        return;
    }
    
    if (start >= end) {
        alert(isNorwegian ? 'Sluttavstand må være større enn startavstand' : 'End distance must be greater than start distance');
        return;
    }
    
    surges.push({ start, end, paceAdjustment });
    updateSurgeList();
    hideSurgeModal();
    debouncedCalculate();
}

function updateSurgeList() {
    elements.surgeList.innerHTML = surges.map((surge, index) => `
        <div class="surge-item">
            <div class="surge-info">
                <strong>${surge.start}m - ${surge.end}m</strong>
                <small>${surge.paceAdjustment > 0 ? '+' : ''}${surge.paceAdjustment}s/km</small>
            </div>
            <div class="surge-actions">
                <button class="delete-surge" onclick="deleteSurge(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function deleteSurge(index) {
    surges.splice(index, 1);
    updateSurgeList();
    debouncedCalculate();
}

// Print pace band
async function printPaceBand() {
    if (!currentPaceData) {
        alert(isNorwegian ? 'Beregn først din pace' : 'Calculate your pace first');
        return;
    }
    
    const { PDFDocument, rgb } = PDFLib;
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([420, 595]); // A6 size
    
    const { width, height } = page.getSize();
    
    // Add title
    page.drawText('3K Pace Band', {
        x: 50,
        y: height - 50,
        size: 20,
        color: rgb(0.86, 0.15, 0.15)
    });
    
    // Add target time
    page.drawText(`Target: ${formatTimeFromMs(currentPaceData.totalTime)}`, {
        x: 50,
        y: height - 80,
        size: 16
    });
    
    // Add splits
    let y = height - 120;
    const splits = currentPaceData.segments.filter(s => s.distance % 400 === 0 || s.distance === 3000);
    
    splits.forEach(split => {
        page.drawText(`${split.distance}m: ${formatTimeFromMs(split.time)}`, {
            x: 50,
            y: y,
            size: 12
        });
        y -= 20;
    });
    
    // Add notes section if needed
    y -= 20;
    page.drawText('Notes:', {
        x: 50,
        y: y,
        size: 12,
        color: rgb(0.86, 0.15, 0.15)
    });
    y -= 15;
    page.drawText('Track: 3000m, Lane ' + currentLane, {
        x: 50,
        y: y,
        size: 10
    });
    
    // Add cut line
    page.drawLine({
        start: { x: 50, y: 100 },
        end: { x: width - 50, y: 100 },
        thickness: 1,
        color: rgb(0.5, 0.5, 0.5)
    });
    
    page.drawText('Cut along this line and wrap around wrist', {
        x: 50,
        y: 80,
        size: 8,
        color: rgb(0.5, 0.5, 0.5)
    });
    
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = '3k-pace-band.pdf';
    link.click();
    
    URL.revokeObjectURL(url);
}

// Share link
function shareLink() {
    const url = new URL(window.location);
    url.searchParams.set('t', elements.goalTime.value);
    url.searchParams.set('lane', currentLane);
    url.searchParams.set('strategy', currentStrategy);
    
    if (surges.length > 0) {
        const surgeStr = surges.map(s => `${s.start}-${s.end}:${s.paceAdjustment}s/km`).join(',');
        url.searchParams.set('surges', surgeStr);
    }
    
    navigator.clipboard.writeText(url.toString()).then(() => {
        alert(isNorwegian ? 'Lenke kopiert til utklippstavlen' : 'Link copied to clipboard');
    });
}

// Load from URL
function loadFromURL() {
    const url = new URL(window.location);
    
    const time = url.searchParams.get('t');
    if (time) elements.goalTime.value = time;
    
    const lane = url.searchParams.get('lane');
    if (lane) {
        currentLane = parseInt(lane);
        elements.laneSelect.value = lane;
    }
    
    const strategy = url.searchParams.get('strategy');
    if (strategy) {
        currentStrategy = strategy;
        document.querySelectorAll('.strategy-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.strategy === strategy);
        });
    }
    
    const surgeStr = url.searchParams.get('surges');
    if (surgeStr) {
        surges = surgeStr.split(',').map(s => {
            const [range, pace] = s.split(':');
            const [start, end] = range.split('-');
            return {
                start: parseInt(start),
                end: parseInt(end),
                paceAdjustment: parseFloat(pace.replace('s/km', ''))
            };
        });
        updateSurgeList();
    }
    
    updateProgressiveSection();
    drawTrack();
    calculatePace();
}

// Update URL
function updateURL() {
    const url = new URL(window.location);
    url.searchParams.set('t', elements.goalTime.value);
    url.searchParams.set('lane', currentLane);
    url.searchParams.set('strategy', currentStrategy);
    
    if (surges.length > 0) {
        const surgeStr = surges.map(s => `${s.start}-${s.end}:${s.paceAdjustment}s/km`).join(',');
        url.searchParams.set('surges', surgeStr);
    }
    
    window.history.replaceState({}, '', url);
}

// Language toggle
function toggleLanguage() {
    isNorwegian = !isNorwegian;
    updateLanguageUI();
    // Reload page to update all text
    window.location.reload();
}

function updateLanguageUI() {
    elements.languageToggle.innerHTML = `<i class="fas fa-globe"></i> ${isNorwegian ? 'NO' : 'EN'}`;
    elements.languageToggle.title = isNorwegian ? 'Switch to English' : 'Bytt til norsk';
}

// Pro mode toggle
function toggleProMode() {
    isProMode = !isProMode;
    updateProModeUI();
}

function updateProModeUI() {
    document.body.classList.toggle('pro-mode', isProMode);
    elements.proModeToggle.classList.toggle('active', isProMode);
}

// Keyboard shortcuts
function handleKeyboardShortcuts(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    switch (e.key) {
        case 'ArrowUp':
            e.preventDefault();
            adjustTime(e.shiftKey ? 5 : 1);
            break;
        case 'ArrowDown':
            e.preventDefault();
            adjustTime(e.shiftKey ? -5 : -1);
            break;
        case 'Enter':
            if (e.target === elements.goalTime) {
                calculatePace();
            }
            break;
    }
}

// Local storage functions
function saveToLocalStorage() {
    const data = {
        goalTime: elements.goalTime.value,
        lane: currentLane,
        strategy: currentStrategy,
        surges: surges,
        // coachNotes removed
        timestamp: Date.now()
    };
    
    localStorage.setItem('3kPaceCalculator', JSON.stringify(data));
}

function restoreSession() {
    const saved = localStorage.getItem('3kPaceCalculator');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            
            // Only restore if data is less than 24 hours old
            if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
                elements.goalTime.value = data.goalTime || '09:30';
                currentLane = data.lane || 1;
                elements.laneSelect.value = currentLane;
                currentStrategy = data.strategy || 'even';
                surges = data.surges || [];
                // coachNotes removed
                
                document.querySelectorAll('.strategy-btn').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.strategy === currentStrategy);
                });
                
                updateProgressiveSection();
                updateSurgeList();
                drawTrack();
                calculatePace();
            }
        } catch (e) {
            console.error('Error restoring session:', e);
        }
    }
}

// Service worker setup
function setupServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('Service Worker registered');
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    }
}

// Update offline status
function updateOfflineStatus() {
    const isOnline = navigator.onLine;
    elements.offlineStatus.textContent = isOnline ? 'Online' : 'Offline';
    elements.offlineToggle.classList.toggle('offline', !isOnline);
}

window.addEventListener('online', updateOfflineStatus);
window.addEventListener('offline', updateOfflineStatus);
updateOfflineStatus();

// Update round list
function updateRoundList() {
    const roundList = elements.roundList;
    roundList.innerHTML = '';
    
    const laneDistance = LANE_DISTANCES[currentLane];
    const totalLaps = TRACK_CONSTANTS.TOTAL_DISTANCE / laneDistance;
    
    for (let lap = 1; lap <= Math.ceil(totalLaps); lap++) {
        const roundItem = document.createElement('div');
        roundItem.className = 'round-item pending';
        roundItem.setAttribute('data-lap', lap);
        
        const distance = Math.min(lap * laneDistance, TRACK_CONSTANTS.TOTAL_DISTANCE);
        const expectedTime = calculateExpectedTime(distance);
        
        roundItem.innerHTML = `
            <span class="round-number">${lap}</span>
            <span class="round-distance">${distance}m</span>
            <span class="round-time">${formatTimeFromMs(expectedTime)}</span>
        `;
        
        roundList.appendChild(roundItem);
    }
}

// Calculate expected time for a given distance
function calculateExpectedTime(distance) {
    const timeStr = elements.goalTime.value;
    const totalMs = parseTimeToMs(timeStr);
    if (!totalMs) return 0;
    
    return (distance / TRACK_CONSTANTS.TOTAL_DISTANCE) * totalMs;
}

// Surge modal functions
function showSurgeModal() {
    document.getElementById('surgeModal').style.display = 'flex';
}

function hideSurgeModal() {
    document.getElementById('surgeModal').style.display = 'none';
    // Clear form
    document.getElementById('surgeStart').value = '';
    document.getElementById('surgeEnd').value = '';
    document.getElementById('surgePace').value = '';
}

function saveSurge() {
    const start = parseInt(document.getElementById('surgeStart').value);
    const end = parseInt(document.getElementById('surgeEnd').value);
    const paceAdjustment = parseFloat(document.getElementById('surgePace').value);
    
    if (isNaN(start) || isNaN(end) || isNaN(paceAdjustment)) {
        alert(isNorwegian ? 'Vennligst fyll ut alle feltene' : 'Please fill in all fields');
        return;
    }
    
    if (start >= end) {
        alert(isNorwegian ? 'Sluttavstand må være større enn startavstand' : 'End distance must be greater than start distance');
        return;
    }
    
    surges.push({ start, end, paceAdjustment });
    updateSurgeList();
    hideSurgeModal();
    debouncedCalculate();
}

function updateSurgeList() {
    elements.surgeList.innerHTML = surges.map((surge, index) => `
        <div class="surge-item">
            <div class="surge-info">
                <strong>${surge.start}m - ${surge.end}m</strong>
                <small>${surge.paceAdjustment > 0 ? '+' : ''}${surge.paceAdjustment}s/km</small>
            </div>
            <div class="surge-actions">
                <button class="delete-surge" onclick="deleteSurge(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function deleteSurge(index) {
    surges.splice(index, 1);
    updateSurgeList();
    debouncedCalculate();
}

// Print pace band
async function printPaceBand() {
    if (!currentPaceData) {
        alert(isNorwegian ? 'Beregn først din pace' : 'Calculate your pace first');
        return;
    }
    
    window.print();
}

// Share link
function shareLink() {
    const url = new URL(window.location);
    url.searchParams.set('t', elements.goalTime.value);
    url.searchParams.set('lane', currentLane);
    url.searchParams.set('strategy', currentStrategy);
    
    if (surges.length > 0) {
        const surgeStr = surges.map(s => `${s.start}-${s.end}:${s.paceAdjustment}s/km`).join(',');
        url.searchParams.set('surges', surgeStr);
    }
    
    navigator.clipboard.writeText(url.toString()).then(() => {
        alert(isNorwegian ? 'Lenke kopiert til utklippstavlen' : 'Link copied to clipboard');
    });
}

// Load from URL
function loadFromURL() {
    const url = new URL(window.location);
    
    const time = url.searchParams.get('t');
    if (time) elements.goalTime.value = time;
    
    const lane = url.searchParams.get('lane');
    if (lane) {
        currentLane = parseInt(lane);
        elements.laneSelect.value = lane;
    }
    
    const strategy = url.searchParams.get('strategy');
    if (strategy) {
        currentStrategy = strategy;
        document.querySelectorAll('.strategy-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.strategy === strategy);
        });
    }
    
    const surgeStr = url.searchParams.get('surges');
    if (surgeStr) {
        surges = surgeStr.split(',').map(s => {
            const [range, pace] = s.split(':');
            const [start, end] = range.split('-');
            return {
                start: parseInt(start),
                end: parseInt(end),
                paceAdjustment: parseFloat(pace.replace('s/km', ''))
            };
        });
        updateSurgeList();
    }
    
    updateProgressiveSection();
    drawTrack();
    calculatePace();
}

// Update URL
function updateURL() {
    const url = new URL(window.location);
    url.searchParams.set('t', elements.goalTime.value);
    url.searchParams.set('lane', currentLane);
    url.searchParams.set('strategy', currentStrategy);
    
    if (surges.length > 0) {
        const surgeStr = surges.map(s => `${s.start}-${s.end}:${s.paceAdjustment}s/km`).join(',');
        url.searchParams.set('surges', surgeStr);
    }
    
    window.history.replaceState({}, '', url);
}

// Language toggle
function toggleLanguage() {
    isNorwegian = !isNorwegian;
    updateLanguageUI();
    // Reload page to update all text
    window.location.reload();
}

function updateLanguageUI() {
    elements.languageToggle.innerHTML = `<i class="fas fa-globe"></i> ${isNorwegian ? 'NO' : 'EN'}`;
    elements.languageToggle.title = isNorwegian ? 'Switch to English' : 'Bytt til norsk';
}

// Pro mode toggle
function toggleProMode() {
    isProMode = !isProMode;
    updateProModeUI();
}

function updateProModeUI() {
    document.body.classList.toggle('pro-mode', isProMode);
    elements.proModeToggle.classList.toggle('active', isProMode);
}

// Keyboard shortcuts
function handleKeyboardShortcuts(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    switch (e.key) {
        case 'ArrowUp':
            e.preventDefault();
            adjustTime(e.shiftKey ? 5 : 1);
            break;
        case 'ArrowDown':
            e.preventDefault();
            adjustTime(e.shiftKey ? -5 : -1);
            break;
        case 'Enter':
            if (e.target === elements.goalTime) {
                calculatePace();
            }
            break;
    }
}

// Local storage functions
function saveToLocalStorage() {
    const data = {
        goalTime: elements.goalTime.value,
        lane: currentLane,
        strategy: currentStrategy,
        surges: surges,
        timestamp: Date.now()
    };
    
    localStorage.setItem('3kPaceCalculator', JSON.stringify(data));
}

function restoreSession() {
    const saved = localStorage.getItem('3kPaceCalculator');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            
            // Only restore if data is less than 24 hours old
            if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
                elements.goalTime.value = data.goalTime || '09:30';
                currentLane = data.lane || 1;
                elements.laneSelect.value = currentLane;
                currentStrategy = data.strategy || 'even';
                surges = data.surges || [];
                
                document.querySelectorAll('.strategy-btn').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.strategy === currentStrategy);
                });
                
                updateProgressiveSection();
                updateSurgeList();
                drawTrack();
                calculatePace();
            }
        } catch (e) {
            console.error('Error restoring session:', e);
        }
    }
}

// Service worker setup
function setupServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('Service Worker registered');
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    }
}

// Update offline status
function updateOfflineStatus() {
    const isOnline = navigator.onLine;
    // Update UI if needed
}

// Animation control functions
function toggleAnimation() {
    if (animationState.isPlaying) {
        pauseAnimation();
    } else {
        startAnimation();
    }
}

function startAnimation() {
    if (!animationState.totalTime) {
        const timeStr = elements.goalTime.value;
        const totalMs = parseTimeToMs(timeStr);
        if (!totalMs) return;
        animationState.totalTime = totalMs;
    }
    const now = Date.now();
    animationState.startTime = now - (animationState.currentTime / animationState.speed * 1000);
    animationState.isPlaying = true;
    elements.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    elements.playPauseBtn.classList.add('active');
    animationLoop();
}

function pauseAnimation() {
    animationState.isPlaying = false;
    elements.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    elements.playPauseBtn.classList.remove('active');
    
    if (animationState.animationId) {
        cancelAnimationFrame(animationState.animationId);
        animationState.animationId = null;
    }
}

function resetAnimation() {
    pauseAnimation();
    animationState.currentTime = 0;
    animationState.currentDistance = 0;
    animationState.currentLap = 0;
    animationState.lapProgress = 0;
    
    updateRunnerPosition(0, 0);
    updateAnimationUI();
    updateRoundIndicators();
}

function changeAnimationSpeed() {
    const currentIndex = ANIMATION_SPEEDS.indexOf(animationState.speed);
    const nextIndex = (currentIndex + 1) % ANIMATION_SPEEDS.length;
    const newSpeed = ANIMATION_SPEEDS[nextIndex];
    if (animationState.isPlaying) {
        const now = Date.now();
        animationState.startTime = now - (animationState.currentTime / newSpeed * 1000);
    }
    animationState.speed = newSpeed;
    elements.speedBtn.innerHTML = `<i class="fas fa-tachometer-alt"></i> ${SPEED_LABELS[nextIndex]}`;
    elements.speedDisplay.textContent = `${SPEED_LABELS[nextIndex]}x Speed`;
}

// Update animation UI
function updateAnimationUI() {
    elements.currentLap.textContent = animationState.currentLap;
    elements.currentDistance.textContent = `${Math.round(animationState.currentDistance)}m`;
    elements.currentTime.textContent = formatTimeFromMs(animationState.currentTime * 1000);
    
    const progressPercent = Math.round((animationState.currentDistance / TRACK_CONSTANTS.TOTAL_DISTANCE) * 100);
    elements.progressPercent.textContent = `${progressPercent}%`;
}

// Update round indicators
function updateRoundIndicators() {
    const laneDistance = LANE_DISTANCES[currentLane];
    const currentLap = animationState.currentLap;
    const distance = animationState.currentDistance;
    
    // Update round list items
    document.querySelectorAll('.round-item').forEach(item => {
        const lap = parseInt(item.getAttribute('data-lap'));
        item.classList.remove('current', 'completed', 'pending');
        
        if (lap < currentLap) {
            item.classList.add('completed');
        } else if (lap === currentLap) {
            item.classList.add('current');
        } else {
            item.classList.add('pending');
        }
    });
    
    // Update round indicators on track
    document.querySelectorAll('.round-indicator').forEach(indicator => {
        const lap = parseInt(indicator.getAttribute('data-lap'));
        indicator.classList.remove('active', 'completed');
        
        if (lap < currentLap) {
            indicator.classList.add('completed');
        } else if (lap === currentLap) {
            indicator.classList.add('active');
        }
    });
}

function animationLoop() {
    if (!animationState.isPlaying) return;
    const now = Date.now();
    const elapsed = ((now - animationState.startTime) / 1000) * animationState.speed;
    animationState.currentTime = Math.min(elapsed, animationState.totalTime / 1000);
    const progress = animationState.currentTime / (animationState.totalTime / 1000);
    const distance = progress * TRACK_CONSTANTS.TOTAL_DISTANCE;
    animationState.currentDistance = distance;
    animationState.currentLap = Math.floor(distance / LANE_DISTANCES[currentLane]) + 1;
    animationState.lapProgress = (distance % LANE_DISTANCES[currentLane]) / LANE_DISTANCES[currentLane];
    updateRunnerPosition(animationState.lapProgress, distance);
    updateAnimationUI();
    updateRoundIndicators();
    if (progress < 1) {
        animationState.animationId = requestAnimationFrame(animationLoop);
    } else {
        pauseAnimation();
    }
}

// Validate inputs
function validateInputs() {
    const timeStr = elements.goalTime.value;
    const totalMs = parseTimeToMs(timeStr);
    
    if (!totalMs) {
        alert(isNorwegian ? 'Vennligst skriv inn en gyldig tid i mm:ss format' : 'Please enter a valid time in mm:ss format');
        return false;
    }
    
    return true;
}

// Debounced calculation
function debouncedCalculate() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        calculatePace();
        updateURL();
    }, 300);
}

// Time input validation and formatting
function validateTimeInput(e) {
    let value = e.target.value;
    
    // Remove any non-digit characters except colon and period
    value = value.replace(/[^\d:.]/g, '');
    
    // Ensure proper format (mm:ss or mm:ss.s)
    if (value.length > 7) {
        value = value.substring(0, 7);
    }
    
    // Auto-insert colon if needed
    if (value.length === 2 && !value.includes(':')) {
        value += ':';
    }
    
    e.target.value = value;
    debouncedCalculate();
}

// Adjust time with keyboard controls
function adjustTime(seconds) {
    const currentTime = parseTimeToMs(elements.goalTime.value);
    if (currentTime !== null) {
        const newTime = Math.max(0, currentTime + (seconds * 1000));
        elements.goalTime.value = formatTimeFromMs(newTime);
        debouncedCalculate();
    }
}

// Parse time string to milliseconds
function parseTimeToMs(timeStr) {
    if (!timeStr || !timeStr.includes(':')) return null;
    
    const parts = timeStr.split(':');
    if (parts.length !== 2) return null;
    
    const minutes = parseInt(parts[0]);
    const seconds = parseFloat(parts[1]);
    
    if (isNaN(minutes) || isNaN(seconds) || seconds >= 60) return null;
    
    return (minutes * 60 + seconds) * 1000;
}

// Format milliseconds to time string
function formatTimeFromMs(ms) {
    if (!ms || ms < 0) return '--:--';
    
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const tenths = Math.floor((ms % 1000) / 100);
    
    if (tenths > 0) {
        return `${minutes}:${seconds.toString().padStart(2, '0')}.${tenths}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Format time for display
function formatTime(seconds) {
    if (!seconds || seconds < 0) return '--:--';
    
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Update progressive section visibility
function updateProgressiveSection() {
    if (currentStrategy === 'custom') {
        elements.progressiveSection.style.display = 'block';
    } else {
        elements.progressiveSection.style.display = 'none';
    }
}

// Update runner position on track
function updateRunnerPosition(lapProgress, distance) {
    const position = calculateTrackPosition(lapProgress);
    
    elements.runnerDot.setAttribute('cx', position.x);
    elements.runnerDot.setAttribute('cy', position.y);
    
    // Update lap progress bar
    const progressWidth = (distance / TRACK_CONSTANTS.TOTAL_DISTANCE) * 700;
    elements.lapProgressFill.setAttribute('width', Math.max(0, progressWidth));
}

// Update animation UI
function updateAnimationUI() {
    elements.currentLap.textContent = animationState.currentLap;
    elements.currentDistance.textContent = `${Math.round(animationState.currentDistance)}m`;
    elements.currentTime.textContent = formatTimeFromMs(animationState.currentTime * 1000);
    
    const progressPercent = Math.round((animationState.currentDistance / TRACK_CONSTANTS.TOTAL_DISTANCE) * 100);
    elements.progressPercent.textContent = `${progressPercent}%`;
}

// Update round indicators
function updateRoundIndicators() {
    const laneDistance = LANE_DISTANCES[currentLane];
    const currentLap = animationState.currentLap;
    const distance = animationState.currentDistance;
    
    // Update round list items
    document.querySelectorAll('.round-item').forEach(item => {
        const lap = parseInt(item.getAttribute('data-lap'));
        item.classList.remove('current', 'completed', 'pending');
        
        if (lap < currentLap) {
            item.classList.add('completed');
        } else if (lap === currentLap) {
            item.classList.add('current');
        } else {
            item.classList.add('pending');
        }
    });
    
    // Update round indicators on track
    document.querySelectorAll('.round-indicator').forEach(indicator => {
        const lap = parseInt(indicator.getAttribute('data-lap'));
        indicator.classList.remove('active', 'completed');
        
        if (lap < currentLap) {
            indicator.classList.add('completed');
        } else if (lap === currentLap) {
            indicator.classList.add('active');
        }
    });
}
