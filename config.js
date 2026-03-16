const CONFIG = {
    shape: {
        // type: 'box',
        type: 'sphere',
        // type: 'cone',
        // type: 'torus',
        // type: 'octahedron',
        // type: 'tetrahedron',
        // type: 'icosahedron',
        // type: 'dodecahedron',
        // type: 'cylinder',

        size: 2,
    },

    // Shapes available when cycling with hand gestures
    availableShapes: [
        'sphere',
        'box',
        'icosahedron',
        'dodecahedron',
        'octahedron',
        'tetrahedron',
        'torus',
        'cone',
        'cylinder'
    ],

    // Colors
    initialColor: 0xff00ff,   // Magenta
    wireframeColor: 0xffffff, // White
    fillOpacity: 0.5,         // 0.0 = invisible, 1.0 = solid

    // Color palette used when cycling colors with a hand gesture
    randomColors: [
        0xFF00FF, // Magenta
        0x00FFFF, // Cyan
        0xFF3300, // Neon Orange
        0x39FF14, // Neon Green
        0xFF0099, // Neon Pink
        0x00FF00, // Lime
        0xFF6600, // Neon Orange-Red
        0xFFFF00, // Yellow
        0xFF1493, // Deep Pink
        0x7FFF00, // Chartreuse
        0x00BFFF, // Deep Sky Blue
        0xFF69B4, // Hot Pink
        0x000000,
        0xFFFFFF,
    ],

    rotation: {
        x: 0.001, // Auto-rotation speed on X axis
        y: 0.001, // Auto-rotation speed on Y axis

        handControl: {
            enabled: false,
            smoothing: 0.05,          // 0-1, lower = smoother
            sensitivity: 0.35,
            disableAutoRotation: false // Pause auto-rotation while hand is controlling
        }
    },

    pulse: {
        enabled: true,
        speed: 0.5,
        minOpacity: 0.4,
        maxOpacity: 0.1,
    },
};

// Creates a Three.js geometry based on the config
function createGeometry(config) {
    const size = config.shape.size;

    switch (config.shape.type) {
        case 'box':
            return new THREE.BoxGeometry(size, size, size);

        case 'sphere':
            return new THREE.SphereGeometry(size, 32, 32);

        case 'cone':
            return new THREE.ConeGeometry(size / 2, size, 32);

        case 'torus':
            return new THREE.TorusGeometry(size / 2, size / 5, 16, 100);

        case 'octahedron':
            return new THREE.OctahedronGeometry(size);

        case 'tetrahedron':
            return new THREE.TetrahedronGeometry(size);

        case 'icosahedron':
            return new THREE.IcosahedronGeometry(size);

        case 'dodecahedron':
            return new THREE.DodecahedronGeometry(size);

        case 'cylinder':
            return new THREE.CylinderGeometry(size / 2, size / 2, size, 32);

        default:
            console.warn(`Unknown shape type: ${config.shape.type}, defaulting to box`);
            return new THREE.BoxGeometry(size, size, size);
    }
}

function getRandomColor(config) {
    const colors = config.randomColors;
    return colors[Math.floor(Math.random() * colors.length)];
}
