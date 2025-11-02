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
        // Clear time suggestion highlights when user types custom value
        document.querySelectorAll('.time-suggestion-btn').forEach(b => b.classList.remove('active'));
    });
    
    if (elements.targetPace) {
        elements.targetPace.addEventListener('input', (e) => {
            validateTimeInput(e);
            updateTimeFromPace();
            // Clear time suggestion highlights when user types custom value
            document.querySelectorAll('.time-suggestion-btn').forEach(b => b.classList.remove('active'));
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
                
                // Update time suggestions for the new distance
                updateTimeSuggestions();
                updatePaceSuggestions();
                updateSplitPresetButtons();
                
                // Automatically set Target Time to the 3rd suggested value (index 2)
                const timeSuggestions = getTimeSuggestions(distance);
                if (timeSuggestions.length >= 3 && elements.goalTime) {
                    elements.goalTime.value = timeSuggestions[2]; // 3rd value (index 2)
                    updatePaceFromTime();
                }
                
                document.querySelectorAll('.preset-btn-compact').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
        });
    });
    
    // Custom split editor
    if (elements.addSplitBtn) {
        elements.addSplitBtn.addEventListener('click', addCustomSplit);
    }
    
    initializeCustomSplits();
    
    // Split management buttons are handled dynamically in updateSplitPresetButtons()
    // No need to attach listeners here as buttons are created dynamically
    
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
    
    // Clear all splits button
    const clearAllSplitsBtn = document.getElementById('clearAllSplitsBtn');
    if (clearAllSplitsBtn) {
        clearAllSplitsBtn.addEventListener('click', () => {
            clearAllSplits();
            // Reinitialize Lucide icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
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
    
    // Action buttons
    elements.calculateBtn.addEventListener('click', handleCalculateButtonClick);
    
    // Edit button (to reopen inputs)
    const editBtn = document.getElementById('editBtn');
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            expandInputArea();
            // Reinitialize Lucide icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            // Scroll to top to show inputs
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    if (elements.downloadStrategyBtn) {
        elements.downloadStrategyBtn.addEventListener('click', downloadStrategyHTML);
    }
    
    const downloadStrategyPDFBtn = document.getElementById('downloadStrategyPDFBtn');
    if (downloadStrategyPDFBtn) {
        downloadStrategyPDFBtn.addEventListener('click', downloadStrategyTXT);
    }
    
    if (elements.themeToggle) {
        elements.themeToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleTheme();
        });
    }
    
    // Theme menu item clicks
    document.querySelectorAll('.theme-menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const theme = item.dataset.theme;
            if (theme) {
                setTheme(theme);
            }
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        const menu = document.getElementById('themeMenu');
        const button = elements.themeToggle;
        if (menu && button && !menu.contains(e.target) && !button.contains(e.target)) {
            menu.classList.add('hidden');
            button.setAttribute('aria-expanded', 'false');
        }
    });
    
    // Track type buttons
    document.querySelectorAll('.track-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.trackType;
            if (type) {
                trackType = type;
                document.querySelectorAll('.track-type-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Reset animation
                resetAnimation();
                
                // Redraw track with new type
                drawTrack();
                drawMarkers();
                addRoundIndicators();
                
                // If data exists, do full recalculate like clicking "Calculate"
                if (currentPaceData) {
                    calculatePace();
                    updateRaceSummary();
                }
            }
        });
    });
    
    // Chart type buttons removed - showing all charts at once
    
    // Animation controls
    if (elements.playPauseBtn) {
        elements.playPauseBtn.addEventListener('click', toggleAnimation);
    }
    if (elements.resetBtn) {
        elements.resetBtn.addEventListener('click', () => {
            resetAnimation();
            // If data exists, do full recalculate like clicking "Calculate"
            if (currentPaceData) {
                calculatePace();
                updateRaceSummary();
            }
        });
    }
    
    // Speed preset buttons
    document.querySelectorAll('.speed-preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const speed = parseFloat(btn.dataset.speed);
            updateAnimationSpeed(speed);
            
            // Update active state
            document.querySelectorAll('.speed-preset-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Auto-save
    window.addEventListener('beforeunload', saveToLocalStorage);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Scroll to top on page load/reload
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Initialize DOM elements
    elements = {
        goalTime: document.getElementById('goalTime'),
        targetPace: document.getElementById('targetPace'),
        raceDistance: document.getElementById('raceDistance'),
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
        toast: document.getElementById('toast'),
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
    updatePaceSuggestions();
    updateSplitPresetButtons();
    
    // Initialize pace field from time
    if (elements.targetPace && elements.goalTime) {
        updatePaceFromTime();
    }
    
    // Initialize speed preset buttons
    const speedPresetButtons = document.querySelectorAll('.speed-preset-btn');
    speedPresetButtons.forEach(btn => {
        const speed = parseFloat(btn.dataset.speed);
        if (Math.abs(speed - animationState.speed) < 0.1) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // If no button matches current speed, set closest one to active
    if (!document.querySelector('.speed-preset-btn.active')) {
        const speeds = Array.from(speedPresetButtons).map(btn => parseFloat(btn.dataset.speed));
        const closestSpeed = speeds.reduce((prev, curr) => 
            Math.abs(curr - animationState.speed) < Math.abs(prev - animationState.speed) ? curr : prev
        );
        const closestBtn = Array.from(speedPresetButtons).find(btn => 
            parseFloat(btn.dataset.speed) === closestSpeed
        );
        if (closestBtn) {
            closestBtn.classList.add('active');
            updateAnimationSpeed(closestSpeed);
        }
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

// Also scroll to top on window load (handles cases where page loads with scroll position)
window.addEventListener('load', function() {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
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

