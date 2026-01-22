import { W, H, AUDIO } from '../constants.js';
import { addFloat } from '../helpers/tweens.js';
import { createImageButton } from '../helpers/uiButtons.js';



export class HomeScene extends Phaser.Scene {
  constructor() { super('HomeScene'); }

  create() {
    const bg = this.add.image(W / 2, H / 2, 'home_bg');
    bg.setDisplaySize(W, H);
    // Menu background music
    this.menuBgm = this.sound.add('menu_bgm', {
      loop: true,
      volume: AUDIO.volMenuBgm,
    });
    this.sfx = this.sfx || {};
    this.sfx.buttonClick = this.sound.add('button_click', { volume: AUDIO.volButtonClick });

    this.playButtonClick = () => {
      const s = this.sfx.buttonClick;
      if (!s) return;
      if (s.isPlaying) s.stop();
      s.play();
    };


    this.menuBgm.play();


    const leftCupid = this.add.image(190, 320, 'angel_left').setScale(0.45);
    const rightCupid = this.add.image(770, 430, 'angel_right').setScale(0.45);
    addFloat(this, leftCupid, 10, 1600);
    addFloat(this, rightCupid, 8, 1400);


    const playBase = 0.3;
    createImageButton(this, W / 2, 280, 'btn_play', {
      baseScale: playBase,
      hoverScale: playBase * 1.1,
          onClick: () => {
      this.menuBgm.stop();
      this.scene.start('GameScene');
    },

    });

    const howBase = 0.35;
    createImageButton(this, W / 2, 400, 'btn_how', {
      baseScale: howBase,
      hoverScale: howBase * 1.1,
      onClick: () => this.showHowToPlay(),
    });
  }

showHowToPlay() {
  // dark overlay behind the panel
  const overlay = this.add
    .rectangle(W / 2, H / 2, W, H, 0x000000, 0.45)
    .setDepth(500)
    .setInteractive();

  // the how-to-play image panel
  const panel = this.add
    .image(W / 2, H / 2, 'howtoplay_ui')
    .setDepth(501)
    .setOrigin(0.5);

  // fit nicely inside the screen without guessing exact sizes
  const maxW = W * 0.85;
  const maxH = H * 0.85;
  const scale = Math.min(maxW / panel.width, maxH / panel.height);
  panel.setScale(scale);

  // click anywhere to close
  overlay.on('pointerup', () => {
    panel.destroy();
    overlay.destroy();
  });

  // optional: allow clicking the panel itself too
  panel.setInteractive();
  panel.on('pointerup', () => {
    panel.destroy();
    overlay.destroy();
  });
}

}
