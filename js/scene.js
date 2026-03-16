function initThreeJS() {
    AppState.scene = new THREE.Scene();

    AppState.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    AppState.camera.position.z = 5;

    AppState.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    AppState.renderer.setSize(window.innerWidth, window.innerHeight);
    AppState.renderer.setClearColor(0x000000, 0);
    AppState.threeContainer.appendChild(AppState.renderer.domElement);

    _buildMeshes(createGeometry(CONFIG), CONFIG.initialColor);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    AppState.scene.add(ambientLight);

    animate();
}

function changeShape(newShapeType) {
    if (!AppState.sphere) return;

    AppState.scene.remove(AppState.sphere);

    CONFIG.shape.type = newShapeType;
    const currentColor = AppState.solidMesh
        ? AppState.solidMesh.material.color.getHex()
        : CONFIG.initialColor;

    _buildMeshes(createGeometry(CONFIG), currentColor);
    AppState.sphere.scale.setScalar(AppState.currentSphereSize);
}

function animate() {
    requestAnimationFrame(animate);

    if (AppState.sphere) {
        if (AppState.handRotationActive && CONFIG.rotation.handControl.enabled) {
            const sm = CONFIG.rotation.handControl.smoothing;
            AppState.currentRotationX += (AppState.targetRotationX - AppState.currentRotationX) * sm;
            AppState.currentRotationY += (AppState.targetRotationY - AppState.currentRotationY) * sm;
            AppState.currentRotationZ += (AppState.targetRotationZ - AppState.currentRotationZ) * sm;

            AppState.sphere.rotation.x = AppState.currentRotationX;
            AppState.sphere.rotation.y = AppState.currentRotationY;
            AppState.sphere.rotation.z = AppState.currentRotationZ;
        } else if (!CONFIG.rotation.handControl.disableAutoRotation || !CONFIG.rotation.handControl.enabled) {
            AppState.sphere.rotation.x += CONFIG.rotation.x;
            AppState.sphere.rotation.y += CONFIG.rotation.y;
        }

        if (CONFIG.pulse.enabled && AppState.solidMesh) {
            const t = Date.now() * 0.001;
            const pulse = 0.1 * Math.sin(t * CONFIG.pulse.speed) + 0.9;
            AppState.solidMesh.material.opacity = CONFIG.pulse.minOpacity + CONFIG.pulse.maxOpacity * pulse;
        }
    }

    AppState.renderer.render(AppState.scene, AppState.camera);
}

// Internal helper — creates the Group with solid + wireframe meshes
function _buildMeshes(geometry, color) {
    AppState.sphere = new THREE.Group();

    AppState.solidMesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: CONFIG.fillOpacity
    }));
    AppState.sphere.add(AppState.solidMesh);

    AppState.wireframeMesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
        color: CONFIG.wireframeColor,
        wireframe: true,
    }));
    AppState.sphere.add(AppState.wireframeMesh);

    AppState.scene.add(AppState.sphere);
}
