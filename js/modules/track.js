// Track Drawing Functions

function roundedRectPath(x, y, w, h, r) {
    return `M ${x+r} ${y}
            H ${x+w-r}
            A ${r} ${r} 0 0 1 ${x+w} ${y+r}
            V ${y+h-r}
            A ${r} ${r} 0 0 1 ${x+w-r} ${y+h}
            H ${x+r}
            A ${r} ${r} 0 0 1 ${x} ${y+h-r}
            V ${y+r}
            A ${r} ${r} 0 0 1 ${x+r} ${y}
            Z`;
}

function pathAtInset(inset) {
    const inner = {
        x: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--inner-x')),
        y: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--inner-y')),
        w: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--inner-w')),
        h: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--inner-h')),
        r: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--inner-r')),
    };
    return roundedRectPath(inner.x - inset, inner.y - inset, inner.w + inset*2, inner.h + inset*2, inner.r + inset);
}

function getTrackColors() {
    const colors = {
        outdoor: {
            track: '#1f2937', // Black/dark tarmac for city road
            apron: '#e5e7eb', // Light gray
            field: '#bfe7a7', // Green field
            bg: '#f0f8ff', // Light blue sky
            laneBoundary: '#ffffff', // White lane lines
            centerLine: '#ffd700', // Yellow center line
            markers: '#ffffff'
        },
        indoor: {
            track: '#6366f1', // Purple/blue tarmac
            apron: '#c7d2fe', // Light purple/blue
            field: '#e0e7ff', // Very light purple
            bg: '#4b5563', // Dark gray/indoor
            laneBoundary: '#ffffff',
            markers: '#ffffff'
        },
        road: {
            track: '#1f2937', // Black tarmac
            apron: '#374151', // Dark gray
            field: '#6b7280', // Medium gray
            bg: '#f0f8ff', // Light blue sky
            laneBoundary: '#ffffff', // White lane lines
            centerLine: '#ffd700', // Yellow center line
            markers: '#ffffff'
        }
    };
    return colors[trackType] || colors.outdoor;
}

function drawTrack() {
    const svg = document.querySelector('svg');
    const stadiumG = document.getElementById('stadium');
    const trackBaseG = document.getElementById('track-base');
    const boundariesG = document.getElementById('lane-boundaries');
    const infieldG = document.getElementById('infield');
    const roadCenterLineG = document.getElementById('road-center-line');
    const backgroundElementsG = document.getElementById('background-elements');
    
    // Clear existing elements
    stadiumG.innerHTML = '';
    trackBaseG.innerHTML = '';
    boundariesG.innerHTML = '';
    infieldG.innerHTML = '';
    roadCenterLineG.innerHTML = '';
    if (backgroundElementsG) backgroundElementsG.innerHTML = '';
    
    const colors = getTrackColors();
    const LANE_W = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--lane-w'));
    
    // Build stadium apron
    const outerBoundaryInset = 7.5 * LANE_W;
    const pad = 15; // Reduced padding for tighter fit
    const inner = {
        x: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--inner-x')),
        y: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--inner-y')),
        w: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--inner-w')),
        h: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--inner-h')),
        r: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--inner-r')),
    };
    
    const x = inner.x - (outerBoundaryInset + pad);
    const y = inner.y - (outerBoundaryInset + pad);
    const w = inner.w + 2*(outerBoundaryInset + pad);
    const h = inner.h + 2*(outerBoundaryInset + pad);
    const r = inner.r + (outerBoundaryInset + pad);
    
    // Update SVG viewBox to fit tighter around the track
    const padding = 20; // Small padding for viewBox
    const viewBoxX = x - padding;
    const viewBoxY = y - padding;
    const viewBoxW = w + padding * 2;
    const viewBoxH = h + padding * 2;
    svg.setAttribute('viewBox', `${viewBoxX} ${viewBoxY} ${viewBoxW} ${viewBoxH}`);
    
    // Update background rect to match new viewBox
    const bgRect = svg.querySelector('rect');
    if (bgRect) {
        bgRect.setAttribute('x', viewBoxX);
        bgRect.setAttribute('y', viewBoxY);
        bgRect.setAttribute('width', viewBoxW);
        bgRect.setAttribute('height', viewBoxH);
        bgRect.setAttribute('fill', colors.bg);
    }
    
    // Stadium apron (only for indoor track)
    if (trackType === 'indoor') {
        const apron = document.createElementNS('http://www.w3.org/2000/svg','path');
        apron.setAttribute('d', roundedRectPath(x, y, w, h, r));
        apron.setAttribute('fill', colors.apron);
        stadiumG.appendChild(apron);
    }
    
    // Infield fill (only for indoor track)
    if (trackType === 'indoor') {
        const infieldInset = -LANE_W/2 - 1;
        const infieldPath = document.createElementNS('http://www.w3.org/2000/svg','path');
        infieldPath.setAttribute('d', pathAtInset(infieldInset));
        infieldPath.setAttribute('fill', colors.field);
        infieldG.appendChild(infieldPath);
    }
    
    // Track lanes
    for(let i=1; i<=8; i++) {
        const inset = (i - 1) * LANE_W;
        const p = document.createElementNS('http://www.w3.org/2000/svg','path');
        p.setAttribute('d', pathAtInset(inset));
        p.setAttribute('fill','none');
        p.setAttribute('stroke', colors.track);
        p.setAttribute('stroke-width', LANE_W);
        p.setAttribute('opacity', 0.98);
        p.setAttribute('id', `lane-${i}`);
        trackBaseG.appendChild(p);
        lanePaths[i] = p;
    }
    
    // Lane boundaries (white lines between lanes)
    for(let j=0; j<=8; j++) {
        const inset = (j - 0.5) * LANE_W;
        const b = document.createElementNS('http://www.w3.org/2000/svg','path');
        b.setAttribute('d', pathAtInset(inset));
        b.setAttribute('fill','none');
        b.setAttribute('stroke', colors.laneBoundary);
        b.setAttribute('stroke-width','3');
        boundariesG.appendChild(b);
    }
    
    // Yellow center line (between lanes 4 and 5) for outdoor and road tracks
    if (trackType === 'outdoor' || trackType === 'road') {
        const centerInset = 3.5 * LANE_W; // Center of track (between lanes 4 and 5)
        const centerPath = pathAtInset(centerInset);
        const centerLine = document.createElementNS('http://www.w3.org/2000/svg','path');
        centerLine.setAttribute('d', centerPath);
        centerLine.setAttribute('fill','none');
        centerLine.setAttribute('stroke', colors.centerLine);
        centerLine.setAttribute('stroke-width','4');
        centerLine.setAttribute('stroke-dasharray','20 20');
        centerLine.setAttribute('opacity','0.9');
        roadCenterLineG.appendChild(centerLine);
    }
    
    lane1 = lanePaths[1];
    totalLen = lane1.getTotalLength();
}

function drawMarkers() {
    const colors = getTrackColors();
    
    // Clear existing markers
    const markersG = document.getElementById('markers');
    const numbersG = document.getElementById('lane-numbers');
    if (markersG) markersG.innerHTML = '';
    if (numbersG) numbersG.innerHTML = '';
    
    function drawPerpMarker(s, label, opts={}) {
        const sNorm = (s % totalLen + totalLen) % totalLen;
        const p0 = lane1.getPointAtLength(sNorm);
        const p1 = lane1.getPointAtLength((sNorm + 0.01) % totalLen);
        const dx = p1.x - p0.x, dy = p1.y - p0.y;
        const mag = Math.hypot(dx, dy) || 1;
        const tx = dx / mag, ty = dy / mag;
        const nx = ty, ny = -tx;
        
        const LANE_W = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--lane-w'));
        const innerOff = -0.5 * LANE_W;
        const outerOff = 7.5 * LANE_W;
        
        const x1 = p0.x + nx * innerOff;
        const y1 = p0.y + ny * innerOff;
        const x2 = p0.x + nx * outerOff;
        const y2 = p0.y + ny * outerOff;
        
        const markersG = document.getElementById('markers');
        const numbersG = document.getElementById('lane-numbers');
        
        const drawSingle = (ox=0, oy=0) => {
            const line = document.createElementNS('http://www.w3.org/2000/svg','line');
            line.setAttribute('x1', x1 + ox);
            line.setAttribute('y1', y1 + oy);
            line.setAttribute('x2', x2 + ox);
            line.setAttribute('y2', y2 + oy);
            line.setAttribute('stroke', colors.markers);
            line.setAttribute('stroke-width', 3);
            markersG.appendChild(line);
        };
        
        if(opts.start) {
            const sep = 6;
            drawSingle(0, 0);
            drawSingle(-tx * sep, -ty * sep);
            
            // Lane numbers
            for(let i=1; i<=8; i++) {
                const laneOff = (i-1) * LANE_W;
                const cx = p0.x + nx * laneOff - tx * 18;
                const cy = p0.y + ny * laneOff - ty * 18;
                const t = document.createElementNS('http://www.w3.org/2000/svg','text');
                t.textContent = i;
                t.setAttribute('x', cx);
                t.setAttribute('y', cy);
                t.setAttribute('fill', colors.markers);
                t.setAttribute('font-size', '14');
                t.setAttribute('font-weight', '800');
                t.setAttribute('text-anchor', 'middle');
                t.setAttribute('dominant-baseline', 'middle');
                numbersG.appendChild(t);
            }
        } else {
            drawSingle(0, 0);
        }
    }
    
    // Place markers
    drawPerpMarker(0, '', {start:true});
    drawPerpMarker(totalLen * 0.25, '');
    drawPerpMarker(totalLen * 0.50, '');
    drawPerpMarker(totalLen * 0.75, '');
}

function addRoundIndicators() {
    const roundIndicatorsG = document.getElementById('round-indicators');
    roundIndicatorsG.replaceChildren();
    const laneDistance = getLaneDistance(currentLane);
    const totalLaps = trackType === 'road' ? 1 : Math.ceil(TRACK_CONSTANTS.TOTAL_DISTANCE / laneDistance);
    
    for(let lap = 1; lap <= totalLaps; lap++) {
        const distance = lap * laneDistance;
        const lapProgress = (distance % laneDistance) / laneDistance;
        const position = calculateTrackPosition(1 - lapProgress);
        
        const indicator = document.createElementNS('http://www.w3.org/2000/svg','circle');
        indicator.setAttribute('cx', position.x);
        indicator.setAttribute('cy', position.y);
        indicator.setAttribute('r', '8');
        indicator.setAttribute('class', 'round-indicator');
        indicator.setAttribute('data-lap', lap);
        indicator.setAttribute('data-distance', distance);
        indicator.setAttribute('fill', 'transparent');
        indicator.setAttribute('stroke', 'transparent');
        roundIndicatorsG.appendChild(indicator);
    }
}

function updateTrackBackground() {
    const svg = document.querySelector('svg');
    if (!svg) return;
    
    const colors = getTrackColors();
    
    const bgRect = svg.querySelector('rect');
    if (bgRect) {
        bgRect.setAttribute('fill', colors.bg);
    }
    
    // Also update apron color for indoor track
    if (trackType === 'indoor') {
        const apron = document.querySelector('#stadium path');
        if (apron) {
            apron.setAttribute('fill', colors.apron);
        }
        
        const infield = document.querySelector('#infield path');
        if (infield) {
            infield.setAttribute('fill', colors.field);
        }
    }
    
    // Update track lane colors
    for(let i=1; i<=8; i++) {
        const lane = document.getElementById(`lane-${i}`);
        if (lane) {
            lane.setAttribute('stroke', colors.track);
        }
    }
}

function calculateTrackPosition(progress) {
    // progress is 0-1, where 0 is start and 1 is end of lap
    if (!lane1 || totalLen === 0) {
        return { x: 0, y: 0 };
    }
    
    // Normalize progress to be within 0-1
    const normalizedProgress = Math.max(0, Math.min(1, progress));
    
    // Calculate the distance along the path
    const distance = normalizedProgress * totalLen;
    
    // Get the point at that distance
    const point = lane1.getPointAtLength(distance);
    
    return { x: point.x, y: point.y };
}

function updateRoundIndicators() {
    const currentLap = animationState.currentLap;
    const currentDistance = animationState.currentDistance;
    
    document.querySelectorAll('.round-indicator').forEach(indicator => {
        const lap = parseInt(indicator.getAttribute('data-lap'));
        indicator.classList.remove('active', 'completed');
        
        if (lap < currentLap) {
            indicator.classList.add('completed');
        } else if (lap === currentLap) {
            indicator.classList.add('active');
        }
    });
}

function updateRunnerPosition(lapProgress, distance) {
    const position = calculateTrackPosition(lapProgress);
    
    elements.runnerDot.setAttribute('cx', position.x);
    elements.runnerDot.setAttribute('cy', position.y);
    
    const totalDistance = currentPaceData?.totalDistance || TRACK_CONSTANTS.TOTAL_DISTANCE;
    const progressPercent = (distance / totalDistance) * 100;
    if (elements.lapProgressFill) {
        elements.lapProgressFill.style.width = `${Math.max(0, progressPercent)}%`;
    }
    
    // Update animation info overlay
    updateAnimationInfoOverlay();
}

function updateAnimationInfoOverlay() {
    const timingBoard = document.getElementById('timingBoard');
    const timingTime = document.getElementById('timingTime');
    const timingLap = document.getElementById('timingLap');
    const timingDistance = document.getElementById('timingDistance');
    
    if (!timingBoard || !timingTime || !timingLap || !timingDistance) return;
    
    // Show board only when animation is active
    if (animationState.isPlaying && animationState.currentDistance > 0) {
        timingBoard.classList.remove('hidden');
        
        // Update time (format: MM:SS.mm)
        const currentTimeMs = animationState.currentTime * 1000;
        const minutes = Math.floor(currentTimeMs / 60000);
        const seconds = Math.floor((currentTimeMs % 60000) / 1000);
        const milliseconds = Math.floor((currentTimeMs % 1000) / 10);
        timingTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
        
        // Calculate total laps
        const laneDistance = getLaneDistance(currentLane);
        const totalLaps = trackType === 'road' ? 1 : Math.ceil(TRACK_CONSTANTS.TOTAL_DISTANCE / laneDistance);
        
        // Update lap (format: current/total)
        timingLap.textContent = `${animationState.currentLap}/${totalLaps}`;
        
        // Update distance
        timingDistance.textContent = `${Math.round(animationState.currentDistance)}m`;
    } else {
        timingBoard.classList.add('hidden');
    }
}

