import { W, H, COLORS } from '../../constants.js';

export function buildUI(scene) {
  scene.scoreText = scene.add.text(20, 18, `Score: ${scene.score}`, { color: COLORS.text });
  scene.livesText = scene.add.text(20, 42, `Lives: ${scene.lives}`, { color: COLORS.text });
  scene.timerText = scene.add.text(20, 66, `Time: ${scene.timeLeft}`, { color: COLORS.text });
  scene.comboText = scene.add.text(20, 90, `Combo: ${scene.comboCount}`, { color: COLORS.text });

  scene.legendText = scene.add.text(W / 2, H - 22, '😇 = good   |   😈 = bad', {
    fontSize: '14px',
    color: '#666',
  }).setOrigin(0.5);

  scene.pauseBtn = scene.add.text(W - 20, 18, 'PAUSE', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#ff4d8d',
    padding: { x: 12, y: 6 },
  }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

  scene.pauseBtn.on('pointerdown', () => scene.openPauseOverlay());

  scene.toast = scene.add.text(W / 2, H - 46, '', {
    fontSize: '14px',
    color: '#ff4d8d',
  }).setOrigin(0.5);

  buildBowUI(scene);
}

function buildBowUI(scene) {
  const x = W - 95;
  const y = H - 95;

  scene.bowUI = scene.add.container(x, y).setDepth(200);

  const g = scene.add.graphics();

  g.lineStyle(6, 0xff4d8d, 1);
  g.beginPath();
  g.arc(0, 0, 26, Phaser.Math.DegToRad(-70), Phaser.Math.DegToRad(70), false);
  g.strokePath();

  g.lineStyle(3, 0xffffff, 0.9);
  g.lineBetween(-18, -20, -18, 20);

  g.fillStyle(0xff4d8d, 1);
  g.fillCircle(12, 0, 4);

  scene.bowUI.add(g);

  scene.bowBaseRot = -0.25;
  scene.bowUI.rotation = scene.bowBaseRot;
  scene.bowUI.scale = 1.0;

  scene.playBowSwing = () => {
    if (!scene.bowUI) return;

    scene.tweens.killTweensOf(scene.bowUI);

    scene.bowUI.rotation = scene.bowBaseRot;
    scene.bowUI.scale = 1.0;

    scene.tweens.add({
      targets: scene.bowUI,
      rotation: scene.bowBaseRot + 0.55,
      scale: 1.08,
      duration: 70,
      ease: 'Quad.easeOut',
      yoyo: true,
      hold: 25,
    });
  };
}
