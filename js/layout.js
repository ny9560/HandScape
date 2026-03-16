function updateCanvasSize() {
    AppState.canvasElement.width = window.innerWidth;
    AppState.canvasElement.height = window.innerHeight;
}

function initResizeHandler() {
    window.addEventListener('resize', () => {
        updateCanvasSize();
        if (AppState.renderer) {
            AppState.renderer.setSize(window.innerWidth, window.innerHeight);
        }
        if (AppState.camera) {
            AppState.camera.aspect = window.innerWidth / window.innerHeight;
            AppState.camera.updateProjectionMatrix();
        }
    });
}
