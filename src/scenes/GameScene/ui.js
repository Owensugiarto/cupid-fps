import { W, COLORS } from '../../constants.js';
import { openPauseOverlay } from './pause.js';

export function buildUI(scene) {
  // HUD container (always on top)
  scene.hud = scene.add.container(0, 0).setDepth(1000);

  // ======= HUD PANEL (top-left) =======
  const panelX = 40;
  const panelY = 28;
  const panelW = 260;
  const panelH = 120;

  const panel = scene.add.graphics();
  panel.fillStyle(0x000000, 0.35);
  panel.fillRoundedRect(panelX - 14, panelY - 10, panelW, panelH, 14);
  panel.lineStyle(2, 0xffffff, 0.25);
  panel.strokeRoundedRect(panelX - 14, panelY - 10, panelW, panelH, 14);

  // Text style (bigger + clearer)
  const statStyle = {
    fontFamily: 'Arial',
    fontSize: '22px',
    fontStyle: '700',
    color: '#ffffff',
  };

  scene.scoreText = scene.add.text(panelX, panelY, 'Score: 0', statStyle);
  scene.livesText = scene.add.text(panelX, panelY + 34, 'Lives: ♥♥♥', statStyle);
  scene.timerText = scene.add.text(panelX, panelY + 68, 'Time: 60', statStyle);

  // Combo can be smaller
  // scene.comboText = scene.add.text(panelX, panelY + 98, 'Combo: 0', {
  //   fontFamily: 'Arial',
  //   fontSize: '16px',
  //   fontStyle: '700',
  //   color: '#ffffff',
  // });

  // Add subtle shadow for readability
  for (const t of [scene.scoreText, scene.livesText, scene.timerText]) {
    t.setShadow(2, 2, '#000000', 6, true, true);
  }

  scene.hud.add([panel, scene.scoreText, scene.livesText, scene.timerText]);


  // ======= TOAST (top-center) =======
  scene.toast = scene.add.text(W / 2, 20, '', {
    fontFamily: 'Arial',
    fontSize: '18px',
    fontStyle: '700',
    color: '#ffffff',
    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: { left: 10, right: 10, top: 6, bottom: 6 },
  }).setOrigin(0.5, 0);
  scene.toast.setShadow(2, 2, '#000000', 6, true, true);
  scene.hud.add(scene.toast);

  // ======= FANCY PAUSE BUTTON (top-right) =======
  scene.pauseBtn = buildFancyPauseButton(scene);
  scene.hud.add(scene.pauseBtn);

  // IMPORTANT: removed bow bottom-right and bottom-middle instructions
  // (Nothing else to do; they simply won’t be created anymore.)
}

function buildFancyPauseButton(scene) {
  const btnW = 120;
  const btnH = 42;
  const x = W - 40 - btnW / 2;
  const y = 34;

  const container = scene.add.container(x, y);
  container.setDepth(1100);

  const g = scene.add.graphics();
  const label = scene.add.text(0, 0, 'PAUSE', {
    fontFamily: 'Arial',
    fontSize: '18px',
    fontStyle: '800',
    color: '#ffffff',
  }).setOrigin(0.5);

  label.setShadow(2, 2, '#000000', 6, true, true);

  container.add([g, label]);

  const draw = (state) => {
    g.clear();

    // State colors (no external constants required)
    // normal: soft pink
    // hover: brighter pink
    // down: darker pink
    let fill = 0xff5aa5;
    let alpha = 0.92;
    let strokeAlpha = 0.35;

    if (state === 'hover') {
      fill = 0xff3f98;
      alpha = 0.98;
      strokeAlpha = 0.45;
    }
    if (state === 'down') {
      fill = 0xe12f83;
      alpha = 0.98;
      strokeAlpha = 0.55;
    }

    // button body
    g.fillStyle(fill, alpha);
    g.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 14);

    // outline
    g.lineStyle(2, 0xffffff, strokeAlpha);
    g.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 14);
  };

  draw('normal');

  // Interaction
  container.setSize(btnW, btnH);
  container.setInteractive(
    new Phaser.Geom.Rectangle(-btnW / 2, -btnH / 2, btnW, btnH),
    Phaser.Geom.Rectangle.Contains
  );

  container.on('pointerover', () => draw('hover'));
  container.on('pointerout', () => draw('normal'));
  container.on('pointerdown', () => draw('down'));
  container.on('pointerup', () => {
    draw('hover');
    openPauseOverlay(scene);
  });

  return container;
}
