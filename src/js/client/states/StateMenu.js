
export default class StateMenu extends Phaser.State {


    /**
     *
     */
	create() {


        if(game.gameState.forcedRoom && game.gameState.spectate) {
            this.spectate();
        }

        //this.testingShortcut();

        game.world.setBounds(0, 0, game.gameWidth, game.gameHeight);
        let background = game.add.image(game.centerX, game.centerY, 'screen-start');
        background.anchor.setTo(0.5, 0.5);
        background.scale.set(game.scaleFactor, game.scaleFactor);

        let textContinue = game.add.bitmapText(0, 0, 'font-white-big', game.texts.PRESS_TO_CONTINUE, 28);
        textContinue.anchor.setTo(0.5, 0);
        textContinue.position.setTo(game.centerX, game.centerY + (game.scaleFactor * 105));

        let textFooter2 = game.add.bitmapText(0, 0, 'font-white', game.texts.START_FOOTER_ROW_2, 16);
        textFooter2.anchor.setTo(1, 1);
        textFooter2.position.setTo(game.gameWidth - 10, game.gameHeight - 10);

        let textFooter1 = game.add.bitmapText(0, 0, 'font-white', game.texts.START_FOOTER_ROW_1, 16);
        textFooter1.anchor.setTo(1, 1);
        textFooter1.position.setTo(game.gameWidth - 10, game.gameHeight - 10 - textFooter2.height - 3);

        game.time.events.loop(700, () => {
            textFooter1.alpha = textFooter1.alpha ? 0 : 1;
        }, this);

        game.sounds.music.play();

        game.input.onTap.add((pointer, doubleTap) => {
            this.nextStep();
        }, this);
	}


    /**
     *
     */
    update() {
        if (game.input.keyboard.isDown(Phaser.Keyboard.ENTER) || game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
            this.nextStep();
        }
    }


    /**
     *
     */
    nextStep() {
        game.sounds.ui.clickOk.play();
        game.state.start('StatePlayerSelect');
    }


    /**
     *
     */
    spectate() {
        game.state.start('StatePlaying');
    }


    /**
     *
     */
    testingShortcut() {
        let allChars = game.characterFactory.getAllCharacters();
        let char = allChars[Math.floor(Math.random() * allChars.length)];
        game.gameState.selectedCharKey = char.key;
        game.gameState.selectedName = 'Peter';
        game.state.start('StatePlaying');
        //game.state.start('StateTutorial');
    }

}
