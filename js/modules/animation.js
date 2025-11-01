// Animation Functions

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
    elements.playPauseBtn.innerHTML = '<i data-lucide="pause"></i>';
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    animationLoop();
}

function pauseAnimation() {
    animationState.isPlaying = false;
    elements.playPauseBtn.innerHTML = '<i data-lucide="play"></i>';
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
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

function updateAnimationSpeed(newSpeed) {
    if (animationState.isPlaying) {
        const now = Date.now();
        animationState.startTime = now - (animationState.currentTime / newSpeed * 1000);
    }
    animationState.speed = newSpeed;
    if (elements.speedInput) elements.speedInput.value = newSpeed;
    if (elements.speedSlider) elements.speedSlider.value = newSpeed;
    if (elements.speedDisplay) elements.speedDisplay.textContent = `${newSpeed.toFixed(1)}x`;
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
    const laneDistance = getLaneDistance(currentLane);
    animationState.currentLap = Math.floor(distance / laneDistance) + 1;
    animationState.lapProgress = 1 - ((distance % laneDistance) / laneDistance);
    
    updateRunnerPosition(animationState.lapProgress, distance);
    updateAnimationUI();
    updateRoundIndicators();
    
    if (progress < 1) {
        animationState.animationId = requestAnimationFrame(animationLoop);
    } else {
        pauseAnimation();
    }
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

function calculateCurrentPace() {
    if (animationState.currentDistance <= 0) return '--:--';
    
    const currentTimeMs = animationState.currentTime * 1000;
    const currentDistanceKm = animationState.currentDistance / 1000;
    const pacePerKm = currentTimeMs / currentDistanceKm;
    
    const roundedPaceMs = Math.round(pacePerKm / 1000) * 1000;
    return formatTimeFromMsSimple(roundedPaceMs);
}

