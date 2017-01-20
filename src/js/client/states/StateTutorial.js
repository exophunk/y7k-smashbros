
export default class StateTutorial extends Phaser.State {


    /**
     *
     */
	create() {

        this.initBackground();
        this.initTutorialBoxes();

        game.input.onTap.add(this.startPlaying, this);
	}


    /**
     *
     */
    initBackground() {
        this.background = game.add.image(game.centerX, game.centerY, 'screen-background');
        this.background.anchor.setTo(0.5, 0.5);
        this.background.scale.set(game.scaleFactor, game.scaleFactor);

        let titleText = game.add.bitmapText(0, 0, 'font-color', game.texts.TITLE_TUTORIAL, 38);
        titleText.anchor.setTo(0.5, 0);
        titleText.position.setTo(game.centerX, 40);

        let textContinue = game.add.bitmapText(0, 0, 'font-white-big', game.texts.PRESS_TO_CONTINUE, 28);
        textContinue.anchor.setTo(0.5, 1);
        textContinue.position.setTo(game.centerX, game.world.height - 40);
    }


    /**
     *
     */
    initTutorialBoxes() {

        this.box1 = game.add.sprite(game.centerX - 50, game.centerY, 'tutorial-box');
        this.box1.anchor.setTo(1, 0.5);

        this.box2 = game.add.sprite(game.centerX + 50, game.centerY, 'tutorial-box');
        this.box2.anchor.setTo(0, 0.5);

        let textMove = game.add.bitmapText(-this.box1.width, this.box1.height / 2 + 5, 'font-white', game.texts.TUTORIAL_MOVE, 16);
        textMove.maxWidth = this.box1.width + 20;
        let textPick = game.add.bitmapText(0, this.box2.height / 2 + 5, 'font-white', game.texts.TUTORIAL_PICK, 16);
        textPick.maxWidth = this.box2.width + 20;

        this.box1.addChild(textMove);
        this.box2.addChild(textPick);

        this.box1.scale.setTo(game.scaleFactor, game.scaleFactor);
        this.box2.scale.setTo(game.scaleFactor, game.scaleFactor);
    }


    /**
     *
     */
    update() {
        if (game.input.keyboard.isDown(Phaser.Keyboard.ENTER) || game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
            this.startPlaying();
        }
    }


    /**
     *
     */
    startPlaying() {
        game.sounds.clickOk.play();
        game.state.start('StatePlaying');
    }


}

