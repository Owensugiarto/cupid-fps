// src/scenes/GameScene/GameScene.js

import { W, H, COLORS, RULES } from '../../constants.js';

import { buildUI } from './ui.js';
import { buildMap } from './map.js';
import { buildCrosshair } from './crosshair.js';
import { buildPauseOverlay, openPauseOverlay, closePauseOverlay } from './pause.js';
import { initTargets, updateTargets, scheduleNextSpawnBatch } from './targets.js';
import { handlePointerDown, attachEndRound } from './scoring.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    // --- Background (behind everything) ---
    // Change bgOffsetY to move the background up/down without touching everything else.
    const bgOffsetY = 0; // try: -40, -80, +40, etc.

    this.houseBG = this.add.image(W / 2, H / 2 + bgOffsetY, 'house_bg')
      .setOrigin(0.5)
      .setDepth(-100);

    // Fill the canvas
    this.houseBG.setDisplaySize(W, H);

    // If you use a full background image, you typically do NOT need this,
    // but it’s harmless as a fallback color.
    this.cameras.main.setBackgroundColor(COLORS.bgGame);

    this.input.setTopOnly(true);

    this.score = 0;
    this.lives = 3;
    this.timeLeft = RULES.startTime;

    this.comboCount = 0;
    this.currentHitScore = 0;
    this.currentTimeAdd = 0;

    this.isPaused = false;

    attachEndRound(this);

    buildUI(this);
    buildMap(this);
    initTargets(this);
    buildCrosshair(this);
    buildPauseOverlay(this);

    this.input.on('pointermove', (pointer) => {
      if (this.isPaused) return;
      this.drawCrosshair(pointer.x, pointer.y);
    });

    this.input.on('pointerdown', (pointer, currentlyOver) => {
      handlePointerDown(this, pointer, currentlyOver);
    });

    this.timerEvent = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (this.isPaused) return;
        this.timeLeft--;
        this.timerText.setText(`Time: ${this.timeLeft}`);
        if (this.timeLeft <= 0) this.endRound();
      },
    });

    scheduleNextSpawnBatch(this);
  }

  update(time, delta) {
    if (this.isPaused) return;
    updateTargets(this, time, delta);
  }

  openPauseOverlay() {
    openPauseOverlay(this);
  }

  closePauseOverlay(forceHide = false) {
    closePauseOverlay(this, forceHide);
  }
}
