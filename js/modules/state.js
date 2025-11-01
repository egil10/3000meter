// State Management
let currentPaceData = null;
let currentLane = 1;
let currentStrategy = 'even';
let isNorwegian = false; // Default to English
let currentDistance = 3000; // Current race distance in meters
let paceChart = null; // Chart.js instance
let currentChartType = 'pace'; // Current chart type: pace, speed, time, split-pace
let isDarkMode = false; // Light theme is default - don't load dark mode preference
let customSplits = []; // Custom split definitions
let progressionType = 'linear'; // linear, exponential, sigmoid
let paceChangePer400m = -2; // seconds per 400m for progressive/degressive
let activeSplitDistances = [200, 400]; // Active split distances to display
let trackType = 'outdoor'; // Track type: 'outdoor', 'indoor', 'road'

// Function to get lane distance based on track type
function getLaneDistance(lane) {
    if (trackType === 'indoor') {
        return LANE_DISTANCES_INDOOR[lane] || LANE_DISTANCES_INDOOR[1];
    } else if (trackType === 'road') {
        // For road, one lap equals the entire race distance
        return TRACK_CONSTANTS.TOTAL_DISTANCE || 3000;
    } else {
        // Outdoor track (default)
        return LANE_DISTANCES_OUTDOOR[lane] || LANE_DISTANCES_OUTDOOR[1];
    }
}

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

