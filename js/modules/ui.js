// UI Update Functions

function updateResults(data) {
    elements.largeTargetTimeDisplay.textContent = `00:00.00 / ${formatTimeFromMs(data.totalTime)}`;
    document.title = `3000METER.com – ${elements.goalTime.value}`;
    updateCumulativeTimes(data);
    updateDownloadButtonsVisibility();
}

function updateDownloadButtonsVisibility() {
    const downloadContainer = document.querySelector('.download-buttons-container');
    if (downloadContainer) {
        if (currentPaceData) {
            downloadContainer.classList.add('visible');
        } else {
            downloadContainer.classList.remove('visible');
        }
    }
}

function updateTrackVisualization(data) {
    animationState.totalTime = data.totalTime;
    animationState.currentTime = 0;
    animationState.currentDistance = 0;
    animationState.currentLap = 1;
    animationState.lapProgress = 0;
    
    updateRunnerPosition(0, 0);
    updateAnimationUI();
    updateRoundIndicators();
}

function updateAnimationUI() {
    elements.currentLapDisplay.textContent = animationState.currentLap;
    elements.currentDistanceDisplay.textContent = `${Math.round(animationState.currentDistance)}m`;
    
    const currentPace = calculateCurrentPace();
    elements.currentPaceDisplay.textContent = currentPace;
    
    const totalDistance = currentPaceData?.totalDistance || TRACK_CONSTANTS.TOTAL_DISTANCE;
    const progressPercent = Math.round((animationState.currentDistance / totalDistance) * 100);
    elements.progressPercentDisplay.textContent = `${progressPercent}%`;
    
    const currentTimeFormatted = formatTimeFromMs(animationState.currentTime * 1000);
    const targetTimeFormatted = currentPaceData ? formatTimeFromMs(currentPaceData.totalTime) : formatTimeFromMs(parseTimeToMs(elements.goalTime.value) || 0);
    elements.largeTargetTimeDisplay.textContent = `${currentTimeFormatted} / ${targetTimeFormatted}`;
    
    // Update split row colors based on animation progress
    updateSplitRowColors();
}

function addSplitDistance(distance) {
    distance = parseInt(distance);
    if (isNaN(distance) || distance < 1) {
        showToast(isNorwegian ? 'Ugyldig distanse' : 'Invalid distance');
        return;
    }
    
    // Check if split is longer than race distance
    const raceDistance = currentDistance || 3000;
    if (distance > raceDistance) {
        showToast(isNorwegian ? `Deltid kan ikke være lengre enn løpsdistanse (${raceDistance}m)` : `Split cannot be longer than race distance (${raceDistance}m)`);
        return;
    }
    
    if (!activeSplitDistances.includes(distance)) {
        activeSplitDistances.push(distance);
        activeSplitDistances.sort((a, b) => a - b);
        
        // Update UI
        updateSplitPresetButtons();
        if (currentPaceData) {
            updateCumulativeTimes(currentPaceData);
        }
        
        // Save to localStorage
        saveSplitDistances();
        
        showToast(isNorwegian ? `Deltid ${distance}m lagt til` : `Split ${distance}m added`);
    }
}

function removeSplitDistance(distance) {
    distance = parseInt(distance);
    const index = activeSplitDistances.indexOf(distance);
    if (index > -1) {
        activeSplitDistances.splice(index, 1);
        
        // Update UI
        updateSplitPresetButtons();
        if (currentPaceData) {
            updateCumulativeTimes(currentPaceData);
        }
        
        // Save to localStorage
        saveSplitDistances();
        
        showToast(isNorwegian ? `Deltid ${distance}m fjernet` : `Split ${distance}m removed`);
    }
}

function clearAllSplits() {
    if (activeSplitDistances.length === 0) {
        return;
    }
    
    activeSplitDistances = [];
    
    // Update UI
    updateSplitPresetButtons();
    if (currentPaceData) {
        updateCumulativeTimes(currentPaceData);
    }
    
    // Save to localStorage
    saveSplitDistances();
    
    showToast(isNorwegian ? 'Alle deltider fjernet' : 'All splits cleared');
}

function getTimeSuggestions(distance) {
    const suggestions = [];
    
    // Exact distance matches first
    if (distance === 100) {
        suggestions.push('0:11.5', '0:12.0', '0:12.5', '0:13.0', '0:13.5', '0:14.0', '0:14.5', '0:15.0', '0:15.5', '0:16.0');
    }
    else if (distance === 200) {
        suggestions.push('0:23', '0:24', '0:25', '0:26', '0:27', '0:28', '0:29', '0:30', '0:31', '0:32');
    }
    else if (distance === 400) {
        suggestions.push('0:52', '0:56', '1:00', '1:04', '1:08', '1:12', '1:16', '1:20', '1:24', '1:28');
    }
    else if (distance === 800) {
        suggestions.push('2:00', '2:10', '2:20', '2:30', '2:40', '2:50', '3:00', '3:10', '3:20', '3:30');
    }
    else if (distance === 1500) {
        suggestions.push('4:20', '4:30', '4:40', '4:50', '5:00', '5:10', '5:20', '5:30', '5:40', '5:50');
    }
    else if (distance === 1000) {
        suggestions.push('3:30', '3:45', '4:00', '4:15', '4:30', '4:45', '5:00', '5:15', '5:30', '5:45');
    }
    else if (distance === 1609) {
        suggestions.push('5:00', '5:15', '5:30', '5:45', '6:00', '6:15', '6:30', '6:45', '7:00', '7:15');
    }
    else if (distance === 2000) {
        suggestions.push('7:00', '7:30', '8:00', '8:30', '9:00', '9:30', '10:00', '10:30', '11:00', '11:30');
    }
    else if (distance === 3000) {
        suggestions.push('9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00');
    }
    else if (distance === 3218) {
        suggestions.push('10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00');
    }
    else if (distance >= 4820 && distance <= 4830) {
        suggestions.push('16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30');
    }
    else if (distance === 5000) {
        suggestions.push('18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '24:00', '25:00', '26:00', '27:00');
    }
    else if (distance >= 8040 && distance <= 8050) {
        suggestions.push('28:00', '29:00', '30:00', '31:00', '32:00', '33:00', '34:00', '35:00', '36:00', '37:00');
    }
    else if (distance === 10000) {
        suggestions.push('36:00', '37:30', '39:00', '40:30', '42:00', '43:30', '45:00', '46:30', '48:00', '49:30');
    }
    else if (distance >= 16080 && distance <= 16100) {
        suggestions.push('58:00', '60:00', '62:00', '64:00', '66:00', '68:00', '70:00', '72:00', '74:00', '76:00');
    }
    else if (distance >= 21090 && distance <= 21100) {
        suggestions.push('1:25:00', '1:30:00', '1:35:00', '1:40:00', '1:45:00', '1:50:00', '1:55:00', '2:00:00', '2:05:00', '2:10:00');
    }
    else if (distance >= 42190 && distance <= 42200) {
        suggestions.push('2:55:00', '3:05:00', '3:15:00', '3:25:00', '3:35:00', '3:45:00', '3:55:00', '4:05:00', '4:15:00', '4:25:00');
    }
    else if (distance === 60000) {
        suggestions.push('5:00:00', '5:15:00', '5:30:00', '5:45:00', '6:00:00', '6:15:00', '6:30:00', '6:45:00', '7:00:00', '7:30:00');
    }
    else if (distance === 100000) {
        suggestions.push('8:00:00', '8:30:00', '9:00:00', '9:30:00', '10:00:00', '10:30:00', '11:00:00', '11:30:00', '12:00:00', '12:30:00');
    }
    // Range-based fallbacks
    else if (distance <= 100) {
        suggestions.push('0:11.5', '0:12.0', '0:12.5', '0:13.0', '0:13.5', '0:14.0', '0:14.5', '0:15.0', '0:15.5', '0:16.0');
    }
    else if (distance <= 200) {
        suggestions.push('0:23', '0:24', '0:25', '0:26', '0:27', '0:28', '0:29', '0:30', '0:31', '0:32');
    }
    else if (distance <= 400) {
        suggestions.push('0:52', '0:56', '1:00', '1:04', '1:08', '1:12', '1:16', '1:20', '1:24', '1:28');
    }
    else if (distance <= 800) {
        suggestions.push('2:00', '2:10', '2:20', '2:30', '2:40', '2:50', '3:00', '3:10', '3:20', '3:30');
    }
    else if (distance <= 1500) {
        suggestions.push('4:20', '4:30', '4:40', '4:50', '5:00', '5:10', '5:20', '5:30', '5:40', '5:50');
    }
    else if (distance <= 2000) {
        suggestions.push('7:00', '7:30', '8:00', '8:30', '9:00', '9:30', '10:00', '10:30', '11:00', '11:30');
    }
    else if (distance <= 3000) {
        suggestions.push('9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00');
    }
    else if (distance <= 5000) {
        suggestions.push('18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '24:00', '25:00', '26:00', '27:00');
    }
    else if (distance <= 10000) {
        suggestions.push('36:00', '37:30', '39:00', '40:30', '42:00', '43:30', '45:00', '46:30', '48:00', '49:30');
    }
    else if (distance <= 21097) {
        suggestions.push('1:25:00', '1:30:00', '1:35:00', '1:40:00', '1:45:00', '1:50:00', '1:55:00', '2:00:00', '2:05:00', '2:10:00');
    }
    else if (distance <= 42195) {
        suggestions.push('2:55:00', '3:05:00', '3:15:00', '3:25:00', '3:35:00', '3:45:00', '3:55:00', '4:05:00', '4:15:00', '4:25:00');
    }
    else if (distance <= 60000) {
        suggestions.push('5:00:00', '5:15:00', '5:30:00', '5:45:00', '6:00:00', '6:15:00', '6:30:00', '6:45:00', '7:00:00', '7:30:00');
    }
    else if (distance <= 100000) {
        suggestions.push('8:00:00', '8:30:00', '9:00:00', '9:30:00', '10:00:00', '10:30:00', '11:00:00', '11:30:00', '12:00:00', '12:30:00');
    }
    // Ultra distances beyond 100k
    else {
        suggestions.push('12:00:00', '13:00:00', '14:00:00', '15:00:00', '16:00:00', '17:00:00', '18:00:00', '19:00:00', '20:00:00', '21:00:00');
    }
    
    return suggestions.slice(0, 8); // Return max 8 suggestions for 4x2 grid
}

function updateTimeSuggestions() {
    const suggestionsContainer = document.getElementById('timeSuggestions');
    if (!suggestionsContainer) return;
    
    const distance = currentDistance || 3000;
    const suggestions = getTimeSuggestions(distance);
    
    suggestionsContainer.innerHTML = '';
    suggestions.forEach(time => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'time-suggestion-btn';
        btn.textContent = time;
        btn.addEventListener('click', () => {
            elements.goalTime.value = time;
            updatePaceFromTime();
            // Highlight active button
            suggestionsContainer.querySelectorAll('.time-suggestion-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
        suggestionsContainer.appendChild(btn);
    });
}

function getSplitSuggestions(raceDistance) {
    // Comprehensive list of split options from smallest to largest
    // These are common split distances used in track and road running
    const allSuggestions = [
        50,    // 50m - Very short split
        100,   // 100m - Sprint distance
        150,   // 150m - Short split
        200,   // 200m - Common track split
        250,   // 250m - Quarter track
        300,   // 300m - Short split
        400,   // 400m - One lap (outdoor track)
        500,   // 500m - Half kilometer
        600,   // 600m - Common split
        800,   // 800m - Two laps
        1000,  // 1km - Kilometer marker
        1200,  // 1200m - Intermediate split
        1500,  // 1500m - Common track distance
        2000,  // 2km - Two kilometers
        2500,  // 2.5km - Intermediate split
        3000,  // 3km - Three kilometers
        5000,  // 5km - Five kilometers
        10000  // 10km - Ten kilometers
    ];
    
    // Filter to only include splits that are valid for this race distance
    // Return up to 10 suggestions
    const validSuggestions = allSuggestions.filter(dist => dist <= raceDistance);
    return validSuggestions.slice(0, 10);
}

function updateSplitPresetButtons() {
    const presetContainer = document.querySelector('.split-preset-buttons');
    if (!presetContainer) return;
    
    // Clear existing buttons
    presetContainer.innerHTML = '';
    
    // Get suggestions (filtered to only valid splits, up to 10)
    const raceDistance = currentDistance || 3000;
    const suggestions = getSplitSuggestions(raceDistance);
    
    // Create buttons only for valid suggestions (they're already filtered)
    suggestions.forEach(dist => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'split-preset-btn';
        btn.dataset.distance = dist;
        
        // Format label
        if (dist >= 1000) {
            btn.textContent = `${(dist / 1000).toFixed(1)}km`;
        } else {
            btn.textContent = `${dist}m`;
        }
        
        // Check if active
        if (activeSplitDistances.includes(dist)) {
            btn.classList.add('active');
        }
        
        // Add click handler
        btn.addEventListener('click', () => {
            if (activeSplitDistances.includes(dist)) {
                removeSplitDistance(dist);
            } else {
                addSplitDistance(dist);
            }
        });
        
        presetContainer.appendChild(btn);
    });
}

function saveSplitDistances() {
    try {
        localStorage.setItem('activeSplitDistances', JSON.stringify(activeSplitDistances));
    } catch (e) {
        console.error('Failed to save split distances:', e);
    }
}

function loadSplitDistances() {
    try {
        const saved = localStorage.getItem('activeSplitDistances');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                const raceDistance = currentDistance || 3000;
                // Filter out splits longer than race distance
                activeSplitDistances = parsed.filter(d => typeof d === 'number' && d > 0 && d <= raceDistance);
            }
        }
    } catch (e) {
        console.error('Failed to load split distances:', e);
    }
    
    // Ensure at least one split is active (if race distance allows)
    const raceDistance = currentDistance || 3000;
    if (activeSplitDistances.length === 0) {
        // Add default splits that are valid for the race distance
        if (raceDistance >= 400) {
            activeSplitDistances = [200, 400];
        } else if (raceDistance >= 200) {
            activeSplitDistances = [200];
        } else {
            activeSplitDistances = [Math.floor(raceDistance / 2)];
        }
    }
    
    updateSplitPresetButtons();
}

function updateCumulativeTimes(data) {
    if (!data) return;
    
    const container = document.getElementById('cumulativeTimesContainer');
    if (!container) return;
    
    // Sort active splits
    const sortedSplits = [...activeSplitDistances].sort((a, b) => a - b);
    
    // Clear container
    container.innerHTML = '';
    
    // Create a table for each active split distance
    sortedSplits.forEach(splitDistance => {
        // Skip if split distance is larger than total distance
        if (splitDistance > data.totalDistance) return;
        
        const table = document.createElement('div');
        table.className = 'splits-table';
        
        const header = document.createElement('div');
        header.className = 'splits-table-header';
        header.innerHTML = `
            <span class="splits-table-title">${splitDistance}m</span>
            <span style="font-size: 0.6875rem; color: var(--text-light);">Time</span>
            <button type="button" class="remove-split-btn" data-distance="${splitDistance}" title="Remove split">
                <i data-lucide="x"></i>
            </button>
        `;
        
        const body = document.createElement('div');
        body.className = 'table-body';
        
        // Generate rows for this split interval
        for (let distance = splitDistance; distance <= data.totalDistance; distance += splitDistance) {
            const expectedTime = calculateExpectedTime(distance, data.basePacePerKm, data.strategy);
            const timeFormatted = formatTimeFromMsSimple(expectedTime);
            
            const row = document.createElement('div');
            row.className = 'cumulative-time-row';
            row.dataset.distance = distance;
            
            row.innerHTML = `
                <span class="distance">${distance}m</span>
                <span class="time">${timeFormatted}</span>
            `;
            
            body.appendChild(row);
        }
        
        table.appendChild(header);
        table.appendChild(body);
        container.appendChild(table);
        
        // Initialize Lucide icons for the remove button
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    });
    
    // Update split colors after rendering
    updateSplitRowColors();
}

function updateSplitRowColors() {
    const currentDistance = animationState.currentDistance;
    const tables = document.querySelectorAll('.splits-table');
    
    tables.forEach(table => {
        const rows = table.querySelectorAll('.cumulative-time-row');
        
        // Get all rows sorted by distance for this table
        const sortedRows = Array.from(rows).map(row => ({
            element: row,
            distance: parseFloat(row.dataset.distance)
        })).sort((a, b) => a.distance - b.distance);
        
        let foundNextIncomplete = false;
        
        sortedRows.forEach(rowData => {
            const row = rowData.element;
            const rowDistance = rowData.distance;
            
            // Remove all status classes
            row.classList.remove('completed', 'in-progress');
            
            if (rowDistance < currentDistance) {
                // Completed - green
                row.classList.add('completed');
            } else if (!foundNextIncomplete) {
                // The first incomplete split in this table should be yellow (in-progress)
                row.classList.add('in-progress');
                foundNextIncomplete = true;
            }
        });
    });
}

function updatePaceChart(data) {
    if (!data || !data.paceData || data.paceData.length === 0) return;
    
    const isDark = document.body.classList.contains('dark-mode');
    const labels = data.paceData.map(d => `${(d.distance / 1000).toFixed(1)}km`);
    
    // Destroy all existing charts
    Object.values(charts).forEach(chart => {
        if (chart) chart.destroy();
    });
    charts = {};
    
    // Create all charts
    const chartConfigs = [
        { id: 'paceChart', config: createPaceChart(data, labels, isDark) },
        { id: 'speedChart', config: createSpeedChart(data, labels, isDark) },
        { id: 'timeChart', config: createTimeChart(data, labels, isDark) },
        { id: 'splitPaceChart', config: createSplitPaceChart(data, labels, isDark) },
        { id: 'accelerationChart', config: createAccelerationChart(data, labels, isDark) },
        { id: 'effortChart', config: createEffortChart(data, labels, isDark) }
    ];
    
    chartConfigs.forEach(({ id, config }) => {
        const canvas = document.getElementById(id);
        if (canvas) {
            const ctx = canvas.getContext('2d');
            charts[id] = new Chart(ctx, config);
        }
    });
}

function createPaceChart(data, labels, isDark) {
    const paceValues = data.paceData.map(d => d.pace / 60);
    
    return {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pace (min/km)',
                data: paceValues,
                borderColor: '#dc2626',
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 2,
                pointHoverRadius: 5
            }]
        },
        options: getBaseChartOptions(isDark, 'Pace (min/km)', (value) => {
            const minutes = Math.floor(value);
            const seconds = Math.round((value - minutes) * 60);
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }, (context) => {
            const pace = context.parsed.y;
            const minutes = Math.floor(pace);
            const seconds = Math.round((pace - minutes) * 60);
            return `Pace: ${minutes}:${seconds.toString().padStart(2, '0')}/km`;
        })
    };
}

function createSpeedChart(data, labels, isDark) {
    const speedValues = data.paceData.map(d => {
        // Convert pace (seconds per km) to speed (km/h)
        const pacePerKm = d.pace;
        return pacePerKm > 0 ? (3600 / pacePerKm) : 0;
    });
    
    return {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Speed (km/h)',
                data: speedValues,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 2,
                pointHoverRadius: 5
            }]
        },
        options: getBaseChartOptions(isDark, 'Speed (km/h)', (value) => {
            return value.toFixed(1);
        }, (context) => {
            return `Speed: ${context.parsed.y.toFixed(1)} km/h`;
        })
    };
}

function createTimeChart(data, labels, isDark) {
    const timeValues = data.paceData.map(d => d.time / 60); // Convert to minutes
    
    return {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cumulative Time (min)',
                data: timeValues,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 2,
                pointHoverRadius: 5
            }]
        },
        options: getBaseChartOptions(isDark, 'Time (minutes)', (value) => {
            const minutes = Math.floor(value);
            const seconds = Math.round((value - minutes) * 60);
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }, (context) => {
            const time = context.parsed.y;
            const minutes = Math.floor(time);
            const seconds = Math.round((time - minutes) * 60);
            const totalSeconds = Math.round(time * 60);
            const hours = Math.floor(totalSeconds / 3600);
            const mins = Math.floor((totalSeconds % 3600) / 60);
            const secs = totalSeconds % 60;
            return `Time: ${hours > 0 ? `${hours}:` : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        })
    };
}

function createSplitPaceChart(data, labels, isDark) {
    if (!data.segments || data.segments.length === 0) {
        return createPaceChart(data, labels, isDark);
    }
    
    const segmentLabels = data.segments.map(s => `Lap ${s.lap}`);
    const segmentPaceValues = data.segments.map(s => s.pace / 60);
    
    const options = getBaseChartOptions(isDark, 'Pace (min/km)', (value) => {
        const minutes = Math.floor(value);
        const seconds = Math.round((value - minutes) * 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, (context) => {
        const pace = context.parsed.y;
        const minutes = Math.floor(pace);
        const seconds = Math.round((pace - minutes) * 60);
        const lapNum = context.label.replace('Lap ', '');
        return `Lap ${lapNum}: ${minutes}:${seconds.toString().padStart(2, '0')}/km`;
    });
    
    // Override X-axis title for split pace chart
    options.scales.x.title.text = 'Lap';
    
    return {
        type: 'bar',
        data: {
            labels: segmentLabels,
            datasets: [{
                label: 'Pace per Lap (min/km)',
                data: segmentPaceValues,
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                borderWidth: 2,
                borderRadius: 4
            }]
        },
        options: options
    };
}

function createAccelerationChart(data, labels, isDark) {
    // Calculate acceleration (change in pace)
    const accelerationValues = [];
    for (let i = 0; i < data.paceData.length; i++) {
        if (i === 0) {
            accelerationValues.push(0);
        } else {
            // Negative acceleration = getting faster (pace decreasing)
            // Positive acceleration = getting slower (pace increasing)
            const paceChange = data.paceData[i].pace - data.paceData[i - 1].pace;
            accelerationValues.push(-paceChange); // Negative because lower pace = faster
        }
    }
    
    return {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Acceleration (pace change/sec)',
                data: accelerationValues,
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 2,
                pointHoverRadius: 5
            }]
        },
        options: getBaseChartOptions(isDark, 'Acceleration (s/km)', (value) => {
            return value.toFixed(2);
        }, (context) => {
            const accel = context.parsed.y;
            const direction = accel > 0 ? 'Faster' : accel < 0 ? 'Slower' : 'Even';
            return `${direction}: ${Math.abs(accel).toFixed(2)} s/km change`;
        })
    };
}

function createEffortChart(data, labels, isDark) {
    // Calculate effort level based on pace relative to average pace
    const paces = data.paceData.map(d => d.pace);
    const avgPace = paces.reduce((a, b) => a + b, 0) / paces.length;
    
    const effortValues = data.paceData.map(d => {
        // Effort level: 0-100%
        // Lower pace = higher effort
        const effort = ((avgPace / d.pace) * 100);
        return Math.max(0, Math.min(100, effort));
    });
    
    return {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Effort Level (%)',
                data: effortValues,
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 2,
                pointHoverRadius: 5
            }]
        },
        options: getBaseChartOptions(isDark, 'Effort Level (%)', (value) => {
            return Math.round(value) + '%';
        }, (context) => {
            const effort = context.parsed.y;
            let level = 'Moderate';
            if (effort > 80) level = 'Very High';
            else if (effort > 60) level = 'High';
            else if (effort > 40) level = 'Moderate';
            else if (effort > 20) level = 'Low';
            else level = 'Very Low';
            return `Effort: ${Math.round(effort)}% (${level})`;
        })
    };
}

function getBaseChartOptions(isDark, yAxisLabel, yAxisFormatter, tooltipFormatter) {
    return {
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
                    label: tooltipFormatter
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
                    text: yAxisLabel,
                    color: isDark ? '#e5e7eb' : '#374151'
                },
                ticks: {
                    color: isDark ? '#9ca3af' : '#6b7280',
                    callback: yAxisFormatter
                },
                grid: {
                    color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                }
            }
        }
    };
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    elements.tabButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    const tabElement = document.getElementById(tabName + 'Tab');
    if (tabElement) {
        tabElement.classList.add('active');
    }
    
    const btn = Array.from(elements.tabButtons).find(b => b.dataset.tab === tabName);
    if (btn) {
        btn.classList.add('active');
    }
    
    if (tabName === 'chart' && currentPaceData) {
        updatePaceChart(currentPaceData);
    }
}

let isUpdatingTime = false;
let isUpdatingPace = false;

function updateTimeFromPace() {
    if (isUpdatingTime || !elements.targetPace) return;
    const paceValue = elements.targetPace.value;
    if (!paceValue || paceValue === '') return;
    
    const paceMs = parseTimeToMs(paceValue);
    if (paceMs === 0) return;
    
    isUpdatingTime = true;
    const distanceKm = getCurrentDistance() / 1000;
    const targetTimeMs = paceMs * distanceKm;
    const targetTimeStr = formatTimeFromMsSimple(targetTimeMs);
    
    elements.goalTime.value = targetTimeStr;
    setTimeout(() => { isUpdatingTime = false; }, 100);
}

function updatePaceFromTime() {
    if (isUpdatingPace || !elements.targetPace) return;
    const timeValue = elements.goalTime.value;
    if (!timeValue || timeValue === '') return;
    
    const timeMs = parseTimeToMs(timeValue);
    if (timeMs === 0) return;
    
    isUpdatingPace = true;
    const distanceKm = getCurrentDistance() / 1000;
    const paceMs = timeMs / distanceKm;
    const paceStr = formatTimeFromMsSimple(paceMs);
    
    elements.targetPace.value = paceStr;
    setTimeout(() => { isUpdatingPace = false; }, 100);
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

function validateTimeInput(e) {
    let value = e.target.value;
    value = value.replace(/[^\d:.]/g, '');
    
    const colons = value.match(/:/g);
    if (colons && colons.length > 1) {
        value = value.replace(/:/g, (match, index) => index === value.indexOf(':') ? ':' : '');
    }
    
    const periods = value.match(/\./g);
    if (periods && periods.length > 1) {
        value = value.replace(/\./g, (match, index) => index === value.indexOf('.') ? '.' : '');
    }
    
    e.target.value = value;
}

function getSystemTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme() {
    let shouldBeDark = false;
    
    if (themePreference === 'system') {
        shouldBeDark = getSystemTheme() === 'dark';
    } else {
        shouldBeDark = themePreference === 'dark';
    }
    
    isDarkMode = shouldBeDark;
    document.body.classList.toggle('dark-mode', isDarkMode);
    
    // Update theme button icon
    if (elements.themeToggle) {
        const iconLight = elements.themeToggle.querySelector('.theme-icon-light');
        const iconDark = elements.themeToggle.querySelector('.theme-icon-dark');
        const iconSystem = elements.themeToggle.querySelector('.theme-icon-system');
        
        if (iconLight) iconLight.style.display = themePreference === 'light' ? 'inline-flex' : 'none';
        if (iconDark) iconDark.style.display = themePreference === 'dark' ? 'inline-flex' : 'none';
        if (iconSystem) iconSystem.style.display = themePreference === 'system' ? 'inline-flex' : 'none';
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    // Update menu item active states
    const menuItems = document.querySelectorAll('.theme-menu-item');
    menuItems.forEach(item => {
        item.classList.toggle('active', item.dataset.theme === themePreference);
    });
    
    // Update track background for theme change
    if (typeof updateTrackBackground === 'function') {
        updateTrackBackground();
    }
    
    updatePaceChart(currentPaceData);
}

function setTheme(preference) {
    themePreference = preference;
    applyTheme();
    saveToLocalStorage();
    
    // Close menu
    const menu = document.getElementById('themeMenu');
    if (menu) {
        menu.classList.add('hidden');
        elements.themeToggle.setAttribute('aria-expanded', 'false');
    }
}

function toggleTheme() {
    // Toggle dropdown menu
    const menu = document.getElementById('themeMenu');
    if (menu) {
        const isHidden = menu.classList.contains('hidden');
        menu.classList.toggle('hidden', !isHidden);
        elements.themeToggle.setAttribute('aria-expanded', !isHidden);
    }
}

function loadThemePreference() {
    loadFromLocalStorage();
    applyTheme();
    
    // Listen for system theme changes if using system preference
    if (window.matchMedia && themePreference === 'system') {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (themePreference === 'system') {
                applyTheme();
            }
        });
    }
}

function initializeDistanceButtons() {
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

function handleDistanceChange() {
    // Same as handleDistanceInput but called on blur/change event
    handleDistanceInput();
    // Recalculate if pace data exists
    if (currentPaceData) {
        calculatePace();
    }
}

function handleDistanceInput() {
    const distance = parseFloat(elements.raceDistance.value);
    if (distance && distance >= 100) {
        const oldDistance = currentDistance;
        currentDistance = distance;
        
        // Filter out splits longer than new race distance
        if (oldDistance && distance < oldDistance) {
            const removedSplits = activeSplitDistances.filter(d => d > distance);
            activeSplitDistances = activeSplitDistances.filter(d => d <= distance);
            if (removedSplits.length > 0) {
                saveSplitDistances();
                // Update UI if pace data exists
                if (currentPaceData) {
                    updateCumulativeTimes(currentPaceData);
                }
            }
        }
        
        document.querySelectorAll('.preset-btn-compact').forEach(btn => {
            const btnDist = parseFloat(btn.dataset.distance);
            if (Math.abs(btnDist - distance) < 0.1) {
                document.querySelectorAll('.preset-btn-compact').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Update time suggestions and split buttons when distance changes
        updateTimeSuggestions();
        updateSplitPresetButtons();
        
        // Automatically set Target Time to the 4th suggested value (index 3)
        const timeSuggestions = getTimeSuggestions(distance);
        if (timeSuggestions.length >= 4 && elements.goalTime) {
            elements.goalTime.value = timeSuggestions[3]; // 4th value (index 3)
            updatePaceFromTime();
        }
        
        // Filter custom splits if any exceed race distance
        const raceDistance = currentDistance || 3000;
        if (customSplits.some(s => s.distance > raceDistance)) {
            customSplits = customSplits.filter(s => s.distance <= raceDistance);
            renderCustomSplits();
        }
        
        // If road track type, we need to recalculate since lap distance depends on total distance
        if (trackType === 'road') {
            // Update round indicators and recalculate if pace data exists
            addRoundIndicators();
            if (currentPaceData) {
                calculatePace();
            }
        }
    }
}

function initializeCustomSplits() {
    customSplits = [];
    renderCustomSplits();
}

function addCustomSplit() {
    const distance = currentDistance || 3000;
    const basePace = parseTimeToMs(elements.targetPace?.value || '05:00') / 1000;
    
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
    
    customSplits.sort((a, b) => a.distance - b.distance);
    renderCustomSplits();
}

function renderCustomSplits() {
    if (!elements.splitEditorList) return;
    
    elements.splitEditorList.innerHTML = '';
    customSplits.sort((a, b) => a.distance - b.distance);
    
    customSplits.forEach((split, index) => {
        const splitRow = document.createElement('div');
        splitRow.className = 'split-editor-row';
        splitRow.innerHTML = `
            <input type="number" class="split-distance-input" value="${split.distance}" min="1" step="1" data-index="${index}">
            <input type="text" class="split-pace-input" value="${formatTimeFromMsSimple(split.pace * 1000)}" placeholder="05:00" data-index="${index}">
            <button type="button" class="btn-remove-split" data-index="${index}">
                <i data-lucide="trash-2"></i>
            </button>
        `;
        
        elements.splitEditorList.appendChild(splitRow);
        
        const distanceInput = splitRow.querySelector('.split-distance-input');
        const paceInput = splitRow.querySelector('.split-pace-input');
        const removeBtn = splitRow.querySelector('.btn-remove-split');
        
        distanceInput.addEventListener('change', (e) => {
            const idx = parseInt(e.target.dataset.index);
            const newDist = parseInt(e.target.value);
            const raceDistance = currentDistance || 3000;
            if (newDist && newDist >= 1 && idx < customSplits.length) {
                // Validate against race distance
                if (newDist > raceDistance) {
                    showToast(isNorwegian ? `Deltid kan ikke være lengre enn løpsdistanse (${raceDistance}m)` : `Split cannot be longer than race distance (${raceDistance}m)`);
                    e.target.value = customSplits[idx].distance;
                    return;
                }
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
    
    // Reinitialize Lucide icons for dynamically created elements
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
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

function downloadStrategyHTML() {
    if (!currentPaceData) {
        showToast(isNorwegian ? 'Beregn først et løp' : 'Calculate a race first');
        return;
    }
    
    // Format distance
    let distanceDisplay = `${currentDistance}m`;
    if (currentDistance >= 1000) {
        distanceDisplay = `${(currentDistance / 1000).toFixed(2)}km`;
    }
    
    // Format strategy name
    const strategyNames = {
        'even': 'Even Pace',
        'neg10p': 'Negative Split (-10%)',
        'neg5p': 'Negative Split (-5%)',
        'neg3p': 'Negative Split (-3%)',
        'pos3p': 'Positive Split (+3%)',
        'pos5p': 'Positive Split (+5%)',
        'pos10p': 'Positive Split (+10%)',
        'kick600': 'Kick Last 600m',
        'progressive': 'Progressive',
        'degressive': 'Degressive',
        'custom': 'Custom Strategy'
    };
    const strategyDisplay = strategyNames[currentStrategy] || currentStrategy;
    
    // Get all splits
    const allSplits = [];
    currentPaceData.splits.forEach(splitGroup => {
        if (activeSplitDistances.includes(splitGroup.distance)) {
            allSplits.push(splitGroup);
        }
    });
    
    // Build HTML
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Race Strategy - ${distanceDisplay} - ${elements.goalTime.value}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #171717;
            background: #ffffff;
            padding: 2rem;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-radius: 12px;
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            color: white;
            padding: 2.5rem 2rem;
            text-align: center;
        }
        .header h1 {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }
        .header .subtitle {
            font-size: 1.125rem;
            opacity: 0.95;
        }
        .content {
            padding: 2rem;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2.5rem;
        }
        .info-card {
            background: #f9fafb;
            padding: 1.25rem;
            border-radius: 8px;
            border-left: 4px solid #dc2626;
        }
        .info-card-label {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #737373;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }
        .info-card-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: #171717;
            font-family: 'Courier New', monospace;
        }
        .splits-section {
            margin-top: 2.5rem;
        }
        .splits-section h2 {
            font-size: 1.5rem;
            font-weight: 700;
            color: #171717;
            margin-bottom: 1.5rem;
            padding-bottom: 0.75rem;
            border-bottom: 2px solid #e5e5e5;
        }
        .split-table {
            margin-bottom: 2rem;
        }
        .split-table-title {
            font-size: 1rem;
            font-weight: 600;
            color: #dc2626;
            margin-bottom: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
        }
        th {
            background: #f9fafb;
            padding: 0.875rem;
            text-align: left;
            font-weight: 600;
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #737373;
            border-bottom: 2px solid #e5e5e5;
        }
        td {
            padding: 0.875rem;
            border-bottom: 1px solid #f3f4f6;
            font-family: 'Courier New', monospace;
        }
        tr:hover {
            background: #f9fafb;
        }
        .distance-cell {
            font-weight: 600;
            color: #171717;
        }
        .time-cell {
            text-align: right;
            color: #dc2626;
            font-weight: 600;
        }
        .footer-note {
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 2px solid #e5e5e5;
            text-align: center;
            color: #737373;
            font-size: 0.875rem;
        }
        .footer-note a {
            color: #dc2626;
            text-decoration: none;
        }
        @media print {
            body {
                padding: 0;
            }
            .container {
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Race Strategy</h1>
            <div class="subtitle">${distanceDisplay} · Target Time: ${elements.goalTime.value}</div>
        </div>
        <div class="content">
            <div class="info-grid">
                <div class="info-card">
                    <div class="info-card-label">Distance</div>
                    <div class="info-card-value">${distanceDisplay}</div>
                </div>
                <div class="info-card">
                    <div class="info-card-label">Target Time</div>
                    <div class="info-card-value">${elements.goalTime.value}</div>
                </div>
                <div class="info-card">
                    <div class="info-card-label">Target Pace</div>
                    <div class="info-card-value">${elements.targetPace ? elements.targetPace.value : 'N/A'}/km</div>
                </div>
                <div class="info-card">
                    <div class="info-card-label">Strategy</div>
                    <div class="info-card-value">${strategyDisplay}</div>
                </div>
            </div>
            
            ${allSplits.length > 0 ? `
            <div class="splits-section">
                <h2>Splits</h2>
                ${allSplits.map(splitGroup => `
                <div class="split-table">
                    <div class="split-table-title">${splitGroup.distance}m Intervals</div>
                    <table>
                        <thead>
                            <tr>
                                <th>Distance</th>
                                <th style="text-align: right;">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${splitGroup.splits.map(split => `
                            <tr>
                                <td class="distance-cell">${split.distance}m</td>
                                <td class="time-cell">${formatTimeFromMsSimple(split.expectedTime)}</td>
                            </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                `).join('')}
            </div>
            ` : ''}
            
            <div class="footer-note">
                Generated by <a href="https://3000meter.com">3000METER.com</a> - Professional pace calculator for track athletes
            </div>
        </div>
    </div>
</body>
</html>`;
    
    // Create blob and download
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `race-strategy-${distanceDisplay.replace(/[^a-zA-Z0-9]/g, '-')}-${elements.goalTime.value.replace(/:/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast(isNorwegian ? 'Strategi lastet ned!' : 'Strategy downloaded!');
}

function downloadStrategyTXT() {
    if (!currentPaceData) {
        showToast(isNorwegian ? 'Ingen strategi å laste ned' : 'No strategy to download');
        return;
    }
    
    const distance = currentPaceData.totalDistance;
    const distanceDisplay = distance >= 1000 ? `${(distance / 1000).toFixed(2)}km` : `${distance}m`;
    
    const strategyNames = {
        'even': 'Even Pace',
        'neg10p': 'Negative Split (-10%)',
        'neg5p': 'Negative Split (-5%)',
        'neg3p': 'Negative Split (-3%)',
        'pos3p': 'Positive Split (+3%)',
        'pos5p': 'Positive Split (+5%)',
        'pos10p': 'Positive Split (+10%)',
        'kick600': 'Kick Last 600m',
        'progressive': 'Progressive',
        'degressive': 'Degressive',
        'custom': 'Custom Strategy'
    };
    const strategyDisplay = strategyNames[currentStrategy] || currentStrategy;
    
    // Get all splits
    const allSplits = [];
    currentPaceData.splits.forEach(splitGroup => {
        if (activeSplitDistances.includes(splitGroup.distance)) {
            allSplits.push(splitGroup);
        }
    });
    
    // Calculate average pace
    const totalTimeMs = currentPaceData.totalTime;
    const totalTimeSec = totalTimeMs / 1000;
    const avgPacePerKm = (totalTimeSec / (distance / 1000)).toFixed(2);
    const avgPaceMinutes = Math.floor(avgPacePerKm / 60);
    const avgPaceSeconds = Math.floor(avgPacePerKm % 60);
    const avgPaceDisplay = `${avgPaceMinutes}:${avgPaceSeconds.toString().padStart(2, '0')}/km`;
    
    // Track type display
    const trackTypeNames = {
        'outdoor': 'Outdoor Track (400m per lap)',
        'indoor': 'Indoor Track (200m per lap)',
        'road': 'Road Race'
    };
    const trackTypeDisplay = trackTypeNames[trackType] || trackType;
    
    // Build comprehensive text file
    let text = '';
    text += '='.repeat(80) + '\n';
    text += 'RACE STRATEGY REPORT\n';
    text += '='.repeat(80) + '\n\n';
    
    text += `Generated by 3000METER.com - ${new Date().toLocaleString()}\n`;
    text += `Website: https://3000meter.com\n\n`;
    
    text += '-'.repeat(80) + '\n';
    text += 'RACE OVERVIEW\n';
    text += '-'.repeat(80) + '\n\n';
    
    text += `Distance:           ${distanceDisplay}\n`;
    text += `Target Time:        ${elements.goalTime.value}\n`;
    if (elements.targetPace && elements.targetPace.value) {
        text += `Target Pace:        ${elements.targetPace.value}/km\n`;
    }
    text += `Average Pace:       ${avgPaceDisplay}\n`;
    text += `Strategy:           ${strategyDisplay}\n`;
    text += `Track Type:         ${trackTypeDisplay}\n`;
    text += `Total Time:         ${formatTimeFromMsSimple(totalTimeMs)}\n\n`;
    
    // Calculate total laps
    const laneDistance = trackType === 'road' ? distance : (trackType === 'indoor' ? 200 : 400);
    const totalLaps = trackType === 'road' ? 1 : Math.ceil(distance / laneDistance);
    text += `Total Laps:         ${totalLaps} ${trackType === 'road' ? '' : `(${laneDistance}m per lap)`}\n\n`;
    
    // Strategy explanation
    text += '-'.repeat(80) + '\n';
    text += 'STRATEGY EXPLANATION\n';
    text += '-'.repeat(80) + '\n\n';
    
    let strategyExplanation = '';
    switch(currentStrategy) {
        case 'even':
            strategyExplanation = 'Maintain a consistent pace throughout the entire race. This is the most energy-efficient strategy and helps avoid early fatigue.';
            break;
        case 'neg10p':
        case 'neg5p':
        case 'neg3p':
            const negPercent = currentStrategy === 'neg10p' ? '10%' : (currentStrategy === 'neg5p' ? '5%' : '3%');
            strategyExplanation = `Start ${negPercent} slower than target pace and finish ${negPercent} faster. This strategy helps conserve energy early and allows for a strong finish.`;
            break;
        case 'pos3p':
        case 'pos5p':
        case 'pos10p':
            const posPercent = currentStrategy === 'pos10p' ? '10%' : (currentStrategy === 'pos5p' ? '5%' : '3%');
            strategyExplanation = `Start ${posPercent} faster than target pace and finish ${posPercent} slower. This aggressive strategy can help build a buffer but requires strong endurance.`;
            break;
        case 'kick600':
            strategyExplanation = 'Maintain steady pace for most of the race, then accelerate significantly in the final 600m for a strong finish.';
            break;
        case 'progressive':
            strategyExplanation = 'Gradually increase pace throughout the race. Start conservatively and build speed as you go.';
            break;
        case 'degressive':
            strategyExplanation = 'Start fast and gradually slow down. This strategy requires excellent early pace control.';
            break;
        case 'custom':
            strategyExplanation = 'Custom pacing strategy with manually defined splits.';
            break;
        default:
            strategyExplanation = 'Custom pacing strategy.';
    }
    text += strategyExplanation + '\n\n';
    
    // Pace breakdown by distance segments
    text += '-'.repeat(80) + '\n';
    text += 'PACING BREAKDOWN\n';
    text += '-'.repeat(80) + '\n\n';
    
    const segments = [
        { label: 'First Quarter', distance: Math.floor(distance * 0.25) },
        { label: 'Second Quarter', distance: Math.floor(distance * 0.5) },
        { label: 'Third Quarter', distance: Math.floor(distance * 0.75) },
        { label: 'Final Quarter', distance: distance }
    ];
    
    segments.forEach((segment, idx) => {
        const segmentSplits = currentPaceData.splits.find(s => s.distance <= segment.distance);
        if (segmentSplits) {
            const closestSplit = segmentSplits.splits.reduce((prev, curr) => 
                Math.abs(curr.distance - segment.distance) < Math.abs(prev.distance - segment.distance) ? curr : prev
            );
            const segmentTime = closestSplit.expectedTime;
            const segmentPace = (segmentTime / 1000) / (segment.distance / 1000);
            const segmentPaceMin = Math.floor(segmentPace / 60);
            const segmentPaceSec = Math.floor(segmentPace % 60);
            const segmentPaceDisplay = `${segmentPaceMin}:${segmentPaceSec.toString().padStart(2, '0')}/km`;
            
            text += `${segment.label} (${segment.distance}m):\n`;
            text += `  Time:    ${formatTimeFromMsSimple(segmentTime)}\n`;
            text += `  Pace:    ${segmentPaceDisplay}\n\n`;
        }
    });
    
    // Detailed splits for each active split distance
    if (allSplits.length > 0) {
        allSplits.forEach(splitGroup => {
            text += '-'.repeat(80) + '\n';
            text += `${splitGroup.distance}m INTERVALS\n`;
            text += '-'.repeat(80) + '\n\n';
            
            text += `${'Distance'.padEnd(15)} ${'Time'.padEnd(15)} ${'Pace/km'.padEnd(15)} ${'Cumulative Time'}\n`;
            text += '-'.repeat(80) + '\n';
            
            splitGroup.splits.forEach((split, idx) => {
                const splitPace = (split.expectedTime / 1000) / (split.distance / 1000);
                const splitPaceMin = Math.floor(splitPace / 60);
                const splitPaceSec = Math.floor(splitPace % 60);
                const splitPaceDisplay = `${splitPaceMin}:${splitPaceSec.toString().padStart(2, '0')}`;
                
                const cumulativeTime = splitGroup.splits.slice(0, idx + 1).reduce((sum, s) => sum + s.expectedTime, 0);
                
                text += `${(split.distance + 'm').padEnd(15)} ${formatTimeFromMsSimple(split.expectedTime).padEnd(15)} ${splitPaceDisplay.padEnd(15)} ${formatTimeFromMsSimple(cumulativeTime)}\n`;
            });
            
            text += '\n';
        });
    }
    
    // Lap-by-lap breakdown
    text += '-'.repeat(80) + '\n';
    text += 'LAP-BY-LAP BREAKDOWN\n';
    text += '-'.repeat(80) + '\n\n';
    
    if (trackType !== 'road') {
        for (let lap = 1; lap <= totalLaps; lap++) {
            const lapDistance = lap * laneDistance;
            const lapSplits = currentPaceData.splits.find(s => s.distance <= laneDistance);
            if (lapSplits) {
                const lapSplit = lapSplits.splits.find(s => s.distance === laneDistance);
                if (lapSplit) {
                    const lapTime = lapSplit.expectedTime;
                    const lapPace = (lapTime / 1000) / (laneDistance / 1000);
                    const lapPaceMin = Math.floor(lapPace / 60);
                    const lapPaceSec = Math.floor(lapPace % 60);
                    const lapPaceDisplay = `${lapPaceMin}:${lapPaceSec.toString().padStart(2, '0')}/km`;
                    
                    const cumulativeDistance = Math.min(lapDistance, distance);
                    const cumulativeTime = lapSplits.splits.filter(s => s.distance <= cumulativeDistance).reduce((sum, s) => sum + s.expectedTime, 0);
                    
                    text += `Lap ${lap.toString().padStart(2, '0')}/${totalLaps.toString().padStart(2, '0')} (${cumulativeDistance}m): ${formatTimeFromMsSimple(lapTime)} (${lapPaceDisplay}) | Cumulative: ${formatTimeFromMsSimple(cumulativeTime)}\n`;
                }
            }
        }
        text += '\n';
    } else {
        text += 'Road race - single continuous distance\n\n';
    }
    
    // Tips and notes
    text += '-'.repeat(80) + '\n';
    text += 'TIPS & NOTES\n';
    text += '-'.repeat(80) + '\n\n';
    
    text += '• Warm up properly before the race\n';
    text += '• Stay hydrated throughout the race\n';
    text += '• Monitor your pace using a GPS watch or track markers\n';
    text += '• Focus on smooth, efficient running form\n';
    text += '• Mental preparation is key - visualize the race\n';
    text += '• If you fall behind pace, don\'t panic - adjust gradually\n';
    text += '• Save energy for the final stretch\n';
    text += '• Trust your training and stick to the plan\n\n';
    
    text += '-'.repeat(80) + '\n';
    text += 'END OF REPORT\n';
    text += '='.repeat(80) + '\n';
    text += `Generated by 3000METER.com - https://3000meter.com\n`;
    text += `Date: ${new Date().toLocaleString()}\n`;
    
    // Create and download file
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `race-strategy-${distanceDisplay.replace(/[^a-zA-Z0-9]/g, '-')}-${elements.goalTime.value.replace(/:/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast(isNorwegian ? 'Tekstfil lastet ned!' : 'Text file downloaded!');
}

function handleExport() {
    if (!currentPaceData) {
        showToast(isNorwegian ? 'Beregn først et løp' : 'Calculate a race first');
        return;
    }
    
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
    
    const splits400 = currentPaceData.splits.find(s => s.distance === 400);
    if (splits400) {
        exportText += `400m Intervals:\n`;
        splits400.splits.forEach(split => {
            exportText += `${split.distance}m: ${formatTimeFromMsSimple(split.expectedTime)}\n`;
        });
        exportText += `\n`;
    }
    
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

function updateLanguageUI() {
    // Language is fixed to Norwegian - no UI update needed
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

