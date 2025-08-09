// Global variables
let currentPaceData = null;
let paceChart = null;
let runnerPosition = 0;

// DOM elements
const elements = {
    targetTime: document.getElementById('targetTime'),
    paceStrategy: document.getElementById('paceStrategy'),
    calculateBtn: document.getElementById('calculateBtn'),
    track: document.getElementById('track'),
    lapCount: document.getElementById('lapCount'),
    currentDistance: document.getElementById('currentDistance'),
    overallPace: document.getElementById('overallPace'),
    targetTimeDisplay: document.getElementById('targetTimeDisplay'),
    avgSpeed: document.getElementById('avgSpeed'),
    splitsTable: document.getElementById('splitsTable'),
    toggleChart: document.getElementById('toggleChart'),
    chartContainer: document.getElementById('chartContainer'),
    paceChart: document.getElementById('paceChart')
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeTrack();
    setupEventListeners();
    calculatePace(); // Calculate with default values
});

// Setup event listeners
function setupEventListeners() {
    elements.calculateBtn.addEventListener('click', calculatePaceWithLoading);
    elements.targetTime.addEventListener('input', validateTimeInput);
    elements.paceStrategy.addEventListener('change', calculatePace);
    elements.toggleChart.addEventListener('click', toggleChart);
    
    // Split tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            updateSplitsTable(parseInt(e.target.dataset.distance));
        });
    });
}

// Initialize track visualization
function initializeTrack() {
    // Create 8 lanes
    for (let i = 1; i <= 8; i++) {
        const lane = document.createElement('div');
        lane.className = `track-lane lane-${i}`;
        elements.track.appendChild(lane);
    }
    
    // Create runner
    const runner = document.createElement('div');
    runner.className = 'runner';
    runner.id = 'runner';
    elements.track.appendChild(runner);
    
    // Position runner at start
    updateRunnerPosition(0);
}

// Validate time input format
function validateTimeInput(e) {
    let value = e.target.value;
    
    // Remove any non-digit characters except colon
    value = value.replace(/[^\d:]/g, '');
    
    // Ensure proper format (mm:ss or m:ss)
    if (value.length > 5) {
        value = value.substring(0, 5);
    }
    
    // Auto-insert colon if needed
    if (value.length === 2 && !value.includes(':')) {
        value += ':';
    }
    
    e.target.value = value;
}

// Parse time string to seconds
function parseTime(timeStr) {
    if (!timeStr || !timeStr.includes(':')) return null;
    
    const parts = timeStr.split(':');
    if (parts.length !== 2) return null;
    
    const minutes = parseInt(parts[0]);
    const seconds = parseInt(parts[1]);
    
    if (isNaN(minutes) || isNaN(seconds) || seconds >= 60) return null;
    
    return minutes * 60 + seconds;
}

// Format seconds to mm:ss
function formatTime(seconds) {
    if (!seconds || seconds < 0) return '--:--';
    
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Calculate pace based on strategy
function calculatePace() {
    const timeStr = elements.targetTime.value;
    const strategy = elements.paceStrategy.value;
    
    const totalSeconds = parseTime(timeStr);
    if (!totalSeconds) {
        alert('Please enter a valid time in mm:ss format');
        return;
    }
    
    const totalDistance = 3000; // 3km in meters
    const totalLaps = 7.5; // 3000m / 400m per lap
    
    // Calculate base pace per km
    const basePacePerKm = totalSeconds / (totalDistance / 1000);
    
    // Generate pace data based on strategy
    currentPaceData = generatePaceData(strategy, totalSeconds, totalDistance, basePacePerKm);
    
    // Update UI
    updateResults(currentPaceData);
    updateTrackVisualization(currentPaceData);
    updateSplitsTable(100); // Default to 100m splits
    updateChart(currentPaceData);
    
    // Add animation
    document.querySelectorAll('.result-card').forEach(card => {
        card.classList.add('fade-in');
        setTimeout(() => card.classList.remove('fade-in'), 500);
    });
}

// Generate pace data based on strategy
function generatePaceData(strategy, totalSeconds, totalDistance, basePacePerKm) {
    const data = {
        strategy: strategy,
        totalTime: totalSeconds,
        totalDistance: totalDistance,
        segments: []
    };
    
    const segmentCount = 30; // 100m segments for 3000m
    const segmentDistance = totalDistance / segmentCount;
    
    for (let i = 0; i < segmentCount; i++) {
        const segmentIndex = i + 1;
        const distance = segmentIndex * segmentDistance;
        
        let segmentPace;
        let segmentTime;
        
        switch (strategy) {
            case 'even':
                segmentPace = basePacePerKm;
                segmentTime = (distance / 1000) * basePacePerKm;
                break;
                
            case 'negative':
                // Start slower, finish faster
                const negativeFactor = 1 + (0.1 * (i / segmentCount));
                segmentPace = basePacePerKm * (1.05 - (0.1 * (i / segmentCount)));
                segmentTime = (distance / 1000) * segmentPace;
                break;
                
            case 'positive':
                // Start faster, finish slower
                const positiveFactor = 1 + (0.1 * (i / segmentCount));
                segmentPace = basePacePerKm * (0.95 + (0.1 * (i / segmentCount)));
                segmentTime = (distance / 1000) * segmentPace;
                break;
                
            case 'progressive':
                // Gradual acceleration
                const progressiveFactor = 1 + (0.15 * Math.sin((i / segmentCount) * Math.PI));
                segmentPace = basePacePerKm * (0.9 + (0.2 * (i / segmentCount)));
                segmentTime = (distance / 1000) * segmentPace;
                break;
        }
        
        data.segments.push({
            distance: Math.round(distance),
            time: segmentTime,
            pace: segmentPace,
            lap: Math.ceil(distance / 400)
        });
    }
    
    return data;
}

// Update results display
function updateResults(data) {
    const totalTime = data.totalTime;
    const totalDistance = data.totalDistance;
    
    // Overall pace per km
    const overallPacePerKm = totalTime / (totalDistance / 1000);
    elements.overallPace.textContent = formatTime(overallPacePerKm);
    
    // Target time
    elements.targetTimeDisplay.textContent = formatTime(totalTime);
    
    // Average speed in km/h
    const avgSpeedKmh = (totalDistance / 1000) / (totalTime / 3600);
    elements.avgSpeed.textContent = avgSpeedKmh.toFixed(1);
}

// Update track visualization
function updateTrackVisualization(data) {
    // Reset track
    document.querySelectorAll('.track-lane').forEach(lane => {
        lane.classList.remove('active');
    });
    
    // Animate runner through the track
    animateRunner(data);
}

// Animate runner through the track
function animateRunner(data) {
    const runner = document.getElementById('runner');
    const totalDistance = data.totalDistance;
    const totalTime = data.totalTime;
    
    // Reset position
    runnerPosition = 0;
    updateRunnerPosition(0);
    
    // Animate through each segment
    data.segments.forEach((segment, index) => {
        setTimeout(() => {
            const progress = segment.distance / totalDistance;
            runnerPosition = progress;
            updateRunnerPosition(progress);
            
            // Update lap counter and distance
            elements.lapCount.textContent = segment.lap;
            elements.currentDistance.textContent = `${segment.distance}m`;
            
            // Highlight active lane
            const activeLane = Math.min(segment.lap, 8);
            document.querySelectorAll('.track-lane').forEach((lane, i) => {
                lane.classList.toggle('active', i + 1 === activeLane);
            });
            
        }, (segment.time / totalTime) * 5000); // 5 second animation
    });
}

// Update runner position on track
function updateRunnerPosition(progress) {
    const runner = document.getElementById('runner');
    const trackRect = elements.track.getBoundingClientRect();
    const centerX = trackRect.width / 2;
    const centerY = trackRect.height / 2;
    const radius = Math.min(centerX, centerY) - 30;
    
    // Calculate position on oval track
    const angle = progress * 2 * Math.PI * 7.5; // 7.5 laps for 3000m
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    runner.style.left = `${x - 10}px`;
    runner.style.top = `${y - 10}px`;
}

// Update splits table
function updateSplitsTable(distance) {
    if (!currentPaceData) return;
    
    const splits = [];
    const totalDistance = currentPaceData.totalDistance;
    
    // Generate splits for the specified distance
    for (let d = distance; d <= totalDistance; d += distance) {
        const segment = currentPaceData.segments.find(s => s.distance >= d);
        if (segment) {
            splits.push({
                distance: d,
                time: segment.time,
                pace: segment.pace,
                lap: Math.ceil(d / 400)
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
                </tr>
            </thead>
            <tbody>
                ${splits.map(split => `
                    <tr>
                        <td>${split.distance}m</td>
                        <td>${formatTime(split.time)}</td>
                        <td>${formatTime(split.pace)}</td>
                        <td>${split.lap}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    elements.splitsTable.innerHTML = tableHTML;
}

// Toggle chart visibility
function toggleChart() {
    const isVisible = elements.chartContainer.style.display !== 'none';
    
    if (isVisible) {
        elements.chartContainer.style.display = 'none';
        elements.toggleChart.innerHTML = '<i class="fas fa-chart-line"></i> Show Chart';
    } else {
        elements.chartContainer.style.display = 'block';
        elements.toggleChart.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Chart';
        if (currentPaceData) {
            updateChart(currentPaceData);
        }
    }
}

// Update chart
function updateChart(data) {
    if (!data) return;
    
    const ctx = elements.paceChart.getContext('2d');
    
    // Destroy existing chart
    if (paceChart) {
        paceChart.destroy();
    }
    
    // Prepare data
    const labels = data.segments.map(s => `${s.distance}m`);
    const paceData = data.segments.map(s => s.pace / 60); // Convert to minutes
    const timeData = data.segments.map(s => s.time / 60); // Convert to minutes
    
    // Create chart
    paceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Pace (min/km)',
                    data: paceData,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Cumulative Time (min)',
                    data: timeData,
                    borderColor: '#764ba2',
                    backgroundColor: 'rgba(118, 75, 162, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Pace Progression Analysis',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    position: 'top',
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Distance'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Pace (min/km)'
                    },
                    reverse: true
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Time (min)'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            }
        }
    });
}

// Add some interactive features
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && document.activeElement === elements.targetTime) {
        calculatePace();
    }
});

// Add smooth scrolling for better UX
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading states
function setLoadingState(loading) {
    const btn = elements.calculateBtn;
    if (loading) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculating...';
        btn.disabled = true;
    } else {
        btn.innerHTML = '<i class="fas fa-calculator"></i> Calculate Pace';
        btn.disabled = false;
    }
}

// Enhanced calculate function with loading state
function calculatePaceWithLoading() {
    setLoadingState(true);
    
    setTimeout(() => {
        calculatePace();
        setLoadingState(false);
    }, 100);
}

// Add tooltips for better UX
function addTooltips() {
    const tooltips = [
        { element: elements.targetTime, text: 'Enter your target time in minutes:seconds format (e.g., 10:30)' },
        { element: elements.paceStrategy, text: 'Choose your pacing strategy for the race' }
    ];
    
    tooltips.forEach(tooltip => {
        tooltip.element.title = tooltip.text;
    });
}

// Initialize tooltips
addTooltips();
