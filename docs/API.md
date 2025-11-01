# 3000METER.com - API Documentation

## Oversikt

Dette dokumentet beskriver JavaScript API-et for 3000METER.com applikasjonen. API-et er delt inn i logiske moduler.

## Global State

### Variabler
```javascript
// App state
let currentPaceData = null;      // Nåværende pace data objekt
let currentLane = 1;             // Valgt lane (1-8)
let currentStrategy = 'even';    // Valgt tempo strategi
let currentDistance = 3000;      // Nåværende løpsdistanse i meter
let isNorwegian = true;          // Språk setting
let isDarkMode = false;          // Tema setting

// Animation state
let animationState = {
    isPlaying: false,             // Er animasjonen aktiv?
    currentTime: 0,               // Nåværende tid i sekunder
    totalTime: 0,                 // Total tid i millisekunder
    speed: 1,                     // Animationshastighet (1x - 10x)
    currentDistance: 0,           // Nåværende distanse i meter
    currentLap: 0,               // Nåværende runde
    lapProgress: 0,               // Fremgang i nåværende runde (0-1)
    animationId: null,           // Animation frame ID
    startTime: 0,                 // Start tid for animasjon
    lastUpdateTime: 0             // Siste oppdateringstid
};

// Track visualization
let lanePaths = [];              // SVG paths for hver lane
let totalLen = 0;                // Total lengde av lane 1
let lane1 = null;                // Reference til lane 1 path

// DOM elements
let elements = {};               // Cache av DOM elementer
```

## Konfigurasjon

### TRACK_CONSTANTS
```javascript
const TRACK_CONSTANTS = {
    LANE_WIDTH: 1.22,            // Bane bredde i meter
    STRAIGHT_LENGTH: 84.39,      // Rett seksjon lengde i meter
    CURVE_RADIUS_LANE1: 36.5,    // Kurve radius lane 1 i meter
    TOTAL_DISTANCE: 3000,        // Standard løpsdistanse (oppdateres dynamisk)
    LAPS: 7.5                    // Standard antall runder
};
```

### STANDARD_DISTANCES
```javascript
const STANDARD_DISTANCES = {
    800: 800,
    1500: 1500,
    3000: 3000,
    5000: 5000,
    10000: 10000
};
```

### LANE_DISTANCES
```javascript
const LANE_DISTANCES = {
    1: 400.0,    // Lane 1: 400m per runde
    2: 407.04,   // Lane 2: 407.04m per runde
    3: 414.08,   // ... og så videre
    // Hver lane legger til 7.04m per runde
};
```

## Hovedfunksjoner

### Pace Kalkulasjon

#### `calculatePace()`
Hovedfunksjon for å beregne pace data.
```javascript
calculatePace();
// Beregner pace basert på nåværende inputs
// Oppdaterer currentPaceData
// Oppdaterer UI og animasjon
```

#### `generatePaceData(totalMs, laneDistance, totalLaps, basePacePerKm)`
Genererer komplett pace data struktur.
```javascript
const data = generatePaceData(
    900000,  // totalMs - total tid i millisekunder
    400.0,   // laneDistance - distanse per runde
    7.5,     // totalLaps - antall runder
    300      // basePacePerKm - base tempo i sekunder per km
);
// Returns: Pace data objekt med splits, segments, og paceData
```

#### `calculateExpectedTime(distance, basePacePerKm, strategy)`
Beregner forventet tid for en gitt distanse.
```javascript
const time = calculateExpectedTime(
    1000,    // distance - distanse i meter
    300,     // basePacePerKm - base tempo (optional)
    'even'   // strategy - tempo strategi (optional)
);
// Returns: Tid i millisekunder
```

### Animasjon

#### `startAnimation()`
Starter animasjonen.
```javascript
startAnimation();
// Starter animasjonsloop hvis currentPaceData er satt
```

#### `pauseAnimation()`
Pauser animasjonen.
```javascript
pauseAnimation();
// Stopper animasjonsloop
```

#### `resetAnimation()`
Resetter animasjonen til start.
```javascript
resetAnimation();
// Stopper animasjon og resetter til startposisjon
```

#### `updateAnimationSpeed(newSpeed)`
Oppdaterer animasjonshastighet.
```javascript
updateAnimationSpeed(2); // Sett hastighet til 2x
```

### UI Funksjoner

#### `toggleTheme()`
Toggle mellom lys og mørk modus.
```javascript
toggleTheme();
// Bytt tema og lagrer preferanse
```

#### `switchTab(tabName)`
Bytt mellom faner.
```javascript
switchTab('chart'); // Vis chart fane
switchTab('splits'); // Vis splits fane
switchTab('intervals'); // Vis intervals fane
```

#### `updatePaceChart(data)`
Oppdaterer tempo grafen.
```javascript
updatePaceChart(currentPaceData);
// Oppdaterer Chart.js instans med ny data
```

#### `generateIntervals()`
Genererer intervall treningsplan.
```javascript
generateIntervals();
// Genererer intervall basert på nåværende pace data
// og input verdier fra intervalDistance, intervalRest, intervalReps
```

### Hjelpefunksjoner

#### `parseTimeToMs(timeStr)`
Parser tid streng til millisekunder.
```javascript
const ms = parseTimeToMs('15:30'); // Returns: 930000
const ms2 = parseTimeToMs('05:45.50'); // Returns: 345500
```

#### `formatTimeFromMs(ms)`
Formatterer millisekunder til tid streng.
```javascript
const time = formatTimeFromMs(930000); // Returns: "15:30.00"
```

#### `formatTimeFromMsSimple(ms)`
Formatterer millisekunder til enkel tid streng.
```javascript
const time = formatTimeFromMsSimple(930000); // Returns: "15:30"
```

#### `showToast(msg)`
Viser toast melding.
```javascript
showToast('Melding til brukeren');
```

#### `copyToClipboard(text)`
Kopierer tekst til utklippstavle.
```javascript
copyToClipboard('Tekst som skal kopieres');
```

### Bane Visualisering

#### `drawTrack()`
Tegner bane SVG.
```javascript
drawTrack();
// Tegner alle 8 lanes og markører
```

#### `drawMarkers()`
Tegner bane markører.
```javascript
drawMarkers();
// Tegner startlinje og kvart runde markører
```

#### `calculateTrackPosition(lapProgress)`
Beregner posisjon på banen.
```javascript
const position = calculateTrackPosition(0.5); // Midt på banen
// Returns: { x: number, y: number }
```

## Data Strukturer

### Pace Data Objekt
```javascript
{
    totalTime: 900000,           // Total tid i millisekunder
    laneDistance: 400.0,          // Distanse per runde
    totalLaps: 7.5,              // Antall runder
    basePacePerKm: 300,          // Base tempo i sekunder per km
    strategy: 'even',            // Brukt strategi
    totalDistance: 3000,         // Total distanse
    splits: [                    // Array av split arrays
        {
            distance: 200,       // Split distanse
            splits: [...]        // Array av split objekter
        }
    ],
    segments: [                  // Array av runde segmenter
        {
            lap: 1,
            distance: 400,
            segmentDistance: 400,
            expectedTime: 120000,
            segmentTime: 120000,
            pace: 300
        }
    ],
    paceData: [                  // Data for graf
        {
            distance: 100,
            time: 30,
            pace: 300
        }
    ]
}
```

## Event Handlers

### Input Events
```javascript
// Time input
elements.goalTime.addEventListener('input', (e) => {
    validateTimeInput(e);
    updatePaceFromTime();
});

// Pace input
elements.targetPace.addEventListener('input', (e) => {
    validateTimeInput(e);
    updateTimeFromPace();
});
```

### Button Events
```javascript
// Calculate button
elements.calculateBtn.addEventListener('click', handleCalculateButtonClick);

// Distance options
document.querySelectorAll('.distance-option').forEach(btn => {
    btn.addEventListener('click', () => {
        // Handle distance selection
    });
});
```

### Keyboard Shortcuts
```javascript
document.addEventListener('keydown', handleKeyboardShortcuts);
// Space: Play/Pause
// R: Reset
// S: Toggle speed
// +/-: Adjust time
```

## LocalStorage API

### Lagre Data
```javascript
saveToLocalStorage();
// Lagrer: goalTime, lane, strategy, distance, isNorwegian, isDarkMode
```

### Laste Data
```javascript
loadFromLocalStorage();
// Laster lagret preferanser
```

## URL Parameters

### Støttede Parametere
- `time`: Måltid (f.eks. `15:30`)
- `distance`: Løpsdistanse (f.eks. `3000`)
- `strategy`: Tempo strategi (f.eks. `even`)
- `lane`: Lane nummer (f.eks. `1`)

### Eksempel
```
https://3000meter.com/?time=15:30&distance=3000&strategy=even
```

## Eksempler

### Beregne Pace for 3000m på 15:00
```javascript
// Sett inputs
elements.goalTime.value = '15:00';
currentDistance = 3000;
currentStrategy = 'even';

// Beregn
calculatePace();

// Få resultater
console.log(currentPaceData);
```

### Starte Animasjon
```javascript
// Beregn først
calculatePace();

// Start animasjon
startAnimation();

// Pause
pauseAnimation();

// Reset
resetAnimation();
```

### Generere Intervall Trening
```javascript
// Sett inputs
elements.intervalDistance.value = 400;
elements.intervalRest.value = 60;
elements.intervalReps.value = 8;

// Generer
generateIntervals();
```

