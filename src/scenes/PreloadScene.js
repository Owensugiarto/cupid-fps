export class PreloadScene extends Phaser.Scene {
  constructor() { super('PreloadScene'); }

  preload() {
    this.load.image('home_bg', 'assets/ui/menuui.png');
    this.load.image('angel_left', 'assets/ui/angelleft.png');
    this.load.image('angel_right', 'assets/ui/angelright.png');
    this.load.image('btn_play', 'assets/ui/playmenunoribbon.png');
    this.load.image('btn_how', 'assets/ui/howtoplaybutton.png');
    this.load.image('howtoplay_ui', 'assets/ui/howtoplayui.png');

    this.load.image('pause_bg', 'assets/ui/pauseui.png');
    this.load.image('btn_resume', 'assets/ui/resumebutton.png');
    this.load.image('btn_reset', 'assets/ui/resetbutton.png');
    // this.load.image('btn_home', 'assets/ui/homebutton.png');
    this.load.image('btn_quit', 'assets/ui/quitbutton.png');
    this.load.image('shootcupid', 'assets/ui/shootcupid.png');
    this.load.image('heart1', 'assets/ui/heart1.png');
    this.load.image('heart3', 'assets/ui/heart3.png');

    this.load.image('gameover_ui', 'assets/ui/gameoverui.png');
    this.load.image('playmenu', 'assets/ui/playmenunoribbon.png');
    this.load.image('quitbutton', 'assets/ui/quitbutton.png');

    this.load.image('house_bg', 'assets/ui/gameui.png');

    // Furniture
    this.load.image('bed', 'assets/furniture/bed.png');
    this.load.image('tub', 'assets/furniture/tub.png');
    this.load.image('kitchentable', 'assets/furniture/kitchentable.png');
    this.load.image('treasure', 'assets/furniture/treasure.png');

    // Targets (KEYS MUST MATCH what targets.js uses)
    this.load.image('target_good', 'assets/targets/shootthetarget.png');
    this.load.image('target_bad', 'assets/targets/dontshoottarget.png');




  }

  create() {
    this.scene.start('HomeScene');
  }
}
