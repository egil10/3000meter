// Pace Calculator - Core calculation logic

function calculatePace() {
    if (!validateInputs()) {
        return;
    }
    
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
        case 'neg5p':
            const progress4 = distance / TRACK_CONSTANTS.TOTAL_DISTANCE;
            const secondsPer400m4 = -5;
            const totalSecondsAdjustment4 = (distance / 400) * secondsPer400m4;
            const baseTimeForDistance4 = (distance / 1000) * basePacePerKm;
            paceMultiplier = (baseTimeForDistance4 + totalSecondsAdjustment4) / baseTimeForDistance4;
            break;
        case 'pos5p':
            const progress5 = distance / TRACK_CONSTANTS.TOTAL_DISTANCE;
            const secondsPer400m5 = 5;
            const totalSecondsAdjustment5 = (distance / 400) * secondsPer400m5;
            const baseTimeForDistance5 = (distance / 1000) * basePacePerKm;
            paceMultiplier = (baseTimeForDistance5 + totalSecondsAdjustment5) / baseTimeForDistance5;
            break;
        case 'kick600':
            if (distance <= 2400) {
                paceMultiplier = 1.0;
            } else {
                const kickProgress = (distance - 2400) / 600;
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
    const totalMs = parseTimeToMs(timeStr);
    
    if (!totalMs) {
        showToast(isNorwegian ? 'Vennligst skriv inn en gyldig tid i mm:ss format' : 'Please enter a valid time in mm:ss format');
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
    calculatePace();
    updateURL();
}

