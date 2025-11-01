# 3000METER.com - Architecture Documentation

## Prosjektstruktur

```
3000meter/
├── index.html              # Hoved HTML fil
├── css/
│   └── styles.css          # Alle stilark
├── js/
│   └── script.js           # Hoved JavaScript fil (modulær struktur)
├── assets/
│   └── stadium.svg         # Bane SVG ikon
├── pwa/
│   ├── manifest.json       # PWA manifest
│   └── sw.js              # Service Worker
├── docs/                   # Dokumentasjon
│   ├── FEATURES.md        # Funksjonsdokumentasjon
│   ├── ARCHITECTURE.md    # Arkitektur dokumentasjon
│   ├── DEVELOPMENT.md     # Utviklingsguide
│   └── API.md            # API dokumentasjon
├── README.md              # Prosjekt oversikt
└── CNAME                  # GitHub Pages konfigurasjon
```

## Teknologi Stack

### Frontend
- **HTML5**: Semantisk markup
- **CSS3**: Moderne styling med CSS Grid, Flexbox, og Custom Properties
- **Vanilla JavaScript**: Ingen rammeverk - ren JavaScript for ytelse
- **SVG**: Skalerbar vektorgrafikk for bane visualisering
- **Canvas API**: Smooth animasjoner og sanntid oppdateringer

### Eksterne Biblioteker
- **Chart.js**: Tempo visualisering grafikk
- **Font Awesome**: Ikoner
- **Space Grotesk**: Moderne grotesk font
- **JetBrains Mono**: Monospace font for tall

## Kode Organisering

### JavaScript Struktur (`js/script.js`)

Filen er organisert i logiske seksjoner:

#### 1. Globale Variabler og State
```javascript
// State management
let currentPaceData = null;
let currentLane = 1;
let currentStrategy = 'even';
let isNorwegian = true;
let currentDistance = 3000;
let paceChart = null;
let isDarkMode = false;
```

#### 2. Konfigurasjon
- `TRACK_CONSTANTS`: Bane geometri konstanter
- `STANDARD_DISTANCES`: Standard løpsdistanser
- `LANE_DISTANCES`: Pre-beregnet lane distanser
- `translations`: Språk oversettelser

#### 3. Initialisering
- `DOMContentLoaded`: App initialisering
- `initializeApp()`: Setup funksjoner
- `setupEventListeners()`: Event handlers

#### 4. Bane Visualisering
- `drawTrack()`: Tegn bane SVG
- `drawMarkers()`: Tegn markører
- `addRoundIndicators()`: Legg til runde indikatorer
- `calculateTrackPosition()`: Beregn posisjon på banen

#### 5. Tempo Kalkulasjoner
- `calculatePace()`: Hovedkalkulasjonsfunksjon
- `generatePaceData()`: Generer pace data struktur
- `calculateExpectedTime()`: Beregn forventet tid med strategi

#### 6. Animasjon
- `animationLoop()`: Hovedanimasjonsloop
- `startAnimation()`: Start animasjon
- `pauseAnimation()`: Pause animasjon
- `resetAnimation()`: Reset animasjon
- `updateRunnerPosition()`: Oppdater løperposisjon
- `updateAnimationUI()`: Oppdater UI elementer

#### 7. UI Funksjoner
- `setupEventListeners()`: Event handlers
- `toggleTheme()`: Toggle mørk modus
- `switchTab()`: Bytt mellom faner
- `updatePaceChart()`: Oppdater graf
- `generateIntervals()`: Generer intervall trening

#### 8. Hjelpefunksjoner
- `parseTimeToMs()`: Parse tid til millisekunder
- `formatTimeFromMs()`: Format millisekunder til tid
- `showToast()`: Vis toast melding
- `copyToClipboard()`: Kopier til utklippstavle

## CSS Struktur (`css/styles.css`)

### Organisering
1. **Reset og Base Styles**: CSS reset og root variabler
2. **Layout**: Grid og Flexbox layouts
3. **Komponenter**: Reusable komponenter (cards, buttons, inputs)
4. **Seksjoner**: Spesifikke seksjoner (header, footer, track, etc.)
5. **Dark Mode**: Mørk modus stiler
6. **Responsive**: Media queries for mobile
7. **Utilities**: Helper klasser og animasjoner

### CSS Variabler
```css
:root {
    --primary-red: #dc2626;
    --neutral-50 to --neutral-900: Neutral farger
    --font-display: Space Grotesk
    --font-mono: JetBrains Mono
    --shadow-sm to --shadow-xl: Skygger
}
```

## Data Flow

### Kalkulasjonsflyt
1. Bruker angir måltid/tempo og distanse
2. `calculatePace()` kalles
3. `generatePaceData()` genererer data struktur
4. `calculateExpectedTime()` beregner tid for hver distanse
5. Data oppdateres i UI (deltider, graf, animasjon)

### Animasjonsflyt
1. Bruker klikker "Play"
2. `startAnimation()` initialiserer animasjon
3. `animationLoop()` kjører med requestAnimationFrame
4. Hver frame: Oppdater tid, distanse, posisjon
5. `updateRunnerPosition()` flytter løperen
6. `updateAnimationUI()` oppdaterer alle UI elementer
7. Loop fortsetter til løpet er ferdig

## State Management

### Global State
- `currentPaceData`: Nåværende pace data objekt
- `animationState`: Animasjonsstate objekt
- `currentLane`: Nåværende lane (1-8)
- `currentStrategy`: Valgt tempo strategi
- `currentDistance`: Nåværende løpsdistanse
- `isNorwegian`: Språk setting
- `isDarkMode`: Tema setting

### LocalStorage
Lagrer brukerpreferanser:
- `goalTime`: Siste mål tid
- `lane`: Valgt lane
- `strategy`: Valgt strategi
- `distance`: Valgt distanse
- `isNorwegian`: Språk preferanse
- `isDarkMode`: Tema preferanse

## Ytelsesoptimalisering

### Animasjoner
- Bruker `requestAnimationFrame` for 60fps
- Throttling av UI oppdateringer
- Effektiv SVG rendering

### Minne
- Rydder opp animasjonsframes når pauset
- Proper cleanup av Chart.js instanser
- Minimal DOM manipulering

### Lasting
- Inline kritiske CSS
- Lazy loading av ikke-kritiske ressurser
- Service Worker for offline støtte

## Browser Støtte

### Moderne Browsere
- Chrome/Edge (siste 2 versjoner)
- Firefox (siste 2 versjoner)
- Safari (siste 2 versjoner)

### Funksjoner som Brukes
- ES6+ JavaScript
- CSS Grid og Flexbox
- SVG
- Canvas API
- Service Workers (PWA)
- LocalStorage
- Web Share API (valgfritt)

## Utvidelsesmuligheter

### Mulige Forbedringer
- Flere tempo strategier
- Eksport til PDF
- Lagre løpsplaner
- Deling på sosiale medier
- Historie over tidligere løp
- Flere språk
- Metric/Imperial konvertering

### Tekniske Forbedringer
- TypeScript for type safety
- Build system for modulær kode
- Testing framework
- CI/CD pipeline
- Performance monitoring

