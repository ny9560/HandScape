async function initWebcam() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            facingMode: 'user'
        }
    });

    AppState.videoElement.srcObject = stream;

    return new Promise((resolve) => {
        AppState.videoElement.onloadedmetadata = () => {
            updateCanvasSize();
            resolve(AppState.videoElement);
        };
    });
}
