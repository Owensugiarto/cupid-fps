import { W, RULES } from '../../constants.js';

/* =========================
   YOUR CURRENT TUNING
   ========================= */
const TARGET_SCALE_GOOD = 0.08;
const TARGET_SCALE_BAD  = 0.08;

// positive = move DOWN, negative = move UP
const FEET_OFFSET_Y = 70;

/* Depth layering:
   Furniture sprites are depth ~15 (in map.js)
   So targets should be:
   - behind furniture: < 15
   - in front of furniture: > 15
*/
const TARGET_DEPTH_BEHIND = 12;
const TARGET_DEPTH_FRONT  = 18;

const SHOW_LABEL = false;

export function initTargets(scene) {
  scene.targets = [];
}

export function scheduleNextSpawnBatch(scene) {
  const delay = Phaser.Math.Between(RULES.spawnIntervalMinMs, RULES.spawnIntervalMaxMs);

  scene.time.delayedCall(delay, () => {
    if (!scene.isPaused) spawnBatch(scene);
    scheduleNextSpawnBatch(scene);
  });
}

function spawnBatch(scene) {
  const count = Phaser.Math.Between(RULES.spawnBatchMin, RULES.spawnBatchMax);
  for (let i = 0; i < count; i++) spawnOneTarget(scene);
}

function spawnOneTarget(scene) {
  const isFake = Phaser.Math.Between(1, 100) <= RULES.fakeChancePercent;
  const floorIndex = Phaser.Math.Between(0, scene.floors.length - 1);

  const x = Phaser.Math.Between(140, W - 140);
  const y = scene.floors[floorIndex].walkY;

  const speed = Phaser.Math.Between(RULES.speedMin, RULES.speedMax);
  const dir = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;

  // Container anchored at FEET position (x, walkY)
  const container = scene.add.container(x, y);

  const key = isFake ? 'target_bad' : 'target_good';
  const scale = isFake ? TARGET_SCALE_BAD : TARGET_SCALE_GOOD;

  // Sprite bottom is at FEET_OFFSET_Y inside the container
  const sprite = scene.add.image(0, FEET_OFFSET_Y, key);
  sprite.setOrigin(0.5, 1); // bottom-center (feet)
  sprite.setScale(scale);

  // Make the PNG itself clickable (sprite-based hitbox)
  sprite.setInteractive({ useHandCursor: true });

  container.add(sprite);

  if (SHOW_LABEL) {
    const label = scene.add.text(
      0,
      FEET_OFFSET_Y - sprite.displayHeight - 10,
      isFake ? 'FAKE' : 'REAL',
      { fontSize: '12px', color: '#000', backgroundColor: '#fff' }
    ).setOrigin(0.5, 1);
    container.add(label);
  }

  const target = {
    isFake,
    floorIndex,
    x,
    y,
    vx: dir * speed,
    container,
    sprite,
    active: true,
    nextDirChangeAt:
      scene.time.now +
      Phaser.Math.Between(RULES.directionChangeMinMs, RULES.directionChangeMaxMs),
    despawnAt:
      scene.time.now +
      Phaser.Math.Between(RULES.targetLifeMinMs, RULES.targetLifeMaxMs),
  };

  // Tag ONLY the sprite for scoring.js (more reliable hitbox)
  sprite.setData('isTarget', true);
  sprite.setData('targetRef', target);

  // Initial depth
  setTargetDepth(scene, target);

  scene.targets.push(target);
}

export function updateTargets(scene, time, delta) {
  const dt = delta / 1000;

  for (let i = scene.targets.length - 1; i >= 0; i--) {
    const t = scene.targets[i];
    if (!t || !t.active) continue;

    // Move X
    t.x += t.vx * dt;

    // Screen bounds
    if (t.x < 90) {
      t.x = 90;
      t.vx = Math.abs(t.vx);
    }
    if (t.x > W - 90) {
      t.x = W - 90;
      t.vx = -Math.abs(t.vx);
    }

    // Random direction changes
    if (time > t.nextDirChangeAt) {
      const speed = Phaser.Math.Between(RULES.speedMin, RULES.speedMax);
      const dir = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
      t.vx = dir * speed;
      t.nextDirChangeAt =
        time + Phaser.Math.Between(RULES.directionChangeMinMs, RULES.directionChangeMaxMs);
    }

    // Stairs may change floorIndex
    scene.maybeUseStairs(t);

    // HARD LOCK Y to floor walkY
    t.y = scene.floors[t.floorIndex].walkY;

    // Despawn
    if (scene.time.now >= t.despawnAt) {
      removeTarget(scene, t);
      continue;
    }

    // Sync visuals
    t.container.x = t.x;
    t.container.y = t.y;

    // 3D feel: dynamic depth (behind / in front of furniture)
    setTargetDepth(scene, t);
  }
}

function setTargetDepth(scene, t) {
  // If no furniture array exists, always front
  if (!scene.furniture || scene.furniture.length === 0) {
    t.container.setDepth(TARGET_DEPTH_FRONT);
    return;
  }

  const feetX = t.x;
  const feetY = t.y;

  // Default: in front
  let depth = TARGET_DEPTH_FRONT;

  for (const f of scene.furniture) {
    if (!f || !f.sprite) continue;

    const fx = f.sprite.x;
    const fw = f.sprite.displayWidth;

    // Rough “occlusion width” check
    const inX = Math.abs(feetX - fx) <= (fw * 0.45);
    if (!inX) continue;

    // If feet are above furniture front edge → behind furniture
    if (feetY < f.frontY) {
      depth = TARGET_DEPTH_BEHIND;
      break;
    }
  }

  t.container.setDepth(depth);
}

export function removeTarget(scene, t) {
  if (!t) return;

  // Prevent double hits instantly
  t.active = false;

  if (t.sprite) {
    try {
      t.sprite.disableInteractive();
      t.sprite.removeAllListeners();
      t.sprite.setData('isTarget', false);
      t.sprite.setData('targetRef', null);
    } catch (e) {}
  }

  if (t.container) {
    // Small pop animation
    scene.tweens.add({
      targets: t.container,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration: 80,
      onComplete: () => {
        if (t.container) t.container.destroy(true);
      }
    });
  }

  // Remove from list
  scene.targets = scene.targets.filter(x => x !== t);
}
