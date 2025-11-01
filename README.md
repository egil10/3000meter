# 3000METER.com

**Live Website:** [https://3000meter.com/](https://3000meter.com/)

Professional pace calculator for track athletes. Plan your perfect race with lane-aware splits, pacing strategies, and live track animation.

---

## Overview

3000METER.com is a professional-grade web application designed specifically for track athletes and coaches. It provides comprehensive race planning with advanced pacing strategies, real-time track visualization, and detailed split analysis.

The application supports any race distance (from 100m to marathon) with precise lane-aware calculations, multiple pacing strategies, and an interactive track visualization showing your progress in real-time.

---

## Features

### Core Functionality

**Lane-Aware Calculations**
- Precise pace calculations accounting for lane differences
- Supports all 8 lanes with accurate distance measurements
- Automatic lap calculation based on lane selection

**Multiple Pacing Strategies**
- Even: Consistent pace throughout the race
- Negative Split (-5%): Start slower, finish faster
- Positive Split (+5%): Start faster, finish slower
- Progressive: Gradually get faster throughout the race
- Degressive: Gradually get slower throughout the race
- Custom: Define your own pace strategy with custom splits

**Live Track Visualization**
- Realistic 8-lane oval track with proper markings
- Animated runner showing current position
- Visual lap indicators showing progress
- Real-time progress updates

**Comprehensive Split Analysis**
- 200m interval splits
- 400m lap splits
- 1000m kilometer markers (for longer races)
- Real-time split updates during animation

**Flexible Distance Selection**
- Direct input for any distance
- Quick preset buttons for common distances:
  - Olympic distances: 100m, 200m, 400m, 800m, 1500m, 3000m, 5000m, 10000m
  - British distances: 1 Mile, 2 Miles, 3 Miles, 5 Miles, 10 Miles, Marathon
  - Other common distances: 1km, 2km, 5km, 10km, Half Marathon

**Pace Visualization**
- Interactive charts showing pace throughout the race
- Chart.js integration for smooth data visualization
- Dark mode support

**Dark Mode**
- Full dark mode support with smooth transitions
- Automatic theme preference saving
- Consistent theming across all UI elements

**Language Support**
- Norwegian (default)
- English
- Automatic language detection

**Progressive Web App**
- Offline support via Service Worker
- Installable as native app
- Fast loading and optimized performance

---

## Getting Started

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/egil10/3000meter.git
   cd 3000meter
   ```

2. **Open in your browser**
   ```bash
   # Using Python (recommended)
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Or simply open index.html in your browser
   ```

3. **Start planning your race**
   - Visit `http://localhost:8000` in your browser
   - Enter your target time (e.g., `15:00`)
   - Select your race distance
   - Choose your pacing strategy
   - Click "Calculate" to see your personalized plan

### Live Demo

Visit the live application: [https://3000meter.com/](https://3000meter.com/)

---

## How to Use

### Basic Usage

1. **Enter Race Distance**
   - Type directly in the distance input field (in meters)
   - Or click a preset button for common distances

2. **Enter Target Time**
   - Enter your desired finish time in `mm:ss` format (e.g., `15:30`)
   - Use the adjustment buttons (-10s, -5s, +5s, +10s) for quick changes

3. **Select Pacing Strategy**
   - Choose from available strategies:
     - **Jevnt** (Even): Consistent pace throughout
     - **-5%**: Negative split - start slower, finish faster
     - **+5%**: Positive split - start faster, finish slower
     - **Progresiv**: Gradually get faster
     - **Custom**: Advanced custom strategy with split editor

4. **Calculate**
   - Click the "Beregn" (Calculate) button
   - View your splits, pace chart, and track visualization

### Advanced Features

**Progressive/Degressive Strategies**
- Select progression type: Linear, Exponential, or Sigmoid
- Adjust pace change per 400m (negative = faster, positive = slower)

**Custom Strategy**
- Define start and end pace
- Or use the split editor to add custom splits at specific distances
- Each split can have its own target pace

**Track Animation**
- Click play to start the animation
- Watch your runner progress around the track
- Monitor real-time stats: lap, distance, pace, and progress
- Click reset to restart the animation

**Keyboard Shortcuts**
- Space: Play/pause animation
- R: Reset animation
- +/-: Adjust time (Shift for larger increments)

**View Results**
- Switch between "Deltider" (Splits) and "Graf" (Chart) tabs
- Splits tab shows 200m and 400m interval tables
- Chart tab shows interactive pace visualization

---

## Project Structure

```
3000meter/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # All stylesheets
├── js/
│   ├── config.js           # Constants and translations
│   ├── utils.js            # Utility functions
│   └── modules/
│       ├── state.js        # State management
│       ├── track.js        # Track visualization
│       ├── pace-calculator.js  # Pace calculations
│       ├── animation.js    # Animation functions
│       ├── ui.js           # UI updates
│       ├── storage.js      # Storage and URL handling
│       └── main.js         # Initialization
├── assets/
│   └── stadium.svg         # Stadium SVG icon
├── pwa/
│   ├── manifest.json       # PWA manifest
│   └── sw.js               # Service Worker
├── docs/                   # Documentation
│   ├── FEATURES.md         # Feature documentation
│   ├── ARCHITECTURE.md     # Architecture documentation
│   ├── DEVELOPMENT.md     # Development guide
│   ├── API.md              # API documentation
│   └── BLOAT_ANALYSIS.md   # Repository analysis
├── README.md               # Project overview
└── CNAME                   # GitHub Pages configuration
```

---

## Documentation

Comprehensive documentation is available in the `docs/` folder:

- **[FEATURES.md](docs/FEATURES.md)** - Detailed feature documentation and usage guide
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Technical architecture and project structure
- **[DEVELOPMENT.md](docs/DEVELOPMENT.md)** - Development guide and best practices
- **[API.md](docs/API.md)** - JavaScript API documentation
- **[BLOAT_ANALYSIS.md](docs/BLOAT_ANALYSIS.md)** - Repository size and quality analysis

---

## Technical Architecture

### Frontend Stack

- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with CSS Grid and Flexbox, CSS Custom Properties
- **Vanilla JavaScript**: No frameworks - pure JavaScript for optimal performance
- **SVG**: Scalable vector graphics for track visualization
- **Chart.js**: Interactive data visualization

### Code Organization

The codebase is organized into modular JavaScript files:

- **config.js**: Constants, track geometry, translations
- **utils.js**: Utility functions (time parsing, formatting, toast notifications)
- **modules/state.js**: Global state management
- **modules/track.js**: Track drawing and visualization functions
- **modules/pace-calculator.js**: Core pace calculation logic
- **modules/animation.js**: Animation control and loop functions
- **modules/ui.js**: UI update and rendering functions
- **modules/storage.js**: LocalStorage and URL parameter handling
- **modules/main.js**: Application initialization and event listeners

### Key Technologies

**Track Visualization**
- SVG-based 8-lane track rendering
- Real-time runner position calculation
- Lane-aware distance calculations

**Pace Calculation**
- Multiple strategy implementations
- Custom split support
- Progressive/degressive algorithms with multiple curve types

**Animation System**
- requestAnimationFrame for smooth 60fps animations
- Configurable playback speed
- Real-time UI updates

---

## Pacing Strategies

### Even Pace
Maintain consistent speed throughout the race. Best for beginners and time trials.

**Formula:** `pace = total_time / total_distance`

### Negative Split (-5%)
Start 5% slower, finish 5% faster. Best for experienced runners with strong finishes.

**Formula:** `pace_adjustment = -5% * (distance / total_distance)`

### Positive Split (+5%)
Start 5% faster, finish 5% slower. Best for tactical racing and championship events.

**Formula:** `pace_adjustment = +5% * (distance / total_distance)`

### Progressive
Gradually get faster throughout the race. Supports three progression types:
- **Linear**: Constant acceleration rate
- **Exponential**: Accelerating acceleration
- **Sigmoid**: Smooth S-curve acceleration

### Degressive
Gradually get slower throughout the race. Supports the same progression types as Progressive.

### Custom
Define your own pace strategy:
- Set start and end pace with interpolation
- Or use the split editor to define custom splits at specific distances
- Each segment can have its own target pace

---

## Development

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- No build tools required - pure HTML/CSS/JS
- Optional: Python or Node.js for local development server

### Local Development

```bash
# Clone the repository
git clone https://github.com/egil10/3000meter.git
cd 3000meter

# Start development server
python -m http.server 8000

# Or using Node.js
npx serve .

# Open in browser
open http://localhost:8000
```

### Code Style

- **JavaScript**: ES6+ with modern syntax, modular organization
- **CSS**: CSS Custom Properties for theming, minimal and modern
- **HTML**: Semantic markup with accessibility in mind
- **Comments**: Comprehensive inline documentation

### Performance Optimizations

- SVG optimization for efficient track rendering
- Animation throttling for smooth 60fps animation loop
- Memory management with proper cleanup of animation frames
- Modular code organization for better loading and caching

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

The application uses modern web standards and should work in any modern browser. Older browsers may have limited functionality.

---

## Contributing

We welcome contributions from the running community. Here's how you can help:

### Development Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Areas for Contribution

- New pacing strategies
- UI/UX improvements
- Performance optimization
- Accessibility enhancements
- Documentation improvements
- Bug fixes

### Code of Conduct

- Be respectful and inclusive
- Focus on the running community
- Maintain professional standards
- Follow existing code style

---

## License

This project is licensed under the MIT License.

### MIT License Summary

- Commercial use allowed
- Modification allowed
- Distribution allowed
- Private use allowed
- No liability
- No warranty

See the [LICENSE](LICENSE) file for full details.

---

## Acknowledgments

### Running Community
- Athletes for feedback and testing
- Coaches for strategic insights
- Track officials for technical accuracy

### Open Source
- Font Awesome for professional icons
- Space Grotesk Font for modern typography
- Chart.js for data visualization

### Development
- Modern Web Standards: HTML5, CSS3, ES6+
- Browser APIs: SVG, Canvas, Service Workers
- Performance Tools: Chrome DevTools, Lighthouse

---

## Support & Contact

### Get Help

- **Website**: [3000METER.com](https://3000meter.com)
- **GitHub Issues**: [Report bugs or request features](https://github.com/egil10/3000meter/issues)

### Community

- **GitHub Discussions**: Share ideas and get help
- **Running Forums**: Spread the word to fellow runners

---

**Built with dedication for the running community**

*Professional pace calculator for track athletes*

Visit [3000METER.com](https://3000meter.com) | [GitHub Repository](https://github.com/egil10/3000meter)
