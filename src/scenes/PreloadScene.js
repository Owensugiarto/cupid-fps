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
    //this.load.image('btn_home', 'assets/ui/homebutton.png');
    this.load.image('btn_quit', 'assets/ui/quitbutton.png');
    this.load.image('shootcupid', 'assets/ui/shootcupid.png');
    this.load.image('heart1', 'assets/ui/heart1.png');
    this.load.image('heart3', 'assets/ui/heart3.png');

    this.load.image('gameover_ui', 'assets/ui/gameoverui.png');
    this.load.image('playmenu', 'assets/ui/playmenunoribbon.png');
    this.load.image('quitbutton', 'assets/ui/quitbutton.png');

    this.load.image('house_bg', 'assets/ui/gameui.png'); 



  }

  create() {
    this.scene.start('HomeScene');
  }
}
