
export default class OverlayDead {


    /**
     *
     */
    constructor() {
        console.log('WTFFFFFFf');
        this.parent = game.add.sprite(0, 0, null);
        this.parent.alpha = 0;
        this.parent.fixedToCamera = true;

        this.background = game.add.graphics(0, 0);
        this.background.beginFill(0x000000);
        this.background.drawRect(-100, -100, game.gameWidth + 100, game.gameHeight + 100);
        this.background.alpha = 0.7;

        this.deadText = game.add.bitmapText(0, 0, 'font-color', game.texts.DEAD, 72);
        this.deadText.anchor.setTo(0.5, 0.5);
        this.deadText.position.setTo(game.gameWidth / 2, game.gameHeight / 2);
        this.deadText.alpha = 0;

        this.parent.addChild(this.background);
        this.parent.addChild(this.deadText);

        game.add.tween(this.parent).to( { alpha: 1 }, 1000, Phaser.Easing.Quadratic.InOut, true);
        game.add.tween(this.deadText).to( { alpha: 1 }, 2000, Phaser.Easing.Quadratic.InOut, true, 1000);

    }


    /**
     *
     */
    hide() {
        let tween = game.add.tween(this.parent);
        tween.onComplete.add(() => {
            this.parent.destroy(true);
        }, this);
        tween.to( { alpha: 0 }, 1000, Phaser.Easing.Quadratic.InOut, true);
    }


}
