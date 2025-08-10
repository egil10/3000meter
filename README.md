# 3000METER.com

<div align="center">

![3000METER.com](https://img.shields.io/badge/3000METER.com-Professional%20Track%20Running%20Pace%20Calculator-red?style=for-the-badge&logo=heart&logoColor=white)

**Professional pace calculator for track athletes. Plan your perfect 3000m race with lane-aware splits, pacing strategies, and live track animation.**

[![Website](https://img.shields.io/badge/Website-3000METER.com-red?style=flat-square&logo=globe)](https://3000meter.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Language](https://img.shields.io/badge/Language-JavaScript-yellow?style=flat-square&logo=javascript)](https://javascript.com)
[![Platform](https://img.shields.io/badge/Platform-Web-blue?style=flat-square&logo=html5)](https://html5.org)

</div>

---

## 🏃‍♂️ Overview

3000METER.com is a professional-grade web application designed specifically for track athletes and coaches. It provides comprehensive 3K race planning with advanced pacing strategies, real-time track visualization, and detailed split analysis.

### Key Features

- **🎯 Lane-Aware Calculations**: Precise pace calculations accounting for lane differences
- **📊 Multiple Pacing Strategies**: Even, negative split, positive split, and custom strategies
- **🎬 Live Track Animation**: Real-time runner visualization on an 8-lane track
- **⏱️ Comprehensive Splits**: 200m, 400m, and 1000m interval calculations
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **🌍 International Support**: English and Norwegian language support

---

## 🚀 Getting Started

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

3. **Start planning your race!**
   - Visit `http://localhost:8000` in your browser
   - Enter your target time (e.g., `15:30`)
   - Choose your pacing strategy
   - Click "Calculate" to see your personalized plan

### Live Demo

🌐 **Visit the live application**: [3000METER.com](https://3000meter.com)

---

## 🎯 How It Works

### Race Setup

1. **Target Time**: Enter your desired finish time in `mm:ss` format
2. **Pacing Strategy**: Choose from multiple strategies:
   - **Even**: Consistent pace throughout
   - **-5%**: Negative split (start slower, finish faster)
   - **+5%**: Positive split (start faster, finish slower)
   - **Kick 600m**: Even pace until 2400m, then accelerate
3. **Calculate**: Generate your personalized race plan

### Track Visualization

- **8-Lane Track**: Realistic oval track with proper lane markings
- **Animated Runner**: Blue dot showing your current position
- **Lap Indicators**: Visual markers for each lap completion
- **Progress Bar**: Real-time progress through the race

### Split Analysis

- **200m Intervals**: Detailed splits every 200 meters
- **400m Intervals**: Standard lap splits
- **1000m Intervals**: Kilometer markers
- **Real-time Updates**: Splits update as the animation progresses

---

## 🛠️ Technical Architecture

### Frontend Stack

```javascript
// Core Technologies
- HTML5          // Semantic markup and structure
- CSS3           // Modern styling with CSS Grid and Flexbox
- Vanilla JS     // No frameworks - pure JavaScript for performance
- SVG            // Scalable vector graphics for track visualization
- Canvas API     // Smooth animations and real-time updates
```

### Key Components

#### 1. Track Visualization Engine
```javascript
// Track geometry calculations
const TRACK_CONSTANTS = {
    LANE_WIDTH: 1.22,           // Standard lane width
    STRAIGHT_LENGTH: 84.39,     // Straight section length
    CURVE_RADIUS_LANE1: 36.5,   // Lane 1 curve radius
    TOTAL_DISTANCE: 3000,       // Race distance
    LAPS: 7.5                   // Total laps for 3000m
};

// Lane-specific distances
const LANE_DISTANCES = {
    1: 400.0,    // Lane 1: 400m per lap
    2: 407.04,   // Lane 2: 407.04m per lap
    3: 414.08,   // ... and so on
    // Each lane adds 7.04m per lap
};
```

#### 2. Pace Calculation Engine
```javascript
// Core pace calculation function
function calculateExpectedTime(distance, basePacePerKm, strategy) {
    // Apply pacing strategy multipliers
    let paceMultiplier = 1.0;
    
    switch(strategy) {
        case 'even':     // Consistent pace
            paceMultiplier = 1.0;
            break;
        case 'neg5p':    // Negative split
            // Calculate progressive speed increase
            break;
        case 'kick600':  // Final 600m acceleration
            // Even pace until 2400m, then accelerate
            break;
    }
    
    return (distance / 1000) * basePacePerKm * paceMultiplier * 1000;
}
```

#### 3. Animation System
```javascript
// Real-time animation loop
function animationLoop() {
    const now = Date.now();
    const elapsed = ((now - animationState.startTime) / 1000) * animationState.speed;
    
    // Update runner position
    animationState.currentTime = Math.min(elapsed, animationState.totalTime / 1000);
    const progress = animationState.currentTime / (animationState.totalTime / 1000);
    const distance = progress * TRACK_CONSTANTS.TOTAL_DISTANCE;
    
    // Update UI and continue animation
    updateRunnerPosition(animationState.lapProgress, distance);
    updateAnimationUI();
    
    if (progress < 1) {
        animationState.animationId = requestAnimationFrame(animationLoop);
    }
}
```

### File Structure

```
3000meter/
├── index.html              # Main application entry point
├── css/
│   └── styles.css          # Modern CSS with CSS Grid and custom properties
├── js/
│   └── script.js           # Core application logic (1,175 lines)
├── assets/
│   └── stadium.svg         # Track visualization assets
├── pwa/
│   ├── manifest.json       # Progressive Web App configuration
│   └── sw.js              # Service Worker for offline support
└── README.md              # This file
```

---

## 🎨 Design Philosophy

### Modern & Professional
- **Clean Interface**: Minimalist design focusing on functionality
- **Professional Typography**: Inter font family for readability
- **Consistent Color Scheme**: Red (#dc2626) primary with neutral grays
- **Responsive Grid**: CSS Grid and Flexbox for perfect layouts

### User Experience
- **Intuitive Controls**: Clear, accessible interface elements
- **Real-time Feedback**: Immediate visual response to user actions
- **Smooth Animations**: 60fps animations using requestAnimationFrame
- **Keyboard Shortcuts**: Space (play/pause), R (reset), S (speed toggle)

### Accessibility
- **Semantic HTML**: Proper heading hierarchy and ARIA labels
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Friendly**: Descriptive alt text and labels
- **High Contrast**: Clear visual hierarchy and contrast ratios

---

## 📊 Pacing Strategies

### Even Pace
- **Description**: Maintain consistent speed throughout the race
- **Best For**: Beginners and time trials
- **Formula**: `pace = total_time / total_distance`

### Negative Split (-5%)
- **Description**: Start 5% slower, finish 5% faster
- **Best For**: Experienced runners with strong finishes
- **Formula**: `pace_adjustment = -5% * (distance / total_distance)`

### Positive Split (+5%)
- **Description**: Start 5% faster, finish 5% slower
- **Best For**: Tactical racing and championship events
- **Formula**: `pace_adjustment = +5% * (distance / total_distance)`

### Kick 600m
- **Description**: Even pace until 2400m, then accelerate for final 600m
- **Best For**: Competitive racing with strong finishes
- **Formula**: 
  - 0-2400m: Even pace
  - 2400-3000m: Gradual 5% acceleration

---

## 🔧 Development

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
- **JavaScript**: ES6+ with modern syntax
- **CSS**: BEM methodology with CSS custom properties
- **HTML**: Semantic markup with accessibility in mind
- **Comments**: Comprehensive inline documentation

### Performance Optimizations
- **SVG Optimization**: Efficient track rendering
- **Animation Throttling**: 60fps animation loop
- **Memory Management**: Proper cleanup of animation frames
- **Lazy Loading**: On-demand resource loading

---

## 🌍 Internationalization

### Supported Languages
- **English**: Primary language
- **Norwegian**: Full translation support

### Translation System
```javascript
const translations = {
    en: {
        title: "3000METER.com",
        race_setup: "Race Setup",
        target_time: "Target Time (mm:ss)",
        calculate: "Calculate",
        // ... more translations
    },
    no: {
        title: "3000METER.com",
        race_setup: "Løps Oppsett",
        target_time: "Måltid (mm:ss)",
        calculate: "Beregn",
        // ... more translations
    }
};
```

### Language Detection
- Automatic detection based on browser language
- Manual toggle with language button
- Persistent language preference in localStorage

---

## 📱 Progressive Web App

### PWA Features
- **Offline Support**: Service Worker for offline functionality
- **App Manifest**: Installable as native app
- **Responsive Design**: Works on all screen sizes
- **Fast Loading**: Optimized for performance

### Installation
1. Visit [3000METER.com](https://3000meter.com)
2. Click "Install" in browser menu
3. Access from home screen like a native app

---

## 🤝 Contributing

We welcome contributions from the running community! Here's how you can help:

### Development
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Areas for Contribution
- **New Pacing Strategies**: Add innovative race strategies
- **UI/UX Improvements**: Enhance the user interface
- **Performance Optimization**: Improve loading and animation speed
- **Accessibility**: Enhance accessibility features
- **Documentation**: Improve code documentation and guides

### Code of Conduct
- Be respectful and inclusive
- Focus on the running community
- Maintain professional standards
- Follow existing code style

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### MIT License Summary
- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ✅ Private use allowed
- ❌ No liability
- ❌ No warranty

---

## 🙏 Acknowledgments

### Running Community
- **Athletes**: For feedback and testing
- **Coaches**: For strategic insights
- **Track Officials**: For technical accuracy

### Open Source
- **Font Awesome**: Professional icons
- **Inter Font**: Modern typography
- **Chart.js**: Data visualization (if used)

### Development
- **Modern Web Standards**: HTML5, CSS3, ES6+
- **Browser APIs**: SVG, Canvas, Service Workers
- **Performance Tools**: Chrome DevTools, Lighthouse

---

## 📞 Support & Contact

### Get Help
- **Website**: [3000METER.com](https://3000meter.com)
- **GitHub Issues**: [Report bugs or request features](https://github.com/egil10/3000meter/issues)
- **Email**: Contact through GitHub profile

### Community
- **GitHub Discussions**: Share ideas and get help
- **Running Forums**: Spread the word to fellow runners
- **Social Media**: Follow for updates and tips

---

<div align="center">

**Built with ❤️ for the running community**

*Professional pace calculator for track athletes*

[![Website](https://img.shields.io/badge/Visit-3000METER.com-red?style=for-the-badge&logo=globe)](https://3000meter.com)
[![GitHub](https://img.shields.io/badge/Star-GitHub-yellow?style=for-the-badge&logo=github)](https://github.com/egil10/3000meter)

</div>