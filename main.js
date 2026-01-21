// ===================== Cupid FPS (FINAL COPY/PASTE) =====================

const W = 960;
const H = 540;

const COLORS = {
  bgHome: 0xffeef6,
  bgGame: 0xfff0f6,
  floor: 0xffc1d9,
  stair: 0xffa6c8,
  furniture: 0xff7fb0,
  furnitureOutline: 0xff4d8d,
  text: '#222',
  accent: '#ff4d8d',
};

const RULES = {
  startTime: 60,
  missTimePenalty: 5,
  missLifePenalty: 1,
  fakeHitScorePenalty: 1000,
  baseHitScore: 100,

  spawnIntervalMinMs: 2000,
  spawnIntervalMaxMs: 3000,
  spawnBatchMin: 2,
  spawnBatchMax: 3,

  targetLifeMinMs: 2500,
  targetLifeMaxMs: 6500,

  speedMin: 70,
  speedMax: 160,
  directionChangeMinMs: 700,
  directionChangeMaxMs: 1600,

  stairUseChance: 0.45,
  fakeChancePercent: 50,
};

// ---------------------- Helpers ----------------------
// IMPORTANT: does NOT call setInteractive (so it won't overwrite custom hit areas)
function addHoverScale(scene, obj, baseScale = 1, hoverScale = 1.08) {
  obj.on('pointerover', () => {
    scene.tweens.killTweensOf(obj);
    scene.tweens.add({ targets: obj, scale: hoverScale, duration: 120, ease: 'Quad.easeOut' });
  });

  obj.on('pointerout', () => {
    scene.tweens.killTweensOf(obj);
    scene.tweens.add({ targets: obj, scale: baseScale, duration: 120, ease: 'Quad.easeOut' });
  });

  obj.on('pointerdown', () => {
    scene.tweens.killTweensOf(obj);
    scene.tweens.add({ targets: obj, scale: baseScale * 0.98, duration: 60, ease: 'Quad.easeOut' });
  });

  obj.on('pointerup', () => {
    scene.tweens.killTweensOf(obj);
    scene.tweens.add({ targets: obj, scale: hoverScale, duration: 80, ease: 'Quad.easeOut' });
  });

  return obj;
}

function addFloat(scene, obj, amplitude = 8, duration = 1500) {
  scene.tweens.add({
    targets: obj,
    y: obj.y - amplitude,
    duration,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });
}

// Make a button clickable using its visible size (after scale)
function setDisplayHitbox(obj) {
  obj.setInteractive(
    new Phaser.Geom.Rectangle(
      -obj.displayWidth / 2,
      -obj.displayHeight / 2,
      obj.displayWidth,
      obj.displayHeight
    ),
    Phaser.Geom.Rectangle.Contains
  );
  obj.input.cursor = 'pointer';
  return obj;
}

// ---------------------- Preload ----------------------
class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    // Home UI
    this.load.image('home_bg', 'assets/ui/menuui.png');
    this.load.image('angel_left', 'assets/ui/angelleft.png');
    this.load.image('angel_right', 'assets/ui/angelright.png');
    this.load.image('btn_play', 'assets/ui/playmenunoribbon.png');
    this.load.image('btn_how', 'assets/ui/howtoplaybutton.png');

    // Pause UI
    this.load.image('pause_bg', 'assets/ui/pauseui.png');
    this.load.image('btn_resume', 'assets/ui/resumebutton.png');
    this.load.image('btn_reset', 'assets/ui/resetbutton.png');
    this.load.image('btn_home', 'assets/ui/homebutton.png');
    this.load.image('btn_quit', 'assets/ui/quitbutton.png');
  }

  create() {
    this.scene.start('HomeScene');
  }
}

// ---------------------- Home ----------------------
class HomeScene extends Phaser.Scene {
  constructor() {
    super('HomeScene');
  }

  create() {
    // Background
    const bg = this.add.image(W / 2, H / 2, 'home_bg');
    bg.setDisplaySize(W, H);

    // Cupids
    const leftCupid = this.add.image(190, 320, 'angel_left').setScale(0.45);
    const rightCupid = this.add.image(770, 430, 'angel_right').setScale(0.45);
    addFloat(this, leftCupid, 10, 1600);
    addFloat(this, rightCupid, 8, 1400);

    // PLAY
    const playBase = 0.3;
    const playBtn = this.add.image(W / 2, 280, 'btn_play').setScale(playBase);
    setDisplayHitbox(playBtn);
    addHoverScale(this, playBtn, playBase, playBase * 1.1);
    playBtn.on('pointerup', () => this.scene.start('GameScene'));

    // HOW TO PLAY
    const howBase = 0.35;
    const howBtn = this.add.image(W / 2, 400, 'btn_how').setScale(howBase);
    setDisplayHitbox(howBtn);
    addHoverScale(this, howBtn, howBase, howBase * 1.1);
    howBtn.on('pointerup', () => this.showHowToPlay());
  }

  showHowToPlay() {
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.45).setDepth(500);

    const panel = this.add
      .rectangle(W / 2, H / 2, 680, 320, 0xffeef6, 1)
      .setStrokeStyle(3, 0xffd8e4)
      .setDepth(501);

    const text = this.add
      .text(W / 2, H / 2, 'Shoot the correct targets.\nAvoid the wrong ones.\nScore as high as possible!', {
        fontSize: '22px',
        color: '#6b3e4b',
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(502);

    overlay.setInteractive();
    overlay.on('pointerup', () => {
      overlay.destroy();
      panel.destroy();
      text.destroy();
    });
  }
}

// ---------------------- Game Over ----------------------
class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  init(data) {
    this.finalScore = data?.finalScore ?? 0;
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.bgHome);

    this.add.text(W / 2, 190, 'Game Over', {
      fontSize: '56px',
      color: COLORS.accent,
    }).setOrigin(0.5);

    this.add.text(W / 2, 270, `Final Score: ${this.finalScore}`, {
      fontSize: '28px',
      color: '#333',
    }).setOrigin(0.5);

    const playAgain = this.add.text(W / 2, 350, 'PLAY AGAIN', {
      fontSize: '28px',
      color: '#ffffff',
      backgroundColor: '#ff4d8d',
      padding: { x: 18, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    playAgain.on('pointerdown', () => this.scene.start('GameScene'));

    const homeBtn = this.add.text(W / 2, 410, 'HOME', {
      fontSize: '22px',
      color: '#ffffff',
      backgroundColor: '#ff7fb0',
      padding: { x: 18, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    homeBtn.on('pointerdown', () => this.scene.start('HomeScene'));
  }
}

// ---------------------- Game ----------------------
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.bgGame);

    this.input.setTopOnly(true);

    this.score = 0;
    this.lives = 3;
    this.timeLeft = RULES.startTime;

    this.comboCount = 0;
    this.currentHitScore = 0;
    this.currentTimeAdd = 0;

    this.isPaused = false;

    this.scoreText = this.add.text(20, 18, `Score: ${this.score}`, { color: COLORS.text });
    this.livesText = this.add.text(20, 42, `Lives: ${this.lives}`, { color: COLORS.text });
    this.timerText = this.add.text(20, 66, `Time: ${this.timeLeft}`, { color: COLORS.text });
    this.comboText = this.add.text(20, 90, `Combo: ${this.comboCount}`, { color: COLORS.text });

    this.legendText = this.add.text(W / 2, H - 22, '😇 = good   |   😈 = bad', {
      fontSize: '14px',
      color: '#666',
    }).setOrigin(0.5);

    this.pauseBtn = this.add.text(W - 20, 18, 'PAUSE', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#ff4d8d',
      padding: { x: 12, y: 6 },
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

    this.pauseBtn.on('pointerdown', () => this.openPauseOverlay());

    this.buildBowUI();

    this.mapGraphics = this.add.graphics();
    this.furnitureHitboxes = [];
    this.furnitureDrawnRects = [];
    this.floors = [];
    this.stairs = { left: [], right: [] };

    this.buildHouseLayout();

    this.targets = [];

    this.furnitureOverlay = this.add.graphics();
    this.drawFurnitureOverlay();
    this.furnitureOverlay.setDepth(10);

    this.crosshair = this.add.graphics();
    this.drawCrosshair(W / 2, H / 2);

    this.input.on('pointermove', (pointer) => {
      if (this.isPaused) return;
      this.drawCrosshair(pointer.x, pointer.y);
    });

    this.toast = this.add.text(W / 2, H - 46, '', {
      fontSize: '14px',
      color: '#ff4d8d',
    }).setOrigin(0.5);

    this.input.on('pointerdown', (pointer, currentlyOver) => {
      if (currentlyOver && currentlyOver.length > 0) return;
      if (this.isPaused) return;

      this.playBowSwing();

      const target = this.getClickedTarget(pointer.x, pointer.y);
      if (target) {
        this.handleTargetHit(target);
        return;
      }

      if (this.isPointInFurniture(pointer.x, pointer.y)) {
        this.applyMiss('Clicked furniture');
        return;
      }

      this.applyMiss('Clicked empty space');
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

    this.scheduleNextSpawnBatch();
    this.buildPauseOverlay();
  }

  update(time, delta) {
    if (this.isPaused) return;

    const dt = delta / 1000;

    for (let i = this.targets.length - 1; i >= 0; i--) {
      const t = this.targets[i];
      if (!t || !t.active) continue;

      t.x += t.vx * dt;

      if (t.x < 90) {
        t.x = 90;
        t.vx = Math.abs(t.vx);
      }
      if (t.x > W - 90) {
        t.x = W - 90;
        t.vx = -Math.abs(t.vx);
      }

      if (time > t.nextDirChangeAt) {
        const speed = Phaser.Math.Between(RULES.speedMin, RULES.speedMax);
        const dir = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
        t.vx = dir * speed;
        t.nextDirChangeAt = time + Phaser.Math.Between(RULES.directionChangeMinMs, RULES.directionChangeMaxMs);
      }

      this.maybeUseStairs(t);

      if (this.time.now >= t.despawnAt) {
        this.removeTarget(t);
        continue;
      }

      this.syncTargetVisual(t);
    }
  }

  // -------- Bow UI --------
  buildBowUI() {
    const x = W - 95;
    const y = H - 95;

    this.bowUI = this.add.container(x, y).setDepth(200);

    const g = this.add.graphics();

    g.lineStyle(6, 0xff4d8d, 1);
    g.beginPath();
    g.arc(0, 0, 26, Phaser.Math.DegToRad(-70), Phaser.Math.DegToRad(70), false);
    g.strokePath();

    g.lineStyle(3, 0xffffff, 0.9);
    g.lineBetween(-18, -20, -18, 20);

    g.fillStyle(0xff4d8d, 1);
    g.fillCircle(12, 0, 4);

    this.bowUI.add(g);

    this.bowBaseRot = -0.25;
    this.bowUI.rotation = this.bowBaseRot;
    this.bowUI.scale = 1.0;
  }

  playBowSwing() {
    if (!this.bowUI) return;

    this.tweens.killTweensOf(this.bowUI);

    this.bowUI.rotation = this.bowBaseRot;
    this.bowUI.scale = 1.0;

    this.tweens.add({
      targets: this.bowUI,
      rotation: this.bowBaseRot + 0.55,
      scale: 1.08,
      duration: 70,
      ease: 'Quad.easeOut',
      yoyo: true,
      hold: 25,
    });
  }

  // -------- Map --------
  buildHouseLayout() {
    this.mapGraphics.clear();
    this.furnitureHitboxes = [];
    this.furnitureDrawnRects = [];

    this.floors = [
      { yLine: 470, walkY: 445 },
      { yLine: 360, walkY: 335 },
      { yLine: 250, walkY: 225 },
      { yLine: 140, walkY: 115 },
    ];

    this.mapGraphics.fillStyle(COLORS.floor, 1);
    for (const f of this.floors) {
      this.mapGraphics.fillRoundedRect(80, f.yLine, W - 160, 10, 8);
    }

    this.mapGraphics.fillStyle(COLORS.stair, 1);

    const stairWidth = 70;
    const stairHeight = 60;

    this.stairs.left = [
      new Phaser.Geom.Rectangle(80, 410, stairWidth, stairHeight),
      new Phaser.Geom.Rectangle(80, 300, stairWidth, stairHeight),
      new Phaser.Geom.Rectangle(80, 190, stairWidth, stairHeight),
    ];
    this.stairs.right = [
      new Phaser.Geom.Rectangle(W - 150, 410, stairWidth, stairHeight),
      new Phaser.Geom.Rectangle(W - 150, 300, stairWidth, stairHeight),
      new Phaser.Geom.Rectangle(W - 150, 190, stairWidth, stairHeight),
    ];

    for (const r of [...this.stairs.left, ...this.stairs.right]) {
      this.mapGraphics.fillRoundedRect(r.x, r.y, r.width, r.height, 10);
    }

    this.addFurniture(260, 415, 120, 55, 'Sofa');
    this.addFurniture(520, 405, 90, 65, 'TV');
    this.addFurniture(400, 305, 140, 55, 'Kitchen Table');
    this.addFurniture(620, 290, 110, 70, 'Bathtub');
    this.addFurniture(300, 195, 110, 60, 'Shelf');
  }

  addFurniture(x, y, w, h, label) {
    this.mapGraphics.fillStyle(COLORS.furniture, 1);
    this.mapGraphics.fillRoundedRect(x, y, w, h, 14);

    this.mapGraphics.lineStyle(2, COLORS.furnitureOutline, 1);
    this.mapGraphics.strokeRoundedRect(x, y, w, h, 14);

    this.add.text(x + w / 2, y + h / 2, label, {
      fontSize: '12px',
      color: '#fff',
    }).setOrigin(0.5);

    const rect = new Phaser.Geom.Rectangle(x, y, w, h);
    this.furnitureHitboxes.push(rect);
    this.furnitureDrawnRects.push(rect);
  }

  drawFurnitureOverlay() {
    this.furnitureOverlay.clear();
    this.furnitureOverlay.fillStyle(COLORS.furniture, 1);
    for (const r of this.furnitureDrawnRects) {
      this.furnitureOverlay.fillRoundedRect(r.x, r.y, r.width, r.height, 14);
      this.furnitureOverlay.lineStyle(2, COLORS.furnitureOutline, 1);
      this.furnitureOverlay.strokeRoundedRect(r.x, r.y, r.width, r.height, 14);
    }
  }

  isPointInFurniture(x, y) {
    for (const rect of this.furnitureHitboxes) {
      if (Phaser.Geom.Rectangle.Contains(rect, x, y)) return true;
    }
    return false;
  }

  hasLineOfSight(fromX, fromY, toX, toY) {
    const line = new Phaser.Geom.Line(fromX, fromY, toX, toY);
    for (const rect of this.furnitureHitboxes) {
      if (Phaser.Geom.Intersects.LineToRectangle(line, rect)) return false;
    }
    return true;
  }

  // -------- Spawn --------
  scheduleNextSpawnBatch() {
    const delay = Phaser.Math.Between(RULES.spawnIntervalMinMs, RULES.spawnIntervalMaxMs);
    this.time.delayedCall(delay, () => {
      if (!this.isPaused) this.spawnBatch();
      this.scheduleNextSpawnBatch();
    });
  }

  spawnBatch() {
    const count = Phaser.Math.Between(RULES.spawnBatchMin, RULES.spawnBatchMax);
    for (let i = 0; i < count; i++) this.spawnOneTarget();
  }

  spawnOneTarget() {
    const isFake = Phaser.Math.Between(1, 100) <= RULES.fakeChancePercent;
    const floorIndex = Phaser.Math.Between(0, this.floors.length - 1);

    const x = Phaser.Math.Between(180, W - 180);
    const y = this.floors[floorIndex].walkY;

    const speed = Phaser.Math.Between(RULES.speedMin, RULES.speedMax);
    const dir = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;

    const container = this.add.container(x, y);
    container.setDepth(5);
    container.setSize(44, 44);

    const body = this.add.graphics();
    body.fillStyle(isFake ? 0xff9aa2 : 0x9affc7, 1);
    body.fillRoundedRect(-18, -18, 36, 36, 12);

    const face = this.add.text(0, 2, isFake ? '😈' : '😇', { fontSize: '22px' }).setOrigin(0.5);
    const label = this.add.text(0, 28, isFake ? 'Fake' : 'Me', {
      fontSize: '11px',
      color: '#444',
    }).setOrigin(0.5);

    container.add([body, face, label]);

    this.targets.push({
      isFake,
      floorIndex,
      x,
      y,
      vx: dir * speed,
      container,
      active: true,
      nextDirChangeAt: this.time.now + Phaser.Math.Between(RULES.directionChangeMinMs, RULES.directionChangeMaxMs),
      despawnAt: this.time.now + Phaser.Math.Between(RULES.targetLifeMinMs, RULES.targetLifeMaxMs),
    });
  }

  removeTarget(t) {
    t.active = false;
    if (t.container) t.container.destroy(true);
    this.targets = this.targets.filter(x => x !== t);
  }

  syncTargetVisual(t) {
    if (!t.container) return;
    t.container.x = t.x;
    t.container.y = t.y;
  }

  getClickedTarget(px, py) {
    if (this.isPointInFurniture(px, py)) return null;

    for (let i = this.targets.length - 1; i >= 0; i--) {
      const t = this.targets[i];
      if (!t.active || !t.container) continue;

      const hitRect = new Phaser.Geom.Rectangle(t.x - 22, t.y - 22, 44, 44);
      if (!Phaser.Geom.Rectangle.Contains(hitRect, px, py)) continue;

      if (!this.hasLineOfSight(px, py, t.x, t.y)) return null;

      return t;
    }
    return null;
  }

  maybeUseStairs(t) {
    const inLeft = this.stairs.left.some(r => Phaser.Geom.Rectangle.Contains(r, t.x, t.y));
    const inRight = this.stairs.right.some(r => Phaser.Geom.Rectangle.Contains(r, t.x, t.y));
    if (!inLeft && !inRight) return;

    if (Math.random() > RULES.stairUseChance) return;

    const up = Math.random() < 0.5;
    let newFloor = t.floorIndex + (up ? -1 : 1);
    newFloor = Phaser.Math.Clamp(newFloor, 0, this.floors.length - 1);
    if (newFloor === t.floorIndex) return;

    t.floorIndex = newFloor;
    t.y = this.floors[newFloor].walkY;
  }

  // -------- Hit / Miss --------
  handleTargetHit(t) {
    if (!t.active) return;

    if (t.isFake) {
      this.score -= RULES.fakeHitScorePenalty;
      this.scoreText.setText(`Score: ${this.score}`);

      this.resetCombo();

      this.timeLeft = Math.max(0, this.timeLeft - RULES.missTimePenalty);
      this.timerText.setText(`Time: ${this.timeLeft}`);

      this.lives = Math.max(0, this.lives - RULES.missLifePenalty);
      this.livesText.setText(`Lives: ${this.lives}`);

      this.showToast(`FAKE HIT → -${RULES.fakeHitScorePenalty} pts, -${RULES.missTimePenalty}s, -1 life`);
      this.removeTarget(t);
      this.checkEnd();
      return;
    }

    this.comboCount += 1;

    if (this.comboCount === 1) {
      this.currentHitScore = RULES.baseHitScore;
      this.currentTimeAdd = 1;
    } else {
      this.currentHitScore *= 2;
      this.currentTimeAdd *= 2;
    }

    this.score += this.currentHitScore;
    this.timeLeft += this.currentTimeAdd;

    this.scoreText.setText(`Score: ${this.score}`);
    this.timerText.setText(`Time: ${this.timeLeft}`);
    this.comboText.setText(`Combo: ${this.comboCount}`);

    this.showToast(`HIT! +${this.currentHitScore} pts, +${this.currentTimeAdd}s`);
    this.removeTarget(t);
  }

  resetCombo() {
    this.comboCount = 0;
    this.currentHitScore = 0;
    this.currentTimeAdd = 0;
    this.comboText.setText(`Combo: ${this.comboCount}`);
  }

  applyMiss(reason) {
    this.resetCombo();

    this.timeLeft = Math.max(0, this.timeLeft - RULES.missTimePenalty);
    this.timerText.setText(`Time: ${this.timeLeft}`);

    this.lives = Math.max(0, this.lives - RULES.missLifePenalty);
    this.livesText.setText(`Lives: ${this.lives}`);

    this.showToast(`${reason} → MISS (-1 life, -${RULES.missTimePenalty}s)`);
    this.checkEnd();
  }

  checkEnd() {
    if (this.lives <= 0) this.endRound();
    if (this.timeLeft <= 0) this.endRound();
  }

  endRound() {
    if (this.timerEvent) this.timerEvent.remove(false);

    for (const t of this.targets) {
      if (t.container) t.container.destroy(true);
      t.active = false;
    }
    this.targets = [];

    this.closePauseOverlay(true);
    this.scene.start('GameOverScene', { finalScore: this.score });
  }

  showToast(msg) {
    this.toast.setText(msg);
    this.time.delayedCall(700, () => this.toast.setText(''));
  }

  // -------- Pause Overlay (image-based) --------
  buildPauseOverlay() {
    this.pauseBG = this.add.image(W / 2, H / 2, 'pause_bg');
    this.pauseBG.setDisplaySize(W, H);
    this.pauseBG.setVisible(false);
    this.pauseBG.setDepth(300);
    this.pauseBG.setInteractive(); // blocks clicks to game while paused

    this.pauseBtns = {
      resume: this.add.image(W / 2, 250, 'btn_resume').setScale(0.9),
      reset:  this.add.image(W / 2, 320, 'btn_reset').setScale(0.9),
      home:   this.add.image(W / 2, 395, 'btn_home').setScale(0.9),
      quit:   this.add.image(W / 2, 470, 'btn_quit').setScale(0.9),
    };

    Object.values(this.pauseBtns).forEach(btn => {
      btn.setDepth(301);
      btn.setVisible(false);
      setDisplayHitbox(btn);
    });

    addHoverScale(this, this.pauseBtns.resume, 0.9, 0.9 * 1.06);
    addHoverScale(this, this.pauseBtns.reset,  0.9, 0.9 * 1.06);
    addHoverScale(this, this.pauseBtns.home,   0.9, 0.9 * 1.06);
    addHoverScale(this, this.pauseBtns.quit,   0.9, 0.9 * 1.06);

    this.pauseBtns.resume.on('pointerup', () => { if (this.isPaused) this.closePauseOverlay(); });
    this.pauseBtns.reset.on('pointerup',  () => { if (this.isPaused) { this.closePauseOverlay(true); this.scene.restart(); } });
    this.pauseBtns.home.on('pointerup',   () => { if (this.isPaused) { this.closePauseOverlay(true); this.scene.start('HomeScene'); } });
    this.pauseBtns.quit.on('pointerup',   () => { if (this.isPaused) { this.closePauseOverlay(true); this.scene.start('HomeScene'); } });
  }

  openPauseOverlay() {
    if (this.isPaused) return;
    this.isPaused = true;

    this.pauseBtn.setVisible(false);

    this.pauseBG.setVisible(true);
    Object.values(this.pauseBtns).forEach(b => b.setVisible(true));
  }

  closePauseOverlay(forceHide = false) {
    if (!this.isPaused && !forceHide) return;

    this.isPaused = false;

    this.pauseBG.setVisible(false);
    Object.values(this.pauseBtns).forEach(b => b.setVisible(false));

    this.pauseBtn.setVisible(true);
  }

  // -------- Crosshair --------
  drawCrosshair(x, y) {
    this.crosshair.clear();
    this.crosshair.lineStyle(2, 0xff0000, 1);
    this.crosshair.lineBetween(x - 10, y, x + 10, y);
    this.crosshair.lineBetween(x, y - 10, x, y + 10);
  }
}

// ---------------------- Phaser Config ----------------------
const config = {
  type: Phaser.AUTO,
  width: W,
  height: H,
  scene: [PreloadScene, HomeScene, GameScene, GameOverScene],
};

new Phaser.Game(config);
