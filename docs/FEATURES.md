# 3000METER.com - Features Documentation

## Oversikt

3000METER.com er en profesjonell tempo kalkulator for baneløpere som gir deg muligheten til å planlegge perfekte løp med detaljerte deltider, tempo strategier og levende bane animasjon.

## Hovedfunksjoner

### 🎯 Multiple Løpsdistanser
- **800m** - Sprint løp
- **1500m** - Mellomdistanse
- **3000m** - Langdistanse (standard)
- **5000m** - Langdistanse
- **10000m** - Langdistanse
- **Egendefinert** - Tilpasset distanse

### 📊 Tempo Strategier

#### Even (Jevnt)
- Konstant tempo gjennom hele løpet
- Best for: Nybegynnere og tidtakere
- Formel: `tempo = total_tid / total_distanse`

#### -5% (Negativ Split)
- Start 5% langsommere, avslutt 5% raskere
- Best for: Erfarne løpere med sterk finish
- Strategi: Bygg fart gjennom løpet

#### +5% (Positiv Split)
- Start 5% raskere, avslutt 5% langsommere
- Best for: Taktisk racing og mesterskap
- Strategi: Ta kontroll tidlig i løpet

#### Kick 600m
- Jevnt tempo til 2400m, deretter akselerasjon siste 600m
- Best for: Konkurranseløp med sterk finish
- Strategi: Spar energi, spark i slutten

### 🎬 Bane Visualisering

- **8-bane bane**: Realistisk oval bane med riktige banemarkeringer
- **Animasjon**: Blå prikk viser løperens nåværende posisjon
- **Runde indikatorer**: Visuelle markører for hver runde fullført
- **Fremdriftsbar**: Sanntid fremgang gjennom løpet

### ⏱️ Deltider

#### 200m Intervaller
- Detaljerte deltider hver 200 meter
- Viser kumulativ tid på hvert punkt

#### 400m Intervaller
- Standard runde deltider
- Perfekt for å følge runde-til-rund tempo

#### 1000m Intervaller
- Kilometer markører
- Brukes for lengre løp (5000m+)

### 📈 Tempo Graf

- Interaktiv graf som viser tempo gjennom hele løpet
- Visualiserer tempo strategien din
- Støtter mørk modus
- Bygget med Chart.js

### 🏋️ Intervall Treningsplanlegger

- Generer intervall treninger basert på mål tempo
- Tilpassbar intervall distanse, hvile tid og repetisjoner
- Viser total arbeidstid, hvile tid og total distanse
- Perfekt for å planlegge treningsøkter

### 🌓 Mørk Modus

- Øyevennlig mørk modus
- Lagrer preferanse i localStorage
- Smooth overganger mellom temaer
- Full støtte på alle elementer

### 📱 Mobil Optimalisert

- Responsivt design for alle skjermstørrelser
- Touch-vennlige knapper
- Optimalisert layout for telefoner og nettbrett
- PWA støtte for offline bruk

### 🔗 Deling og Eksport

- **Del**: Opprett delbare lenker med løpsparametere
- **Eksport**: Last ned løpsplan som tekstfil
- URL parametere for enkel deling

## Bruksanvisning

### 1. Velg Løpsdistanse
Klikk på en av distanseknappene (800m, 1500m, 3000m, etc.) eller velg "Custom" for egendefinert distanse.

### 2. Angi Måltid eller Tempo
- **Måltid**: Angi ønsket sluttid i formatet `mm:ss` (f.eks. `15:30`)
- **Tempo**: Angi ønsket tempo per km i formatet `mm:ss` (f.eks. `05:00`)

Tempo og tid oppdateres automatisk basert på valgt distanse.

### 3. Velg Tempo Strategi
Klikk på en av tempo strategiene:
- **Even**: Jevnt tempo
- **-5%**: Negativ split
- **+5%**: Positiv split
- **Kick 600m**: Sprint siste 600m

### 4. Beregn
Klikk på "Beregn" knappen for å generere din løpsplan.

### 5. Se Resultater
- **Splits**: Se detaljerte deltider for 200m, 400m og 1000m intervaller
- **Tempo Graf**: Visualiser tempo gjennom løpet
- **Intervaller**: Planlegg treningsøkter basert på løpet

### 6. Animer Løpet
- Klikk "Play" for å starte animasjonen
- Bruk hastighetskontrollen for å justere hastighet (1x - 10x)
- Se løperen bevege seg rundt banen i sanntid

## Tips og Triks

### Justering av Tid
- Bruk `-10s`, `-5s`, `+5s`, `+10s` knappene for rask justering
- Eller skriv inn direkte i tidsfeltet

### Justering av Tempo
- Bruk `-5s`, `-1s`, `+1s`, `+5s` knappene for rask justering
- Tempo oppdateres automatisk basert på distanse

### Tastatursnarveier
- **Space**: Spill/Pause animasjon
- **R**: Reset animasjon
- **S**: Toggle hastighet mellom 1x og 2x
- **+/-**: Juster tid med 1 sekund (Shift for 5 sekunder)

### Intervall Trening
1. Beregn først et løp
2. Gå til "Intervaller" fanen
3. Angi intervall distanse, hvile tid og repetisjoner
4. Klikk "Generer Intervaller"
5. Se detaljert treningsplan

## Tekniske Detaljer

### Bane Kalkulasjoner
- Bane er basert på standard IAAF spesifikasjoner
- Lane 1: 400m per runde
- Hver ekstra lane: +7.04m per runde
- Precisjon kalkulasjoner for alle distanser

### Tempo Kalkulasjoner
- Alle beregninger er basert på valgt tempo strategi
- Lane-aware beregninger for nøyaktige deltider
- Støtter både metriske og engelske enheter

### Animasjon
- 60fps animasjon med requestAnimationFrame
- Smooth runner bevegelse rundt banen
- Sanntid oppdatering av UI elementer

