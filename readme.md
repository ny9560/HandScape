# Leviosa

> *Wingardium Leviosa, but make it WebGL.*

Control and sculpt 3D shapes in real time using just your hands — no wand required. Built with MediaPipe hand tracking and Three.js.

## Demo

<!-- Add your live demo link here once deployed -->

## Features

- Real-time hand tracking via MediaPipe Hands (runs entirely in the browser)
- Left fist — cycle through shapes
- Right hand open — pinch to resize
- Right fist — randomise the color
- Configurable shapes, colors, and animation via `config.js`

## Requirements

- Modern browser with WebGL support
- Webcam access
- No installs needed — runs entirely in the browser

## Technologies

- [Three.js](https://threejs.org/) — 3D rendering
- [MediaPipe Hands](https://mediapipe.dev/) — hand tracking and landmark detection
- Vanilla JavaScript, HTML5 Canvas, WebRTC

## Setup

```bash
git clone https://github.com/LakshAgrawal28/Leviosa
cd Leviosa
python -m http.server
```

Open `http://localhost:8000` in your browser.

## Project Structure

```
config.js        — shape, color, and animation settings
style.css        — all styles
js/
  state.js       — shared app state
  layout.js      — canvas sizing and resize handling
  webcam.js      — webcam initialisation
  gestures.js    — gesture math (fist, pinch, rotation)
  scene.js       — Three.js scene, shapes, animation loop
  mediapipe.js   — MediaPipe setup, landmark drawing, hand logic
  main.js        — entry point
docs/
  CONTROLS.md          — gesture reference
  TECHNICAL_DOCUMENTATION.md — architecture and implementation notes
```

## License

MIT — see [LICENSE](LICENSE).

## Credits

Based on [threejs-handtracking-101](https://github.com/collidingScopes/threejs-handtracking-101) by Alan (collidingScopes), released under MIT License.
