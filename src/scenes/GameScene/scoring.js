import { RULES } from '../../constants.js';
import { removeTarget } from './targets.js';

const TIME_BONUS_ON_HIT = 2;     // +2 seconds per correct hit
const MAX_COMBO_MULT = 2048;     // safety cap (optional)

export function handlePointerDown(scene, pointer) {
  if (scene.isPaused) return;

  if (scene.playBowSwing) scene.playBowSwing();

  // Phaser internal hit test against all interactive objects
  const hits = scene.input.manager.hitTest(
    pointer,
    scene.input._list,
    scene.cameras.main
  );

  // Find first target sprite in hit stack
  let targetObj = null;
  for (const obj of hits) {
    if (!obj) continue;
    if (obj.getData && obj.getData('isTarget')) {
      targetObj = obj; // sprite is interactive now
      break;
    }
  }

  // If clicked a target
  if (targetObj) {
    const t = targetObj.getData('targetRef');
    if (t && t.active) {
      handleTargetHit(scene, t);
      return;
    }
  }

  // Not a target -> furniture vs air
  if (scene.isPointInFurniture && scene.isPointInFurniture(pointer.x, pointer.y)) {
    applyPenalty(scene, 'Hit furniture');
    return;
  }

  applyPenalty(scene, 'Missed');
}

function ensureComboState(scene) {
  if (scene.comboMult == null) scene.comboMult = 1;   // 1,2,4,8,...
}

function resetCombo(scene) {
  scene.comboMult = 1;
}

function handleTargetHit(scene, t) {
  if (!t || !t.active) return;

  ensureComboState(scene);

  // Lock instantly to prevent spam
  t.active = false;

  // Angel (bad) vs Devil (good)
  const isAngel = t.isFake === true;

  if (isAngel) {
    applyPenalty(scene, 'Hit angel');
    removeTarget(scene, t);
    return;
  }

  // Devil (good): award score with doubling combo
  const base = RULES.baseHitScore ?? 100;
  const mult = scene.comboMult;

  const pts = base * mult;
  scene.score = (scene.score ?? 0) + pts;

  // +2 seconds bonus
  scene.timeLeft = Math.max(0, (scene.timeLeft ?? 0) + TIME_BONUS_ON_HIT);

  // Update UI
  if (scene.scoreText) scene.scoreText.setText(`Score: ${scene.score}`);
  if (scene.timerText) scene.timerText.setText(`Time: ${scene.timeLeft}`);

  if (scene.toast) {
    scene.toast.setText(`HIT! +${pts}  (+${TIME_BONUS_ON_HIT}s)`);
    scene.time.delayedCall(350, () => {
      if (scene.toast) scene.toast.setText('');
    });
  }

  // Increase combo multiplier (double) for next consecutive hit
  scene.comboMult = Math.min(MAX_COMBO_MULT, scene.comboMult * 2);

  removeTarget(scene, t);
}

function applyPenalty(scene, reason) {
  // Any penalty breaks combo
  resetCombo(scene);

  // Lose 1 life
  scene.lives = Math.max(0, (scene.lives ?? 0) - 1);

  // Lose 10% of CURRENT time
  scene.timeLeft = Math.max(0, Math.floor((scene.timeLeft ?? 0) * 0.9));

  // Update UI
  if (scene.livesText) scene.livesText.setText(`Lives: ${'♥'.repeat(scene.lives)}`);
  if (scene.timerText) scene.timerText.setText(`Time: ${scene.timeLeft}`);

  if (scene.toast) {
    scene.toast.setText(`${reason} → -1 life, -10% time`);
    scene.time.delayedCall(450, () => {
      if (scene.toast) scene.toast.setText('');
    });
  }

  // End round if dead or out of time
  if (scene.lives <= 0 || scene.timeLeft <= 0) {
    if (scene.endRound) scene.endRound();
  }
}

export function attachEndRound(scene) {
  scene.endRound = () => endRound(scene);
}

function endRound(scene) {
  if (scene.timerEvent) scene.timerEvent.remove(false);

  if (scene.targets && scene.targets.length) {
    for (const t of scene.targets) {
      if (t && t.container) t.container.destroy(true);
      if (t) t.active = false;
    }
    scene.targets = [];
  }

  scene.scene.start('GameOverScene', { finalScore: scene.score });
}
