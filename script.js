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

// DOM elements
const elements = {
    goalTime: document.getElementById('goalTime'),
    laneSelect: document.getElementById('laneSelect'),
    startPace: document.getElementById('startPace'),
    endPace: document.getElementById('endPace'),
    curveType: document.getElementById('curveType'),
    calculateBtn: document.getElementById('calculateBtn'),
    printBtn: document.getElementById('printBtn'),
    shareBtn: document.getElementById('shareBtn'),
    languageToggle: document.getElementById('languageToggle'),
    proModeToggle: document.getElementById('proModeToggle'),
    progressiveSection: document.getElementById('progressiveSection'),
    addSurgeBtn: document.getElementById('addSurgeBtn'),
    surgeList: document.getElementById('surgeList'),
    surgeModal: document.getElementById('surgeModal'),
    coachNotes: document.getElementById('coachNotes'),
    trackSVG: document.getElementById('trackSVG'),
    currentLap: document.getElementById('currentLap'),
    currentDistance: document.getElementById('currentDistance'),
    currentTime: document.getElementById('currentTime'),
    targetTimeDisplay: document.getElementById('targetTimeDisplay'),
    overallPace: document.getElementById('overallPace'),
    avgSpeed: document.getElementById('avgSpeed'),
    lapCount: document.getElementById('lapCount'),
    splitsTable: document.getElementById('splitsTable'),
    toggleCharts: document.getElementById('toggleCharts'),
    chartsContainer: document.getElementById('chartsContainer'),
    paceChart: document.getElementById('paceChart'),
    deltaChart: document.getElementById('deltaChart'),
    offlineToggle: document.getElementById('offlineToggle'),
    offlineStatus: document.getElementById('offlineStatus'),
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

// Draw SVG track
function drawTrack() {
    const svg = elements.trackSVG;
    svg.innerHTML = '';
    
    const width = 800;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Track background
    const trackGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    // Draw 8 lanes
    for (let lane = 1; lane <= 8; lane++) {
        const radius = TRACK_CONSTANTS.CURVE_RADIUS_LANE1 + (lane - 1) * TRACK_CONSTANTS.LANE_WIDTH;
        const laneGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        // Lane color
        const laneColor = lane === currentLane ? '#dc2626' : '#e5e5e5';
        const laneWidth = lane === currentLane ? 3 : 1;
        
        // Straight sections
        const straightY = centerY - TRACK_CONSTANTS.STRAIGHT_LENGTH / 2;
        const straightLength = TRACK_CONSTANTS.STRAIGHT_LENGTH;
        
        // Top straight
        const topStraight = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        topStraight.setAttribute('x1', centerX - straightLength / 2);
        topStraight.setAttribute('y1', straightY - radius);
        topStraight.setAttribute('x2', centerX + straightLength / 2);
        topStraight.setAttribute('y2', straightY - radius);
        topStraight.setAttribute('stroke', laneColor);
        topStraight.setAttribute('stroke-width', laneWidth);
        topStraight.setAttribute('fill', 'none');
        laneGroup.appendChild(topStraight);
        
        // Bottom straight
        const bottomStraight = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        bottomStraight.setAttribute('x1', centerX - straightLength / 2);
        bottomStraight.setAttribute('y1', straightY + radius);
        bottomStraight.setAttribute('x2', centerX + straightLength / 2);
        bottomStraight.setAttribute('y2', straightY + radius);
        bottomStraight.setAttribute('stroke', laneColor);
        bottomStraight.setAttribute('stroke-width', laneWidth);
        bottomStraight.setAttribute('fill', 'none');
        laneGroup.appendChild(bottomStraight);
        
        // Curves
        const leftCurve = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        leftCurve.setAttribute('d', `M ${centerX - straightLength / 2} ${straightY - radius} A ${radius} ${radius} 0 0 1 ${centerX - straightLength / 2} ${straightY + radius}`);
        leftCurve.setAttribute('stroke', laneColor);
        leftCurve.setAttribute('stroke-width', laneWidth);
        leftCurve.setAttribute('fill', 'none');
        laneGroup.appendChild(leftCurve);
        
        const rightCurve = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        rightCurve.setAttribute('d', `M ${centerX + straightLength / 2} ${straightY - radius} A ${radius} ${radius} 0 0 0 ${centerX + straightLength / 2} ${straightY + radius}`);
        rightCurve.setAttribute('stroke', laneColor);
        rightCurve.setAttribute('stroke-width', laneWidth);
        rightCurve.setAttribute('fill', 'none');
        laneGroup.appendChild(rightCurve);
        
        trackGroup.appendChild(laneGroup);
    }
    
    // Add distance markers every 100m
    addDistanceMarkers(trackGroup, centerX, centerY);
    
    // Add finish line
    addFinishLine(trackGroup, centerX, centerY);
    
    svg.appendChild(trackGroup);
}

// Add distance markers
function addDistanceMarkers(trackGroup, centerX, centerY) {
    const laneDistance = LANE_DISTANCES[currentLane];
    const totalLaps = TRACK_CONSTANTS.TOTAL_DISTANCE / laneDistance;
    
    for (let distance = 100; distance <= TRACK_CONSTANTS.TOTAL_DISTANCE; distance += 100) {
        const lapProgress = (distance % laneDistance) / laneDistance;
        const totalProgress = (distance / TRACK_CONSTANTS.TOTAL_DISTANCE) * totalLaps;
        
        // Calculate position on track
        const position = calculateTrackPosition(centerX, centerY, lapProgress);
        
        // Create marker
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        marker.setAttribute('cx', position.x);
        marker.setAttribute('cy', position.y);
        marker.setAttribute('r', 2);
        marker.setAttribute('fill', '#dc2626');
        marker.setAttribute('opacity', 0.7);
        
        // Add distance label for key points
        if (distance % 400 === 0 || distance === TRACK_CONSTANTS.TOTAL_DISTANCE) {
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', position.x + 10);
            label.setAttribute('y', position.y);
            label.setAttribute('font-size', '12');
            label.setAttribute('fill', '#374151');
            label.textContent = `${distance}m`;
            trackGroup.appendChild(label);
        }
        
        trackGroup.appendChild(marker);
    }
}

// Add finish line
function addFinishLine(trackGroup, centerX, centerY) {
    const finishPosition = calculateTrackPosition(centerX, centerY, 0.5); // Middle of back straight
    
    const finishLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    finishLine.setAttribute('x1', finishPosition.x - 20);
    finishLine.setAttribute('y1', finishPosition.y);
    finishLine.setAttribute('x2', finishPosition.x + 20);
    finishLine.setAttribute('y2', finishPosition.y);
    finishLine.setAttribute('stroke', '#dc2626');
    finishLine.setAttribute('stroke-width', 4);
    finishLine.setAttribute('stroke-dasharray', '5,5');
    
    trackGroup.appendChild(finishLine);
}

// Calculate position on track
function calculateTrackPosition(centerX, centerY, lapProgress) {
    const radius = TRACK_CONSTANTS.CURVE_RADIUS_LANE1 + (currentLane - 1) * TRACK_CONSTANTS.LANE_WIDTH;
    const straightLength = TRACK_CONSTANTS.STRAIGHT_LENGTH;
    
    // Convert lap progress to angle (0 = start, 1 = finish)
    const angle = lapProgress * 2 * Math.PI;
    
    let x, y;
    
    if (lapProgress < 0.25) {
        // First straight
        const straightProgress = lapProgress / 0.25;
        x = centerX - straightLength / 2 + straightProgress * straightLength;
        y = centerY - radius;
    } else if (lapProgress < 0.5) {
        // First curve
        const curveProgress = (lapProgress - 0.25) / 0.25;
        const curveAngle = curveProgress * Math.PI;
        x = centerX - straightLength / 2 + radius * Math.cos(curveAngle);
        y = centerY - radius + radius * Math.sin(curveAngle);
    } else if (lapProgress < 0.75) {
        // Second straight
        const straightProgress = (lapProgress - 0.5) / 0.25;
        x = centerX + straightLength / 2 - straightProgress * straightLength;
        y = centerY + radius;
    } else {
        // Second curve
        const curveProgress = (lapProgress - 0.75) / 0.25;
        const curveAngle = Math.PI + curveProgress * Math.PI;
        x = centerX + straightLength / 2 + radius * Math.cos(curveAngle);
        y = centerY + radius + radius * Math.sin(curveAngle);
    }
    
    return { x, y };
}

// Calculate pace based on strategy
function calculatePace() {
    const timeStr = elements.goalTime.value;
    const totalMs = parseTimeToMs(timeStr);
    
    if (!totalMs) {
        alert(isNorwegian ? 'Vennligst skriv inn en gyldig tid i mm:ss format' : 'Please enter a valid time in mm:ss format');
        return;
    }
    
    const laneDistance = LANE_DISTANCES[currentLane];
    const totalLaps = TRACK_CONSTANTS.TOTAL_DISTANCE / laneDistance;
    
    // Calculate base pace per km
    const basePacePerKm = totalMs / (TRACK_CONSTANTS.TOTAL_DISTANCE / 1000);
    
    // Generate pace data based on strategy
    currentPaceData = generatePaceData(totalMs, laneDistance, totalLaps, basePacePerKm);
    
    // Update UI
    updateResults(currentPaceData);
    updateSplitsTable(100);
    updateCharts(currentPaceData);
    updateTrackVisualization(currentPaceData);
    
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
function updateSplitsTable(distance) {
    if (!currentPaceData) return;
    
    const splits = [];
    const totalDistance = currentPaceData.totalDistance;
    const laneDistance = currentPaceData.laneDistance;
    
    // Generate splits for the specified distance
    for (let d = distance; d <= totalDistance; d += distance) {
        const segment = currentPaceData.segments.find(s => s.distance >= d);
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
    // Update current position info
    const currentSegment = data.segments[data.segments.length - 1];
    elements.currentLap.textContent = currentSegment.lap.toFixed(1);
    elements.currentDistance.textContent = `${currentSegment.distance}m`;
    elements.currentTime.textContent = formatTimeFromMs(currentSegment.time);
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
