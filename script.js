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
    trackSVG: document.getElementById('trackSVG'),
    trackGroup: document.getElementById('trackGroup'),
    runnerGroup: document.getElementById('runnerGroup'),
    runner: document.getElementById('runner'),
    runnerTrail: document.getElementById('runnerTrail'),
    roundIndicators: document.getElementById('roundIndicators'),
    lapProgressBar: document.getElementById('lapProgressBar'),
    lapProgressFill: document.getElementById('lapProgressFill'),
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
            updateSplitsTable(parseInt(e.target.dataset.distance));
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

// Draw SVG track - Now using elliptical track based on field SVG
function drawTrack() {
    const centerX = 400;
    const centerY = 300;
    addRoundIndicators(centerX, centerY);
    updateRoundList();
}

// Distance markers are now handled by the field SVG visualization

// Finish line is now handled by the field SVG visualization

// Calculate position on elliptical track based on field SVG coordinates
function calculateTrackPosition(centerX, centerY, lapProgress, scale = 1) {
    // Field SVG dimensions: 682x442
    // Container dimensions: 800x600
    // Target ellipse: width 560, height 336, left 110, top 82
    // Position runner between lanes (e.g., between lane 1 and lane 2)

    const fieldWidth = 682;
    const fieldHeight = 442;
    const containerWidth = 800;
    const containerHeight = 600;

    // Calculate scaling to fit the field SVG in the container
    const scaleX = containerWidth / fieldWidth; // ~1.173
    const scaleY = containerHeight / fieldHeight; // ~1.357
    const scaleFactor = Math.min(scaleX, scaleY); // ~1.173

    // Calculate the actual displayed size of the field SVG
    const displayedWidth = fieldWidth * scaleFactor;
    const displayedHeight = fieldHeight * scaleFactor;

    // Calculate centering offsets
    const offsetX = (containerWidth - displayedWidth) / 2; // ~59
    const offsetY = (containerHeight - displayedHeight) / 2; // ~79

    // Target ellipse coordinates in field SVG
    const ellipseLeft = 110;
    const ellipseTop = 82;
    const ellipseWidth = 560;
    const ellipseHeight = 336;

    // Scale ellipse coordinates to match the displayed field
    const scaledCenterX = (ellipseLeft + ellipseWidth / 2) * scaleFactor + offsetX;
    const scaledCenterY = (ellipseTop + ellipseHeight / 2) * scaleFactor + offsetY;
    let scaledWidth = ellipseWidth * scaleFactor;
    let scaledHeight = ellipseHeight * scaleFactor;

    // Adjust for lane position (position runner between lanes)
    const laneOffset = (currentLane - 0.5) * 4 * scaleFactor; // Position between lanes
    scaledWidth += laneOffset * 2;
    scaledHeight += laneOffset * 2;

    // Calculate angle for runner position (start at top, move clockwise)
    const angle = (lapProgress * 2 * Math.PI) - (Math.PI / 2);

    // Calculate position on ellipse
    const x = scaledCenterX + (scaledWidth / 2) * Math.cos(angle);
    const y = scaledCenterY + (scaledHeight / 2) * Math.sin(angle);

    return { x, y };
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
                const neg1Factor = 1 + (0.01 * (i / segmentCount));
                segmentPace = basePacePerKm * (1.005 - (0.01 * (i / segmentCount)));
                segmentTime = (distance / 1000) * segmentPace;
                break;
                
            case 'neg2':
                // 2.5% negative split
                const neg2Factor = 1 + (0.025 * (i / segmentCount));
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
    
    // Add coach notes
    const notes = elements.coachNotes.value;
    if (notes) {
        y -= 20;
        page.drawText('Notes:', {
            x: 50,
            y: y,
            size: 12,
            color: rgb(0.86, 0.15, 0.15)
        });
        y -= 15;
        page.drawText(notes, {
            x: 50,
            y: y,
            size: 10
        });
    }
    
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
        coachNotes: elements.coachNotes.value,
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
                elements.coachNotes.value = data.coachNotes || '';
                
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

// Add round indicators for elliptical track
function addRoundIndicators(centerX, centerY) {
    const roundIndicators = elements.roundIndicators;
    roundIndicators.innerHTML = '';
    
    const laneDistance = LANE_DISTANCES[currentLane];
    const totalLaps = TRACK_CONSTANTS.TOTAL_DISTANCE / laneDistance;
    
    for (let lap = 1; lap <= Math.ceil(totalLaps); lap++) {
        const lapProgress = 0.5; // Bottom of ellipse for lap completion
        const position = calculateTrackPosition(centerX, centerY, lapProgress);
        
        // Create round indicator
        const indicator = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        indicator.setAttribute('cx', position.x);
        indicator.setAttribute('cy', position.y);
        indicator.setAttribute('r', 6);
        indicator.setAttribute('class', 'round-indicator');
        indicator.setAttribute('data-lap', lap);
        indicator.setAttribute('data-distance', lap * laneDistance);
        
        // Add lap number label
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', position.x + 15);
        label.setAttribute('y', position.y + 5);
        label.setAttribute('font-size', '12');
        label.setAttribute('font-weight', '600');
        label.setAttribute('fill', '#374151');
        label.textContent = lap;
        
        roundIndicators.appendChild(indicator);
        roundIndicators.appendChild(label);
    }
}

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

// Update runner position on elliptical track
function updateRunnerPosition(lapProgress, distance) {
    const centerX = 400;
    const centerY = 300;
    const position = calculateTrackPosition(centerX, centerY, lapProgress);
    
    elements.runner.setAttribute('cx', position.x);
    elements.runner.setAttribute('cy', position.y);
    elements.runnerTrail.setAttribute('cx', position.x);
    elements.runnerTrail.setAttribute('cy', position.y);
    
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
