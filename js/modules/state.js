// State Management
let currentPaceData = null;
let currentLane = 1;
let currentStrategy = 'even';
let isNorwegian = false; // Default to English
let currentDistance = 3000; // Current race distance in meters
let paceChart = null; // Chart.js instance
let currentChartType = 'pace'; // Current chart type: pace, speed, time, split-pace
let isDarkMode = false;
let customSplits = []; // Custom split definitions
let progressionType = 'linear'; // linear, exponential, sigmoid
let paceChangePer400m = -2; // seconds per 400m for progressive/degressive
let activeSplitDistances = [200, 400]; // Active split distances to display

// Animation state
let animationState = {
    isPlaying: false,
    currentTime: 0,
    totalTime: 0,
    speed: 1,
    currentDistance: 0,
    currentLap: 0,
    lapProgress: 0,
    animationId: null,
    startTime: 0,
    lastUpdateTime: 0
};

// Track drawing state
let lanePaths = [];
let totalLen = 0;
let lane1 = null;

// DOM elements cache
let elements = {};

