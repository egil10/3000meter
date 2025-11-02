// Storage and URL Management

function saveToLocalStorage() {
    const data = {
        goalTime: elements.goalTime.value,
        lane: currentLane,
        strategy: currentStrategy,
        isNorwegian: isNorwegian,
        distance: currentDistance,
        themePreference: themePreference
    };
    localStorage.setItem('3000mRunner', JSON.stringify(data));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('3000mRunner');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data.goalTime) elements.goalTime.value = data.goalTime;
            if (data.lane) currentLane = data.lane;
            if (data.strategy) currentStrategy = data.strategy;
            if (data.isNorwegian !== undefined) isNorwegian = data.isNorwegian;
            if (data.distance) currentDistance = data.distance;
            if (data.themePreference) themePreference = data.themePreference;
        } catch (e) {
            console.error('Error loading from localStorage:', e);
        }
    }
}

function loadFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const time = urlParams.get('time');
    const lane = urlParams.get('lane');
    const strategy = urlParams.get('strategy');
    const distance = urlParams.get('distance');
    
    if (time) elements.goalTime.value = time;
    if (lane) {
        currentLane = parseInt(lane);
    }
    if (strategy) {
        currentStrategy = strategy;
        elements.strategyButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.strategy === strategy);
        });
    }
    if (distance) {
        const dist = parseFloat(distance);
        if (dist && dist >= 100) {
            elements.raceDistance.value = dist.toString();
            currentDistance = dist;
        }
    }
    
    loadFromLocalStorage();
}

function updateURL() {
    const url = new URL(window.location);
    url.searchParams.set('time', elements.goalTime.value);
    url.searchParams.set('distance', currentDistance);
    url.searchParams.set('lane', currentLane);
    url.searchParams.set('strategy', currentStrategy);
    window.history.replaceState({}, '', url);
}

function handleKeyboardShortcuts(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'Enter':
                e.preventDefault();
                break;
        }
    }
    
    if (e.key === ' ') {
        e.preventDefault();
        toggleAnimation();
    } else if (e.key === 'r') {
        e.preventDefault();
        resetAnimation();
    } else if (e.key === 's' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (elements.speedInput) {
            const currentSpeed = parseFloat(elements.speedInput.value) || 1;
            const newSpeed = currentSpeed === 1 ? 2 : 1;
            updateAnimationSpeed(newSpeed);
        }
    }
    
    if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        adjustTime(e.shiftKey ? 5 : 1);
    } else if (e.key === '-') {
        e.preventDefault();
        adjustTime(e.shiftKey ? -5 : -1);
    }
}

function setupServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/pwa/sw.js').catch(() => {});
    }
}

