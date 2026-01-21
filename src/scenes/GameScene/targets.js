import { W, RULES } from '../../constants.js';

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

  const x = Phaser.Math.Between(180, W - 180);
  const y = scene.floors[floorIndex].walkY;

  const speed = Phaser.Math.Between(RULES.speedMin, RULES.speedMax);
  const dir = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;

  const container = scene.add.container(x, y);
  container.setDepth(5);
  container.setSize(44, 44);

  const body = scene.add.graphics();
  body.fillStyle(isFake ? 0xff9aa2 : 0x9affc7, 1);
  body.fillRoundedRect(-18, -18, 36, 36, 12);

  const face = scene.add.text(0, 2, isFake ? '😈' : '😇', { fontSize: '22px' }).setOrigin(0.5);
  const label = scene.add.text(0, 28, isFake ? 'Fake' : 'Me', {
    fontSize: '11px',
    color: '#444',
  }).setOrigin(0.5);

  container.add([body, face, label]);

  scene.targets.push({
    isFake,
    floorIndex,
    x,
    y,
    vx: dir * speed,
    container,
    active: true,
    nextDirChangeAt: scene.time.now + Phaser.Math.Between(RULES.directionChangeMinMs, RULES.directionChangeMaxMs),
    despawnAt: scene.time.now + Phaser.Math.Between(RULES.targetLifeMinMs, RULES.targetLifeMaxMs),
  });
}

export function updateTargets(scene, time, delta) {
  const dt = delta / 1000;

  for (let i = scene.targets.length - 1; i >= 0; i--) {
    const t = scene.targets[i];
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

    scene.maybeUseStairs(t);

    if (scene.time.now >= t.despawnAt) {
      removeTarget(scene, t);
      continue;
    }

    syncTargetVisual(t);
  }
}

function syncTargetVisual(t) {
  if (!t.container) return;
  t.container.x = t.x;
  t.container.y = t.y;
}

export function removeTarget(scene, t) {
  t.active = false;
  if (t.container) t.container.destroy(true);
  scene.targets = scene.targets.filter(x => x !== t);
}
