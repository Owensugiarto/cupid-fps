export function buildCrosshair(scene) {
  // Hide browser cursor over the canvas
  scene.input.setDefaultCursor('none');

  // Crosshair as vector graphics (no PNG)
  scene.crosshair = scene.add.graphics();
  scene.crosshair.setDepth(2000);

  // Config (tweak to match your reference image)
  scene.crosshairCfg = {
    r: 18,            // outer ring radius
    gapAngleDeg: 18,  // gap size in ring at 4 points
    tickLen: 8,       // length of the 4 ticks
    tickGap: 3,       // distance from ring to tick start
    centerSize: 6,    // half-size of the small + (so overall + is 2*centerSize)
    glowWidth: 8,     // outer glow thickness
    mainWidth: 3,     // main stroke thickness
    color: 0x39ff14,  // warm orange
    alphaGlow: 0.18,
    alphaMain: 1.0,
  };

  // Draw function
  function redraw(scale = 1) {
    const cfg = scene.crosshairCfg;
    const r = cfg.r * scale;

    scene.crosshair.clear();

    // Soft glow (draw ring multiple times with thicker stroke)
    scene.crosshair.lineStyle(cfg.glowWidth * scale, cfg.color, cfg.alphaGlow);
    drawRingWithGaps(scene.crosshair, 0, 0, r, cfg.gapAngleDeg);

    // Main ring
    scene.crosshair.lineStyle(cfg.mainWidth * scale, cfg.color, cfg.alphaMain);
    drawRingWithGaps(scene.crosshair, 0, 0, r, cfg.gapAngleDeg);

    // Ticks (top/right/bottom/left)
    scene.crosshair.lineStyle(cfg.mainWidth * scale, cfg.color, cfg.alphaMain);
    const tickStart = r + cfg.tickGap * scale;
    const tickEnd = tickStart + cfg.tickLen * scale;

    // top
    scene.crosshair.beginPath();
    scene.crosshair.moveTo(0, -tickStart);
    scene.crosshair.lineTo(0, -tickEnd);
    scene.crosshair.strokePath();

    // right
    scene.crosshair.beginPath();
    scene.crosshair.moveTo(tickStart, 0);
    scene.crosshair.lineTo(tickEnd, 0);
    scene.crosshair.strokePath();

    // bottom
    scene.crosshair.beginPath();
    scene.crosshair.moveTo(0, tickStart);
    scene.crosshair.lineTo(0, tickEnd);
    scene.crosshair.strokePath();

    // left
    scene.crosshair.beginPath();
    scene.crosshair.moveTo(-tickStart, 0);
    scene.crosshair.lineTo(-tickEnd, 0);
    scene.crosshair.strokePath();

    // Center plus
    const c = cfg.centerSize * scale;
    scene.crosshair.beginPath();
    scene.crosshair.moveTo(-c, 0);
    scene.crosshair.lineTo(c, 0);
    scene.crosshair.moveTo(0, -c);
    scene.crosshair.lineTo(0, c);
    scene.crosshair.strokePath();
  }

  // Helper: ring with 4 small gaps like your screenshot
  function drawRingWithGaps(g, x, y, r, gapDeg) {
    const gap = Phaser.Math.DegToRad(gapDeg);
    const quarter = Math.PI / 2;

    // We draw 4 arcs between the gaps:
    // from (gap/2) to (quarter - gap/2), repeated 4 times.
    for (let i = 0; i < 4; i++) {
      const start = i * quarter + gap / 2;
      const end = (i + 1) * quarter - gap / 2;
      g.beginPath();
      g.arc(x, y, r, start, end, false);
      g.strokePath();
    }
  }

  // Initial draw
  scene.crosshairScale = 1;
  redraw(scene.crosshairScale);

  // Follow pointer
  scene.input.on('pointermove', (pointer) => {
    scene.crosshair.x = pointer.x;
    scene.crosshair.y = pointer.y;
  });

  // Click “kick” (scale down briefly)
  scene.input.on('pointerdown', () => {
    // scale down
    scene.crosshairScale = 0.90;
    redraw(scene.crosshairScale);

    // return to normal
    scene.time.delayedCall(60, () => {
      scene.crosshairScale = 1;
      redraw(scene.crosshairScale);
    });
  });
}
