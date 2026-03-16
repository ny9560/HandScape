function calculateDistance(point1, point2) {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    const dz = point1.z - point2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function isHandClosed(landmarks) {
    const palm = landmarks[0];
    const threshold = 0.15;

    return (
        calculateDistance(palm, landmarks[8])  < threshold &&
        calculateDistance(palm, landmarks[12]) < threshold &&
        calculateDistance(palm, landmarks[16]) < threshold &&
        calculateDistance(palm, landmarks[20]) < threshold
    );
}

function isHandOpen(landmarks) {
    const palm = landmarks[0];
    const threshold = 0.22; // higher threshold — must be clearly open to reset

    return (
        calculateDistance(palm, landmarks[8])  > threshold ||
        calculateDistance(palm, landmarks[12]) > threshold ||
        calculateDistance(palm, landmarks[16]) > threshold ||
        calculateDistance(palm, landmarks[20]) > threshold
    );
}

function calculateHandRotation(landmarks) {
    const wrist      = landmarks[0];
    const indexBase  = landmarks[5];
    const pinkyBase  = landmarks[17];
    const middleBase = landmarks[9];

    // Direction from wrist to middle finger base (where the palm faces)
    const palmVector = {
        x: middleBase.x - wrist.x,
        y: middleBase.y - wrist.y,
        z: middleBase.z - wrist.z
    };

    // Direction across the palm (pinky side to index side)
    const crossVector = {
        x: indexBase.x - pinkyBase.x,
        y: indexBase.y - pinkyBase.y,
        z: indexBase.z - pinkyBase.z
    };

    const rotationY = Math.atan2(palmVector.x, -palmVector.z);
    const rotationX = Math.atan2(palmVector.y, Math.sqrt(palmVector.x * palmVector.x + palmVector.z * palmVector.z));
    const rotationZ = Math.atan2(crossVector.y, crossVector.x);

    const s = CONFIG.rotation.handControl.sensitivity;
    return { x: rotationX * s, y: rotationY * s, z: rotationZ * s };
}

