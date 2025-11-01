// Global variables and state management
let currentPaceData = null;
let currentLane = 1;
let currentStrategy = 'even';
let isNorwegian = true; // Default to Norwegian
let currentDistance = 3000; // Current race distance in meters
let paceChart = null; // Chart.js instance
let isDarkMode = false;
let customSplits = []; // Custom split definitions
let progressionType = 'linear'; // linear, exponential, sigmoid
let paceChangePer400m = -2; // seconds per 400m for progressive/degressive

// Translations
const translations = {
    en: {
        title: "3000METER.com",
        race_setup: "Race Setup",
        target_time: "Target Time (mm:ss)",
        lane: "Lane",
        pacing_strategy: "Pacing Strategy",
        even: "Even",
        neg1: "-1s/400m",
        neg2: "-2s/400m",
        pos1: "+1s/400m",
        neg5p: "-5%",
        pos5p: "+5%",
        kick600: "Kick 600m",
        custom: "Custom",
        start_pace: "Start Pace (mm:ss/km)",
        end_pace: "End Pace (mm:ss/km)",
        progression_type: "Progression Type",
        linear: "Linear",
        exponential: "Exponential",
        sigmoidal: "Sigmoidal",
        surge_designer: "Surge Designer",
        add_surge: "Add Surge",
        calculate: "Calculate",
        print: "Print",
        results: "Results",
        overall_pace: "Overall Pace",
        avg_speed: "Avg Speed",
        laps: "Laps",
        splits: "Splits",
        lap: "Lap",
        distance: "Distance",
        time: "Time",
        progress: "Progress",
        rounds: "Rounds",
        footer_text: "3k Run Tracker - Professional pace calculator for track athletes",
        race_distance: "Race Distance",
        pace_chart: "Pace Chart",
        intervals: "Intervals",
        interval_training: "Interval Training Planner",
        target_pace: "Target Pace (mm:ss/km)"
    },
    no: {
        title: "3000METER.com",
        race_setup: "Løps Oppsett",
        target_time: "Måltid (mm:ss)",
        lane: "Bane",
        pacing_strategy: "Tempo Strategi",
        even: "Jevnt",
        neg1: "-1s/400m",
        neg2: "-2s/400m",
        pos1: "+1s/400m",
        neg5p: "-5%",
        pos5p: "+5%",
        kick600: "Sprint 600m",
        custom: "Egendefinert",
        start_pace: "Start Tempo (mm:ss/km)",
        end_pace: "Slutt Tempo (mm:ss/km)",
        progression_type: "Progresjon Type",
        linear: "Lineær",
        exponential: "Eksponentiell",
        sigmoidal: "Sigmoidal",
        surge_designer: "Sprint Designer",
        add_surge: "Legg til Sprint",
        calculate: "Beregn",
        print: "Skriv ut",
        results: "Resultater",
        overall_pace: "Gjennomsnitt Tempo",
        avg_speed: "Gjennomsnitt Fart",
        laps: "Runder",
        splits: "Deltider",
        lap: "Runde",
        distance: "Distanse",
        time: "Tid",
        progress: "Framgang",
        rounds: "Runder",
        save: "Lagre",
        footer_text: "3k Løp Sporer - Profesjonell tempo kalkulator for baneløpere",
        race_distance: "Løpsdistanse",
        pace_chart: "Tempo Graf",
        intervals: "Intervaller",
        interval_training: "Intervall Treningsplanlegger",
        target_pace: "Mål Tempo (mm:ss/km)"
    }
};

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


// Track geometry constants
const TRACK_CONSTANTS = {
    LANE_WIDTH: 1.22, // meters
    STRAIGHT_LENGTH: 84.39, // meters
    CURVE_RADIUS_LANE1: 36.5, // meters
    TOTAL_DISTANCE: 3000, // meters (default, will be updated)
    LAPS: 7.5
};

// Standard race distances (for reference, but now using direct input)
const STANDARD_DISTANCES = {
    100: 100,
    200: 200,
    400: 400,
    800: 800,
    1500: 1500,
    3000: 3000,
    5000: 5000,
    10000: 10000,
    // British/Imperial distances in meters
    1609.344: 1609.344,      // 1 Mile
    3218.688: 3218.688,      // 2 Miles
    4828.032: 4828.032,      // 3 Miles
    8046.72: 8046.72,        // 5 Miles
    16093.44: 16093.44,      // 10 Miles
    // Other common distances
    1000: 1000,              // 1km
    2000: 2000,              // 2km
    21097.5: 21097.5,        // Half Marathon
    42195: 42195             // Marathon
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

// DOM elements - will be initialized after DOM loads
let elements = {};

// Toast function
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 1800);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize DOM elements
    elements = {
        goalTime: document.getElementById('goalTime'),
        raceDistance: document.getElementById('raceDistance'),
        strategyButtons: document.querySelectorAll('.strategy-btn'),
        calculateBtn: document.getElementById('calculateBtn'),
        themeToggle: document.getElementById('themeToggle'),
        largeTargetTimeDisplay: document.getElementById('largeTargetTimeDisplay'),
        runnerDot: document.getElementById('runner-dot'),
        roundIndicators: document.getElementById('round-indicators'),
        playPauseBtn: document.getElementById('playPauseBtn'),
        resetBtn: document.getElementById('resetBtn'),
        currentLapDisplay: document.getElementById('currentLapDisplay'),
        currentDistanceDisplay: document.getElementById('currentDistanceDisplay'),
        currentPaceDisplay: document.getElementById('currentPaceDisplay'),
        progressPercentDisplay: document.getElementById('progressPercentDisplay'),
        cumulativeTimes200m: document.getElementById('cumulativeTimes200m'),
        cumulativeTimes400m: document.getElementById('cumulativeTimes400m'),
        cumulativeTimes1000m: document.getElementById('cumulativeTimes1000m'),
        tabButtons: document.querySelectorAll('.tab-btn'),
        toast: document.getElementById('toast'),
        advancedStrategyOptions: document.getElementById('advancedStrategyOptions'),
        progressionType: document.getElementById('progressionType'),
        paceChange: document.getElementById('paceChange'),
        startPace: document.getElementById('startPace'),
        endPace: document.getElementById('endPace'),
        splitEditorList: document.getElementById('splitEditorList'),
        addSplitBtn: document.getElementById('addSplitBtn')
    };
    
    // Initialize distance button states
    initializeDistanceButtons();
    
    initializeApp();
    setupEventListeners();
    setupServiceWorker();
    loadFromURL();
    updateLanguageUI();
    updateI18n();
});

function initializeApp() {
    drawTrack();
    drawMarkers();
    addRoundIndicators();
    initializeDistanceButtons();
    // Ensure animation state is initialized
    calculatePace();
}

function initializeDistanceButtons() {
    // Set initial active state based on current distance
    const currentDist = currentDistance || 3000;
    document.querySelectorAll('.preset-btn-compact').forEach(btn => {
        const btnDist = parseFloat(btn.dataset.distance);
        if (Math.abs(btnDist - currentDist) < 0.1) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function setupEventListeners() {
    // Input event listeners - only update pace/time conversion, don't trigger calculations
    elements.goalTime.addEventListener('input', (e) => {
        validateTimeInput(e);
        updatePaceFromTime();
    });
    
    // Target pace input listeners - only update time/pace conversion, don't trigger calculations
    if (elements.targetPace) {
        elements.targetPace.addEventListener('input', (e) => {
            validateTimeInput(e);
            updateTimeFromPace();
        });
    }
    
    // Distance input
    if (elements.raceDistance) {
        elements.raceDistance.addEventListener('input', handleDistanceInput);
        elements.raceDistance.addEventListener('change', handleDistanceChange);
    }
    
    // Distance preset buttons
    document.querySelectorAll('.preset-btn-compact').forEach(btn => {
        btn.addEventListener('click', () => {
            const distance = parseFloat(btn.dataset.distance);
            if (distance && distance >= 100) {
                elements.raceDistance.value = distance;
                currentDistance = distance;
                updatePaceFromTime();
                
                // Update button states
                document.querySelectorAll('.preset-btn-compact').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
        });
    });
    
    // Strategy option buttons (new design)
    document.querySelectorAll('.strategy-btn-simple').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.strategy-btn-simple').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentStrategy = btn.dataset.strategy;
            
            // Show/hide advanced options
            if (currentStrategy === 'progressive' || currentStrategy === 'degressive' || currentStrategy === 'custom') {
                if (elements.advancedStrategyOptions) {
                    elements.advancedStrategyOptions.style.display = 'block';
                }
                
                // Set default values
                if (currentStrategy === 'progressive') {
                    if (elements.paceChange) elements.paceChange.value = -2;
                    paceChangePer400m = -2;
                } else if (currentStrategy === 'degressive') {
                    if (elements.paceChange) elements.paceChange.value = 2;
                    paceChangePer400m = 2;
                }
            } else {
                if (elements.advancedStrategyOptions) {
                    elements.advancedStrategyOptions.style.display = 'none';
                }
            }
            
            // Update old strategy buttons for compatibility
            elements.strategyButtons.forEach(b => {
                b.classList.toggle('active', b.dataset.strategy === currentStrategy);
            });
        });
    });
    
    // Advanced strategy controls
    if (elements.progressionType) {
        elements.progressionType.addEventListener('change', () => {
            progressionType = elements.progressionType.value;
        });
    }
    
    if (elements.paceChange) {
        elements.paceChange.addEventListener('input', () => {
            paceChangePer400m = parseFloat(elements.paceChange.value) || 0;
        });
    }
    
    if (elements.startPace) {
        elements.startPace.addEventListener('input', () => {
            updatePaceFromTime();
        });
    }
    
    if (elements.endPace) {
        elements.endPace.addEventListener('input', () => {
            updatePaceFromTime();
        });
    }
    
    // Custom split editor
    if (elements.addSplitBtn) {
        elements.addSplitBtn.addEventListener('click', addCustomSplit);
    }
    
    // Initialize custom splits
    initializeCustomSplits();
    
    // Strategy buttons - only update strategy, don't trigger calculations
    elements.strategyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.strategyButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentStrategy = btn.dataset.strategy;
            
            // Update new strategy options for compatibility
            document.querySelectorAll('.strategy-option').forEach(b => {
                b.classList.toggle('active', b.dataset.strategy === currentStrategy);
            });
        });
    });
    
    // Action buttons
    elements.calculateBtn.addEventListener('click', handleCalculateButtonClick);
    
    if (elements.shareBtn) {
        elements.shareBtn.addEventListener('click', handleShare);
    }
    
    if (elements.exportBtn) {
        elements.exportBtn.addEventListener('click', handleExport);
    }
    
    // Theme toggle
    if (elements.themeToggle) {
        elements.themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Tab buttons
    if (elements.tabButtons) {
        elements.tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                switchTab(tab);
            });
        });
    }
    
    // Interval planner
    if (elements.generateIntervalsBtn) {
        elements.generateIntervalsBtn.addEventListener('click', generateIntervals);
    }
    
    // Animation controls
    if (elements.playPauseBtn) {
        elements.playPauseBtn.addEventListener('click', toggleAnimation);
    }
    if (elements.resetBtn) {
        elements.resetBtn.addEventListener('click', resetAnimation);
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Auto-save
    window.addEventListener('beforeunload', saveToLocalStorage);
}

// Track drawing functions
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

function drawTrack() {
    const svg = document.querySelector('svg');
    const stadiumG = document.getElementById('stadium');
    const trackBaseG = document.getElementById('track-base');
    const boundariesG = document.getElementById('lane-boundaries');
    const infieldG = document.getElementById('infield');
    
    const LANE_W = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--lane-w'));
    
    // Build stadium apron
    const outerBoundaryInset = 7.5 * LANE_W;
    const pad = 42;
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
    
    // Infield fill
    const infieldInset = -LANE_W/2 - 1;
    const infieldPath = document.createElementNS('http://www.w3.org/2000/svg','path');
    infieldPath.setAttribute('d', pathAtInset(infieldInset));
    infieldPath.setAttribute('fill', getComputedStyle(document.documentElement).getPropertyValue('--field'));
    infieldG.appendChild(infieldPath);
    
    // Track lanes
    for(let i=1; i<=8; i++) {
        const inset = (i - 1) * LANE_W;
        const p = document.createElementNS('http://www.w3.org/2000/svg','path');
        p.setAttribute('d', pathAtInset(inset));
        p.setAttribute('fill','none');
        p.setAttribute('stroke', getComputedStyle(document.documentElement).getPropertyValue('--track'));
        p.setAttribute('stroke-width', LANE_W);
        p.setAttribute('opacity', 0.98);
        p.setAttribute('id', `lane-${i}`);
        trackBaseG.appendChild(p);
        lanePaths[i] = p;
    }
    
    // White lane boundaries
    for(let j=0; j<=8; j++) {
        const inset = (j - 0.5) * LANE_W;
        const b = document.createElementNS('http://www.w3.org/2000/svg','path');
        b.setAttribute('d', pathAtInset(inset));
        b.setAttribute('fill','none');
        b.setAttribute('stroke','#ffffff');
        b.setAttribute('stroke-width','3');
        boundariesG.appendChild(b);
    }
    
    lane1 = lanePaths[1];
    totalLen = lane1.getTotalLength();
}

function drawMarkers() {
    function drawPerpMarker(s, label, opts={}) {
        const sNorm = (s % totalLen + totalLen) % totalLen;
        const p0 = lane1.getPointAtLength(sNorm);
        const p1 = lane1.getPointAtLength((sNorm + 0.01) % totalLen);
        const dx = p1.x - p0.x, dy = p1.y - p0.y;
        const mag = Math.hypot(dx, dy) || 1;
        const tx = dx / mag, ty = dy / mag;
        const nx = ty, ny = -tx;
        
        const LANE_W = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--lane-w'));
        const innerOff = -0.5 * LANE_W;
        const outerOff = 7.5 * LANE_W;
        
        const x1 = p0.x + nx * innerOff;
        const y1 = p0.y + ny * innerOff;
        const x2 = p0.x + nx * outerOff;
        const y2 = p0.y + ny * outerOff;
        
        const markersG = document.getElementById('markers');
        const numbersG = document.getElementById('lane-numbers');
        
        const drawSingle = (ox=0, oy=0) => {
            const line = document.createElementNS('http://www.w3.org/2000/svg','line');
            line.setAttribute('x1', x1 + ox);
            line.setAttribute('y1', y1 + oy);
            line.setAttribute('x2', x2 + ox);
            line.setAttribute('y2', y2 + oy);
            line.setAttribute('stroke', '#ffffff');
            line.setAttribute('stroke-width', 3);
            markersG.appendChild(line);
        };
        
        if(opts.start) {
            const sep = 6;
            drawSingle(0, 0);
            drawSingle(-tx * sep, -ty * sep);
            
            // Lane numbers
            for(let i=1; i<=8; i++) {
                const laneOff = (i-1) * LANE_W;
                const cx = p0.x + nx * laneOff - tx * 18;
                const cy = p0.y + ny * laneOff - ty * 18;
                const t = document.createElementNS('http://www.w3.org/2000/svg','text');
                t.textContent = i;
                t.setAttribute('x', cx);
                t.setAttribute('y', cy);
                t.setAttribute('fill', '#ffffff');
                t.setAttribute('font-size', '14');
                t.setAttribute('font-weight', '800');
                t.setAttribute('text-anchor', 'middle');
                t.setAttribute('dominant-baseline', 'middle');
                numbersG.appendChild(t);
            }
            

        } else {
            drawSingle(0, 0);
        }
    }
    
    // Place markers
    drawPerpMarker(0, '', {start:true});
    drawPerpMarker(totalLen * 0.25, '');
    drawPerpMarker(totalLen * 0.50, '');
    drawPerpMarker(totalLen * 0.75, '');
}

function addRoundIndicators() {
    const roundIndicatorsG = document.getElementById('round-indicators');
    roundIndicatorsG.replaceChildren(); // Clear existing indicators
    const laneDistance = LANE_DISTANCES[currentLane];
    const totalLaps = Math.ceil(TRACK_CONSTANTS.TOTAL_DISTANCE / laneDistance);
    
    for(let lap = 1; lap <= totalLaps; lap++) {
        const distance = lap * laneDistance;
        const lapProgress = (distance % laneDistance) / laneDistance;
        const position = calculateTrackPosition(1 - lapProgress);
        
        const indicator = document.createElementNS('http://www.w3.org/2000/svg','circle');
        indicator.setAttribute('cx', position.x);
        indicator.setAttribute('cy', position.y);
        indicator.setAttribute('r', '8');
        indicator.setAttribute('class', 'round-indicator');
        indicator.setAttribute('data-lap', lap);
        indicator.setAttribute('data-distance', distance);
        indicator.setAttribute('fill', 'transparent');
        indicator.setAttribute('stroke', 'transparent');
        roundIndicatorsG.appendChild(indicator);
    }
}

function calculateTrackPosition(lapProgress) {
    const s = lapProgress * totalLen;
    const point = lane1.getPointAtLength(s);
    return { x: point.x, y: point.y };
}

// Core calculation functions
function calculatePace() {
    if (!validateInputs()) {
        return;
    }
    
    // Get current distance
    const distance = getCurrentDistance();
    TRACK_CONSTANTS.TOTAL_DISTANCE = distance;
    
    const timeStr = elements.goalTime.value;
    const totalMs = parseTimeToMs(timeStr);
    const laneDistance = LANE_DISTANCES[currentLane];
    const totalLaps = Math.ceil(TRACK_CONSTANTS.TOTAL_DISTANCE / laneDistance);
    const basePacePerKm = (totalMs / 1000) / (TRACK_CONSTANTS.TOTAL_DISTANCE / 1000);
    
    const data = generatePaceData(totalMs, laneDistance, totalLaps, basePacePerKm);
    currentPaceData = data;
    
    updateResults(data);
    updateTrackVisualization(data);
    updateAnimationState(data);
    updatePaceChart(data);
}

function handleCalculateButtonClick() {
    // Add success feedback to calculate button
    const calculateBtn = elements.calculateBtn;
    calculateBtn.classList.add('success');
    setTimeout(() => {
        calculateBtn.classList.remove('success');
    }, 1500);
    
    // Reset animation state before calculating new pace
    resetAnimation();
    
    // Calculate new pace data
    calculatePace();
    
    // Update URL with current settings
    updateURL();
}

function generatePaceData(totalMs, laneDistance, totalLaps, basePacePerKm) {
    const data = {
        totalTime: totalMs,
        laneDistance: laneDistance,
        totalLaps: totalLaps,
        basePacePerKm: basePacePerKm,
        strategy: currentStrategy, // Store the strategy used for this calculation
        totalDistance: TRACK_CONSTANTS.TOTAL_DISTANCE,
        splits: [],
        segments: [],
        paceData: [] // For chart visualization
    };
    
    // Generate splits for different distances (adjust based on race distance)
    let splitDistances = [100, 200, 400];
    if (TRACK_CONSTANTS.TOTAL_DISTANCE >= 5000) {
        splitDistances.push(1000);
    }
    
    splitDistances.forEach(splitDist => {
        const splits = [];
        for(let distance = splitDist; distance <= TRACK_CONSTANTS.TOTAL_DISTANCE; distance += splitDist) {
            const expectedTime = calculateExpectedTime(distance, basePacePerKm);
            splits.push({
                distance: distance,
                expectedTime: expectedTime,
                pace: (expectedTime / 1000) / (distance / 1000)
            });
        }
        data.splits.push({ distance: splitDist, splits: splits });
    });
    
    // Generate lap segments
    for(let lap = 1; lap <= totalLaps; lap++) {
        const lapDistance = lap * laneDistance;
        const expectedTime = calculateExpectedTime(lapDistance, basePacePerKm);
        const prevLapDistance = (lap - 1) * laneDistance;
        const prevExpectedTime = calculateExpectedTime(prevLapDistance, basePacePerKm);
        
        data.segments.push({
            lap: lap,
            distance: lapDistance,
            segmentDistance: laneDistance,
            expectedTime: expectedTime,
            segmentTime: expectedTime - prevExpectedTime,
            pace: ((expectedTime - prevExpectedTime) / 1000) / (laneDistance / 1000)
        });
    }
    
    // Generate pace data points for chart (every 100m)
    for(let dist = 100; dist <= TRACK_CONSTANTS.TOTAL_DISTANCE; dist += 100) {
        const expectedTime = calculateExpectedTime(dist, basePacePerKm);
        const pace = (expectedTime / 1000) / (dist / 1000); // seconds per km
        data.paceData.push({
            distance: dist,
            time: expectedTime / 1000,
            pace: pace
        });
    }
    
    return data;
}

function calculateExpectedTime(distance, basePacePerKmParam = null, strategyParam = null) {
    // Use provided basePacePerKm or fall back to currentPaceData
    let basePacePerKm;
    
    if (basePacePerKmParam !== null) {
        basePacePerKm = basePacePerKmParam;
    } else if (currentPaceData) {
        basePacePerKm = currentPaceData.basePacePerKm;
    } else {
        // If no pace data is available, calculate from goal time
        const goalTimeMs = parseTimeToMs(elements.goalTime.value);
        const laneDistance = LANE_DISTANCES[currentLane];
        const totalLaps = TRACK_CONSTANTS.TOTAL_DISTANCE / laneDistance;
        basePacePerKm = (goalTimeMs / 1000) / (TRACK_CONSTANTS.TOTAL_DISTANCE / 1000);
    }
    
    // Use provided strategy, stored strategy from pace data, or fall back to current strategy
    const strategy = strategyParam || (currentPaceData ? currentPaceData.strategy : currentStrategy);
    
    // Apply pacing strategy
    let paceMultiplier = 1.0;
    
    switch(strategy) {
        case 'even':
            paceMultiplier = 1.0;
            break;
        case 'neg2':
            // Negative split: -2 seconds per 400m
            const progress = distance / TRACK_CONSTANTS.TOTAL_DISTANCE;
            const secondsPer400m = -2;
            const totalSecondsAdjustment = (distance / 400) * secondsPer400m;
            const baseTimeForDistance = (distance / 1000) * basePacePerKm;
            paceMultiplier = (baseTimeForDistance + totalSecondsAdjustment) / baseTimeForDistance;
            break;
        case 'neg1':
            // Negative split: -1 second per 400m
            const progress2 = distance / TRACK_CONSTANTS.TOTAL_DISTANCE;
            const secondsPer400m2 = -1;
            const totalSecondsAdjustment2 = (distance / 400) * secondsPer400m2;
            const baseTimeForDistance2 = (distance / 1000) * basePacePerKm;
            paceMultiplier = (baseTimeForDistance2 + totalSecondsAdjustment2) / baseTimeForDistance2;
            break;
        case 'pos1':
            // Positive split: +1 second per 400m
            const progress3 = distance / TRACK_CONSTANTS.TOTAL_DISTANCE;
            const secondsPer400m3 = 1;
            const totalSecondsAdjustment3 = (distance / 400) * secondsPer400m3;
            const baseTimeForDistance3 = (distance / 1000) * basePacePerKm;
            paceMultiplier = (baseTimeForDistance3 + totalSecondsAdjustment3) / baseTimeForDistance3;
            break;
        case 'neg5p':
            // Negative split: -5 seconds per 400m (equivalent to ~5% variation)
            const progress4 = distance / TRACK_CONSTANTS.TOTAL_DISTANCE;
            const secondsPer400m4 = -5;
            const totalSecondsAdjustment4 = (distance / 400) * secondsPer400m4;
            const baseTimeForDistance4 = (distance / 1000) * basePacePerKm;
            paceMultiplier = (baseTimeForDistance4 + totalSecondsAdjustment4) / baseTimeForDistance4;
            break;
        case 'pos5p':
            // Positive split: +5 seconds per 400m (equivalent to ~5% variation)
            const progress5 = distance / TRACK_CONSTANTS.TOTAL_DISTANCE;
            const secondsPer400m5 = 5;
            const totalSecondsAdjustment5 = (distance / 400) * secondsPer400m5;
            const baseTimeForDistance5 = (distance / 1000) * basePacePerKm;
            paceMultiplier = (baseTimeForDistance5 + totalSecondsAdjustment5) / baseTimeForDistance5;
            break;
        case 'kick600':
            // Even pace until 2400m, then gradually increase speed
            if (distance <= 2400) {
                paceMultiplier = 1.0;
            } else {
                const kickProgress = (distance - 2400) / 600;
                paceMultiplier = 1.0 - (kickProgress * 0.05); // 5% faster at finish
            }
            break;
        case 'progressive':
            // Progressive: Get faster throughout the race
            const progressProg = distance / TRACK_CONSTANTS.TOTAL_DISTANCE;
            const secondsPer400mProg = paceChangePer400m || -2;
            let adjustmentProg;
            
            if (progressionType === 'linear') {
                adjustmentProg = (distance / 400) * secondsPer400mProg * progressProg;
            } else if (progressionType === 'exponential') {
                adjustmentProg = (distance / 400) * secondsPer400mProg * (Math.pow(progressProg, 2));
            } else if (progressionType === 'sigmoid') {
                // Sigmoid curve for smooth acceleration
                const sigmoid = 1 / (1 + Math.exp(-10 * (progressProg - 0.5)));
                adjustmentProg = (distance / 400) * secondsPer400mProg * sigmoid;
            } else {
                adjustmentProg = (distance / 400) * secondsPer400mProg * progressProg;
            }
            
            const baseTimeProg = (distance / 1000) * basePacePerKm;
            paceMultiplier = (baseTimeProg + adjustmentProg) / baseTimeProg;
            break;
        case 'degressive':
            // Degressive: Get slower throughout the race
            const progressDeg = distance / TRACK_CONSTANTS.TOTAL_DISTANCE;
            const secondsPer400mDeg = paceChangePer400m || 2;
            let adjustmentDeg;
            
            if (progressionType === 'linear') {
                adjustmentDeg = (distance / 400) * secondsPer400mDeg * progressDeg;
            } else if (progressionType === 'exponential') {
                adjustmentDeg = (distance / 400) * secondsPer400mDeg * (Math.pow(progressDeg, 2));
            } else if (progressionType === 'sigmoid') {
                const sigmoid = 1 / (1 + Math.exp(-10 * (progressDeg - 0.5)));
                adjustmentDeg = (distance / 400) * secondsPer400mDeg * sigmoid;
            } else {
                adjustmentDeg = (distance / 400) * secondsPer400mDeg * progressDeg;
            }
            
            const baseTimeDeg = (distance / 1000) * basePacePerKm;
            paceMultiplier = (baseTimeDeg + adjustmentDeg) / baseTimeDeg;
            break;
        case 'custom':
            // Custom strategy with multiple options
            if (customSplits.length > 0) {
                // Use custom splits if defined
                let prevSplit = { distance: 0, pace: basePacePerKm };
                for (const split of customSplits) {
                    if (distance <= split.distance) {
                        // Interpolate between previous split and current split
                        const segmentProgress = (distance - prevSplit.distance) / (split.distance - prevSplit.distance);
                        const interpolatedPace = prevSplit.pace + (split.pace - prevSplit.pace) * segmentProgress;
                        paceMultiplier = interpolatedPace / basePacePerKm;
                        break;
                    }
                    prevSplit = split;
                }
                // If beyond all splits, use last split pace
                if (distance > customSplits[customSplits.length - 1].distance) {
                    paceMultiplier = customSplits[customSplits.length - 1].pace / basePacePerKm;
                }
            } else if (elements.startPace && elements.endPace && elements.startPace.value && elements.endPace.value) {
                // Use start/end pace if custom splits not defined
                const startPaceSec = parseTimeToMs(elements.startPace.value) / 1000;
                const endPaceSec = parseTimeToMs(elements.endPace.value) / 1000;
                const progressCustom = distance / TRACK_CONSTANTS.TOTAL_DISTANCE;
                
                let interpolatedPace;
                if (progressionType === 'linear') {
                    interpolatedPace = startPaceSec + (endPaceSec - startPaceSec) * progressCustom;
                } else if (progressionType === 'exponential') {
                    interpolatedPace = startPaceSec + (endPaceSec - startPaceSec) * Math.pow(progressCustom, 2);
                } else if (progressionType === 'sigmoid') {
                    const sigmoid = 1 / (1 + Math.exp(-10 * (progressCustom - 0.5)));
                    interpolatedPace = startPaceSec + (endPaceSec - startPaceSec) * sigmoid;
                } else {
                    interpolatedPace = startPaceSec + (endPaceSec - startPaceSec) * progressCustom;
                }
                
                paceMultiplier = interpolatedPace / basePacePerKm;
            } else {
                paceMultiplier = 1.0;
            }
            break;
    }
    

    
    // For even pacing, ensure exact calculation to avoid precision issues
    if (strategy === 'even') {
        return (distance / 1000) * basePacePerKm * 1000;
    }
    
    return (distance / 1000) * basePacePerKm * paceMultiplier * 1000;
}



// Update functions
function updateResults(data) {
    elements.largeTargetTimeDisplay.textContent = `00:00.00 / ${formatTimeFromMs(data.totalTime)}`;
    // Removed references to non-existent elements
    
    // Update page title
    document.title = `3000METER.com – ${elements.goalTime.value}`;
    
    // Update cumulative times
    updateCumulativeTimes(data);
}



function updateTrackVisualization(data) {
    // Reset animation state
    animationState.totalTime = data.totalTime;
    animationState.currentTime = 0;
    animationState.currentDistance = 0;
    animationState.currentLap = 1;
    animationState.lapProgress = 0;
    
    updateRunnerPosition(0, 0);
    updateAnimationUI();
    updateRoundIndicators();
}



function updateAnimationState(data) {
    animationState.totalTime = data.totalTime;
    animationState.currentTime = 0;
    animationState.currentDistance = 0;
    animationState.currentLap = 1;
    animationState.lapProgress = 0;
    
    updateRunnerPosition(0, 0);
    updateAnimationUI();
    updateRoundIndicators();
}

// Animation functions
function toggleAnimation() {
    if (animationState.isPlaying) {
        pauseAnimation();
    } else {
        startAnimation();
    }
}

function startAnimation() {
    if (!currentPaceData) {
        return;
    }
    
    animationState.isPlaying = true;
    animationState.startTime = Date.now() - (animationState.currentTime * 1000);
    elements.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    animationLoop();
}

function pauseAnimation() {
    animationState.isPlaying = false;
    elements.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    if (animationState.animationId) {
        cancelAnimationFrame(animationState.animationId);
        animationState.animationId = null;
    }
}

function resetAnimation() {
    pauseAnimation();
    animationState.currentTime = 0;
    animationState.currentDistance = 0;
    animationState.currentLap = 1;
    animationState.lapProgress = 0;
    updateRunnerPosition(0, 0);
    updateAnimationUI();
    updateRoundIndicators();
}

function updateSpeedFromSlider() {
    if (!elements.speedSlider) return;
    const newSpeed = parseFloat(elements.speedSlider.value);
    updateAnimationSpeed(newSpeed);
}

function updateSpeedFromInput() {
    if (!elements.speedInput) return;
    const newSpeed = parseInt(elements.speedInput.value);
    if (newSpeed >= 1 && newSpeed <= 10) {
        updateAnimationSpeed(newSpeed);
        if (elements.speedSlider) elements.speedSlider.value = newSpeed;
    }
}

function updateAnimationSpeed(newSpeed) {
    if (animationState.isPlaying) {
        const now = Date.now();
        animationState.startTime = now - (animationState.currentTime / newSpeed * 1000);
    }
    animationState.speed = newSpeed;
    if (elements.speedInput) elements.speedInput.value = newSpeed;
    if (elements.speedSlider) elements.speedSlider.value = newSpeed;
}

function animationLoop() {
    if (!animationState.isPlaying) {
        return;
    }
    
    const now = Date.now();
    const elapsed = ((now - animationState.startTime) / 1000) * animationState.speed;
    animationState.currentTime = Math.min(elapsed, animationState.totalTime / 1000);
    const progress = animationState.currentTime / (animationState.totalTime / 1000);
    const totalDistance = currentPaceData?.totalDistance || TRACK_CONSTANTS.TOTAL_DISTANCE;
    const distance = progress * totalDistance;
    animationState.currentDistance = distance;
    animationState.currentLap = Math.floor(distance / LANE_DISTANCES[currentLane]) + 1;
    animationState.lapProgress = 1 - ((distance % LANE_DISTANCES[currentLane]) / LANE_DISTANCES[currentLane]);
    
    updateRunnerPosition(animationState.lapProgress, distance);
    updateAnimationUI();
    updateRoundIndicators();
    
    if (progress < 1) {
        animationState.animationId = requestAnimationFrame(animationLoop);
    } else {
        pauseAnimation();
    }
}

// Utility functions
function validateInputs() {
    const timeStr = elements.goalTime.value;
    const totalMs = parseTimeToMs(timeStr);
    
    if (!totalMs) {
        showToast(isNorwegian ? 'Vennligst skriv inn en gyldig tid i mm:ss format' : 'Please enter a valid time in mm:ss format');
        return false;
    }
    
    return true;
}

// Removed debouncedCalculate function - no longer needed since all updates happen only on Calculate button click

function validateTimeInput(e) {
    let value = e.target.value;
    
    // Remove any non-digit characters except colon and period
    value = value.replace(/[^\d:.]/g, '');
    
    // Ensure only one colon
    const colons = value.match(/:/g);
    if (colons && colons.length > 1) {
        value = value.replace(/:/g, (match, index) => index === value.indexOf(':') ? ':' : '');
    }
    
    // Ensure only one period
    const periods = value.match(/\./g);
    if (periods && periods.length > 1) {
        value = value.replace(/\./g, (match, index) => index === value.indexOf('.') ? '.' : '');
    }
    
    e.target.value = value;
    
    // Update helper text
    const helper = elements.timeHelper;
    if (!value) {
        helper.textContent = '';
        helper.className = 'input-helper';
    } else if (!/^\d{1,2}:\d{2}(\.\d{1,2})?$/.test(value)) {
        helper.textContent = isNorwegian ? 'Format: mm:ss eller mm:ss.t' : 'Format: mm:ss or mm:ss.t';
        helper.className = 'input-helper error';
    } else {
        helper.textContent = '';
        helper.className = 'input-helper success';
    }
}

function updateTimeFromPace() {
    if (!elements.targetPace) return;
    const paceValue = elements.targetPace.value;
    if (!paceValue || paceValue === '') return;
    
    const paceMs = parseTimeToMs(paceValue);
    if (paceMs === 0) return;
    
    // Calculate target time from pace based on current distance
    const distanceKm = getCurrentDistance() / 1000;
    const targetTimeMs = paceMs * distanceKm;
    const targetTimeStr = formatTimeFromMsSimple(targetTimeMs);
    
    elements.goalTime.value = targetTimeStr;
}

function updatePaceFromTime() {
    if (!elements.targetPace) return;
    const timeValue = elements.goalTime.value;
    if (!timeValue || timeValue === '') return;
    
    const timeMs = parseTimeToMs(timeValue);
    if (timeMs === 0) return;
    
    // Calculate pace from target time based on current distance
    const distanceKm = getCurrentDistance() / 1000;
    const paceMs = timeMs / distanceKm;
    const paceStr = formatTimeFromMsSimple(paceMs);
    
    elements.targetPace.value = paceStr;
}

function adjustTime(seconds) {
    const currentValue = elements.goalTime.value;
    const currentMs = parseTimeToMs(currentValue) || 0;
    const newMs = currentMs + (seconds * 1000);
    elements.goalTime.value = formatTimeFromMsSimple(newMs);
    if (elements.targetPace) updatePaceFromTime();
}

function adjustPace(seconds) {
    if (!elements.targetPace) return;
    const currentValue = elements.targetPace.value;
    const currentMs = parseTimeToMs(currentValue) || 0;
    const newMs = currentMs + (seconds * 1000);
    elements.targetPace.value = formatTimeFromMsSimple(newMs);
    updateTimeFromPace();
}

function parseTimeToMs(timeStr) {
    if (!timeStr) return null;
    
    const parts = timeStr.split(':');
    if (parts.length !== 2) return null;
    
    const minutes = parseInt(parts[0]);
    const seconds = parseFloat(parts[1]);
    
    if (isNaN(minutes) || isNaN(seconds) || seconds >= 60) return null;
    
    return (minutes * 60 + seconds) * 1000;
}

function formatTimeFromMs(ms) {
    if (!ms || ms < 0) return '00:00.00';
    
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const hundredths = Math.floor((ms % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
}

function formatTime(seconds) {
    if (!seconds || seconds < 0) return '00:00.00';
    
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.00`;
}

function formatTimeFromMsSimple(ms) {
    if (!ms || ms < 0) return '00:00';
    
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function formatTimeSimple(seconds) {
    if (!seconds || seconds < 0) return '00:00';
    
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}



function updateRunnerPosition(lapProgress, distance) {
    const position = calculateTrackPosition(lapProgress);
    
    elements.runnerDot.setAttribute('cx', position.x);
    elements.runnerDot.setAttribute('cy', position.y);
    
    // Update lap progress bar
    const totalDistance = currentPaceData?.totalDistance || TRACK_CONSTANTS.TOTAL_DISTANCE;
    const progressPercent = (distance / totalDistance) * 100;
    if (elements.lapProgressFill) {
        elements.lapProgressFill.style.width = `${Math.max(0, progressPercent)}%`;
    }
}

function updateAnimationUI() {
    elements.currentLapDisplay.textContent = animationState.currentLap;
    elements.currentDistanceDisplay.textContent = `${Math.round(animationState.currentDistance)}m`;
    
    // Update current pace display
    const currentPace = calculateCurrentPace();
    elements.currentPaceDisplay.textContent = currentPace;
    
    const totalDistance = currentPaceData?.totalDistance || TRACK_CONSTANTS.TOTAL_DISTANCE;
    const progressPercent = Math.round((animationState.currentDistance / totalDistance) * 100);
    elements.progressPercentDisplay.textContent = `${progressPercent}%`;
    
    // Update the large target time display with current time / target time format
    const currentTimeFormatted = formatTimeFromMs(animationState.currentTime * 1000);
    // Use stored pace data instead of reading from input field to prevent real-time changes
    const targetTimeFormatted = currentPaceData ? formatTimeFromMs(currentPaceData.totalTime) : formatTimeFromMs(parseTimeToMs(elements.goalTime.value) || 0);
    elements.largeTargetTimeDisplay.textContent = `${currentTimeFormatted} / ${targetTimeFormatted}`;
    
    // Update cumulative times during animation
    if (currentPaceData) {
        updateCumulativeTimes(currentPaceData);
    }
    

}

function calculateCurrentPace() {
    if (animationState.currentDistance <= 0) return '--:--';
    
    const currentTimeMs = animationState.currentTime * 1000;
    const currentDistanceKm = animationState.currentDistance / 1000;
    const pacePerKm = currentTimeMs / currentDistanceKm;
    
    // Round to nearest second to reduce jittering
    const roundedPaceMs = Math.round(pacePerKm / 1000) * 1000;
    
    return formatTimeFromMsSimple(roundedPaceMs);
}

function adjustSpeed(delta) {
    if (!elements.speedInput) return;
    const currentSpeed = parseInt(elements.speedInput.value) || 1;
    const newSpeed = Math.max(1, Math.min(10, currentSpeed + delta));
    updateAnimationSpeed(newSpeed);
}

function updateRoundIndicators() {
    const currentLap = animationState.currentLap;
    const currentDistance = animationState.currentDistance;
    
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

function updateRoundList() {
    // Clock splits display removed from UI
}

function updateCumulativeTimes(data) {
    if (!data) return;
    
    const currentDistance = animationState.currentDistance;
    
    // Function to populate a specific interval table
    function populateIntervalTable(containerId, interval) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        
        for (let distance = interval; distance <= data.totalDistance; distance += interval) {
            const expectedTime = calculateExpectedTime(distance, data.basePacePerKm, data.strategy);
            const timeFormatted = formatTimeFromMsSimple(expectedTime);
            
            const row = document.createElement('div');
            row.className = 'cumulative-time-row';
            
            // Determine row state
            if (Math.abs(distance - currentDistance) < 50) {
                row.classList.add('current');
            } else if (distance < currentDistance) {
                row.classList.add('completed');
            }
            
            row.innerHTML = `
                <span class="distance">${distance}m</span>
                <span class="time">${timeFormatted}</span>
            `;
            
            container.appendChild(row);
        }
    }
    
    // Populate tables based on available splits
    if (data.splits) {
        data.splits.forEach(splitData => {
            if (splitData.distance === 200) {
                populateIntervalTable('cumulativeTimes200m', 200);
            } else if (splitData.distance === 400) {
                populateIntervalTable('cumulativeTimes400m', 400);
            } else if (splitData.distance === 1000) {
                populateIntervalTable('cumulativeTimes1000m', 1000);
            }
        });
    }
}



function calculatePaceZone(segmentPace, basePace) {
    const diff = segmentPace - basePace;
    if (diff < -5) return 'fast';
    if (diff > 5) return 'slow';
    return 'even';
}

// UI functions






function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast(isNorwegian ? 'Lenke kopiert til utklippstavle' : 'Link copied to clipboard!');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast(isNorwegian ? 'Lenke kopiert til utklippstavle' : 'Link copied to clipboard!');
    });
}



function loadFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const time = urlParams.get('time');
    const lane = urlParams.get('lane');
    const strategy = urlParams.get('strategy');
    const distance = urlParams.get('distance');
    
    if (time) elements.goalTime.value = time;
    if (lane) {
        currentLane = parseInt(lane);
    }
    if (strategy) {
        currentStrategy = strategy;
        elements.strategyButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.strategy === strategy);
        });
    }
    if (distance) {
        const dist = parseFloat(distance);
        if (dist && dist >= 100) {
            elements.raceDistance.value = dist.toString();
            currentDistance = dist;
        }
    }
    
    // Load from localStorage after URL params
    loadFromLocalStorage();
    
    // Removed automatic calculation - user must click Calculate button
}

function updateURL() {
    const url = new URL(window.location);
    url.searchParams.set('time', elements.goalTime.value);
    url.searchParams.set('distance', currentDistance);
    url.searchParams.set('lane', currentLane);
    url.searchParams.set('strategy', currentStrategy);
    window.history.replaceState({}, '', url);
}

function toggleLanguage() {
    isNorwegian = !isNorwegian;
    updateLanguageUI();
    updateI18n();
    saveToLocalStorage();
}

function updateI18n() {
    const lang = isNorwegian ? 'no' : 'en';
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
}

function updateLanguageUI() {
    // Language is fixed to Norwegian - no UI update needed
}



function handleKeyboardShortcuts(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'Enter':
                e.preventDefault();
                // Removed automatic calculation - user must click Calculate button
                break;
        }
    }
    
    // Animation controls
    if (e.key === ' ') {
        e.preventDefault();
        toggleAnimation();
    } else if (e.key === 'r') {
        e.preventDefault();
        resetAnimation();
    } else if (e.key === 's' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        // Toggle speed between 1x and 2x
        if (elements.speedInput) {
            const currentSpeed = parseFloat(elements.speedInput.value) || 1;
            const newSpeed = currentSpeed === 1 ? 2 : 1;
            updateAnimationSpeed(newSpeed);
        }
    }
    
    // Time adjustments
    if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        adjustTime(e.shiftKey ? 5 : 1);
    } else if (e.key === '-') {
        e.preventDefault();
        adjustTime(e.shiftKey ? -5 : -1);
    }
}

function saveToLocalStorage() {
    const data = {
        goalTime: elements.goalTime.value,
        lane: currentLane,
        strategy: currentStrategy,
        isNorwegian: isNorwegian,
        distance: currentDistance,
        isDarkMode: isDarkMode
    };
    localStorage.setItem('3000mRunner', JSON.stringify(data));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('3000mRunner');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data.goalTime) elements.goalTime.value = data.goalTime;
            if (data.lane) currentLane = data.lane;
            if (data.strategy) currentStrategy = data.strategy;
            if (data.isNorwegian !== undefined) isNorwegian = data.isNorwegian;
            if (data.distance) currentDistance = data.distance;
            if (data.isDarkMode !== undefined) isDarkMode = data.isDarkMode;
        } catch (e) {
            console.error('Error loading from localStorage:', e);
        }
    }
}

// New feature functions

function getCurrentDistance() {
    if (!elements.raceDistance) return 3000;
    
    const distance = parseFloat(elements.raceDistance.value);
    return distance && distance >= 100 ? distance : 3000;
}

function handleDistanceInput() {
    const distance = parseFloat(elements.raceDistance.value);
    if (distance && distance >= 100) {
        currentDistance = distance;
        
        // Update active preset button if matches
        document.querySelectorAll('.preset-btn-compact').forEach(btn => {
            const btnDist = parseFloat(btn.dataset.distance);
            if (Math.abs(btnDist - distance) < 0.1) {
                document.querySelectorAll('.preset-btn-compact').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            } else if (!document.querySelector('.preset-btn-compact.active')) {
                // If no exact match, remove all active states
                btn.classList.remove('active');
            }
        });
        
        updatePaceFromTime();
    }
}

function handleDistanceChange() {
    const distance = parseFloat(elements.raceDistance.value);
    if (distance && distance >= 100) {
        currentDistance = distance;
        updatePaceFromTime();
    }
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    elements.themeToggle.innerHTML = isDarkMode 
        ? '<i class="fas fa-sun"></i>' 
        : '<i class="fas fa-moon"></i>';
    saveToLocalStorage();
    updatePaceChart(currentPaceData); // Redraw chart with new theme
}

function loadThemePreference() {
    loadFromLocalStorage();
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        if (elements.themeToggle) {
            elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }
}

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    elements.tabButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const tabElement = document.getElementById(tabName + 'Tab');
    if (tabElement) {
        tabElement.classList.add('active');
    }
    
    // Activate button
    const btn = Array.from(elements.tabButtons).find(b => b.dataset.tab === tabName);
    if (btn) {
        btn.classList.add('active');
    }
    
    // If switching to chart tab, update chart
    if (tabName === 'chart' && currentPaceData) {
        updatePaceChart(currentPaceData);
    }
}

function updatePaceChart(data) {
    if (!data || !data.paceData || data.paceData.length === 0) return;
    
    const canvas = document.getElementById('paceChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const isDark = document.body.classList.contains('dark-mode');
    
    // Destroy existing chart if it exists
    if (paceChart) {
        paceChart.destroy();
    }
    
    const labels = data.paceData.map(d => `${(d.distance / 1000).toFixed(1)}km`);
    const paceValues = data.paceData.map(d => d.pace / 60); // Convert to minutes per km
    
    paceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pace (min/km)',
                data: paceValues,
                borderColor: isDark ? '#dc2626' : '#dc2626',
                backgroundColor: isDark ? 'rgba(220, 38, 38, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 2,
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: isDark ? '#e5e7eb' : '#374151'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            const pace = context.parsed.y;
                            const minutes = Math.floor(pace);
                            const seconds = Math.round((pace - minutes) * 60);
                            return `Pace: ${minutes}:${seconds.toString().padStart(2, '0')}/km`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Distance',
                        color: isDark ? '#e5e7eb' : '#374151'
                    },
                    ticks: {
                        color: isDark ? '#9ca3af' : '#6b7280'
                    },
                    grid: {
                        color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Pace (min/km)',
                        color: isDark ? '#e5e7eb' : '#374151'
                    },
                    ticks: {
                        color: isDark ? '#9ca3af' : '#6b7280',
                        callback: function(value) {
                            const minutes = Math.floor(value);
                            const seconds = Math.round((value - minutes) * 60);
                            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
                        }
                    },
                    grid: {
                        color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }
                }
            }
        }
    });
}

function generateIntervals() {
    if (!currentPaceData) {
        showToast(isNorwegian ? 'Beregn først et løp' : 'Calculate a race first');
        return;
    }
    
    const intervalDist = parseInt(elements.intervalDistance.value) || 400;
    const restTime = parseInt(elements.intervalRest.value) || 60;
    const reps = parseInt(elements.intervalReps.value) || 8;
    
    const basePace = currentPaceData.basePacePerKm;
    const intervalTime = calculateExpectedTime(intervalDist, basePace) / 1000;
    
    let html = '<div class="interval-list">';
    let totalTime = 0;
    let totalRest = 0;
    
    for (let i = 1; i <= reps; i++) {
        totalTime += intervalTime;
        totalRest += (i < reps ? restTime : 0);
        const paceStr = formatTimeSimple(intervalTime);
        const restStr = i < reps ? `${restTime}s` : 'Finish';
        
        html += `
            <div class="interval-item">
                <span class="interval-rep">Rep ${i}</span>
                <span class="interval-time">${paceStr}</span>
                <span class="interval-rest">${restStr}</span>
            </div>
        `;
    }
    
    html += `
        <div class="interval-summary">
            <div class="summary-item">
                <span>Total Work Time:</span>
                <span>${formatTimeSimple(totalTime)}</span>
            </div>
            <div class="summary-item">
                <span>Total Rest Time:</span>
                <span>${formatTimeSimple(totalRest)}</span>
            </div>
            <div class="summary-item">
                <span>Total Time:</span>
                <span>${formatTimeSimple(totalTime + totalRest)}</span>
            </div>
            <div class="summary-item">
                <span>Total Distance:</span>
                <span>${intervalDist * reps}m</span>
            </div>
        </div>
    `;
    
    html += '</div>';
    elements.intervalResults.innerHTML = html;
}

function handleShare() {
    if (!currentPaceData) {
        showToast(isNorwegian ? 'Beregn først et løp' : 'Calculate a race first');
        return;
    }
    
    const url = new URL(window.location);
    url.searchParams.set('time', elements.goalTime.value);
    url.searchParams.set('distance', currentDistance);
    url.searchParams.set('strategy', currentStrategy);
    
    const shareData = {
        title: `${currentDistance}m Race Plan - ${elements.goalTime.value}`,
        text: `Check out my ${currentDistance}m race plan targeting ${elements.goalTime.value}`,
        url: url.toString()
    };
    
    if (navigator.share) {
        navigator.share(shareData).catch(() => {
            copyToClipboard(url.toString());
        });
    } else {
        copyToClipboard(url.toString());
    }
}

function initializeCustomSplits() {
    // Initialize with empty splits array
    customSplits = [];
    renderCustomSplits();
}

function addCustomSplit() {
    const distance = currentDistance || 3000;
    const basePace = parseTimeToMs(elements.targetPace?.value || '05:00') / 1000;
    
    // Add split at 25%, 50%, 75% of race distance
    const splitDistances = [
        Math.floor(distance * 0.25),
        Math.floor(distance * 0.5),
        Math.floor(distance * 0.75)
    ];
    
    splitDistances.forEach(dist => {
        if (!customSplits.find(s => s.distance === dist)) {
            customSplits.push({
                distance: dist,
                pace: basePace
            });
        }
    });
    
    // Sort by distance
    customSplits.sort((a, b) => a.distance - b.distance);
    renderCustomSplits();
}

function renderCustomSplits() {
    if (!elements.splitEditorList) return;
    
    elements.splitEditorList.innerHTML = '';
    
    // Ensure splits are sorted by distance
    customSplits.sort((a, b) => a.distance - b.distance);
    
    customSplits.forEach((split, index) => {
        const splitRow = document.createElement('div');
        splitRow.className = 'split-editor-row';
        splitRow.innerHTML = `
            <input type="number" class="split-distance-input" value="${split.distance}" min="100" step="100" data-index="${index}">
            <input type="text" class="split-pace-input" value="${formatTimeFromMsSimple(split.pace * 1000)}" placeholder="05:00" data-index="${index}">
            <button type="button" class="btn-remove-split" data-index="${index}">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        elements.splitEditorList.appendChild(splitRow);
        
        // Add event listeners
        const distanceInput = splitRow.querySelector('.split-distance-input');
        const paceInput = splitRow.querySelector('.split-pace-input');
        const removeBtn = splitRow.querySelector('.btn-remove-split');
        
        distanceInput.addEventListener('change', (e) => {
            const idx = parseInt(e.target.dataset.index);
            const newDist = parseFloat(e.target.value);
            if (newDist && newDist >= 100 && idx < customSplits.length) {
                customSplits[idx].distance = newDist;
                customSplits.sort((a, b) => a.distance - b.distance);
                renderCustomSplits();
            }
        });
        
        paceInput.addEventListener('change', (e) => {
            const idx = parseInt(e.target.dataset.index);
            const paceMs = parseTimeToMs(e.target.value);
            if (paceMs && idx < customSplits.length) {
                customSplits[idx].pace = paceMs / 1000;
            }
        });
        
        removeBtn.addEventListener('click', () => {
            const idx = parseInt(removeBtn.dataset.index);
            if (idx < customSplits.length) {
                customSplits.splice(idx, 1);
                renderCustomSplits();
            }
        });
    });
}

function handleExport() {
    if (!currentPaceData) {
        showToast(isNorwegian ? 'Beregn først et løp' : 'Calculate a race first');
        return;
    }
    
    // Create export data
    let exportText = `Race Plan Export\n`;
    exportText += `================\n\n`;
    exportText += `Distance: ${currentDistance}m\n`;
    exportText += `Target Time: ${elements.goalTime.value}\n`;
    exportText += `Strategy: ${currentStrategy}\n`;
    if (elements.targetPace) {
        exportText += `Pace: ${elements.targetPace.value}/km\n\n`;
    }
    exportText += `Splits:\n`;
    exportText += `-------\n\n`;
    
    // Add 400m splits
    const splits400 = currentPaceData.splits.find(s => s.distance === 400);
    if (splits400) {
        exportText += `400m Intervals:\n`;
        splits400.splits.forEach(split => {
            exportText += `${split.distance}m: ${formatTimeFromMsSimple(split.expectedTime)}\n`;
        });
        exportText += `\n`;
    }
    
    // Download as text file
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `race-plan-${currentDistance}m-${elements.goalTime.value.replace(/:/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast(isNorwegian ? 'Eksportert!' : 'Exported!');
}



function setupServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/pwa/sw.js')
            .then(registration => {
                // Service Worker registered successfully
            })
            .catch(registrationError => {
                // Service Worker registration failed
            });
    }
}



// Global functions

