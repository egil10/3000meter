// Configuration and Constants

// Track geometry constants
const TRACK_CONSTANTS = {
    LANE_WIDTH: 1.22, // meters
    STRAIGHT_LENGTH: 84.39, // meters
    CURVE_RADIUS_LANE1: 36.5, // meters
    TOTAL_DISTANCE: 3000, // meters (default, will be updated)
    LAPS: 7.5
};

// Standard race distances
const STANDARD_DISTANCES = {
    100: 100,
    200: 200,
    400: 400,
    800: 800,
    1500: 1500,
    3000: 3000,
    5000: 5000,
    10000: 10000,
    // British/Imperial distances in meters
    1609.344: 1609.344,      // 1 Mile
    3218.688: 3218.688,      // 2 Miles
    4828.032: 4828.032,      // 3 Miles
    8046.72: 8046.72,        // 5 Miles
    16093.44: 16093.44,      // 10 Miles
    // Other common distances
    1000: 1000,              // 1km
    2000: 2000,              // 2km
    21097.5: 21097.5,        // Half Marathon
    42195: 42195             // Marathon
};

// Lane distances (precomputed)
const LANE_DISTANCES = {
    1: 400.0,
    2: 407.04,
    3: 414.08,
    4: 421.12,
    5: 428.16,
    6: 435.20,
    7: 442.24,
    8: 449.28
};

// Translations
const translations = {
    en: {
        title: "3000METER.com",
        race_setup: "Race Setup",
        target_time: "Target Time (mm:ss)",
        lane: "Lane",
        pacing_strategy: "Pacing Strategy",
        even: "Even",
        neg5p: "-5%",
        pos5p: "+5%",
        kick600: "Kick 600m",
        calculate: "Calculate",
        splits: "Splits",
        lap: "Lap",
        distance: "Distance",
        time: "Time",
        progress: "Progress",
        race_distance: "Race Distance",
        pace_chart: "Pace Chart",
        intervals: "Intervals",
        interval_training: "Interval Training Planner",
        target_pace: "Target Pace (mm:ss/km)",
        progression_type: "Progression Type",
        linear: "Linear",
        exponential: "Exponential",
        sigmoid: "Sigmoid",
        pace_change: "Pace Change per 400m (seconds)",
        start_pace: "Start Pace",
        end_pace: "End Pace",
        chart: "Chart",
        progressive: "Progressive"
    },
    no: {
        title: "3000METER.com",
        race_setup: "Løps Oppsett",
        target_time: "Måltid (mm:ss)",
        lane: "Bane",
        pacing_strategy: "Tempo Strategi",
        even: "Jevnt",
        neg5p: "-5%",
        pos5p: "+5%",
        kick600: "Sprint 600m",
        calculate: "Beregn",
        splits: "Deltider",
        lap: "Runde",
        distance: "Distanse",
        time: "Tid",
        progress: "Framgang",
        race_distance: "Løpsdistanse",
        pace_chart: "Tempo Graf",
        intervals: "Intervaller",
        interval_training: "Intervall Treningsplanlegger",
        target_pace: "Mål Tempo (mm:ss/km)",
        progression_type: "Progresjonstype",
        linear: "Lineær",
        exponential: "Eksponentiell",
        sigmoid: "Sigmoid",
        pace_change: "Tempoendring per 400m (sekunder)",
        start_pace: "Start Tempo",
        end_pace: "Slutt Tempo",
        chart: "Graf",
        progressive: "Progresiv"
    }
};

