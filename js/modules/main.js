// Main Application Initialization

function initializeApp() {
    drawTrack();
    drawMarkers();
    addRoundIndicators();
    initializeDistanceButtons();
    calculatePace();
}

function setupEventListeners() {
    // Input event listeners
    elements.goalTime.addEventListener('input', (e) => {
        validateTimeInput(e);
        updatePaceFromTime();
    });
    
    if (elements.targetPace) {
        elements.targetPace.addEventListener('input', (e) => {
            validateTimeInput(e);
            updateTimeFromPace();
        });
    }
    
    // Distance input
    if (elements.raceDistance) {
        elements.raceDistance.addEventListener('input', handleDistanceInput);
        elements.raceDistance.addEventListener('change', handleDistanceChange);
    }
    
    // Distance preset buttons
    document.querySelectorAll('.preset-btn-compact').forEach(btn => {
        btn.addEventListener('click', () => {
            const distance = parseFloat(btn.dataset.distance);
            if (distance && distance >= 100) {
                elements.raceDistance.value = distance;
                currentDistance = distance;
                // Update pace if time is set, or update time if pace is set
                if (elements.goalTime && elements.goalTime.value) {
                    updatePaceFromTime();
                } else if (elements.targetPace && elements.targetPace.value) {
                    updateTimeFromPace();
                }
                
                document.querySelectorAll('.preset-btn-compact').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
        });
    });
    
    // Strategy option buttons
    document.querySelectorAll('.strategy-btn-simple').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.strategy-btn-simple').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentStrategy = btn.dataset.strategy;
            
            if (currentStrategy === 'progressive' || currentStrategy === 'degressive' || currentStrategy === 'custom') {
                if (elements.advancedStrategyOptions) {
                    elements.advancedStrategyOptions.style.display = 'block';
                }
                
                if (currentStrategy === 'progressive') {
                    if (elements.paceChange) elements.paceChange.value = -2;
                    paceChangePer400m = -2;
                } else if (currentStrategy === 'degressive') {
                    if (elements.paceChange) elements.paceChange.value = 2;
                    paceChangePer400m = 2;
                }
            } else {
                if (elements.advancedStrategyOptions) {
                    elements.advancedStrategyOptions.style.display = 'none';
                }
            }
            
            elements.strategyButtons.forEach(b => {
                b.classList.toggle('active', b.dataset.strategy === currentStrategy);
            });
        });
    });
    
    // Advanced strategy controls
    if (elements.progressionType) {
        elements.progressionType.addEventListener('change', () => {
            progressionType = elements.progressionType.value;
        });
    }
    
    if (elements.paceChange) {
        elements.paceChange.addEventListener('input', () => {
            paceChangePer400m = parseFloat(elements.paceChange.value) || 0;
        });
    }
    
    if (elements.startPace) {
        elements.startPace.addEventListener('input', () => {
            updatePaceFromTime();
        });
    }
    
    if (elements.endPace) {
        elements.endPace.addEventListener('input', () => {
            updatePaceFromTime();
        });
    }
    
    // Custom split editor
    if (elements.addSplitBtn) {
        elements.addSplitBtn.addEventListener('click', addCustomSplit);
    }
    
    initializeCustomSplits();
    
    // Split management
    document.querySelectorAll('.split-preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const distance = parseInt(btn.dataset.distance);
            if (distance) {
                if (activeSplitDistances.includes(distance)) {
                    removeSplitDistance(distance);
                } else {
                    addSplitDistance(distance);
                }
            }
        });
    });
    
    const customSplitInput = document.getElementById('customSplitDistance');
    const addCustomSplitBtn = document.getElementById('addCustomSplitBtn');
    
    if (addCustomSplitBtn) {
        addCustomSplitBtn.addEventListener('click', () => {
            if (customSplitInput && customSplitInput.value) {
                addSplitDistance(customSplitInput.value);
                customSplitInput.value = '';
            }
        });
    }
    
    if (customSplitInput) {
        customSplitInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                if (customSplitInput.value) {
                    addSplitDistance(customSplitInput.value);
                    customSplitInput.value = '';
                }
            }
        });
    }
    
    // Handle remove split buttons (delegated event listener)
    document.addEventListener('click', (e) => {
        if (e.target.closest('.remove-split-btn')) {
            const btn = e.target.closest('.remove-split-btn');
            const distance = parseInt(btn.dataset.distance);
            if (distance) {
                removeSplitDistance(distance);
            }
        }
    });
    
    // Strategy buttons
    elements.strategyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.strategyButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentStrategy = btn.dataset.strategy;
            
            document.querySelectorAll('.strategy-option').forEach(b => {
                b.classList.toggle('active', b.dataset.strategy === currentStrategy);
            });
        });
    });
    
    // Action buttons
    elements.calculateBtn.addEventListener('click', handleCalculateButtonClick);
    
    if (elements.downloadStrategyBtn) {
        elements.downloadStrategyBtn.addEventListener('click', downloadStrategyHTML);
    }
    
    if (elements.themeToggle) {
        elements.themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Tab buttons
    if (elements.tabButtons) {
        elements.tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                switchTab(tab);
            });
        });
    }
    
    // Track type buttons
    document.querySelectorAll('.track-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.trackType;
            if (type) {
                trackType = type;
                document.querySelectorAll('.track-type-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                // Redraw track with new type
                drawTrack();
                drawMarkers();
                addRoundIndicators();
                // Recalculate pace if data exists
                if (currentPaceData) {
                    calculatePace();
                } else {
                    // Update runner position if animation is active
                    if (animationState.currentDistance > 0) {
                        updateRunnerPosition(animationState.lapProgress, animationState.currentDistance);
                    }
                }
            }
        });
    });
    
    // Chart type buttons
    document.querySelectorAll('.chart-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const chartType = btn.dataset.chartType;
            if (chartType) {
                switchChartType(chartType);
            }
        });
    });
    
    // Animation controls
    if (elements.playPauseBtn) {
        elements.playPauseBtn.addEventListener('click', toggleAnimation);
    }
    if (elements.resetBtn) {
        elements.resetBtn.addEventListener('click', resetAnimation);
    }
    
    // Speed controls
    if (elements.speedSlider) {
        elements.speedSlider.addEventListener('input', (e) => {
            const speed = parseFloat(e.target.value);
            updateAnimationSpeed(speed);
            if (elements.speedDisplay) {
                elements.speedDisplay.textContent = `${speed.toFixed(1)}x`;
            }
        });
    }
    
    if (elements.speedDownBtn) {
        elements.speedDownBtn.addEventListener('click', () => {
            const currentSpeed = animationState.speed;
            const newSpeed = Math.max(0.25, currentSpeed - 0.25);
            updateAnimationSpeed(newSpeed);
            if (elements.speedSlider) elements.speedSlider.value = newSpeed;
            if (elements.speedDisplay) elements.speedDisplay.textContent = `${newSpeed.toFixed(1)}x`;
        });
    }
    
    if (elements.speedUpBtn) {
        elements.speedUpBtn.addEventListener('click', () => {
            const currentSpeed = animationState.speed;
            const newSpeed = Math.min(5, currentSpeed + 0.25);
            updateAnimationSpeed(newSpeed);
            if (elements.speedSlider) elements.speedSlider.value = newSpeed;
            if (elements.speedDisplay) elements.speedDisplay.textContent = `${newSpeed.toFixed(1)}x`;
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Auto-save
    window.addEventListener('beforeunload', saveToLocalStorage);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize DOM elements
    elements = {
        goalTime: document.getElementById('goalTime'),
        targetPace: document.getElementById('targetPace'),
        raceDistance: document.getElementById('raceDistance'),
        strategyButtons: document.querySelectorAll('.strategy-btn'),
        calculateBtn: document.getElementById('calculateBtn'),
        themeToggle: document.getElementById('themeToggle'),
        largeTargetTimeDisplay: document.getElementById('largeTargetTimeDisplay'),
        runnerDot: document.getElementById('runner-dot'),
        roundIndicators: document.getElementById('round-indicators'),
        playPauseBtn: document.getElementById('playPauseBtn'),
        resetBtn: document.getElementById('resetBtn'),
        currentLapDisplay: document.getElementById('currentLapDisplay'),
        currentDistanceDisplay: document.getElementById('currentDistanceDisplay'),
        currentPaceDisplay: document.getElementById('currentPaceDisplay'),
        progressPercentDisplay: document.getElementById('progressPercentDisplay'),
        speedSlider: document.getElementById('speedSlider'),
        speedDisplay: document.getElementById('speedDisplay'),
        speedDownBtn: document.getElementById('speedDownBtn'),
        speedUpBtn: document.getElementById('speedUpBtn'),
        cumulativeTimes200m: document.getElementById('cumulativeTimes200m'),
        cumulativeTimes400m: document.getElementById('cumulativeTimes400m'),
        cumulativeTimes1000m: document.getElementById('cumulativeTimes1000m'),
        tabButtons: document.querySelectorAll('.tab-btn'),
        toast: document.getElementById('toast'),
        advancedStrategyOptions: document.getElementById('advancedStrategyOptions'),
        progressionType: document.getElementById('progressionType'),
        paceChange: document.getElementById('paceChange'),
        startPace: document.getElementById('startPace'),
        endPace: document.getElementById('endPace'),
        splitEditorList: document.getElementById('splitEditorList'),
        addSplitBtn: document.getElementById('addSplitBtn'),
        downloadStrategyBtn: document.getElementById('downloadStrategyBtn')
    };
    
    initializeDistanceButtons();
    initializeApp();
    setupEventListeners();
    setupServiceWorker();
    loadFromURL();
    updateLanguageUI();
    updateI18n();
    loadThemePreference();
    loadSplitDistances(); // Load saved split distances
    
    // Initialize track type button states
    document.querySelectorAll('.track-type-btn').forEach(btn => {
        if (btn.dataset.trackType === trackType) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Initialize time suggestions and split buttons
    updateTimeSuggestions();
    updateSplitPresetButtons();
    
    // Initialize pace field from time
    if (elements.targetPace && elements.goalTime) {
        updatePaceFromTime();
    }
    
    // Initialize speed display
    if (elements.speedDisplay) {
        elements.speedDisplay.textContent = `${animationState.speed.toFixed(1)}x`;
    }
    
    // Initialize Lucide icons after everything is loaded
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Update loading screen runner color to match theme
    updateLoadingRunnerColor();
    
    // Hide loading screen after everything is initialized
    hideLoadingScreen();
});

function updateLoadingRunnerColor() {
    const runnerCircle = document.querySelector('.loading-runner-circle');
    if (runnerCircle) {
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
        runnerCircle.setAttribute('fill', primaryColor || '#dc2626');
    }
}

function hideLoadingScreen() {
    // Wait a minimum time to show the loading animation
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            document.body.classList.remove('loading');
            // Remove from DOM after animation completes
            setTimeout(() => {
                if (loadingScreen.parentNode) {
                    loadingScreen.remove();
                }
            }, 500);
        }
    }, 800); // Show for at least 800ms
}

