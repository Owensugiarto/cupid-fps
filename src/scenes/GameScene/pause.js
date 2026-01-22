// src/scenes/GameScene/pause.js

import { W, H } from '../../constants.js';
import { makeImageButtonInteractive, addHoverScale } from '../../helpers/uiButtons.js';

export function buildPauseOverlay(scene) {
  // Background
  scene.pauseBG = scene.add.image(W / 2, H / 2, 'pause_bg')
    .setDepth(300)
    .setVisible(false);

  scene.pauseBG.setDisplaySize(W, H);
  scene.pauseBG.setInteractive();

  // Buttons
  const baseW = 360;
  const baseH = 300;

  const makeBtn = (x, y, key) => {
    const btn = scene.add.image(x, y, key)
      .setDepth(301)
      .setVisible(false)
      .setOrigin(0.5, 0.5);

    btn.setDisplaySize(baseW, baseH);

    makeImageButtonInteractive(btn, { pixelPerfect: true, alphaTolerance: 1 });
    addHoverScale(scene, btn, { hoverMult: 1.06 });

    return btn;
  };

  const cx = W / 2;
  const cy = H / 2;
  const gap = 92;

  scene.pauseBtns = {
    resume: makeBtn(cx, cy - gap, 'btn_resume'),
    reset:  makeBtn(cx, cy,       'btn_reset'),
    quit:   makeBtn(cx, cy + gap, 'btn_quit'),
  };

  // --- Cupid + simple hearts (always-on, left/right wobble) ---
  // Cupid behind buttons
  scene.pauseCupid = scene.add.image(W - 150, H - 210, 'shootcupid')
    .setDepth(300.7)
    .setScale(0.55)
    .setVisible(false);

  // Hearts near the bow (also behind buttons)
  // Use heart1 + heart3 always (no randomness, no timers)
  const heartDepth = 300.75;

  // Bow-ish offsets (tweak these 2 numbers if needed)
  const bowOffsetX = 40;
  const bowOffsetY = -10;

  scene.pauseHearts = {
    a: scene.add.image(scene.pauseCupid.x + bowOffsetX, scene.pauseCupid.y + bowOffsetY, 'heart1')
      .setDepth(heartDepth)
      .setScale(0.10)
      .setAlpha(0.9)
      .setVisible(false),

    b: scene.add.image(scene.pauseCupid.x + bowOffsetX + 22, scene.pauseCupid.y + bowOffsetY + 18, 'heart3')
      .setDepth(heartDepth)
      .setScale(0.08)
      .setAlpha(0.8)
      .setVisible(false),
  };

  // One simple looping tween per heart (no spawning, no destroying)
  scene.pauseHeartTweens = [
    scene.tweens.add({
      targets: scene.pauseHearts.a,
      x: scene.pauseHearts.a.x - 18,
      y: scene.pauseHearts.a.y - 60,
      angle: -8,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
      paused: true,
    }),
    scene.tweens.add({
      targets: scene.pauseHearts.b,
      x: scene.pauseHearts.b.x - 14,
      y: scene.pauseHearts.b.y - 40,
      angle: 10,
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
      paused: true,
    }),
  ];

  // Button actions
  scene.pauseBtns.resume.on('pointerup', () => {
    if (scene.isPaused) closePauseOverlay(scene);
  });

  scene.pauseBtns.reset.on('pointerup', () => {
    if (!scene.isPaused) return;
    closePauseOverlay(scene, true);
    scene.scene.restart();
  });

  scene.pauseBtns.quit.on('pointerup', () => {
    if (!scene.isPaused) return;
    closePauseOverlay(scene, true);
    scene.scene.start('HomeScene');
  });
}

export function openPauseOverlay(scene) {
  if (scene.isPaused) return;
  scene.isPaused = true;

  if (scene.pauseBtn) scene.pauseBtn.setVisible(false);

  scene.pauseBG.setVisible(true);
  Object.values(scene.pauseBtns).forEach(b => b.setVisible(true));

  // Show cupid + hearts and start their wobble
  if (scene.pauseCupid) scene.pauseCupid.setVisible(true);

  if (scene.pauseHearts) {
    Object.values(scene.pauseHearts).forEach(h => h.setVisible(true));
  }

  if (scene.pauseHeartTweens) {
    scene.pauseHeartTweens.forEach(t => t && (t.paused = false));
  }
}

export function closePauseOverlay(scene, forceHide = false) {
  if (!scene.isPaused && !forceHide) return;

  scene.isPaused = false;

  // Pause the wobble + hide cupid + hearts
  if (scene.pauseHeartTweens) {
    scene.pauseHeartTweens.forEach(t => t && (t.paused = true));
  }

  if (scene.pauseHearts) {
    Object.values(scene.pauseHearts).forEach(h => h.setVisible(false));
  }

  if (scene.pauseCupid) scene.pauseCupid.setVisible(false);

  if (scene.pauseBG) scene.pauseBG.setVisible(false);
  if (scene.pauseBtns) Object.values(scene.pauseBtns).forEach(b => b.setVisible(false));

  if (scene.pauseBtn) scene.pauseBtn.setVisible(true);
}
