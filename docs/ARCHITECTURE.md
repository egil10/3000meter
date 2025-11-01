# 3000METER.com - Architecture Documentation

## Prosjektstruktur

```
3000meter/
├── index.html              # Hoved HTML fil
├── css/
│   └── styles.css          # Alle stilark
├── js/
│   ├── config.js           # Konstantar og oversettelser
│   ├── utils.js            # Hjelpefunksjoner
│   └── modules/
│       ├── state.js        # State management
│       ├── track.js        # Bane visualisering
│       ├── pace-calculator.js  # Tempo kalkulasjoner
│       ├── animation.js    # Animasjonsfunksjoner
│       ├── ui.js           # UI oppdateringer
│       ├── storage.js      # Lagring og URL håndtering
│       └── main.js         # Initialisering
├── assets/
│   └── stadium.svg         # Bane SVG ikon
├── pwa/
│   ├── manifest.json       # PWA manifest
│   └── sw.js              # Service Worker
├── docs/                   # Dokumentasjon
│   ├── FEATURES.md        # Funksjonsdokumentasjon
│   ├── ARCHITECTURE.md    # Arkitektur dokumentasjon
│   ├── DEVELOPMENT.md     # Utviklingsguide
│   ├── API.md            # API dokumentasjon
│   └── BLOAT_ANALYSIS.md # Repositorie analyse
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

### JavaScript Struktur (Modulær)

Koden er organisert i separate moduler for bedre vedlikehold og lesbarhet:

#### 1. `js/config.js` - Konfigurasjon
- `TRACK_CONSTANTS`: Bane geometri konstanter
- `STANDARD_DISTANCES`: Standard løpsdistanser
- `LANE_DISTANCES`: Pre-beregnet lane distanser
- `translations`: Språk oversettelser (norsk/engelsk)

#### 2. `js/utils.js` - Hjelpefunksjoner
- `parseTimeToMs()`: Parse tid til millisekunder
- `formatTimeFromMs()`: Format millisekunder til tid
- `formatTimeFromMsSimple()`: Enkel tidsformatering
- `formatTimeSimple()`: Format tid streng
- `showToast()`: Vis toast melding

#### 3. `js/modules/state.js` - State Management
- `currentPaceData`: Nåværende pace data objekt
- `currentLane`: Nåværende lane (1-8)
- `currentStrategy`: Valgt tempo strategi
- `currentDistance`: Nåværende løpsdistanse
- `isNorwegian`: Språk setting
- `isDarkMode`: Tema setting
- `paceChart`: Chart.js instans
- `customSplits`: Custom split definisjoner
- `animationState`: Animasjonsstate objekt
- `elements`: DOM element referanser

#### 4. `js/modules/track.js` - Bane Visualisering
- `roundedRectPath()`: Generer avrundet rektangel path
- `pathAtInset()`: Beregn posisjon langs path
- `drawTrack()`: Tegn bane SVG
- `drawMarkers()`: Tegn markører
- `addRoundIndicators()`: Legg til runde indikatorer
- `calculateTrackPosition()`: Beregn posisjon på banen

#### 5. `js/modules/pace-calculator.js` - Tempo Kalkulasjoner
- `calculatePace()`: Hovedkalkulasjonsfunksjon
- `generatePaceData()`: Generer pace data struktur
- `calculateExpectedTime()`: Beregn forventet tid med strategi

#### 6. `js/modules/animation.js` - Animasjon
- `updateAnimationState()`: Oppdater animasjonsstate
- `toggleAnimation()`: Toggle play/pause
- `startAnimation()`: Start animasjon
- `pauseAnimation()`: Pause animasjon
- `resetAnimation()`: Reset animasjon
- `updateAnimationSpeed()`: Oppdater animasjonshastighet
- `animationLoop()`: Hovedanimasjonsloop

#### 7. `js/modules/ui.js` - UI Funksjoner
- `updateResults()`: Oppdater resultater
- `updateTrackVisualization()`: Oppdater bane visualisering
- `updateAnimationUI()`: Oppdater animasjons UI
- `updateCumulativeTimes()`: Oppdater kumulative tider
- `updatePaceChart()`: Oppdater graf
- `generateIntervals()`: Generer intervall trening
- `initializeCustomSplits()`: Initialiser custom splits
- `addCustomSplit()`: Legg til custom split
- `renderCustomSplits()`: Render custom splits
- `handleExport()`: Håndter eksport

#### 8. `js/modules/storage.js` - Lagring og URL
- `copyToClipboard()`: Kopier til utklippstavle
- `loadFromURL()`: Last fra URL parametere
- `updateURL()`: Oppdater URL parametere
- `saveToLocalStorage()`: Lagre til localStorage
- `loadFromLocalStorage()`: Last fra localStorage

#### 9. `js/modules/main.js` - Initialisering
- `initializeApp()`: App initialisering
- `initializeDistanceButtons()`: Initialiser distanseknapper
- `setupEventListeners()`: Event handlers

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

