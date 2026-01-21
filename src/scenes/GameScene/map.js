import { W, H, COLORS } from '../../constants.js';

export function buildMap(scene) {
  // Debug graphics that draw lines/labels on top of the background but behind targets
  scene.mapGraphics = scene.add.graphics().setDepth(-50);
  scene.furnitureOverlay = scene.add.graphics().setDepth(10);

  scene.furnitureHitboxes = [];
  scene.furnitureDrawnRects = [];
  scene.floors = [];
  scene.stairs = { left: [], right: [] };

  scene.buildHouseLayout = () => buildHouseLayout(scene);
  scene.drawFurnitureOverlay = () => drawFurnitureOverlay(scene);

  scene.isPointInFurniture = (x, y) => isPointInFurniture(scene, x, y);
  scene.hasLineOfSight = (fromX, fromY, toX, toY) => hasLineOfSight(scene, fromX, fromY, toX, toY);
  scene.maybeUseStairs = (t) => maybeUseStairs(scene, t);

  scene.buildHouseLayout();
  scene.drawFurnitureOverlay();
}

// ======================================================
// FLOOR CONSTANT RULE (LOCKED)
// If you want to change floor alignment, change ONLY here.
// ======================================================
const HOUSE_FLOORS = [
  { name: 'Attic',    yLine: 70,  walkY: 80  },
  { name: 'Bedroom',  yLine: 200, walkY: 220 },
  { name: 'Bathroom', yLine: 340, walkY: 350 },
  { name: 'Kitchen',  yLine: 480, walkY: 500 },
];

function buildHouseLayout(scene) {
  scene.mapGraphics.clear();
  scene.furnitureHitboxes = [];
  scene.furnitureDrawnRects = [];

  // Apply the constant floors to the scene
  scene.floors = HOUSE_FLOORS.map(f => ({ ...f }));

  // ======================================================
  // DEBUG OVERLAY (LEAVE TRUE WHILE TUNING)
  // ======================================================
  const SHOW_DEBUG = true;

  if (SHOW_DEBUG) {
    // Darken the whole play area slightly (optional)
    // Comment this block out if you dislike the tint.
    scene.mapGraphics.fillStyle(0x000000, 0.08);
    scene.mapGraphics.fillRect(0, 0, W, H);

    // Draw yLine (magenta) and walkY (green)
    // Use lineStyle colors that are easy to spot.
    for (let i = 0; i < scene.floors.length; i++) {
      const f = scene.floors[i];

      // yLine (magenta)
      scene.mapGraphics.lineStyle(3, 0xff4fd8, 0.95);
      scene.mapGraphics.beginPath();
      scene.mapGraphics.moveTo(40, f.yLine);
      scene.mapGraphics.lineTo(W - 40, f.yLine);
      scene.mapGraphics.strokePath();

      // walkY (green)
      scene.mapGraphics.lineStyle(3, 0x00ff9a, 0.95);
      scene.mapGraphics.beginPath();
      scene.mapGraphics.moveTo(40, f.walkY);
      scene.mapGraphics.lineTo(W - 40, f.walkY);
      scene.mapGraphics.strokePath();

      // Label background
      const labelText = `${i} ${f.name}  yLine=${f.yLine}  walkY=${f.walkY}`;
      const labelX = 60;
      const labelY = f.yLine - 16;

      // Draw a light box behind the text for readability
      scene.mapGraphics.fillStyle(0xffffff, 0.7);
      scene.mapGraphics.fillRoundedRect(labelX - 10, labelY - 14, 280, 26, 6);

      // Use normal text object for crisp text
      scene.add.text(labelX, labelY - 12, labelText, {
        fontSize: '16px',
        color: '#222',
        fontFamily: 'Arial, sans-serif',
      }).setDepth(9999);
    }
  }

  // ======================================================
  // STAIRS ZONES (OPTIONAL)
  // These rectangles are "teleport zones" between floors.
  // Tune later to match your background stairs/ladder areas.
  // ======================================================
  const USE_STAIRS = true;
  if (USE_STAIRS) {
    const stairWidth = 70;
    const stairHeight = 80;

    scene.stairs.left = [
      new Phaser.Geom.Rectangle(80, 260, stairWidth, stairHeight),
      new Phaser.Geom.Rectangle(80, 440, stairWidth, stairHeight),
      new Phaser.Geom.Rectangle(80, 620, stairWidth, stairHeight),
    ];
    scene.stairs.right = [
      new Phaser.Geom.Rectangle(W - 150, 260, stairWidth, stairHeight),
      new Phaser.Geom.Rectangle(W - 150, 440, stairWidth, stairHeight),
      new Phaser.Geom.Rectangle(W - 150, 620, stairWidth, stairHeight),
    ];

    // Optional: show the stair zones
    if (SHOW_DEBUG) {
      scene.mapGraphics.fillStyle(0x00b7ff, 0.18);
      for (const r of [...scene.stairs.left, ...scene.stairs.right]) {
        scene.mapGraphics.fillRoundedRect(r.x, r.y, r.width, r.height, 10);
      }
    }
  } else {
    scene.stairs.left = [];
    scene.stairs.right = [];
  }

  // ======================================================
  // FURNITURE HITBOXES (OPTIONAL)
  // If you are NOT using hitboxes yet, set USE_FURNITURE=false.
  // ======================================================
  const USE_FURNITURE = false;
  if (USE_FURNITURE) {
    addFurniture(scene, 260, 395, 120, 55, 'Sofa');
    addFurniture(scene, 520, 385, 90, 65, 'TV');
    addFurniture(scene, 400, 475, 140, 55, 'Table');
    addFurniture(scene, 620, 560, 110, 70, 'Tub');
    addFurniture(scene, 300, 290, 110, 60, 'Shelf');
  }
}

function addFurniture(scene, x, y, w, h, label) {
  const rect = new Phaser.Geom.Rectangle(x, y, w, h);
  scene.furnitureHitboxes.push(rect);
  scene.furnitureDrawnRects.push(rect);

  // Debug draw furniture hitboxes (only if you want)
  const DRAW_FURNITURE_DEBUG = false;
  if (DRAW_FURNITURE_DEBUG) {
    scene.mapGraphics.fillStyle(COLORS.furniture, 0.35);
    scene.mapGraphics.fillRoundedRect(x, y, w, h, 14);
    scene.mapGraphics.lineStyle(2, COLORS.furnitureOutline, 0.9);
    scene.mapGraphics.strokeRoundedRect(x, y, w, h, 14);

    scene.add.text(x + w / 2, y + h / 2, label, {
      fontSize: '12px',
      color: '#fff',
    }).setOrigin(0.5).setDepth(9999);
  }
}

function drawFurnitureOverlay(scene) {
  scene.furnitureOverlay.clear();

  // Usually OFF once your background looks good
  const DRAW_OVERLAY = false;
  if (!DRAW_OVERLAY) return;

  scene.furnitureOverlay.fillStyle(COLORS.furniture, 0.25);
  for (const r of scene.furnitureDrawnRects) {
    scene.furnitureOverlay.fillRoundedRect(r.x, r.y, r.width, r.height, 14);
    scene.furnitureOverlay.lineStyle(2, COLORS.furnitureOutline, 1);
    scene.furnitureOverlay.strokeRoundedRect(r.x, r.y, r.width, r.height, 14);
  }
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

  // Probability of using stairs when standing in the zone
  if (Math.random() > 0.45) return;

  // Random up/down
  const up = Math.random() < 0.5;
  let newFloor = t.floorIndex + (up ? -1 : 1);
  newFloor = Phaser.Math.Clamp(newFloor, 0, scene.floors.length - 1);
  if (newFloor === t.floorIndex) return;

  t.floorIndex = newFloor;
  t.y = scene.floors[newFloor].walkY;
}
