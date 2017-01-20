
export default class OverlayRoundOver {


    /**
     *
     */
    constructor() {

        this.parent = game.add.sprite(0, 0, null);
        this.parent.alpha = 0;
        this.parent.fixedToCamera = true;

        this.background = game.add.image(game.gameWidth / 2, game.gameHeight / 2, 'screen-background');
        this.background.anchor.setTo(0.5, 0.5);
        this.background.scale.set(game.scaleFactor, game.scaleFactor);

        this.roundOverText = game.add.bitmapText(0, 0, 'font-color', game.texts.ROUND_OVER, 38);
        this.roundOverText.anchor.setTo(0.5, 0);
        this.roundOverText.position.setTo(game.world.centerX, 40);

        this.parent.addChild(this.background);
        this.parent.addChild(this.roundOverText);

        game.add.tween(this.parent).to( { alpha: 1 }, 1000, Phaser.Easing.Quadratic.InOut, true);
        game.add.tween(this.roundOverText).to( { alpha: 1 }, 2000, Phaser.Easing.Quadratic.InOut, true, 1000);

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
