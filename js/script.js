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
        title: "3000m Track Runner",
        race_setup: "Race Setup",
        target_time: "Target Time (mm:ss)",
        lane: "Lane",
        pacing_strategy: "Pacing Strategy",
        even: "Even",
        neg1: "Neg 1%",
        neg2: "Neg 2.5%",
        pos1: "Pos 1%",
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
        analytics: "Analytics",
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
        footer_text: "3000m Track Runner - Professional pace calculator for track athletes",
    
    },
    no: {
        title: "3000m Bane Løper",
        race_setup: "Løps Oppsett",
        target_time: "Måltid (mm:ss)",
        lane: "Bane",
        pacing_strategy: "Tempo Strategi",
        even: "Jevnt",
        neg1: "Neg 1%",
        neg2: "Neg 2.5%",
        pos1: "Pos 1%",
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
        analytics: "Analyse",
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
        footer_text: "3000m Bane Løper - Profesjonell tempo kalkulator for baneløpere"
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
    languageToggle: document.getElementById('languageToggle'),
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
    lapProgressFill: document.getElementById('lapProgressFill'),
    currentLap: document.getElementById('currentLap'),
    currentDistance: document.getElementById('currentDistance'),
    currentTime: document.getElementById('currentTime'),
    progressPercent: document.getElementById('progressPercent'),
    roundList: document.getElementById('roundList'),
    playPauseBtn: document.getElementById('playPauseBtn'),
    resetBtn: document.getElementById('resetBtn'),
    speedSlider: document.getElementById('speedSlider'),
    speedInput: document.getElementById('speedInput'),
    setupBtn: document.getElementById('setupBtn'),
    copyCsvBtn: document.getElementById('copyCsvBtn'),
    downloadCsvBtn: document.getElementById('downloadCsvBtn'),
    timeHelper: document.getElementById('timeHelper')
};

// Toast function
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 1800);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
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
    drawTrack();
    drawMarkers();
    addRoundIndicators();
    updateRoundList();
    calculatePace();
}

function setupEventListeners() {
    // Input event listeners
    elements.goalTime.addEventListener('input', validateTimeInput);
    elements.goalTime.addEventListener('blur', debouncedCalculate);
    elements.laneSelect.addEventListener('change', debouncedCalculate);
    
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
            adjustTime(adjust);
        });
    });
    
    // Surge management
    elements.addSurgeBtn.addEventListener('click', showSurgeModal);
    document.getElementById('saveSurge').addEventListener('click', saveSurge);
    document.getElementById('cancelSurge').addEventListener('click', hideSurgeModal);
    
    // Action buttons
    elements.calculateBtn.addEventListener('click', calculatePace);
    
    // CSV buttons
    elements.copyCsvBtn.addEventListener('click', copyCSV);
    elements.downloadCsvBtn.addEventListener('click', downloadCSV);
    
    // UI toggles
    elements.languageToggle.addEventListener('click', toggleLanguage);
    elements.toggleCharts.addEventListener('click', toggleCharts);
    
    // Tab buttons
    elements.tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateSplitsTable(currentPaceData);
        });
    });
    
    // Animation controls
    elements.playPauseBtn.addEventListener('click', toggleAnimation);
    elements.resetBtn.addEventListener('click', resetAnimation);
    
    // Speed controls
    elements.speedSlider.addEventListener('input', updateSpeedFromSlider);
    elements.speedInput.addEventListener('input', updateSpeedFromInput);
    
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
    if (!validateInputs()) return;
    
    const timeStr = elements.goalTime.value;
    const totalMs = parseTimeToMs(timeStr);
    const laneDistance = LANE_DISTANCES[currentLane];
    const totalLaps = Math.ceil(TRACK_CONSTANTS.TOTAL_DISTANCE / laneDistance);
    const basePacePerKm = (totalMs / 1000) / (TRACK_CONSTANTS.TOTAL_DISTANCE / 1000);
    
    const data = generatePaceData(totalMs, laneDistance, totalLaps, basePacePerKm);
    currentPaceData = data;
    
    updateResults(data);
    updateSplitsTable(data);
    updateTrackVisualization(data);
    updateCharts(data);
    updateAnimationState(data);
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
            const expectedTime = calculateExpectedTime(distance);
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
        const expectedTime = calculateExpectedTime(lapDistance);
        const prevLapDistance = (lap - 1) * laneDistance;
        const prevExpectedTime = calculateExpectedTime(prevLapDistance);
        
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

function calculateExpectedTime(distance) {
    // Apply pacing strategy
    let paceMultiplier = 1.0;
    
    switch(currentStrategy) {
        case 'even':
            paceMultiplier = 1.0;
            break;
        case 'neg1':
            // Negative split: start 1% slower, end 1% faster
            const progress = distance / TRACK_CONSTANTS.TOTAL_DISTANCE;
            paceMultiplier = 1.01 - (progress * 0.02);
            break;
        case 'neg2':
            // Negative split: start 2.5% slower, end 2.5% faster
            const progress2 = distance / TRACK_CONSTANTS.TOTAL_DISTANCE;
            paceMultiplier = 1.025 - (progress2 * 0.05);
            break;
        case 'pos1':
            // Positive split: start 1% faster, end 1% slower
            const progress3 = distance / TRACK_CONSTANTS.TOTAL_DISTANCE;
            paceMultiplier = 0.99 + (progress3 * 0.02);
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
                const progress4 = distance / TRACK_CONSTANTS.TOTAL_DISTANCE;
                paceMultiplier = startPace + (endPace - startPace) * progress4;
            }
            break;
    }
    
    const basePacePerKm = currentPaceData ? currentPaceData.basePacePerKm : 180; // 3:00/km default
    return (distance / 1000) * basePacePerKm * paceMultiplier * 1000;
}



// Update functions
function updateResults(data) {
    elements.targetTimeDisplay.textContent = formatTimeFromMs(data.totalTime);
    elements.overallPace.textContent = formatTime(data.basePacePerKm);
    elements.avgSpeed.textContent = `${(3.6 / data.basePacePerKm).toFixed(1)} km/h`;
    elements.lapCount.textContent = data.totalLaps.toFixed(1);
    
    // Update page title
    document.title = `3000m – ${elements.goalTime.value}`;
}

function updateSplitsTable(data) {
    const activeTab = document.querySelector('.tab-btn.active');
    const splitDistance = parseInt(activeTab.dataset.distance);
    const splitData = data.splits.find(s => s.distance === splitDistance);
    
    if (!splitData) return;
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>Distance</th>
                    <th>Time</th>
                    <th>Pace</th>
                    <th>Zone</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    splitData.splits.forEach(split => {
        const paceZone = calculatePaceZone(split.pace, data.basePacePerKm);
        const isCurrent = Math.abs(split.distance - animationState.currentDistance) < splitDistance / 2;
        const rowClass = isCurrent ? 'current' : '';
        html += `
            <tr class="${rowClass}">
                <td>${split.distance}m</td>
                <td>${formatTimeFromMs(split.expectedTime)}</td>
                <td>${formatTime(split.pace)}</td>
                <td><span class="pace-zone ${paceZone}">${paceZone}</span></td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    elements.splitsTable.innerHTML = html;
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
    
    paceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pace (min/km)',
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
                    reverse: true
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
        const target = (data.totalTime / data.totalLaps);
        return ((expected - target) / 1000).toFixed(1);
    });
    
    deltaChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Time Delta (s)',
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
                    beginAtZero: true
                }
            }
        }
    });
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
    if (!currentPaceData) return;
    
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
    const newSpeed = parseFloat(elements.speedSlider.value);
    updateAnimationSpeed(newSpeed);
}

function updateSpeedFromInput() {
    const newSpeed = parseFloat(elements.speedInput.value);
    if (newSpeed >= 0.25 && newSpeed <= 8) {
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
    if (!animationState.isPlaying) return;
    
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

function adjustTime(seconds) {
    const currentValue = elements.goalTime.value;
    const currentMs = parseTimeToMs(currentValue) || 0;
    const newMs = currentMs + (seconds * 1000);
    elements.goalTime.value = formatTimeFromMs(newMs);
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
    if (!ms || ms < 0) return '00:00';
    
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const tenths = Math.floor((ms % 1000) / 100);
    
    if (tenths > 0) {
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${tenths}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function formatTime(seconds) {
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
    elements.currentLap.textContent = animationState.currentLap;
    elements.currentDistance.textContent = `${Math.round(animationState.currentDistance)}m`;
    elements.currentTime.textContent = formatTimeFromMs(animationState.currentTime * 1000);
    
    const progressPercent = Math.round((animationState.currentDistance / TRACK_CONSTANTS.TOTAL_DISTANCE) * 100);
    elements.progressPercent.textContent = `${progressPercent}%`;
}

function updateRoundIndicators() {
    const currentLap = animationState.currentLap;
    
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

function updateRoundList() {
    const laneDistance = LANE_DISTANCES[currentLane];
    const totalLaps = Math.ceil(TRACK_CONSTANTS.TOTAL_DISTANCE / laneDistance);
    
    let html = '';
    for(let lap = 1; lap <= totalLaps; lap++) {
        const distance = lap * laneDistance;
        const expectedTime = calculateExpectedTime(distance);
        
        html += `
            <div class="round-item" data-lap="${lap}">
                <span class="round-number">${lap}</span>
                <span class="round-distance">${distance}m</span>
                <span class="round-time">${formatTimeFromMs(expectedTime)}</span>
            </div>
        `;
    }
    
    elements.roundList.innerHTML = html;
}

function calculatePaceZone(segmentPace, basePace) {
    const diff = segmentPace - basePace;
    if (diff < -5) return 'fast';
    if (diff > 5) return 'slow';
    return 'even';
}

// UI functions
function toggleCharts() {
    const isVisible = elements.chartsContainer.style.display !== 'none';
    elements.chartsContainer.style.display = isVisible ? 'none' : 'block';
    elements.toggleCharts.innerHTML = isVisible ? 
        '<i class="fas fa-chart-line"></i> Show Charts' : 
        '<i class="fas fa-chart-line"></i> Hide Charts';
    
    if (!isVisible && currentPaceData) {
        updateCharts(currentPaceData);
    }
}

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

function generateCSV() {
    if (!currentPaceData) {
        showToast(isNorwegian ? 'Beregn først en løpsplan' : 'Calculate a race plan first');
        return null;
    }
    
    const activeTab = document.querySelector('.tab-btn.active');
    const splitDistance = parseInt(activeTab.dataset.distance);
    const splitData = currentPaceData.splits.find(s => s.distance === splitDistance);
    
    if (!splitData) return null;
    
    let csv = 'Distance,Time,Pace,Zone\n';
    splitData.splits.forEach(split => {
        const paceZone = calculatePaceZone(split.pace, currentPaceData.basePacePerKm);
        csv += `${split.distance}m,${formatTimeFromMs(split.expectedTime)},${formatTime(split.pace)},${paceZone}\n`;
    });
    
    return csv;
}

function copyCSV() {
    const csv = generateCSV();
    if (csv) {
        copyToClipboard(csv);
    }
}

function downloadCSV() {
    const csv = generateCSV();
    if (csv) {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `3000m_splits_${elements.goalTime.value.replace(':', '_')}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showToast(isNorwegian ? 'CSV lastet ned' : 'CSV downloaded');
    }
}

function loadFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const time = urlParams.get('time');
    const lane = urlParams.get('lane');
    const strategy = urlParams.get('strategy');
    
    if (time) elements.goalTime.value = time;
    if (lane) {
        currentLane = parseInt(lane);
        elements.laneSelect.value = lane;
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
        changeAnimationSpeed();
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
