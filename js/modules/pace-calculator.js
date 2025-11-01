// Pace Calculator - Core calculation logic

function calculatePace() {
    if (!validateInputs()) {
        return;
    }
    
    const distance = getCurrentDistance();
    TRACK_CONSTANTS.TOTAL_DISTANCE = distance;
    
    // Get time - either directly from goalTime or calculate from pace
    let totalMs;
    const timeStr = elements.goalTime.value;
    const timeMs = parseTimeToMs(timeStr);
    
    // If pace is provided and valid, use it to calculate time
    if (elements.targetPace && elements.targetPace.value) {
        const paceStr = elements.targetPace.value;
        const paceMs = parseTimeToMs(paceStr);
        if (paceMs > 0) {
            const distanceKm = distance / 1000;
            totalMs = paceMs * distanceKm;
            // Update time field to reflect calculated time
            if (!timeMs || Math.abs(timeMs - totalMs) > 100) {
                elements.goalTime.value = formatTimeFromMsSimple(totalMs);
            }
        } else {
            totalMs = timeMs;
        }
    } else {
        totalMs = timeMs;
    }
    
    if (!totalMs || totalMs <= 0) {
        showToast(isNorwegian ? 'Vennligst skriv inn en gyldig tid eller tempo' : 'Please enter a valid time or pace');
        return;
    }
    
    const laneDistance = getLaneDistance(currentLane);
    const totalLaps = trackType === 'road' ? 1 : Math.ceil(TRACK_CONSTANTS.TOTAL_DISTANCE / laneDistance);
    const basePacePerKm = (totalMs / 1000) / (TRACK_CONSTANTS.TOTAL_DISTANCE / 1000);
    
    const data = generatePaceData(totalMs, laneDistance, totalLaps, basePacePerKm);
    currentPaceData = data;
    
    // Update all UI elements
    updateResults(data);
    updateTrackVisualization(data);
    updateAnimationState(data);
    updatePaceChart(data);
    
    // Ensure track is redrawn with correct type
    drawTrack();
    drawMarkers();
    addRoundIndicators();
}

function generatePaceData(totalMs, laneDistance, totalLaps, basePacePerKm) {
    const data = {
        totalTime: totalMs,
        laneDistance: laneDistance,
        totalLaps: totalLaps,
        basePacePerKm: basePacePerKm,
        strategy: currentStrategy,
        totalDistance: TRACK_CONSTANTS.TOTAL_DISTANCE,
        splits: [],
        segments: [],
        paceData: []
    };
    
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
    
    for(let dist = 100; dist <= TRACK_CONSTANTS.TOTAL_DISTANCE; dist += 100) {
        const expectedTime = calculateExpectedTime(dist, basePacePerKm);
        const pace = (expectedTime / 1000) / (dist / 1000);
        data.paceData.push({
            distance: dist,
            time: expectedTime / 1000,
            pace: pace
        });
    }
    
    return data;
}

function calculateExpectedTime(distance, basePacePerKmParam = null, strategyParam = null) {
    let basePacePerKm;
    
    if (basePacePerKmParam !== null) {
        basePacePerKm = basePacePerKmParam;
    } else if (currentPaceData) {
        basePacePerKm = currentPaceData.basePacePerKm;
    } else {
        const goalTimeMs = parseTimeToMs(elements.goalTime.value);
        basePacePerKm = (goalTimeMs / 1000) / (TRACK_CONSTANTS.TOTAL_DISTANCE / 1000);
    }
    
    const strategy = strategyParam || (currentPaceData ? currentPaceData.strategy : currentStrategy);
    let paceMultiplier = 1.0;
    
    switch(strategy) {
        case 'even':
            paceMultiplier = 1.0;
            break;
        case 'neg10p':
            const progress10neg = distance / TRACK_CONSTANTS.TOTAL_DISTANCE;
            const secondsPer400m10neg = -10;
            const totalSecondsAdjustment10neg = (distance / 400) * secondsPer400m10neg;
            const baseTimeForDistance10neg = (distance / 1000) * basePacePerKm;
            paceMultiplier = (baseTimeForDistance10neg + totalSecondsAdjustment10neg) / baseTimeForDistance10neg;
            break;
        case 'neg5p':
            const progress4 = distance / TRACK_CONSTANTS.TOTAL_DISTANCE;
            const secondsPer400m4 = -5;
            const totalSecondsAdjustment4 = (distance / 400) * secondsPer400m4;
            const baseTimeForDistance4 = (distance / 1000) * basePacePerKm;
            paceMultiplier = (baseTimeForDistance4 + totalSecondsAdjustment4) / baseTimeForDistance4;
            break;
        case 'neg3p':
            const progress3neg = distance / TRACK_CONSTANTS.TOTAL_DISTANCE;
            const secondsPer400m3neg = -3;
            const totalSecondsAdjustment3neg = (distance / 400) * secondsPer400m3neg;
            const baseTimeForDistance3neg = (distance / 1000) * basePacePerKm;
            paceMultiplier = (baseTimeForDistance3neg + totalSecondsAdjustment3neg) / baseTimeForDistance3neg;
            break;
        case 'pos3p':
            const progress3pos = distance / TRACK_CONSTANTS.TOTAL_DISTANCE;
            const secondsPer400m3pos = 3;
            const totalSecondsAdjustment3pos = (distance / 400) * secondsPer400m3pos;
            const baseTimeForDistance3pos = (distance / 1000) * basePacePerKm;
            paceMultiplier = (baseTimeForDistance3pos + totalSecondsAdjustment3pos) / baseTimeForDistance3pos;
            break;
        case 'pos5p':
            const progress5 = distance / TRACK_CONSTANTS.TOTAL_DISTANCE;
            const secondsPer400m5 = 5;
            const totalSecondsAdjustment5 = (distance / 400) * secondsPer400m5;
            const baseTimeForDistance5 = (distance / 1000) * basePacePerKm;
            paceMultiplier = (baseTimeForDistance5 + totalSecondsAdjustment5) / baseTimeForDistance5;
            break;
        case 'pos10p':
            const progress10pos = distance / TRACK_CONSTANTS.TOTAL_DISTANCE;
            const secondsPer400m10pos = 10;
            const totalSecondsAdjustment10pos = (distance / 400) * secondsPer400m10pos;
            const baseTimeForDistance10pos = (distance / 1000) * basePacePerKm;
            paceMultiplier = (baseTimeForDistance10pos + totalSecondsAdjustment10pos) / baseTimeForDistance10pos;
            break;
        case 'kick600':
            const kickStartDistance = TRACK_CONSTANTS.TOTAL_DISTANCE - 600;
            if (distance <= kickStartDistance) {
                paceMultiplier = 1.0;
            } else {
                const kickProgress = (distance - kickStartDistance) / 600;
                paceMultiplier = 1.0 - (kickProgress * 0.05);
            }
            break;
        case 'progressive':
            const progressProg = distance / TRACK_CONSTANTS.TOTAL_DISTANCE;
            const secondsPer400mProg = paceChangePer400m || -2;
            let adjustmentProg;
            
            if (progressionType === 'linear') {
                adjustmentProg = (distance / 400) * secondsPer400mProg * progressProg;
            } else if (progressionType === 'exponential') {
                adjustmentProg = (distance / 400) * secondsPer400mProg * (Math.pow(progressProg, 2));
            } else if (progressionType === 'sigmoid') {
                const sigmoid = 1 / (1 + Math.exp(-10 * (progressProg - 0.5)));
                adjustmentProg = (distance / 400) * secondsPer400mProg * sigmoid;
            } else {
                adjustmentProg = (distance / 400) * secondsPer400mProg * progressProg;
            }
            
            const baseTimeProg = (distance / 1000) * basePacePerKm;
            paceMultiplier = (baseTimeProg + adjustmentProg) / baseTimeProg;
            break;
        case 'degressive':
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
            if (customSplits.length > 0) {
                let prevSplit = { distance: 0, pace: basePacePerKm };
                for (const split of customSplits) {
                    if (distance <= split.distance) {
                        const segmentProgress = (distance - prevSplit.distance) / (split.distance - prevSplit.distance);
                        const interpolatedPace = prevSplit.pace + (split.pace - prevSplit.pace) * segmentProgress;
                        paceMultiplier = interpolatedPace / basePacePerKm;
                        break;
                    }
                    prevSplit = split;
                }
                if (distance > customSplits[customSplits.length - 1].distance) {
                    paceMultiplier = customSplits[customSplits.length - 1].pace / basePacePerKm;
                }
            } else if (elements.startPace && elements.endPace && elements.startPace.value && elements.endPace.value) {
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
    
    if (strategy === 'even') {
        return (distance / 1000) * basePacePerKm * 1000;
    }
    
    return (distance / 1000) * basePacePerKm * paceMultiplier * 1000;
}

function getCurrentDistance() {
    if (!elements.raceDistance) return 3000;
    const distance = parseFloat(elements.raceDistance.value);
    return distance && distance >= 100 ? distance : 3000;
}

function validateInputs() {
    const timeStr = elements.goalTime.value;
    const timeMs = parseTimeToMs(timeStr);
    
    // Check if pace is provided instead
    if (elements.targetPace && elements.targetPace.value) {
        const paceStr = elements.targetPace.value;
        const paceMs = parseTimeToMs(paceStr);
        if (paceMs > 0) {
            return true; // Valid pace input
        }
    }
    
    // Check if time is provided
    if (!timeMs) {
        showToast(isNorwegian ? 'Vennligst skriv inn en gyldig tid eller tempo i mm:ss format' : 'Please enter a valid time or pace in mm:ss format');
        return false;
    }
    
    return true;
}

function handleCalculateButtonClick() {
    const calculateBtn = elements.calculateBtn;
    calculateBtn.classList.add('success');
    setTimeout(() => {
        calculateBtn.classList.remove('success');
    }, 1500);
    
    resetAnimation();
    
    // Show calculation loading
    showCalculationLoading();
    
    // Use setTimeout to allow UI to update before starting heavy calculations
    setTimeout(() => {
        calculatePace();
        updateURL();
        
        // Hide loading and collapse inputs after calculation
        setTimeout(() => {
            hideCalculationLoading();
            collapseInputArea();
            updateRaceSummary();
        }, 300);
    }, 50);
}

function collapseInputArea() {
    const inputArea = document.getElementById('inputArea');
    const summaryCard = document.getElementById('raceSummary');
    
    if (inputArea) {
        inputArea.classList.add('collapsed');
    }
    
    if (summaryCard) {
        summaryCard.classList.remove('hidden');
    }
}

function expandInputArea() {
    const inputArea = document.getElementById('inputArea');
    const summaryCard = document.getElementById('raceSummary');
    
    if (inputArea) {
        inputArea.classList.remove('collapsed');
    }
    
    if (summaryCard) {
        summaryCard.classList.add('hidden');
    }
}

function updateRaceSummary() {
    const summaryDistance = document.getElementById('summaryDistance');
    const summaryTime = document.getElementById('summaryTime');
    const summaryPace = document.getElementById('summaryPace');
    const summaryStrategy = document.getElementById('summaryStrategy');
    const summaryTrackType = document.getElementById('summaryTrackType');
    
    if (summaryDistance) {
        const distance = currentDistance || 3000;
        if (distance >= 1000) {
            summaryDistance.textContent = `${(distance / 1000).toFixed(2)}km`;
        } else {
            summaryDistance.textContent = `${distance}m`;
        }
    }
    
    if (summaryTime && elements.goalTime) {
        summaryTime.textContent = elements.goalTime.value || '--:--';
    }
    
    if (summaryPace && elements.targetPace) {
        summaryPace.textContent = `${elements.targetPace.value || '--:--'}/km`;
    }
    
    if (summaryStrategy) {
        const strategyNames = {
            'even': 'Even',
            'neg10p': '-10%',
            'neg5p': '-5%',
            'neg3p': '-3%',
            'pos3p': '+3%',
            'pos5p': '+5%',
            'pos10p': '+10%',
            'kick600': 'Kick 600m',
            'progressive': 'Progressive',
            'degressive': 'Degressive',
            'custom': 'Custom'
        };
        summaryStrategy.textContent = strategyNames[currentStrategy] || currentStrategy;
    }
    
    if (summaryTrackType) {
        const trackTypeNames = {
            'outdoor': 'Outdoor',
            'indoor': 'Indoor',
            'road': 'Road'
        };
        summaryTrackType.textContent = trackTypeNames[trackType] || 'Outdoor';
    }
}

function showCalculationLoading() {
    const loadingEl = document.getElementById('calculationLoading');
    if (loadingEl) {
        loadingEl.classList.remove('hidden');
    }
}

function hideCalculationLoading() {
    const loadingEl = document.getElementById('calculationLoading');
    if (loadingEl) {
        loadingEl.classList.add('hidden');
    }
}

