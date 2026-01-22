import { W, H, COLORS } from '../../constants.js';

export function buildMap(scene) {
  // behind targets (background drawn elsewhere), only for optional debug overlays
  scene.mapGraphics = scene.add.graphics().setDepth(-50);
  scene.furnitureOverlay = scene.add.graphics().setDepth(25);

  scene.furnitureHitboxes = [];
  scene.furnitureDrawnRects = [];
  scene.floors = [];
  scene.stairs = { left: [], right: [] };

  // NEW: used for “walk behind furniture” depth logic
  // Each item: { sprite, frontY }
  scene.furniture = [];

  // DEBUG: keep references to furniture sprites for tuning
  scene.furnitureSprites = [];
  scene.selectedFurniture = null;

  scene.buildHouseLayout = () => buildHouseLayout(scene);
  scene.drawFurnitureOverlay = () => drawFurnitureOverlay(scene);

  scene.isPointInFurniture = (x, y) => isPointInFurniture(scene, x, y);
  scene.hasLineOfSight = (fromX, fromY, toX, toY) => hasLineOfSight(scene, fromX, fromY, toX, toY);
  scene.maybeUseStairs = (t) => maybeUseStairs(scene, t);

  scene.buildHouseLayout();
  scene.drawFurnitureOverlay();
}

function buildHouseLayout(scene) {
  scene.mapGraphics.clear();
  scene.furnitureOverlay.clear();

  // Clear old furniture sprites
  for (const s of scene.furnitureSprites) s.destroy();
  scene.furnitureSprites = [];

  scene.furnitureHitboxes = [];
  scene.furnitureDrawnRects = [];
  scene.furniture = [];

  // =========================================================
  // FLOORS (TOP -> BOTTOM)
  // yLine: debug visual line
  // walkY: actual Y that targets stand on
  // =========================================================
  scene.floors = [
    { name: 'Attic',    yLine: 70,  walkY: 80  },
    { name: 'Bedroom',  yLine: 200, walkY: 220 },
    { name: 'Bathroom', yLine: 340, walkY: 350 },
    { name: 'Kitchen',  yLine: 480, walkY: 500 },
  ];

  // =========================================================
  // DEBUG LINES (turn on while tuning)
  // =========================================================
  const SHOW_DEBUG = false;

  if (SHOW_DEBUG) {
    drawFloorDebug(scene);
  }

  // =========================================================
  // STAIRS ZONES (teleport between floors)
  // =========================================================
  const stairWidth = 90;
  const stairHeight = 110;

  scene.stairs.left = [
    new Phaser.Geom.Rectangle(40,  95, stairWidth, stairHeight),
    new Phaser.Geom.Rectangle(40,  235, stairWidth, stairHeight),
    new Phaser.Geom.Rectangle(40,  375, stairWidth, stairHeight),
  ];

  scene.stairs.right = [
    new Phaser.Geom.Rectangle(W - 130, 95,  stairWidth, stairHeight),
    new Phaser.Geom.Rectangle(W - 130, 235, stairWidth, stairHeight),
    new Phaser.Geom.Rectangle(W - 130, 375, stairWidth, stairHeight),
  ];

  if (SHOW_DEBUG) {
    scene.mapGraphics.fillStyle(COLORS.stair, 0.20);
    for (const r of [...scene.stairs.left, ...scene.stairs.right]) {
      scene.mapGraphics.fillRoundedRect(r.x, r.y, r.width, r.height, 12);
    }
  }

  // =========================================================
  // FURNITURE CONFIG
  //
  // IMPORTANT NEW FIELD:
  // frontY = the "front edge" line of that furniture
  // - If target FEET (walkY) are ABOVE frontY, target should be BEHIND furniture
  // - If target FEET are BELOW frontY, target should be IN FRONT of furniture
  //
  // You will probably tweak frontY per item by ±10~40.
  // =========================================================
  const furnitureConfig = [
    {
      key: 'treasure',
      name: 'Treasure',
      x: 333, y: 69, scale: 0.24,
      depth: 15,
      frontY: 120,
      hitbox: { x: 280, y: 40, w: 210, h: 150 },
    },
    {
      key: 'bed',
      name: 'Bed',
      x: 511, y: 216, scale: 0.23,
      depth: 15,
      frontY: 270,
      hitbox: { x: 400, y: 170, w: 260, h: 140 },
    },
    {
      key: 'tub',
      name: 'Tub',
      x: 265, y: 327, scale: 0.26,
      depth: 15,
      frontY: 405,
      hitbox: { x: 160, y: 270, w: 260, h: 140 },
    },
    {
      key: 'kitchentable',
      name: 'KitchenTable',
      x: 644, y: 499, scale: 0.34,
      depth: 15,
      frontY: 545,
      hitbox: { x: 520, y: 435, w: 250, h: 170 },
    },
  ];

  for (const cfg of furnitureConfig) {
    addFurnitureSpriteAndHitbox(scene, cfg, SHOW_DEBUG);
  }

  // Debug tuning (only when SHOW_DEBUG = true)
  if (SHOW_DEBUG) {
    enableFurnitureTuning(scene);
    printFurnitureConfigHint();
  }
}

function addFurnitureSpriteAndHitbox(scene, cfg, showDebug) {
  const spr = scene.add.image(cfg.x, cfg.y, cfg.key)
    .setOrigin(0.5)
    .setDepth(cfg.depth ?? 15)
    .setScale(cfg.scale ?? 1);

  spr.__furnitureName = cfg.name;
  spr.__furnitureKey = cfg.key;

  if (showDebug) {
    spr.setInteractive({ useHandCursor: true });
  }

  scene.furnitureSprites.push(spr);

  // Used by targets.js for “walk behind furniture”
  const frontY = (typeof cfg.frontY === 'number')
    ? cfg.frontY
    : (cfg.hitbox?.y ?? spr.y) + (cfg.hitbox?.h ?? 0);

  scene.furniture.push({ sprite: spr, frontY });

  // Hitbox blocks line-of-sight + clicking-through checks
  const hb = new Phaser.Geom.Rectangle(cfg.hitbox.x, cfg.hitbox.y, cfg.hitbox.w, cfg.hitbox.h);
  scene.furnitureHitboxes.push(hb);
  scene.furnitureDrawnRects.push(hb);

  if (showDebug) {
    scene.furnitureOverlay.fillStyle(0x00ffff, 0.15);
    scene.furnitureOverlay.fillRoundedRect(hb.x, hb.y, hb.width, hb.height, 12);
    scene.furnitureOverlay.lineStyle(2, 0x00ffff, 0.65);
    scene.furnitureOverlay.strokeRoundedRect(hb.x, hb.y, hb.width, hb.height, 12);

    scene.add.text(cfg.x, cfg.y - 60, `${cfg.name}\nfrontY=${frontY}`, {
      fontSize: '12px',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.45)',
      padding: { left: 6, right: 6, top: 3, bottom: 3 }
    }).setOrigin(0.5).setDepth(999);
  }
}

function drawFloorDebug(scene) {
  for (let i = 0; i < scene.floors.length; i++) {
    const f = scene.floors[i];

    scene.mapGraphics.lineStyle(3, 0xff4da6, 0.9);
    scene.mapGraphics.beginPath();
    scene.mapGraphics.moveTo(40, f.yLine);
    scene.mapGraphics.lineTo(W - 40, f.yLine);
    scene.mapGraphics.strokePath();

    scene.mapGraphics.lineStyle(3, 0x2ee6a6, 0.9);
    scene.mapGraphics.beginPath();
    scene.mapGraphics.moveTo(40, f.walkY);
    scene.mapGraphics.lineTo(W - 40, f.walkY);
    scene.mapGraphics.strokePath();

    scene.add.text(60, f.yLine - 18, `${i} ${f.name}  yLine=${f.yLine}  walkY=${f.walkY}`, {
      fontSize: '14px',
      color: '#111',
      backgroundColor: 'rgba(255,255,255,0.75)',
      padding: { left: 6, right: 6, top: 3, bottom: 3 }
    }).setDepth(999);
  }
}

function enableFurnitureTuning(scene) {
  scene.input.setDraggable(scene.furnitureSprites);

  scene.input.on('dragstart', (pointer, gameObject) => {
    scene.selectedFurniture = gameObject;
  });

  scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    gameObject.x = dragX;
    gameObject.y = dragY;
  });

  scene.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
    if (!scene.selectedFurniture) return;

    const step = 0.02;
    const dir = deltaY > 0 ? -1 : 1;
    const next = Phaser.Math.Clamp(scene.selectedFurniture.scale + dir * step, 0.05, 3);
    scene.selectedFurniture.setScale(next);
  });

  scene.input.keyboard?.on('keydown-P', () => {
    printFurniturePlacements(scene);
  });
}

function printFurnitureConfigHint() {
  console.log('[Furniture Tuning] Drag furniture to reposition.');
  console.log('[Furniture Tuning] Mousewheel scales selected furniture.');
  console.log('[Furniture Tuning] Press P to print x/y/scale for all furniture.');
}

function printFurniturePlacements(scene) {
  const out = scene.furnitureSprites.map(s => ({
    key: s.__furnitureKey,
    name: s.__furnitureName,
    x: Math.round(s.x),
    y: Math.round(s.y),
    scale: Number(s.scale.toFixed(2)),
  }));

  console.log('--- Furniture Placements (copy into furnitureConfig) ---');
  console.table(out);
}

function drawFurnitureOverlay(scene) {
  // Keeping this function for compatibility; overlay drawing is done in buildHouseLayout when SHOW_DEBUG is true.
}

function isPointInFurniture(scene, x, y) {
  for (const rect of scene.furnitureHitboxes) {
    if (Phaser.Geom.Rectangle.Contains(rect, x, y)) return true;
  }
  return false;
}

function hasLineOfSight(scene, fromX, fromY, toX, toY) {
  const line = new Phaser.Geom.Line(fromX, fromY, toX, toY);
  for (const rect of scene.furnitureHitboxes) {
    if (Phaser.Geom.Intersects.LineToRectangle(line, rect)) return false;
  }
  return true;
}

function maybeUseStairs(scene, t) {
  const inLeft = scene.stairs.left.some(r => Phaser.Geom.Rectangle.Contains(r, t.x, t.y));
  const inRight = scene.stairs.right.some(r => Phaser.Geom.Rectangle.Contains(r, t.x, t.y));
  if (!inLeft && !inRight) return;

  if (Math.random() > 0.45) return;

  const up = Math.random() < 0.5;
  let newFloor = t.floorIndex + (up ? -1 : 1);
  newFloor = Phaser.Math.Clamp(newFloor, 0, scene.floors.length - 1);
  if (newFloor === t.floorIndex) return;

  t.floorIndex = newFloor;
  t.y = scene.floors[newFloor].walkY;
}
