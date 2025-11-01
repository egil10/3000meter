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

function drawTrack() {
    const svg = document.querySelector('svg');
    const stadiumG = document.getElementById('stadium');
    const trackBaseG = document.getElementById('track-base');
    const boundariesG = document.getElementById('lane-boundaries');
    const infieldG = document.getElementById('infield');
    
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
    
    // Update background rect to match new viewBox and use CSS variable
    const bgRect = svg.querySelector('rect');
    if (bgRect) {
        bgRect.setAttribute('x', viewBoxX);
        bgRect.setAttribute('y', viewBoxY);
        bgRect.setAttribute('width', viewBoxW);
        bgRect.setAttribute('height', viewBoxH);
        // Get CSS variable value for track background
        const trackBg = getComputedStyle(document.documentElement).getPropertyValue('--track-bg').trim();
        bgRect.setAttribute('fill', trackBg || '#f8fafc');
    }
    
    const apron = document.createElementNS('http://www.w3.org/2000/svg','path');
    apron.setAttribute('d', roundedRectPath(x, y, w, h, r));
    apron.setAttribute('fill', getComputedStyle(document.documentElement).getPropertyValue('--apron'));
    stadiumG.appendChild(apron);
    
    // Infield fill
    const infieldInset = -LANE_W/2 - 1;
    const infieldPath = document.createElementNS('http://www.w3.org/2000/svg','path');
    infieldPath.setAttribute('d', pathAtInset(infieldInset));
    infieldPath.setAttribute('fill', getComputedStyle(document.documentElement).getPropertyValue('--field'));
    infieldG.appendChild(infieldPath);
    
    // Track lanes
    for(let i=1; i<=8; i++) {
        const inset = (i - 1) * LANE_W;
        const p = document.createElementNS('http://www.w3.org/2000/svg','path');
        p.setAttribute('d', pathAtInset(inset));
        p.setAttribute('fill','none');
        p.setAttribute('stroke', getComputedStyle(document.documentElement).getPropertyValue('--track'));
        p.setAttribute('stroke-width', LANE_W);
        p.setAttribute('opacity', 0.98);
        p.setAttribute('id', `lane-${i}`);
        trackBaseG.appendChild(p);
        lanePaths[i] = p;
    }
    
    // White lane boundaries
    for(let j=0; j<=8; j++) {
        const inset = (j - 0.5) * LANE_W;
        const b = document.createElementNS('http://www.w3.org/2000/svg','path');
        b.setAttribute('d', pathAtInset(inset));
        b.setAttribute('fill','none');
        b.setAttribute('stroke','#ffffff');
        b.setAttribute('stroke-width','3');
        boundariesG.appendChild(b);
    }
    
    lane1 = lanePaths[1];
    totalLen = lane1.getTotalLength();
}

function drawMarkers() {
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
            line.setAttribute('stroke', '#ffffff');
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
                t.setAttribute('fill', '#ffffff');
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
    const laneDistance = LANE_DISTANCES[currentLane];
    const totalLaps = Math.ceil(TRACK_CONSTANTS.TOTAL_DISTANCE / laneDistance);
    
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
    
    const bgRect = svg.querySelector('rect');
    if (bgRect) {
        // Get CSS variable value for track background
        const trackBg = getComputedStyle(document.documentElement).getPropertyValue('--track-bg').trim();
        bgRect.setAttribute('fill', trackBg || '#f8fafc');
    }
    
    // Also update apron color
    const apron = document.querySelector('#stadium path');
    if (apron) {
        const apronColor = getComputedStyle(document.documentElement).getPropertyValue('--apron').trim();
        apron.setAttribute('fill', apronColor || '#e5e7eb');
    }
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
    updateAnimationInfoOverlay(position.x, position.y);
}

function updateAnimationInfoOverlay(runnerX, runnerY) {
    const infoGroup = document.getElementById('animation-info');
    if (!infoGroup) return;
    
    const infoBg = document.getElementById('info-bg');
    const infoTime = document.getElementById('info-time');
    const infoDistance = document.getElementById('info-distance');
    const infoPace = document.getElementById('info-pace');
    
    if (!infoBg || !infoTime || !infoDistance || !infoPace) return;
    
    // Show/hide overlay based on animation state
    if (!animationState.isPlaying && animationState.currentDistance === 0) {
        infoGroup.style.display = 'none';
        return;
    }
    infoGroup.style.display = 'block';
    
    // Format time
    const currentTimeMs = animationState.currentTime * 1000;
    const timeFormatted = formatTimeFromMs(currentTimeMs);
    infoTime.textContent = timeFormatted.split('.')[0]; // Remove milliseconds
    
    // Format distance
    const distance = Math.round(animationState.currentDistance);
    infoDistance.textContent = `${distance}m`;
    
    // Format pace
    const currentPace = calculateCurrentPace();
    infoPace.textContent = currentPace !== '--:--' ? `${currentPace} /km` : '--:-- /km';
    
    // Position overlay near runner (top-right relative to runner)
    const svg = document.querySelector('svg');
    if (!svg) return;
    
    const viewBox = svg.getAttribute('viewBox').split(' ').map(Number);
    const overlayWidth = 200;
    const overlayHeight = 80;
    const offsetX = 20;
    const offsetY = -overlayHeight - 20;
    
    // Position relative to viewBox coordinates
    let overlayX = runnerX + offsetX;
    let overlayY = runnerY + offsetY;
    
    // Keep overlay within viewBox bounds
    if (overlayX + overlayWidth > viewBox[0] + viewBox[2]) {
        overlayX = runnerX - overlayWidth - offsetX;
    }
    if (overlayY < viewBox[1]) {
        overlayY = runnerY + 30;
    }
    
    infoBg.setAttribute('x', overlayX);
    infoBg.setAttribute('y', overlayY);
    
    infoTime.setAttribute('x', overlayX + overlayWidth / 2);
    infoTime.setAttribute('y', overlayY + 25);
    infoDistance.setAttribute('x', overlayX + overlayWidth / 2);
    infoDistance.setAttribute('y', overlayY + 45);
    infoPace.setAttribute('x', overlayX + overlayWidth / 2);
    infoPace.setAttribute('y', overlayY + 65);
}

