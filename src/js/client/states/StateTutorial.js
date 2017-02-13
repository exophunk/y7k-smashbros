
export default class StateTutorial extends Phaser.State {


    /**
     *
     */
	create() {
        this.initBackground();
        this.initTutorialBoxes();
        this.initControls();
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

        this.textContinue = game.add.bitmapText(0, 0, 'font-white-big', game.texts.PRESS_TO_CONTINUE, 28);
        this.textContinue.anchor.setTo(0.5, 1);
        this.textContinue.position.setTo(game.centerX, game.world.height - 40);
    }


    /**
     *
     */
    initTutorialBoxes() {

        if(isTouchDevice) {
            this.video1 = 'tutorial-1';
            this.video2 = 'tutorial-2';
        } else {
            this.video1 = game.add.video('tutorial-video-1');
            this.video2 = game.add.video('tutorial-video-2');
            this.video1.play(true);
            this.video2.play(true);
        }

        this.box1 = game.add.sprite(game.centerX - 50, game.centerY, 'tutorial-box');
        this.box1.anchor.setTo(1, 0.5);

        this.video1Pane = game.add.sprite(game.centerX - 53, game.centerY, this.video1);
        this.video1Pane.anchor.setTo(1, 0.5);

        this.box2 = game.add.sprite(game.centerX + 50, game.centerY, 'tutorial-box');
        this.box2.anchor.setTo(0, 0.5);

        this.video2Pane = game.add.sprite(game.centerX + 53, game.centerY, this.video2);
        this.video2Pane.anchor.setTo(0, 0.5);

        let textMove = game.add.bitmapText(-this.box1.width, this.box1.height / 2 + 5, 'font-white', game.texts.TUTORIAL_MOVE, 16);
        textMove.maxWidth = this.box1.width + 20;
        let textPick = game.add.bitmapText(0, this.box2.height / 2 + 5, 'font-white', game.texts.TUTORIAL_PICK, 16);
        textPick.maxWidth = this.box2.width + 20;

        this.box1.addChild(textMove);
        this.box2.addChild(textPick);

        this.box1.scale.setTo(game.scaleFactor, game.scaleFactor);
        this.box2.scale.setTo(game.scaleFactor, game.scaleFactor);

        this.video1Pane.scale.setTo(game.scaleFactor, game.scaleFactor);
        this.video2Pane.scale.setTo(game.scaleFactor, game.scaleFactor);



    }


    /**
     *
     */
    initControls() {
        if(isTouchDevice) {
            this.textContinue.inputEnabled = true;
            this.textContinue.events.onInputDown.add(() => {
                this.startPlaying();
            }, this);
        }
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
        game.sounds.ui.clickOk.play();
        game.state.start('StatePlaying');
    }


}

