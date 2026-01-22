export function addFloat(scene, obj, amplitude = 8, duration = 1500) {
  scene.tweens.add({
    targets: obj,
    y: obj.y - amplitude,
    duration,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });
}
