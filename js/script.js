// Global variables and state management
let currentPaceData = null;
let paceChart = null;
let deltaChart = null;
let currentLane = 1;
let currentStrategy = 'even';
let surges = [];
let isNorwegian = false;
let debounceTimer = null;

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
        analytics: "ANALYTICS",
        show_charts: "Show Charts",
        copy_csv: "Copy CSV",
        download_csv: "Download CSV",
        lap: "Lap",
        distance: "Distance",
        time: "Time",
        progress: "Progress",
        rounds: "Rounds",
        surge_start: "Start Distance (m)",
        surge_end: "End Distance (m)",
        surge_pace: "Pace Adjustment (s/km)",
        cancel: "Cancel",
        save: "Save",
        footer_text: "3k Run Tracker - Professional pace calculator for track athletes",
    
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
        analytics: "ANALYSE",
        show_charts: "Vis Grafer",
        copy_csv: "Kopier CSV",
        download_csv: "Last ned CSV",
        lap: "Runde",
        distance: "Distanse",
        time: "Tid",
        progress: "Framgang",
        rounds: "Runder",
        surge_start: "Start Distanse (m)",
        surge_end: "Slutt Distanse (m)",
        surge_pace: "Tempo Justering (s/km)",
        cancel: "Avbryt",
        save: "Lagre",
        footer_text: "3k Løp Sporer - Profesjonell tempo kalkulator for baneløpere"
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
        targetPace: document.getElementById('targetPace'),
        strategyButtons: document.querySelectorAll('.strategy-btn'),
        calculateBtn: document.getElementById('calculateBtn'),
        largeTargetTimeDisplay: document.getElementById('largeTargetTimeDisplay'),
        toggleCharts: document.getElementById('toggleCharts'),
        chartsContainer: document.getElementById('chartsContainer'),
        paceChart: document.getElementById('paceChart'),
        deltaChart: document.getElementById('deltaChart'),
        runnerDot: document.getElementById('runner-dot'),
        roundIndicators: document.getElementById('round-indicators'),
        playPauseBtn: document.getElementById('playPauseBtn'),
        resetBtn: document.getElementById('resetBtn'),
        speedSlider: document.getElementById('speedSlider'),
        speedInput: document.getElementById('speedInput'),
        speedMinusBtn: document.getElementById('speedMinusBtn'),
        speedPlusBtn: document.getElementById('speedPlusBtn'),
        currentLapDisplay: document.getElementById('currentLapDisplay'),
        currentDistanceDisplay: document.getElementById('currentDistanceDisplay'),
        currentPaceDisplay: document.getElementById('currentPaceDisplay'),
        progressPercentDisplay: document.getElementById('progressPercentDisplay'),
        lapProgressFill: document.getElementById('lapProgressFill'),
        languageToggle: document.getElementById('languageToggle'),
        addSurgeBtn: document.getElementById('addSurgeBtn'),
        surgeList: document.getElementById('surgeList'),
        surgeModal: document.getElementById('surgeModal'),
        surgeStart: document.getElementById('surgeStart'),
        surgeEnd: document.getElementById('surgeEnd'),
        surgePace: document.getElementById('surgePace'),
        saveSurge: document.getElementById('saveSurge'),
        cancelSurge: document.getElementById('cancelSurge'),
        progressiveSection: document.getElementById('progressiveSection'),
        startPace: document.getElementById('startPace'),
        endPace: document.getElementById('endPace'),
        curveType: document.getElementById('curveType'),
        timeHelper: document.getElementById('timeHelper'),
        paceHelper: document.getElementById('paceHelper'),
        cumulativeTimesList: document.getElementById('cumulativeTimesList'),
        toast: document.getElementById('toast')
    };
    
    // Debug: Check if critical elements are found
    console.log('Critical elements check:');
    console.log('goalTime:', elements.goalTime);
    console.log('playPauseBtn:', elements.playPauseBtn);
    console.log('resetBtn:', elements.resetBtn);
    console.log('speedSlider:', elements.speedSlider);
    console.log('speedInput:', elements.speedInput);
    console.log('largeTargetTimeDisplay:', elements.largeTargetTimeDisplay);
    console.log('runnerDot:', elements.runnerDot);
    
    // Set initial language based on browser
    if (navigator.language.startsWith('no')) {
        isNorwegian = true;
    }
    
    initializeApp();
    setupEventListeners();
    setupServiceWorker();
    loadFromURL();
    updateLanguageUI();
    updateI18n();
});

function initializeApp() {
    console.log('initializeApp called');
    drawTrack();
    drawMarkers();
    addRoundIndicators();
    // Ensure animation state is initialized
    console.log('Calling calculatePace from initializeApp');
    calculatePace();
    console.log('initializeApp completed');
}

function setupEventListeners() {
    // Input event listeners
    elements.goalTime.addEventListener('input', (e) => {
        validateTimeInput(e);
        updatePaceFromTime();
    });
    elements.goalTime.addEventListener('blur', debouncedCalculate);
    
    // Target pace input listeners
    elements.targetPace.addEventListener('input', (e) => {
        validateTimeInput(e);
        updateTimeFromPace();
    });
    elements.targetPace.addEventListener('blur', debouncedCalculate);
    
    // Strategy buttons
    elements.strategyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.strategyButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentStrategy = btn.dataset.strategy;
            updateProgressiveSection();
            debouncedCalculate();
        });
    });
    
    // Progressive inputs
    elements.startPace.addEventListener('input', debouncedCalculate);
    elements.endPace.addEventListener('input', debouncedCalculate);
    elements.curveType.addEventListener('change', debouncedCalculate);
    
    // Time adjustment buttons
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const adjust = parseInt(btn.dataset.adjust);
            // Check if the button is in the target pace section
            const isPaceButton = btn.closest('.input-group') && 
                                btn.closest('.input-group').querySelector('#targetPace');
            if (isPaceButton) {
                adjustPace(adjust);
            } else {
                adjustTime(adjust);
            }
        });
    });
    
    // Surge management
    elements.addSurgeBtn.addEventListener('click', showSurgeModal);
    document.getElementById('saveSurge').addEventListener('click', saveSurge);
    document.getElementById('cancelSurge').addEventListener('click', hideSurgeModal);
    
    // Action buttons
    elements.calculateBtn.addEventListener('click', handleCalculateButtonClick);
    

    
    // UI toggles
    elements.languageToggle.addEventListener('click', toggleLanguage);
    
    // Tab buttons (removed - now showing all splits in one table)
    
    // Animation controls
    elements.playPauseBtn.addEventListener('click', toggleAnimation);
    elements.resetBtn.addEventListener('click', resetAnimation);
    
    // Speed controls
    elements.speedSlider.addEventListener('input', updateSpeedFromSlider);
    elements.speedInput.addEventListener('input', updateSpeedFromInput);
    elements.speedMinusBtn.addEventListener('click', () => adjustSpeed(-1));
    elements.speedPlusBtn.addEventListener('click', () => adjustSpeed(1));
    
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
    console.log('calculatePace called');
    
    if (!validateInputs()) {
        return;
    }
    
    const timeStr = elements.goalTime.value;
    const totalMs = parseTimeToMs(timeStr);
    const laneDistance = LANE_DISTANCES[currentLane];
    const totalLaps = Math.ceil(TRACK_CONSTANTS.TOTAL_DISTANCE / laneDistance);
    const basePacePerKm = (totalMs / 1000) / (TRACK_CONSTANTS.TOTAL_DISTANCE / 1000);
    
    console.log('Pace calculation:', { timeStr, totalMs, laneDistance, totalLaps, basePacePerKm });
    
    const data = generatePaceData(totalMs, laneDistance, totalLaps, basePacePerKm);
    currentPaceData = data;
    
    console.log('Generated pace data:', data);
    
    updateResults(data);
    updateTrackVisualization(data);
    updateCharts(data);
    updateAnimationState(data);
    
    console.log('Animation state after update:', animationState);
}

function handleCalculateButtonClick() {
    // Add success feedback to calculate button
    const calculateBtn = elements.calculateBtn;
    calculateBtn.classList.add('success');
    setTimeout(() => {
        calculateBtn.classList.remove('success');
    }, 1500);
    
    calculatePace();
}

function generatePaceData(totalMs, laneDistance, totalLaps, basePacePerKm) {
    const data = {
        totalTime: totalMs,
        laneDistance: laneDistance,
        totalLaps: totalLaps,
        basePacePerKm: basePacePerKm,
        splits: [],
        segments: []
    };
    
    // Generate splits for different distances
    const splitDistances = [100, 200, 400, 1000];
    
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
    
    return data;
}

function calculateExpectedTime(distance, basePacePerKmParam = null) {
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
    
    // Apply pacing strategy
    let paceMultiplier = 1.0;
    
    switch(currentStrategy) {
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
            // Negative split: start 5% slower, end 5% faster
            const progress4 = distance / TRACK_CONSTANTS.TOTAL_DISTANCE;
            paceMultiplier = 1.05 - (progress4 * 0.10);
            break;
        case 'pos5p':
            // Positive split: start 5% faster, end 5% slower
            const progress5 = distance / TRACK_CONSTANTS.TOTAL_DISTANCE;
            paceMultiplier = 0.95 + (progress5 * 0.10);
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
        case 'custom':
            // Use progressive inputs if available
            if (elements.startPace.value && elements.endPace.value) {
                const startPace = parseTimeToMs(elements.startPace.value) / 1000;
                const endPace = parseTimeToMs(elements.endPace.value) / 1000;
                const progress6 = distance / TRACK_CONSTANTS.TOTAL_DISTANCE;
                paceMultiplier = startPace + (endPace - startPace) * progress6;
            }
            break;
    }
    
    // For even pacing, ensure exact calculation to avoid precision issues
    if (currentStrategy === 'even') {
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

function updateCharts(data) {
    if (elements.chartsContainer.style.display === 'none') return;
    
    updatePaceChart(data);
    updateDeltaChart(data);
}

function updatePaceChart(data) {
    if (paceChart) {
        paceChart.destroy();
    }
    
    const ctx = elements.paceChart.getContext('2d');
    const labels = data.segments.map(s => `Lap ${s.lap}`);
    const paces = data.segments.map(s => s.pace);
    
    // Convert pace values to mm:ss format for display
    const formatPace = (pace) => {
        const minutes = Math.floor(pace / 60);
        const seconds = Math.floor(pace % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };
    
    paceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pace (mm:ss/km)',
                data: paces,
                borderColor: '#dc2626',
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    reverse: true,
                    ticks: {
                        callback: function(value) {
                            return formatPace(value);
                        },
                        stepSize: 60 // 60 seconds = 1 minute, ensures no duplicate ticks
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Pace: ${formatPace(context.parsed.y)}/km`;
                        }
                    }
                }
            }
        }
    });
}

function updateDeltaChart(data) {
    if (deltaChart) {
        deltaChart.destroy();
    }
    
    const ctx = elements.deltaChart.getContext('2d');
    const labels = data.segments.map(s => `Lap ${s.lap}`);
    const deltas = data.segments.map(s => {
        const expected = s.segmentTime;
        // For even pacing, each lap should take the same time
        const target = data.totalTime / data.totalLaps;
        const delta = ((expected - target) / 1000);
        // Round to 1 decimal place to avoid floating point precision issues
        return Math.round(delta * 10) / 10;
    });
    
    // Calculate dynamic Y-axis range based on data
    const maxDelta = Math.max(...deltas.map(Math.abs));
    const yMin = Math.max(-10, -Math.ceil(maxDelta * 1.2)); // At least -10, but can go lower if needed
    const yMax = Math.max(10, Math.ceil(maxDelta * 1.2));   // At least 10, but can go higher if needed
    
    deltaChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Time Delta (s) - Shows how much faster/slower each lap is compared to the target even pace',
                data: deltas,
                backgroundColor: deltas.map(d => d > 0 ? '#ef4444' : '#10b981'),
                borderColor: deltas.map(d => d > 0 ? '#dc2626' : '#059669'),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: yMin,
                    max: yMax,
                    ticks: {
                        stepSize: Math.max(1, Math.ceil((yMax - yMin) / 10)) // Dynamic step size
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            const sign = value > 0 ? '+' : '';
                            return `Delta: ${sign}${value}s (${value > 0 ? 'slower' : 'faster'} than target)`;
                        }
                    }
                }
            }
        }
    });
}

function updateAnimationState(data) {
    console.log('updateAnimationState called with data:', data);
    animationState.totalTime = data.totalTime;
    animationState.currentTime = 0;
    animationState.currentDistance = 0;
    animationState.currentLap = 1;
    animationState.lapProgress = 0;
    
    console.log('Animation state updated:', animationState);
    
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
    console.log('startAnimation called');
    console.log('currentPaceData:', currentPaceData);
    console.log('animationState:', animationState);
    
    if (!currentPaceData) {
        console.log('No currentPaceData, returning');
        return;
    }
    
    animationState.isPlaying = true;
    animationState.startTime = Date.now() - (animationState.currentTime * 1000);
    elements.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    console.log('Starting animation loop');
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
    const newSpeed = parseFloat(elements.speedSlider.value);
    updateAnimationSpeed(newSpeed);
}

function updateSpeedFromInput() {
    const newSpeed = parseInt(elements.speedInput.value);
    if (newSpeed >= 1 && newSpeed <= 10) {
        updateAnimationSpeed(newSpeed);
        elements.speedSlider.value = newSpeed;
    }
}

function updateAnimationSpeed(newSpeed) {
    if (animationState.isPlaying) {
        const now = Date.now();
        animationState.startTime = now - (animationState.currentTime / newSpeed * 1000);
    }
    animationState.speed = newSpeed;
    elements.speedInput.value = newSpeed;
    elements.speedSlider.value = newSpeed;
}

function animationLoop() {
    if (!animationState.isPlaying) {
        console.log('Animation not playing, returning');
        return;
    }
    
    const now = Date.now();
    const elapsed = ((now - animationState.startTime) / 1000) * animationState.speed;
    animationState.currentTime = Math.min(elapsed, animationState.totalTime / 1000);
    const progress = animationState.currentTime / (animationState.totalTime / 1000);
    const distance = progress * TRACK_CONSTANTS.TOTAL_DISTANCE;
    animationState.currentDistance = distance;
    animationState.currentLap = Math.floor(distance / LANE_DISTANCES[currentLane]) + 1;
    animationState.lapProgress = 1 - ((distance % LANE_DISTANCES[currentLane]) / LANE_DISTANCES[currentLane]);
    
    updateRunnerPosition(animationState.lapProgress, distance);
    updateAnimationUI();
    updateRoundIndicators();
    
    if (progress < 1) {
        animationState.animationId = requestAnimationFrame(animationLoop);
    } else {
        console.log('Animation completed');
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

function debouncedCalculate() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        calculatePace();
        updateURL();
        // Reset animation when analysis changes
        if (animationState.isPlaying) {
            pauseAnimation();
        }
        resetAnimation();
    }, 300);
}

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
    const paceValue = elements.targetPace.value;
    if (!paceValue || paceValue === '') return;
    
    const paceMs = parseTimeToMs(paceValue);
    if (paceMs === 0) return;
    
    // Calculate target time from pace (3000m = 3km)
    const targetTimeMs = paceMs * 3;
    const targetTimeStr = formatTimeFromMsSimple(targetTimeMs);
    
    elements.goalTime.value = targetTimeStr;
}

function updatePaceFromTime() {
    const timeValue = elements.goalTime.value;
    if (!timeValue || timeValue === '') return;
    
    const timeMs = parseTimeToMs(timeValue);
    if (timeMs === 0) return;
    
    // Calculate pace from target time (3000m = 3km)
    const paceMs = timeMs / 3;
    const paceStr = formatTimeFromMsSimple(paceMs);
    
    elements.targetPace.value = paceStr;
}

function adjustTime(seconds) {
    const currentValue = elements.goalTime.value;
    const currentMs = parseTimeToMs(currentValue) || 0;
    const newMs = currentMs + (seconds * 1000);
    elements.goalTime.value = formatTimeFromMsSimple(newMs);
    updatePaceFromTime();
    debouncedCalculate();
}

function adjustPace(seconds) {
    const currentValue = elements.targetPace.value;
    const currentMs = parseTimeToMs(currentValue) || 0;
    const newMs = currentMs + (seconds * 1000);
    elements.targetPace.value = formatTimeFromMsSimple(newMs);
    updateTimeFromPace();
    debouncedCalculate();
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

function updateProgressiveSection() {
    if (currentStrategy === 'custom') {
        elements.progressiveSection.style.display = 'block';
    } else {
        elements.progressiveSection.style.display = 'none';
    }
}

function updateRunnerPosition(lapProgress, distance) {
    const position = calculateTrackPosition(lapProgress);
    
    elements.runnerDot.setAttribute('cx', position.x);
    elements.runnerDot.setAttribute('cy', position.y);
    
    // Update lap progress bar
    const progressPercent = (distance / TRACK_CONSTANTS.TOTAL_DISTANCE) * 100;
    elements.lapProgressFill.style.width = `${Math.max(0, progressPercent)}%`;
}

function updateAnimationUI() {
    elements.currentLapDisplay.textContent = animationState.currentLap;
    elements.currentDistanceDisplay.textContent = `${Math.round(animationState.currentDistance)}m`;
    
    // Update current pace display
    const currentPace = calculateCurrentPace();
    elements.currentPaceDisplay.textContent = currentPace;
    
    const progressPercent = Math.round((animationState.currentDistance / TRACK_CONSTANTS.TOTAL_DISTANCE) * 100);
    elements.progressPercentDisplay.textContent = `${progressPercent}%`;
    
    // Update the large target time display with current time / target time format
    const currentTimeFormatted = formatTimeFromMs(animationState.currentTime * 1000);
    const goalTimeMs = parseTimeToMs(elements.goalTime.value);
    const targetTimeFormatted = formatTimeFromMs(goalTimeMs);
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
    const currentSpeed = parseInt(elements.speedInput.value);
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
    if (!elements.cumulativeTimesList || !data) return;
    
    const container = elements.cumulativeTimesList;
    container.innerHTML = '';
    
    // Get cumulative times for 200m, 400m, and 1000m intervals
    const intervals = [200, 400, 1000];
    const currentDistance = animationState.currentDistance;
    
    intervals.forEach(interval => {
        for (let distance = interval; distance <= TRACK_CONSTANTS.TOTAL_DISTANCE; distance += interval) {
            const expectedTime = calculateExpectedTime(distance, data.basePacePerKm);
            const timeFormatted = formatTimeFromMsSimple(expectedTime);
            
            const row = document.createElement('div');
            row.className = 'cumulative-time-row';
            
            // Determine row state
            if (distance === currentDistance) {
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
    });
}



function calculatePaceZone(segmentPace, basePace) {
    const diff = segmentPace - basePace;
    if (diff < -5) return 'fast';
    if (diff > 5) return 'slow';
    return 'even';
}

// UI functions


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
        showToast(isNorwegian ? 'Vennligst fyll ut alle felter med gyldige tall' : 'Please fill in all fields with valid numbers');
        return;
    }
    
    if (start >= end) {
        showToast(isNorwegian ? 'Slutt distanse må være større enn start distanse' : 'End distance must be greater than start distance');
        return;
    }
    
    // Check for overlaps
    for (let surge of surges) {
        if ((start >= surge.start && start < surge.end) || (end > surge.start && end <= surge.end)) {
            showToast(isNorwegian ? 'Sprint overlapper med eksisterende sprint' : 'Surge overlaps with existing surge');
            return;
        }
    }
    
    const editingIndex = document.getElementById('surgeModal').getAttribute('data-editing');
    
    if (editingIndex !== null) {
        // Update existing surge
        surges[parseInt(editingIndex)] = { start, end, paceAdjustment };
        document.getElementById('surgeModal').removeAttribute('data-editing');
        showToast(isNorwegian ? 'Sprint oppdatert' : 'Surge updated');
    } else {
        // Add new surge
        surges.push({ start, end, paceAdjustment });
        showToast(isNorwegian ? 'Sprint lagt til' : 'Surge added');
    }
    
    updateSurgeList();
    hideSurgeModal();
    debouncedCalculate();
}

function updateSurgeList() {
    let html = '';
    surges.forEach((surge, index) => {
        html += `
            <div class="surge-item" onclick="editSurge(${index})">
                <div class="surge-info">
                    <div>${surge.start}m - ${surge.end}m</div>
                    <div>${surge.paceAdjustment > 0 ? '+' : ''}${surge.paceAdjustment}s/km</div>
                </div>
                <div class="surge-actions">
                    <button class="delete-surge" onclick="event.stopPropagation(); deleteSurge(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    elements.surgeList.innerHTML = html;
}

function editSurge(index) {
    const surge = surges[index];
    document.getElementById('surgeStart').value = surge.start;
    document.getElementById('surgeEnd').value = surge.end;
    document.getElementById('surgePace').value = surge.paceAdjustment;
    
    // Store the index being edited
    document.getElementById('surgeModal').setAttribute('data-editing', index);
    showSurgeModal();
}

function deleteSurge(index) {
    surges.splice(index, 1);
    updateSurgeList();
    debouncedCalculate();
}



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
    
    if (time) elements.goalTime.value = time;
    if (lane) {
        currentLane = parseInt(lane);
    }
    if (strategy) {
        currentStrategy = strategy;
        elements.strategyButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.strategy === strategy);
        });
        updateProgressiveSection();
    }
    
    calculatePace();
}

function updateURL() {
    const url = new URL(window.location);
    url.searchParams.set('time', elements.goalTime.value);
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
    elements.languageToggle.innerHTML = `<i class="fas fa-globe"></i> ${isNorwegian ? 'NO' : 'EN'}`;
}



function handleKeyboardShortcuts(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'Enter':
                e.preventDefault();
                calculatePace();
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
        const currentSpeed = parseFloat(elements.speedInput.value);
        const newSpeed = currentSpeed === 1 ? 2 : 1;
        updateAnimationSpeed(newSpeed);
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
        surges: surges,
        isNorwegian: isNorwegian
    };
    localStorage.setItem('3000mRunner', JSON.stringify(data));
}



function setupServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/pwa/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    }
}



// Global functions
window.deleteSurge = deleteSurge;
window.editSurge = editSurge;
