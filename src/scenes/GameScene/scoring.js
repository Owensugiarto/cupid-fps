import { RULES } from '../../constants.js';
import { removeTarget } from './targets.js';

export function handlePointerDown(scene, pointer, currentlyOver) {
  if (currentlyOver && currentlyOver.length > 0) return;
  if (scene.isPaused) return;

  if (scene.playBowSwing) scene.playBowSwing();

  const target = getClickedTarget(scene, pointer.x, pointer.y);
  if (target) {
    handleTargetHit(scene, target);
    return;
  }

  if (scene.isPointInFurniture(pointer.x, pointer.y)) {
    applyMiss(scene, 'Clicked furniture');
    return;
  }

  applyMiss(scene, 'Clicked empty space');
}

function getClickedTarget(scene, px, py) {
  if (scene.isPointInFurniture(px, py)) return null;

  for (let i = scene.targets.length - 1; i >= 0; i--) {
    const t = scene.targets[i];
    if (!t.active || !t.container) continue;

    const hitRect = new Phaser.Geom.Rectangle(t.x - 22, t.y - 22, 44, 44);
    if (!Phaser.Geom.Rectangle.Contains(hitRect, px, py)) continue;

    if (!scene.hasLineOfSight(px, py, t.x, t.y)) return null;

    return t;
  }
  return null;
}

function handleTargetHit(scene, t) {
  if (!t.active) return;

  if (t.isFake) {
    scene.score -= RULES.fakeHitScorePenalty;
    scene.scoreText.setText(`Score: ${scene.score}`);

    resetCombo(scene);

    scene.timeLeft = Math.max(0, scene.timeLeft - RULES.missTimePenalty);
    scene.timerText.setText(`Time: ${scene.timeLeft}`);

    scene.lives = Math.max(0, scene.lives - RULES.missLifePenalty);
    scene.livesText.setText(`Lives: ${scene.lives}`);

    showToast(scene, `FAKE HIT → -${RULES.fakeHitScorePenalty} pts, -${RULES.missTimePenalty}s, -1 life`);
    removeTarget(scene, t);
    checkEnd(scene);
    return;
  }

  scene.comboCount += 1;

  if (scene.comboCount === 1) {
    scene.currentHitScore = RULES.baseHitScore;
    scene.currentTimeAdd = 1;
  } else {
    scene.currentHitScore *= 2;
    scene.currentTimeAdd *= 2;
  }

  scene.score += scene.currentHitScore;
  scene.timeLeft += scene.currentTimeAdd;

  scene.scoreText.setText(`Score: ${scene.score}`);
  scene.timerText.setText(`Time: ${scene.timeLeft}`);
  scene.comboText.setText(`Combo: ${scene.comboCount}`);

  showToast(scene, `HIT! +${scene.currentHitScore} pts, +${scene.currentTimeAdd}s`);
  removeTarget(scene, t);
}

function resetCombo(scene) {
  scene.comboCount = 0;
  scene.currentHitScore = 0;
  scene.currentTimeAdd = 0;
  scene.comboText.setText(`Combo: ${scene.comboCount}`);
}

function applyMiss(scene, reason) {
  resetCombo(scene);

  scene.timeLeft = Math.max(0, scene.timeLeft - RULES.missTimePenalty);
  scene.timerText.setText(`Time: ${scene.timeLeft}`);

  scene.lives = Math.max(0, scene.lives - RULES.missLifePenalty);
  scene.livesText.setText(`Lives: ${scene.lives}`);

  showToast(scene, `${reason} → MISS (-1 life, -${RULES.missTimePenalty}s)`);
  checkEnd(scene);
}

function checkEnd(scene) {
  if (scene.lives <= 0) scene.endRound();
  if (scene.timeLeft <= 0) scene.endRound();
}

function showToast(scene, msg) {
  scene.toast.setText(msg);
  scene.time.delayedCall(700, () => scene.toast.setText(''));
}

export function attachEndRound(scene) {
  scene.endRound = () => endRound(scene);
}

function endRound(scene) {
  if (scene.timerEvent) scene.timerEvent.remove(false);

  for (const t of scene.targets) {
    if (t.container) t.container.destroy(true);
    t.active = false;
  }
  scene.targets = [];

  scene.closePauseOverlay(true);
  scene.scene.start('GameOverScene', { finalScore: scene.score });
}
