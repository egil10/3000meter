// UI Update Functions

function updateResults(data) {
    elements.largeTargetTimeDisplay.textContent = `00:00.00 / ${formatTimeFromMs(data.totalTime)}`;
    document.title = `3000METER.com – ${elements.goalTime.value}`;
    updateCumulativeTimes(data);
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
    
    if (currentPaceData) {
        updateCumulativeTimes(currentPaceData);
    }
}

function addSplitDistance(distance) {
    distance = parseInt(distance);
    if (isNaN(distance) || distance < 50) {
        showToast(isNorwegian ? 'Ugyldig distanse' : 'Invalid distance');
        return;
    }
    
    // Round to nearest 50m
    distance = Math.round(distance / 50) * 50;
    
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

function getTimeSuggestions(distance) {
    // Generate 10 common times for the given distance
    const suggestions = [];
    
    // Different pace ranges for different distances
    if (distance <= 200) {
        // Sprint distances - very fast times
        const baseTimes = [10, 12, 15, 18, 20, 22, 25, 28, 30, 35];
        baseTimes.forEach(sec => {
            const minutes = Math.floor(sec / 60);
            const seconds = sec % 60;
            suggestions.push(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        });
    } else if (distance <= 400) {
        // 400m - 30s to 90s
        const baseTimes = [30, 35, 40, 45, 50, 55, 60, 70, 80, 90];
        baseTimes.forEach(sec => {
            const minutes = Math.floor(sec / 60);
            const seconds = sec % 60;
            suggestions.push(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        });
    } else if (distance <= 800) {
        // 800m - 1:30 to 4:00
        const times = [90, 110, 130, 150, 170, 190, 210, 230, 250, 240];
        times.forEach(sec => {
            const minutes = Math.floor(sec / 60);
            const seconds = sec % 60;
            suggestions.push(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        });
    } else if (distance <= 1500) {
        // 1500m - 3:30 to 8:00
        const times = [210, 240, 270, 300, 330, 360, 390, 420, 450, 480];
        times.forEach(sec => {
            const minutes = Math.floor(sec / 60);
            const seconds = sec % 60;
            suggestions.push(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        });
    } else if (distance <= 3000) {
        // 3000m - 8:00 to 15:00
        const times = [480, 540, 600, 660, 720, 780, 840, 900, 960, 900];
        times.forEach(sec => {
            const minutes = Math.floor(sec / 60);
            const seconds = sec % 60;
            suggestions.push(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        });
    } else if (distance <= 5000) {
        // 5000m - 12:00 to 25:00
        const times = [720, 840, 960, 1080, 1200, 1320, 1440, 1560, 1680, 1500];
        times.forEach(sec => {
            const minutes = Math.floor(sec / 60);
            const seconds = sec % 60;
            suggestions.push(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        });
    } else if (distance <= 10000) {
        // 10000m - 25:00 to 50:00
        const times = [1500, 1800, 2100, 2400, 2700, 3000, 3300, 3600, 3900, 4200];
        times.forEach(sec => {
            const minutes = Math.floor(sec / 60);
            const seconds = sec % 60;
            suggestions.push(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        });
    } else if (distance <= 21097) {
        // Half Marathon - 1:00:00 to 2:30:00
        const times = [3600, 4200, 4800, 5400, 6000, 6600, 7200, 7800, 8400, 9000];
        times.forEach(sec => {
            const hours = Math.floor(sec / 3600);
            const minutes = Math.floor((sec % 3600) / 60);
            const seconds = sec % 60;
            suggestions.push(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        });
    } else {
        // Marathon - 2:00:00 to 5:00:00
        const times = [7200, 8400, 9600, 10800, 12000, 13200, 14400, 15600, 16800, 18000];
        times.forEach(sec => {
            const hours = Math.floor(sec / 3600);
            const minutes = Math.floor((sec % 3600) / 60);
            const seconds = sec % 60;
            suggestions.push(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        });
    }
    
    return suggestions.slice(0, 10); // Return max 10 suggestions
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

function getSplitSuggestions(distance) {
    // Generate split suggestions based on distance
    const suggestions = [];
    
    if (distance <= 200) {
        suggestions.push(50, 100);
    } else if (distance <= 400) {
        suggestions.push(50, 100, 200);
    } else if (distance <= 800) {
        suggestions.push(100, 200, 400);
    } else if (distance <= 1500) {
        suggestions.push(100, 200, 300, 400, 800);
    } else if (distance <= 3000) {
        suggestions.push(200, 400, 600, 800, 1000, 1500);
    } else if (distance <= 5000) {
        suggestions.push(400, 800, 1000, 1600, 2000);
    } else if (distance <= 10000) {
        suggestions.push(400, 800, 1000, 1600, 2000, 5000);
    } else {
        suggestions.push(1000, 2000, 5000, 10000);
    }
    
    return suggestions;
}

function updateSplitPresetButtons() {
    const presetContainer = document.querySelector('.split-preset-buttons');
    if (!presetContainer) return;
    
    // Clear existing buttons
    presetContainer.innerHTML = '';
    
    // Get suggestions based on current distance
    const suggestions = getSplitSuggestions(currentDistance || 3000);
    
    // Create buttons for each suggestion
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
            addCustomSplit(dist);
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
                activeSplitDistances = parsed.filter(d => typeof d === 'number' && d > 0);
            }
        }
    } catch (e) {
        console.error('Failed to load split distances:', e);
    }
    
    // Ensure at least one split is active
    if (activeSplitDistances.length === 0) {
        activeSplitDistances = [200, 400];
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
    
    const currentDistance = animationState.currentDistance;
    
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
            
            if (Math.abs(distance - currentDistance) < 50) {
                row.classList.add('current');
            } else if (distance < currentDistance) {
                row.classList.add('completed');
            }
            
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
}

function updatePaceChart(data) {
    if (!data || !data.paceData || data.paceData.length === 0) return;
    
    const canvas = document.getElementById('paceChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const isDark = document.body.classList.contains('dark-mode');
    
    if (paceChart) {
        paceChart.destroy();
    }
    
    const labels = data.paceData.map(d => `${(d.distance / 1000).toFixed(1)}km`);
    
    let chartConfig = {};
    
    switch(currentChartType) {
        case 'pace':
            chartConfig = createPaceChart(data, labels, isDark);
            break;
        case 'speed':
            chartConfig = createSpeedChart(data, labels, isDark);
            break;
        case 'time':
            chartConfig = createTimeChart(data, labels, isDark);
            break;
        case 'split-pace':
            chartConfig = createSplitPaceChart(data, labels, isDark);
            break;
        case 'acceleration':
            chartConfig = createAccelerationChart(data, labels, isDark);
            break;
        case 'effort':
            chartConfig = createEffortChart(data, labels, isDark);
            break;
    }
    
    paceChart = new Chart(ctx, chartConfig);
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

function switchChartType(chartType) {
    currentChartType = chartType;
    
    // Update button states
    document.querySelectorAll('.chart-type-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.chartType === chartType) {
            btn.classList.add('active');
        }
    });
    
    // Update chart
    if (currentPaceData) {
        updatePaceChart(currentPaceData);
    }
    
    // Reinitialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
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

function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    elements.themeToggle.innerHTML = isDarkMode 
        ? '<i data-lucide="sun"></i>' 
        : '<i data-lucide="moon"></i>';
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    // Update track background for theme change
    if (typeof updateTrackBackground === 'function') {
        updateTrackBackground();
    }
    saveToLocalStorage();
    updatePaceChart(currentPaceData);
}

function loadThemePreference() {
    loadFromLocalStorage();
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        if (elements.themeToggle) {
            elements.themeToggle.innerHTML = '<i data-lucide="sun"></i>';
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    }
    // Update track background when loading theme preference
    if (typeof updateTrackBackground === 'function') {
        updateTrackBackground();
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
        currentDistance = distance;
        
        document.querySelectorAll('.preset-btn-compact').forEach(btn => {
            const btnDist = parseFloat(btn.dataset.distance);
            if (Math.abs(btnDist - distance) < 0.1) {
                document.querySelectorAll('.preset-btn-compact').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            } else if (!document.querySelector('.preset-btn-compact.active')) {
                btn.classList.remove('active');
            }
        });
        
        // Update time suggestions and split buttons when distance changes
        updateTimeSuggestions();
        updateSplitPresetButtons();
        
        // If road track type, we need to recalculate since lap distance depends on total distance
        if (trackType === 'road') {
            // Update round indicators and recalculate if pace data exists
            addRoundIndicators();
            if (currentPaceData) {
                calculatePace();
            }
        }
        
        // Update pace if time is set, or update time if pace is set
        if (elements.goalTime && elements.goalTime.value) {
            updatePaceFromTime();
        } else if (elements.targetPace && elements.targetPace.value) {
            updateTimeFromPace();
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
            <input type="number" class="split-distance-input" value="${split.distance}" min="100" step="100" data-index="${index}">
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

