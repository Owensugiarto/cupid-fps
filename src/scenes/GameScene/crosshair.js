import { W, H } from '../../constants.js';

export function buildCrosshair(scene) {
  scene.crosshair = scene.add.graphics();
  scene.drawCrosshair = (x, y) => drawCrosshair(scene, x, y);
  scene.drawCrosshair(W / 2, H / 2);
}

function drawCrosshair(scene, x, y) {
  scene.crosshair.clear();
  scene.crosshair.lineStyle(2, 0xff0000, 1);
  scene.crosshair.lineBetween(x - 10, y, x + 10, y);
  scene.crosshair.lineBetween(x, y - 10, x, y + 10);
}
