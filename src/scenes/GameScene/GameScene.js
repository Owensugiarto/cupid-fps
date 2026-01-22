// src/scenes/GameScene/GameScene.js

import { W, H, COLORS, RULES, AUDIO } from '../../constants.js';
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
    // --- Background ---
    const bgOffsetY = 0;

    this.houseBG = this.add
      .image(W / 2, H / 2 + bgOffsetY, 'house_bg')
      .setOrigin(0.5)
      .setDepth(-100);

    this.houseBG.setDisplaySize(W, H);

    // --- Gameplay background music ---
    this.gameBgm = this.sound.add('game_bgm', {
      loop: true,
      volume: AUDIO.volGameBgm,
    });

    this.gameBgm.play();
        // --- SFX (create once, reuse; no overlap spam) ---
    this.sfx = {
      shootDevil: this.sound.add('shoot_devil', { volume: AUDIO.volShootDevil }),
      shootAngel: this.sound.add('shoot_angel', { volume: AUDIO.volShootAngel }),
      miss: this.sound.add('miss_or_furniture', { volume: AUDIO.volMiss }),
      buttonClick: this.sound.add('button_click', { volume: AUDIO.volButtonClick }),
      //devilLaugh: this.sound.add('devil_laugh_loop', { loop: true, volume: AUDIO.volDevilLaugh }),
    };

    // simple cooldown store to prevent spam stacking
    this._sfxLastAt = Object.create(null);

    const safePlay = (key, cooldownMs = 60) => {
      const s = this.sfx[key];
      if (!s) return;

      const now = this.time.now;
      const last = this._sfxLastAt[key] ?? -999999;
      if (now - last < cooldownMs) return;
      this._sfxLastAt[key] = now;

      // prevent overlap stacking
      if (s.isPlaying) s.stop();
      s.play();
    };

    // helper methods scoring/UI can call
    this.playShootDevil = () => safePlay('shootDevil', 40);
    this.playShootAngel = () => safePlay('shootAngel', 40);
    this.playMissSfx = () => safePlay('miss', 60);
    this.playButtonClick = () => safePlay('buttonClick', 40);

    // devil laugh control (looped)
    this.ensureDevilLaugh = (shouldPlay) => {
      const s = this.sfx.devilLaugh;
      if (!s) return;

      if (shouldPlay) {
        if (!s.isPlaying) s.play();
      } else {
        if (s.isPlaying) s.stop();
      }
    };


    // Pause / resume safety
    this.events.on('pause', () => {
      if (this.gameBgm) this.gameBgm.pause();
    });

    this.events.on('resume', () => {
      if (this.gameBgm) this.gameBgm.resume();
    });

    // Stop music on scene shutdown
    this.events.once('shutdown', () => {
      if (this.gameBgm) this.gameBgm.stop();
      //if (this.sfx?.devilLaugh && this.sfx.devilLaugh.isPlaying) this.sfx.devilLaugh.stop();
    });


    this.cameras.main.setBackgroundColor(COLORS.bgGame);
    this.input.setTopOnly(true);

    // --- Game state ---
    this.score = 0;
    this.lives = 3;
    this.timeLeft = RULES.startTime;

    this.comboCount = 0;
    this.currentHitScore = 0;
    this.currentTimeAdd = 0;

    this.isPaused = false;

    attachEndRound(this);

    // --- Build systems ---
    buildUI(this);
    buildMap(this);
    initTargets(this);
    buildCrosshair(this);
    buildPauseOverlay(this);

    // --- ESC pause toggle ---
    this.input.keyboard.on('keydown-ESC', () => {
      if (this.isPaused) {
        closePauseOverlay(this);
        if (this.gameBgm) this.gameBgm.resume();
      } else {
        openPauseOverlay(this);
        if (this.gameBgm) this.gameBgm.pause();
      }
    });

    // --- Shooting ---
    this.input.on('pointerdown', (pointer) => {
      handlePointerDown(this, pointer);
    });

    // --- Timer ---
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
