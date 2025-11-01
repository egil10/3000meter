# 3000METER.com - Development Guide

## Oppsett

### Forutsetninger
- Moderne nettleser (Chrome, Firefox, Safari, Edge)
- Ingen build tools nødvendig - ren HTML/CSS/JS
- Valgfritt: Python eller Node.js for lokal utviklingsserver

### Lokal Utvikling

#### Med Python
```bash
# Start HTTP server
python -m http.server 8000

# Åpne i nettleser
# http://localhost:8000
```

#### Med Node.js
```bash
# Installer serve (hvis ikke installert)
npm install -g serve

# Start server
serve .

# Eller med npx
npx serve .
```

#### Direkte
Du kan også åpne `index.html` direkte i nettleseren, men noen funksjoner kan ikke fungere (f.eks. Service Worker).

## Kode Stil

### JavaScript
- **ES6+**: Bruk moderne JavaScript syntaks
- **CamelCase**: For funksjoner og variabler
- **Kommentarer**: Dokumenter komplekse funksjoner
- **Konsistent**: Følg eksisterende mønstre

### CSS
- **BEM**: Bruk BEM metodikk hvor mulig
- **CSS Variabler**: Bruk CSS custom properties
- **Mobile First**: Start med mobile, utvid til desktop
- **Semantikk**: Bruk semantiske klasse navn

### HTML
- **Semantisk**: Bruk semantiske HTML elementer
- **Accessibility**: Inkluder ARIA labels hvor nødvendig
- **Struktur**: Logisk HTML struktur

## Fil Struktur

### Nye Funksjoner
Når du legger til nye funksjoner:

1. **Legg til i riktig modul** i `js/modules/` (eller opprett ny modul hvis nødvendig)
2. **Oppdater CSS** hvis nødvendig
3. **Legg til HTML** strukturen
4. **Oppdater dokumentasjon** i `docs/` mappen
5. **Test på mobile** enheter

### Funksjoner som Trenger Oppdatering
- **Translations**: Legg til i `translations` objektet
- **Dark Mode**: Legg til dark mode stiler i CSS
- **Mobile**: Sjekk responsive design
- **Keyboard**: Legg til tastatursnarveier hvis relevant

## Testing

### Manuell Testing
1. Test alle tempo strategier
2. Test alle distanser
3. Test animasjonen (play, pause, reset)
4. Test dark mode toggle
5. Test på mobile enheter
6. Test språk toggle
7. Test deling og eksport funksjoner

### Browser Testing
Test i følgende browsere:
- Chrome/Edge (siste versjon)
- Firefox (siste versjon)
- Safari (siste versjon)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

## Debugging

### Konsoll Logging
Bruker `console.log` for debugging:
```javascript
console.log('Debug info:', variable);
```

### Chrome DevTools
- **Elements**: Inspiser DOM
- **Console**: Se JavaScript feil
- **Network**: Sjekk ressurse loading
- **Performance**: Profiler animasjoner
- **Lighthouse**: Test performance og accessibility

### Vanlige Problemer

#### Animasjonen Starter Ikke
- Sjekk at `currentPaceData` er satt
- Sjekk at `animationState.totalTime` er satt
- Sjekk konsollen for feil

#### Tempo Kalkulasjoner er Feil
- Sjekk at `parseTimeToMs()` returnerer riktig verdi
- Sjekk at distanse er korrekt
- Sjekk at strategi er korrekt brukt

#### Dark Mode Fungerer Ikke
- Sjekk at `body.dark-mode` klasse er satt
- Sjekk CSS spesifisitet
- Sjekk localStorage

## Deployment

### GitHub Pages
1. Push til `main` branch
2. GitHub Pages publiserer automatisk
3. Sjekk at `CNAME` fil er korrekt

### Manuel Deployment
1. Bygg prosjektet (hvis nødvendig)
2. Upload filer til web server
3. Sjekk at Service Worker fungerer
4. Test offline funksjonalitet

## Performance Tips

### Optimalisering
- **Minimal DOM Manipulering**: Batch DOM oppdateringer
- **Efficient Animations**: Bruk `transform` og `opacity` for animasjoner
- **Lazy Loading**: Last ikke-kritiske ressurser senere
- **Caching**: Bruk Service Worker for caching

### Profiling
- Bruk Chrome DevTools Performance tab
- Sjekk for memory leaks
- Optimaliser animasjonslooper
- Reduser layout thrashing

## Contributing

### Pull Requests
1. Opprett feature branch
2. Gjør endringer
3. Test grundig
4. Oppdater dokumentasjon
5. Opprett pull request

### Code Review Checklist
- [ ] Kode følger stil guidelines
- [ ] Funksjoner er testet
- [ ] Dokumentasjon er oppdatert
- [ ] Ingen console.log statements
- [ ] Mobile responsive
- [ ] Dark mode støttet
- [ ] Accessibility vurdert

## Ressurser

### Dokumentasjon
- [MDN Web Docs](https://developer.mozilla.org/)
- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [SVG Reference](https://developer.mozilla.org/en-US/docs/Web/SVG)

### Verktøy
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Can I Use](https://caniuse.com/) - Browser support

