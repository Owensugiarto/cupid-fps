import { W, H } from './constants.js';
import { PreloadScene } from './scenes/PreloadScene.js';
import { HomeScene } from './scenes/HomeScene.js';
import GameScene from './scenes/GameScene/GameScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';

const config = {
  type: Phaser.AUTO,
  width: W,
  height: H,
  scene: [PreloadScene, HomeScene, GameScene, GameOverScene],
};

new Phaser.Game(config);
