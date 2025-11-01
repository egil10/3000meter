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
            track: '#dc2626', // Red tarmac
            apron: '#e5e7eb', // Light gray
            field: '#bfe7a7', // Green field
            bg: '#87ceeb', // Sky blue
            laneBoundary: '#ffffff', // White lane lines
            markers: '#ffffff',
            tree: '#228b22', // Forest green
            treeTrunk: '#8b4513', // Brown
            stand: '#808080', // Gray stands
            cloud: '#ffffff' // White clouds
        },
        indoor: {
            track: '#6366f1', // Purple/blue tarmac
            apron: '#c7d2fe', // Light purple/blue
            field: '#e0e7ff', // Very light purple
            bg: '#4b5563', // Dark gray/indoor
            laneBoundary: '#ffffff',
            markers: '#ffffff',
            wall: '#64748b', // Slate gray walls
            ceiling: '#1e293b', // Dark ceiling
            light: '#ffd700', // Yellow lights
            beam: '#334155' // Dark beams
        },
        road: {
            track: '#1f2937', // Black tarmac
            apron: '#374151', // Dark gray
            field: '#6b7280', // Medium gray
            bg: '#f0f8ff', // Light blue sky
            laneBoundary: '#ffffff', // White lane lines
            centerLine: '#ffd700', // Yellow center line
            markers: '#ffffff',
            tree: '#228b22', // Forest green
            treeTrunk: '#8b4513', // Brown
            building: '#9ca3af', // Gray buildings
            roadSign: '#ffd700' // Yellow signs
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
    
    // Draw background elements based on track type
    // Note: For road type, we need to draw trees after track is created
    if (trackType !== 'road') {
        drawBackgroundElements(backgroundElementsG, viewBoxX, viewBoxY, viewBoxW, viewBoxH, colors);
    }
    
    // Stadium apron (only for track types, not road)
    if (trackType !== 'road') {
        const apron = document.createElementNS('http://www.w3.org/2000/svg','path');
        apron.setAttribute('d', roundedRectPath(x, y, w, h, r));
        apron.setAttribute('fill', colors.apron);
        stadiumG.appendChild(apron);
    }
    
    // Infield fill (only for track types, not road)
    if (trackType !== 'road') {
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
    
    // Road center line (yellow dashed line for road type)
    if (trackType === 'road') {
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
    
    // Draw road background elements after track is initialized
    if (trackType === 'road') {
        drawBackgroundElements(backgroundElementsG, viewBoxX, viewBoxY, viewBoxW, viewBoxH, colors);
    }
}

function drawBackgroundElements(container, x, y, w, h, colors) {
    if (!container) return;
    
    if (trackType === 'outdoor') {
        // Outdoor: Trees, stadium stands, clouds
        drawOutdoorElements(container, x, y, w, h, colors);
    } else if (trackType === 'indoor') {
        // Indoor: Building structure, lights, beams
        drawIndoorElements(container, x, y, w, h, colors);
    } else if (trackType === 'road') {
        // Road: Trees, buildings, road signs
        drawRoadElements(container, x, y, w, h, colors);
    }
}

function drawOutdoorElements(container, x, y, w, h, colors) {
    // Draw clouds
    for(let i = 0; i < 5; i++) {
        const cloudX = x + (w / 6) * (i + 1) + (i * 20);
        const cloudY = y + 30;
        const cloud = document.createElementNS('http://www.w3.org/2000/svg','g');
        cloud.setAttribute('opacity', '0.8');
        
        // Cloud shape made of circles
        for(let j = 0; j < 3; j++) {
            const circle = document.createElementNS('http://www.w3.org/2000/svg','circle');
            circle.setAttribute('cx', cloudX + (j * 15));
            circle.setAttribute('cy', cloudY);
            circle.setAttribute('r', 12 + (j % 2) * 3);
            circle.setAttribute('fill', colors.cloud);
            cloud.appendChild(circle);
        }
        container.appendChild(cloud);
    }
    
    // Draw stadium stands (bleachers)
    const standHeight = 40;
    const standY = y + h - standHeight;
    
    // Left stands
    const leftStand = document.createElementNS('http://www.w3.org/2000/svg','rect');
    leftStand.setAttribute('x', x);
    leftStand.setAttribute('y', standY);
    leftStand.setAttribute('width', 60);
    leftStand.setAttribute('height', standHeight);
    leftStand.setAttribute('fill', colors.stand);
    leftStand.setAttribute('opacity', '0.7');
    container.appendChild(leftStand);
    
    // Right stands
    const rightStand = document.createElementNS('http://www.w3.org/2000/svg','rect');
    rightStand.setAttribute('x', x + w - 60);
    rightStand.setAttribute('y', standY);
    rightStand.setAttribute('width', 60);
    rightStand.setAttribute('height', standHeight);
    rightStand.setAttribute('fill', colors.stand);
    rightStand.setAttribute('opacity', '0.7');
    container.appendChild(rightStand);
    
    // Draw trees around the track
    const treePositions = [
        {x: x + 20, y: y + h - 25},
        {x: x + w - 40, y: y + h - 25},
        {x: x + w/2 - 30, y: y + 20},
        {x: x + w/2 + 30, y: y + 20}
    ];
    
    treePositions.forEach(pos => {
        drawTree(container, pos.x, pos.y, colors);
    });
}

function drawIndoorElements(container, x, y, w, h, colors) {
    // Draw ceiling
    const ceiling = document.createElementNS('http://www.w3.org/2000/svg','rect');
    ceiling.setAttribute('x', x);
    ceiling.setAttribute('y', y);
    ceiling.setAttribute('width', w);
    ceiling.setAttribute('height', 50);
    ceiling.setAttribute('fill', colors.ceiling);
    container.appendChild(ceiling);
    
    // Draw walls on sides
    const leftWall = document.createElementNS('http://www.w3.org/2000/svg','rect');
    leftWall.setAttribute('x', x);
    leftWall.setAttribute('y', y);
    leftWall.setAttribute('width', 40);
    leftWall.setAttribute('height', h);
    leftWall.setAttribute('fill', colors.wall);
    leftWall.setAttribute('opacity', '0.8');
    container.appendChild(leftWall);
    
    const rightWall = document.createElementNS('http://www.w3.org/2000/svg','rect');
    rightWall.setAttribute('x', x + w - 40);
    rightWall.setAttribute('y', y);
    rightWall.setAttribute('width', 40);
    rightWall.setAttribute('height', h);
    rightWall.setAttribute('fill', colors.wall);
    rightWall.setAttribute('opacity', '0.8');
    container.appendChild(rightWall);
    
    // Draw ceiling beams
    for(let i = 0; i < 4; i++) {
        const beamX = x + (w / 5) * (i + 1);
        const beam = document.createElementNS('http://www.w3.org/2000/svg','line');
        beam.setAttribute('x1', beamX);
        beam.setAttribute('y1', y);
        beam.setAttribute('x2', beamX);
        beam.setAttribute('y2', y + h);
        beam.setAttribute('stroke', colors.beam);
        beam.setAttribute('stroke-width', '3');
        beam.setAttribute('opacity', '0.6');
        container.appendChild(beam);
    }
    
    // Draw lights
    for(let i = 0; i < 6; i++) {
        const lightX = x + (w / 7) * (i + 1);
        const lightY = y + 25;
        const light = document.createElementNS('http://www.w3.org/2000/svg','circle');
        light.setAttribute('cx', lightX);
        light.setAttribute('cy', lightY);
        light.setAttribute('r', '8');
        light.setAttribute('fill', colors.light);
        light.setAttribute('opacity', '0.9');
        container.appendChild(light);
        
        // Light beam
        const beam = document.createElementNS('http://www.w3.org/2000/svg','line');
        beam.setAttribute('x1', lightX);
        beam.setAttribute('y1', lightY + 8);
        beam.setAttribute('x2', lightX);
        beam.setAttribute('y2', y + h - 50);
        beam.setAttribute('stroke', colors.light);
        beam.setAttribute('stroke-width', '2');
        beam.setAttribute('opacity', '0.2');
        container.appendChild(beam);
    }
}

function drawRoadElements(container, x, y, w, h, colors) {
    // Draw trees along the road
    const treeCount = 12;
    for(let i = 0; i < treeCount; i++) {
        const progress = i / (treeCount - 1);
        const trackPoint = lane1.getPointAtLength(progress * totalLen);
        const perpAngle = Math.atan2(
            lane1.getPointAtLength(Math.min(progress * totalLen + 1, totalLen)).y - trackPoint.y,
            lane1.getPointAtLength(Math.min(progress * totalLen + 1, totalLen)).x - trackPoint.x
        );
        
        // Trees on both sides
        const offsetLeft = 60;
        const offsetRight = -60;
        
        const treeLeftX = trackPoint.x + Math.cos(perpAngle + Math.PI/2) * offsetLeft;
        const treeLeftY = trackPoint.y + Math.sin(perpAngle + Math.PI/2) * offsetLeft;
        drawTree(container, treeLeftX, treeLeftY, colors);
        
        const treeRightX = trackPoint.x + Math.cos(perpAngle - Math.PI/2) * offsetRight;
        const treeRightY = trackPoint.y + Math.sin(perpAngle - Math.PI/2) * offsetRight;
        drawTree(container, treeRightX, treeRightY, colors);
    }
    
    // Draw buildings in background
    const buildingCount = 4;
    for(let i = 0; i < buildingCount; i++) {
        const buildingX = x + (w / (buildingCount + 1)) * (i + 1);
        const buildingHeight = 40 + Math.random() * 30;
        const building = document.createElementNS('http://www.w3.org/2000/svg','rect');
        building.setAttribute('x', buildingX - 15);
        building.setAttribute('y', y + h - buildingHeight);
        building.setAttribute('width', 30);
        building.setAttribute('height', buildingHeight);
        building.setAttribute('fill', colors.building);
        building.setAttribute('opacity', '0.6');
        container.appendChild(building);
        
        // Windows
        for(let win = 0; win < 3; win++) {
            const window = document.createElementNS('http://www.w3.org/2000/svg','rect');
            window.setAttribute('x', buildingX - 10);
            window.setAttribute('y', y + h - buildingHeight + 10 + (win * 12));
            window.setAttribute('width', '8');
            window.setAttribute('height', '6');
            window.setAttribute('fill', colors.light);
            window.setAttribute('opacity', '0.8');
            container.appendChild(window);
        }
    }
    
    // Draw road signs
    const signPositions = [
        {x: x + w/4, y: y + h - 80},
        {x: x + 3*w/4, y: y + h - 80}
    ];
    
    signPositions.forEach(pos => {
        const sign = document.createElementNS('http://www.w3.org/2000/svg','rect');
        sign.setAttribute('x', pos.x - 8);
        sign.setAttribute('y', pos.y - 12);
        sign.setAttribute('width', '16');
        sign.setAttribute('height', '16');
        sign.setAttribute('fill', colors.roadSign);
        sign.setAttribute('opacity', '0.9');
        container.appendChild(sign);
        
        const pole = document.createElementNS('http://www.w3.org/2000/svg','rect');
        pole.setAttribute('x', pos.x - 1);
        pole.setAttribute('y', pos.y + 4);
        pole.setAttribute('width', '2');
        pole.setAttribute('height', '20');
        pole.setAttribute('fill', '#374151');
        container.appendChild(pole);
    });
}

function drawTree(container, treeX, treeY, colors) {
    // Tree trunk
    const trunk = document.createElementNS('http://www.w3.org/2000/svg','rect');
    trunk.setAttribute('x', treeX - 2);
    trunk.setAttribute('y', treeY);
    trunk.setAttribute('width', '4');
    trunk.setAttribute('height', '12');
    trunk.setAttribute('fill', colors.treeTrunk);
    container.appendChild(trunk);
    
    // Tree foliage (circles)
    const foliage = document.createElementNS('http://www.w3.org/2000/svg','circle');
    foliage.setAttribute('cx', treeX);
    foliage.setAttribute('cy', treeY - 5);
    foliage.setAttribute('r', '10');
    foliage.setAttribute('fill', colors.tree);
    foliage.setAttribute('opacity', '0.8');
    container.appendChild(foliage);
    
    const foliage2 = document.createElementNS('http://www.w3.org/2000/svg','circle');
    foliage2.setAttribute('cx', treeX - 5);
    foliage2.setAttribute('cy', treeY - 3);
    foliage2.setAttribute('r', '8');
    foliage2.setAttribute('fill', colors.tree);
    foliage2.setAttribute('opacity', '0.7');
    container.appendChild(foliage2);
    
    const foliage3 = document.createElementNS('http://www.w3.org/2000/svg','circle');
    foliage3.setAttribute('cx', treeX + 5);
    foliage3.setAttribute('cy', treeY - 3);
    foliage3.setAttribute('r', '8');
    foliage3.setAttribute('fill', colors.tree);
    foliage3.setAttribute('opacity', '0.7');
    container.appendChild(foliage3);
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
    
    // Also update apron color for track types
    if (trackType !== 'road') {
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
        
        // Update lap
        timingLap.textContent = animationState.currentLap;
        
        // Update distance
        timingDistance.textContent = `${Math.round(animationState.currentDistance)}m`;
    } else {
        timingBoard.classList.add('hidden');
    }
}

