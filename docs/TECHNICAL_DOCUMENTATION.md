# Technical Documentation: Hand Tracking 3D Interactive Application

## Table of Contents

1. [Technology Stack](#technology-stack)
2. [Architecture Overview](#architecture-overview)
3. [Core Technologies Explained](#core-technologies-explained)
4. [Application Flow](#application-flow)
5. [Key Components](#key-components)
6. [Hand Gesture Detection Logic](#hand-gesture-detection-logic)
7. [3D Graphics Pipeline](#3d-graphics-pipeline)
8. [Performance Considerations](#performance-considerations)

---

## Technology Stack

### Frontend

- **HTML5** - Structure and layout
- **CSS3** - Styling and positioning
- **Vanilla JavaScript** - Application logic (no frameworks)

### 3D Graphics

- **Three.js (r128)** - WebGL-based 3D rendering library
  - Handles scene creation, camera, renderer, geometries, materials
  - Provides high-level abstractions over WebGL

### Computer Vision

- **MediaPipe Hands** - Google's ML solution for hand tracking
  - Real-time hand landmark detection (21 points per hand)
  - Runs in-browser using TensorFlow.js under the hood
  - Detects up to 2 hands simultaneously

### Media APIs

- **WebRTC getUserMedia** - Accesses the webcam feed
- **Canvas API** - 2D drawing for hand landmark visualization

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    User's Webcam                        │
└────────────────────┬────────────────────────────────────┘
                     │ Video Stream
                     ▼
┌─────────────────────────────────────────────────────────┐
│              MediaPipe Hands Engine                     │
│  • Detects hands in video frames                        │
│  • Extracts 21 3D landmarks per hand                    │
│  • Identifies left/right handedness                     │
└────────────────────┬────────────────────────────────────┘
                     │ Hand Landmarks Data
                     ▼
┌─────────────────────────────────────────────────────────┐
│           Gesture Recognition Logic                     │
│  • Fist detection (distance calculations)               │
│  • Pinch detection (thumb-index distance)               │
│  • Hand rotation tracking (orientation vectors)         │
│  • Cooldown timers for gesture stability                │
└────────────────────┬────────────────────────────────────┘
                     │ Gesture Events
                     ▼
┌─────────────────────────────────────────────────────────┐
│              3D Scene Controller                        │
│  • Shape morphing (geometry swapping)                   │
│  • Color changes (material updates)                     │
│  • Size scaling (transform operations)                  │
└────────────────────┬────────────────────────────────────┘
                     │ Render Commands
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Three.js Renderer                          │
│  • WebGL rendering pipeline                             │
│  • Animation loop (60 FPS)                              │
│  • Continuous rotation & pulse effects                  │
└────────────────────┬────────────────────────────────────┘
                     │ Rendered Frames
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 Browser Display                         │
│  • Mirrored webcam feed (background)                    │
│  • Hand landmarks overlay (2D canvas)                   │
│  • 3D object (Three.js canvas)                          │
└─────────────────────────────────────────────────────────┘
```

---

## Core Technologies Explained

### 1. MediaPipe Hands

MediaPipe uses ML models to detect and track hands in real-time. It provides 21 landmark points per hand (fingertips, knuckles, palm, wrist), each with normalized (x, y, z) coordinates in [0, 1].

Detection works in two stages:
1. A lightweight CNN detects palm regions
2. A second model predicts the 21 3D landmarks within each detected palm
3. Previous frame data is used to speed up tracking in subsequent frames

**Landmark indices:**
```
0:  Wrist
1-4:  Thumb (base to tip)
5-8:  Index finger (base to tip)
9-12: Middle finger (base to tip)
13-16: Ring finger (base to tip)
17-20: Pinky (base to tip)
```

**Configuration:**
```javascript
hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,          // 0=lite, 1=full
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});
```

### 2. Three.js 3D Graphics

**Scene graph structure:**
```
Scene
├── Camera (PerspectiveCamera)
│   └── FOV: 75°, Aspect: window ratio, Near: 0.1, Far: 1000
├── Ambient Light (white, intensity 1.0)
└── Group (shape object)
    ├── Solid Mesh (colored fill with transparency)
    └── Wireframe Mesh (white outline)
```

**Rendering pipeline:**
1. **Scene** - Container for all 3D objects
2. **Camera** - Defines viewpoint (positioned at z=5)
3. **Renderer** - WebGL renderer with transparent background
4. **Animation Loop** - `requestAnimationFrame()` for 60 FPS updates

**Materials used:**
- `MeshBasicMaterial` with `transparent: true` and `opacity: 0.5` for the colored fill
- `MeshBasicMaterial` with `wireframe: true` for the white outline

### 3. WebRTC Media Capture

```javascript
navigator.mediaDevices.getUserMedia({
    video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        facingMode: 'user'
    }
})
```

High resolution is requested because it improves hand detection accuracy. MediaPipe downsamples internally for processing, so the overhead is minimal.

---

## Application Flow

### Initialization Sequence

1. **DOM Ready** (`DOMContentLoaded` event)
2. **Request Webcam Access** → `initWebcam()`
3. **Initialize Three.js Scene** → `initThreeJS()`
4. **Load MediaPipe Models** → `initMediaPipeHands()`
5. **Start Camera Processing Loop** → `camera.start()`
6. **Begin Animation Loop** → `animate()`

### Per-Frame Processing Loop

```
Every Frame (~60 FPS):
├── Camera captures video frame
├── MediaPipe processes frame → detects hands
├── onResults() callback triggered
│   ├── Clear 2D canvas
│   ├── For each detected hand:
│   │   ├── Determine handedness (left/right)
│   │   ├── Draw landmarks on 2D canvas
│   │   ├── Detect gestures (fist, pinch)
│   │   ├── Update 3D object (shape, color, size)
│   │   └── Apply cooldown timers
│   └── If no hands: (do nothing)
├── animate() function runs
│   ├── Update rotation
│   ├── Update pulse effect
│   └── Render Three.js scene
└── Loop continues
```

---

## Key Components

### 1. Configuration System (`config.js`)

Centralized settings for easy customization:

```javascript
CONFIG = {
    shape: { type, size },
    availableShapes: [...],
    initialColor: 0xff00ff,
    wireframeColor: 0xffffff,
    fillOpacity: 0.5,
    randomColors: [...],
    rotation: {
        x, y,
        handControl: { enabled, smoothing, sensitivity, disableAutoRotation }
    },
    pulse: { enabled, speed, minOpacity, maxOpacity }
}
```

### 2. Geometry Factory (`createGeometry()`)

Dynamically creates Three.js geometries based on config:

```javascript
function createGeometry(config) {
    switch (config.shape.type) {
        case 'sphere': return new THREE.SphereGeometry(size, 32, 32);
        case 'box': return new THREE.BoxGeometry(size, size, size);
        // ... other shapes
    }
}
```

Geometry parameters (higher segment counts = smoother appearance):
- **Sphere**: `(radius, widthSegments, heightSegments)`
- **Box**: `(width, height, depth)`
- **Torus**: `(radius, tube, radialSegments, tubularSegments)`

### 3. Shape Morphing (`changeShape()`)

Three.js geometries are immutable, so shape changes require replacing the entire object:

```javascript
function changeShape(newShapeType) {
    scene.remove(sphere);

    const geometry = createGeometry(CONFIG);

    sphere = new THREE.Group();
    solidMesh = new THREE.Mesh(geometry, solidMaterial);
    wireframeMesh = new THREE.Mesh(geometry, wireframeMaterial);

    // Preserve color and scale, then re-add to scene
    scene.add(sphere);
}
```

This approach is fast enough for real-time interaction and keeps material properties intact.

---

## Hand Gesture Detection Logic

### 1. Fist Detection (`isHandClosed()`)

Calculates the 3D Euclidean distance from the palm (landmark 0) to each fingertip. If all distances fall below a threshold, the hand is considered closed.

```javascript
function isHandClosed(landmarks) {
    const palmBase = landmarks[0];
    const fingerTips = [4, 8, 12, 16, 20];

    distances = fingerTips.map(tip =>
        calculateDistance(palmBase, landmarks[tip])
    );

    return all(distances < 0.15);
}
```

The threshold of 0.15 is empirically tuned for normalized coordinates. Open hand fingertips are typically > 0.15 from the palm; closed fist fingertips < 0.15.

**Distance calculation:**
```javascript
function calculateDistance(point1, point2) {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    const dz = point1.z - point2.z;
    return Math.sqrt(dx*dx + dy*dy + dz*dz);
}
```

### 2. Pinch Detection (Size Control)

Maps the distance between thumb tip and index tip to an object scale:

```javascript
const pinchDistance = calculateDistance(thumbTip, indexTip);

if (pinchDistance < 0.05) {
    targetSize = 0.2;
} else if (pinchDistance > 0.25) {
    targetSize = 2.0;
} else {
    targetSize = lerp(0.2, 2.0, (pinchDistance - 0.05) / 0.2);
}

// Exponential moving average for smooth transitions
currentSize = currentSize + (targetSize - currentSize) * 0.15;
```

### 3. Gesture Cooldown System

Hand detection runs at 30-60 FPS, which would cause rapid repeated triggers without throttling. A time-based cooldown prevents this:

```javascript
let lastShapeChangeTime = 0;
const shapeChangeDelay = 500;

if (gestureDetected) {
    const currentTime = Date.now();
    if (currentTime - lastShapeChangeTime > shapeChangeDelay) {
        changeShape();
        lastShapeChangeTime = currentTime;
    }
}
```

### 4. Hand Rotation Control

Maps hand orientation to 3D object rotation:

```javascript
function calculateHandRotation(landmarks) {
    const wrist = landmarks[0];
    const indexBase = landmarks[5];
    const pinkyBase = landmarks[17];
    const middleBase = landmarks[9];

    // Direction from wrist to middle finger base
    const palmVector = {
        x: middleBase.x - wrist.x,
        y: middleBase.y - wrist.y,
        z: middleBase.z - wrist.z
    };

    // Direction across the palm (pinky to index)
    const crossVector = {
        x: indexBase.x - pinkyBase.x,
        y: indexBase.y - pinkyBase.y,
        z: indexBase.z - pinkyBase.z
    };

    const rotationY = Math.atan2(palmVector.x, -palmVector.z);  // yaw
    const rotationX = Math.atan2(palmVector.y, ...);            // pitch
    const rotationZ = Math.atan2(crossVector.y, crossVector.x); // roll

    return { x, y, z } * sensitivity;
}
```

Smooth interpolation is applied to prevent jitter:
```javascript
currentRotationX += (targetRotationX - currentRotationX) * smoothing;
```

When the left hand is removed, auto-rotation resumes (if enabled in config).

---

## 3D Graphics Pipeline

### 1. Dual-Mesh Rendering

Two meshes in a single group create the neon wireframe aesthetic:

```javascript
sphere = new THREE.Group();
sphere.add(solidMesh);      // Colored, semi-transparent fill
sphere.add(wireframeMesh);  // White, opaque outline
```

### 2. Animation Loop

```javascript
function animate() {
    requestAnimationFrame(animate);  // Syncs with browser repaint (~60 Hz)

    // Rotation
    sphere.rotation.x += CONFIG.rotation.x;
    sphere.rotation.y += CONFIG.rotation.y;

    // Pulsing opacity
    if (CONFIG.pulse.enabled) {
        const time = Date.now() * 0.001;
        const pulse = Math.sin(time * CONFIG.pulse.speed);
        solidMesh.material.opacity = minOpacity + pulse * variation;
    }

    renderer.render(scene, camera);
}
```

`requestAnimationFrame` pauses when the tab is inactive, saving CPU and battery.

### 3. Coordinate System Mirroring

The webcam feed is mirrored for natural interaction, and the 2D canvas that overlays hand landmarks is mirrored to match:

```css
#webcam { transform: scaleX(-1); }
#canvas { transform: scaleX(-1); }
```

The Three.js scene is not mirrored and uses standard coordinates.

---

## Performance Considerations

### MediaPipe

- `modelComplexity: 0` (Lite): faster, less accurate
- `modelComplexity: 1` (Full): slower, more accurate — current setting
- MediaPipe uses Web Workers internally and doesn't block the main thread

### Three.js Rendering

`SphereGeometry(radius, 32, 32)` produces 1024 faces — a reasonable balance between smoothness and performance. Only the solid mesh uses transparency, keeping the number of alpha-sorted render passes low.

### Canvas Layering

Three layers overlap using `position: absolute`:

1. `<video>` — Webcam feed (GPU-accelerated)
2. `<canvas>` — 2D hand landmarks (CPU-rendered)
3. Three.js canvas — 3D scene (GPU via WebGL)

Canvas layers use `pointer-events: none` so they don't capture mouse/touch input.

### Memory Management

When changing shapes, the old geometry should be disposed to avoid memory leaks (not currently implemented):

```javascript
// Best practice:
oldGeometry.dispose();
oldMaterial.dispose();
```

---

## Customization

### Adding new shapes

```javascript
// In config.js
availableShapes: [..., 'newShape']

// In createGeometry()
case 'newShape': return new THREE.NewGeometry(...);
```

### Adjusting gesture sensitivity

```javascript
const threshold = 0.15;       // Lower = easier to trigger fist
const shapeChangeDelay = 500; // Higher = slower shape cycling
```

### Changing animation speed

```javascript
rotation: { x: 0.001, y: 0.001 }
pulse: { speed: 0.5 }
```

### Adding new gestures

- Peace sign: check if index and middle tips are extended while others are curled
- Thumbs up: check thumb tip position relative to other fingers
- Pointing: check if only the index finger is extended

---

## Data Flow Summary

```
Webcam → MediaPipe → Landmarks → Gesture Detection → 3D Updates → Render
  ↓         ↓           ↓              ↓                 ↓           ↓
1920x1080  ML Model   21 points    isHandClosed()   changeShape()  WebGL
30-60 FPS  TensorFlow  (x,y,z)     calculateDist()  material.color  60 FPS
```

---

## Learning Resources

- Three.js docs: https://threejs.org/docs/
- MediaPipe Hands: https://google.github.io/mediapipe/solutions/hands
- WebGL fundamentals: https://webglfundamentals.org/
- Hand landmark paper: https://arxiv.org/abs/2006.10214

---

## Common Issues

**Hand detection is laggy**
Lower `modelComplexity` to 0 or reduce video resolution.

**Gestures trigger too easily**
Increase the threshold in `isHandClosed()` or increase cooldown delays.

**3D object doesn't appear**
Check the browser console for WebGL errors and make sure Three.js loaded correctly.

**Webcam permission denied**
Check browser settings. The page must be served over HTTPS or localhost.
