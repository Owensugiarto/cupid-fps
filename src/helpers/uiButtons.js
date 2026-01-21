// src/helpers/uiButtons.js

/**
 * Make an image button interactive safely.
 * - No custom hit rect (Phaser uses texture bounds + transform correctly)
 * - pixelPerfect handles transparent PNGs correctly
 */
export function makeImageButtonInteractive(obj, {
  pixelPerfect = true,
  alphaTolerance = 1,
  useHandCursor = true
} = {}) {
  obj.setInteractive({
    pixelPerfect,
    alphaTolerance,
    useHandCursor
  });
  return obj;
}

/**
 * Hover scale that does NOT break hit detection.
 * Key points:
 * - Uses the object's current scale as the base (doesn't assume 1)
 * - Never overwrites hit areas
 * - Tween uses relative multipliers
 */
export function addHoverScale(scene, obj, {
  hoverMult = 1.06,
  downMult = 0.98,
  duration = 120
} = {}) {
  const baseX = obj.scaleX;
  const baseY = obj.scaleY;

  let activeTween = null;

  const tweenTo = (mx, my, ms) => {
    if (activeTween) activeTween.stop();
    activeTween = scene.tweens.add({
      targets: obj,
      scaleX: baseX * mx,
      scaleY: baseY * my,
      duration: ms,
      ease: 'Quad.Out',
      onComplete: () => { activeTween = null; }
    });
  };

  obj.on('pointerover', () => tweenTo(hoverMult, hoverMult, duration));
  obj.on('pointerout',  () => tweenTo(1, 1, duration));
  obj.on('pointerdown', () => tweenTo(downMult, downMult, 60));
  obj.on('pointerup',   () => tweenTo(hoverMult, hoverMult, 80));

  return obj;
}

/**
 * Reusable image button creator.
 */
export function createImageButton(scene, x, y, key, {
  baseScale = 1,
  hoverScale = null,          // optional absolute scale override
  hoverMult = 1.08,           // preferred: multiplier
  alphaTolerance = 1,
  onClick = null,
  depth = null,
  visible = true
} = {}) {
  const btn = scene.add.image(x, y, key)
    .setOrigin(0.5, 0.5)
    .setScale(baseScale)
    .setVisible(visible);

  if (depth !== null) btn.setDepth(depth);

  makeImageButtonInteractive(btn, { pixelPerfect: true, alphaTolerance });

  // If caller gave absolute hoverScale, convert it to a multiplier
  const mult = (hoverScale !== null) ? (hoverScale / baseScale) : hoverMult;

  addHoverScale(scene, btn, { hoverMult: mult });

  if (typeof onClick === 'function') {
    btn.on('pointerup', () => onClick(btn));
  }

  return btn;
}
