async function initMediaPipeHands() {
    const hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    await hands.initialize();
    return hands;
}

function drawLandmarks(landmarks, isLeft) {
    const { canvasCtx, canvasElement } = AppState;
    const screenSize = Math.min(window.innerWidth, window.innerHeight);
    const lineWidth = Math.max(2, Math.min(5, screenSize / 300));
    const pointSize = Math.max(2, Math.min(8, screenSize / 250));

    const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4],        // Thumb
        [0, 5], [5, 6], [6, 7], [7, 8],         // Index
        [0, 9], [9, 10], [10, 11], [11, 12],    // Middle
        [0, 13], [13, 14], [14, 15], [15, 16],  // Ring
        [0, 17], [17, 18], [18, 19], [19, 20],  // Pinky
        [0, 5], [5, 9], [9, 13], [13, 17]       // Palm
    ];

    const handColor = isLeft ? '#00FF00' : '#00FFFF';

    canvasCtx.lineWidth = lineWidth;
    canvasCtx.strokeStyle = handColor;

    connections.forEach(([i, j]) => {
        const s = landmarks[i];
        const e = landmarks[j];
        canvasCtx.beginPath();
        canvasCtx.moveTo(s.x * canvasElement.width, s.y * canvasElement.height);
        canvasCtx.lineTo(e.x * canvasElement.width, e.y * canvasElement.height);
        canvasCtx.stroke();
    });

    landmarks.forEach((lm, i) => {
        canvasCtx.fillStyle = (i === 4 || i === 8) ? '#FF0000' : handColor;
        canvasCtx.beginPath();
        canvasCtx.arc(lm.x * canvasElement.width, lm.y * canvasElement.height, pointSize * 1.2, 0, 2 * Math.PI);
        canvasCtx.fill();
    });
}

function onResults(results) {
    const { canvasCtx, canvasElement } = AppState;

    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (canvasElement.width !== window.innerWidth || canvasElement.height !== window.innerHeight) {
        updateCanvasSize();
    }

    AppState.handRotationActive = false;

    const hint = document.getElementById('hands-hint');
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
        if (hint) hint.classList.add('visible');
        return;
    }
    if (hint) hint.classList.remove('visible');

    results.multiHandLandmarks.forEach((landmarks, i) => {
        const isLeftHand = results.multiHandedness[i].label === 'Left';
        drawLandmarks(landmarks, isLeftHand);
        isLeftHand ? _handleLeftHand(landmarks) : _handleRightHand(landmarks);
    });
}

function _handleRightHand(landmarks) {
    if (isHandClosed(landmarks)) {
        // Right fist: cycle shapes (once per fist, with cooldown backup)
        const now = Date.now();
        if (!AppState.rightFistActive && now - AppState.lastShapeChangeTime > 600) {
            AppState.rightFistActive = true;
            AppState.lastShapeChangeTime = now;
            AppState.currentShapeIndex = (AppState.currentShapeIndex + 1) % CONFIG.availableShapes.length;
            changeShape(CONFIG.availableShapes[AppState.currentShapeIndex]);
        }
    } else if (isHandOpen(landmarks)) {
        AppState.rightFistActive = false;
    }
}

function _handleLeftHand(landmarks) {
    if (isHandClosed(landmarks)) {
        // Left fist: random color (with cooldown)
        const now = Date.now();
        if (now - AppState.lastColorChangeTime > AppState.colorChangeDelay) {
            if (AppState.solidMesh) {
                AppState.solidMesh.material.color.setHex(getRandomColor(CONFIG));
            }
            AppState.lastColorChangeTime = now;
        }
    } else {
        // Left open: pinch to resize
        const pinchDist = calculateDistance(landmarks[4], landmarks[8]);
        if (pinchDist < 0.05) {
            AppState.targetSphereSize = 0.2;
        } else if (pinchDist > 0.25) {
            AppState.targetSphereSize = 2.0;
        } else {
            AppState.targetSphereSize = 0.2 + (pinchDist - 0.05) * (2.0 - 0.2) / (0.25 - 0.05);
        }
        AppState.currentSphereSize += (AppState.targetSphereSize - AppState.currentSphereSize) * AppState.smoothingFactor;
        if (AppState.sphere) {
            AppState.sphere.scale.setScalar(AppState.currentSphereSize);
        }
    }
}
