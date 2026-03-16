// Shared mutable state accessible by all modules
const AppState = {
    // DOM elements (set during init)
    videoElement: null,
    canvasElement: null,
    canvasCtx: null,
    threeContainer: null,

    // Three.js objects
    scene: null,
    camera: null,
    renderer: null,
    sphere: null,
    solidMesh: null,
    wireframeMesh: null,

    // Hand tracking flags
    handRotationActive: false,

    // Gesture cooldowns
    lastColorChangeTime: 0,
    lastShapeChangeTime: 0,
    colorChangeDelay: 500,  // ms
    shapeChangeDelay: 500,  // ms

    // Gesture edge detection
    rightFistActive: false,  // true while fist is held, prevents repeat shape cycling

    // Size control
    currentSphereSize: 1.0,
    targetSphereSize: 1.0,
    smoothingFactor: 0.15,

    // Shape cycling
    currentShapeIndex: 0,

    // Hand rotation targets
    targetRotationX: 0,
    targetRotationY: 0,
    targetRotationZ: 0,
    currentRotationX: 0,
    currentRotationY: 0,
    currentRotationZ: 0,
};
