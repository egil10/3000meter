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
                updatePaceFromTime();
                
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
    
    // Animation controls
    if (elements.playPauseBtn) {
        elements.playPauseBtn.addEventListener('click', toggleAnimation);
    }
    if (elements.resetBtn) {
        elements.resetBtn.addEventListener('click', resetAnimation);
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
        addSplitBtn: document.getElementById('addSplitBtn')
    };
    
    initializeDistanceButtons();
    initializeApp();
    setupEventListeners();
    setupServiceWorker();
    loadFromURL();
    updateLanguageUI();
    updateI18n();
    loadThemePreference();
});

