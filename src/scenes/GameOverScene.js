import { W, H, AUDIO } from '../constants.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  init(data) {
    // Receive final score safely
    this.finalScore = data?.finalScore ?? 0;
  }

  create() {
    // ===============================
    // Play Game Over SFX (once)
    // ===============================
    this.gameOverSfx = this.sound.add('game_over', { volume: AUDIO.volGameOver });
    this.gameOverSfx.play();

    // Helper for click sound in this scene
    this.playButtonClick = () => {
      // No stacking spam
      if (!this._btnSfx) {
        this._btnSfx = this.sound.add('button_click', { volume: AUDIO.volButtonClick });
      }
      if (this._btnSfx.isPlaying) this._btnSfx.stop();
      this._btnSfx.play();
    };

    // Clean up on shutdown (optional but safe)
    this.events.once('shutdown', () => {
      if (this.gameOverSfx && this.gameOverSfx.isPlaying) this.gameOverSfx.stop();
      if (this._btnSfx && this._btnSfx.isPlaying) this._btnSfx.stop();
    });

    // ===============================
    // Background UI
    // ===============================
    const bg = this.add.image(W / 2, H / 2, 'gameover_ui')
      .setOrigin(0.5)
      .setDepth(0);

    bg.setDisplaySize(W, H);

    // ===============================
    // Final Score (text over UI)
    // ===============================
    const scoreX = W / 2;
    const scoreY = H / 2 + 50; // tweak if needed

    this.add.text(scoreX, scoreY, String(this.finalScore), {
      fontFamily: 'Georgia, serif',
      fontSize: '34px',
      color: '#6b3e4b',
    })
    .setOrigin(0.5)
    .setDepth(10);

    // ===============================
    // Helper: Hover Button
    // ===============================
    const makeHoverButton = (x, y, key, baseScale, onClick) => {
      const btn = this.add.image(x, y, key)
        .setOrigin(0.5)
        .setScale(baseScale)
        .setDepth(10)
        .setInteractive({ useHandCursor: true });

      // Hover in
      btn.on('pointerover', () => {
        this.tweens.killTweensOf(btn);
        this.tweens.add({
          targets: btn,
          scale: baseScale * 1.08,
          duration: 120,
          ease: 'Sine.Out',
        });
      });

      // Hover out
      btn.on('pointerout', () => {
        this.tweens.killTweensOf(btn);
        this.tweens.add({
          targets: btn,
          scale: baseScale,
          duration: 120,
          ease: 'Sine.Out',
        });
      });

      // Click
      btn.on('pointerup', () => {
        this.playButtonClick();
        onClick();
      });

      return btn;
    };

    // ===============================
    // Buttons
    // ===============================
    const playBtnY = H / 2 + 150;
    const homeBtnY = H / 2 + 230;

    makeHoverButton(W / 2, playBtnY, 'playmenu', 0.20, () => {
      this.scene.start('GameScene');
    });

    makeHoverButton(W / 2, homeBtnY, 'quitbutton', 0.20, () => {
      this.scene.start('HomeScene');
    });
  }
}
