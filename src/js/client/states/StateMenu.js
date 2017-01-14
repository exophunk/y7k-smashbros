
export default class StateMenu extends Phaser.State {

	create() {
        this.background = game.add.image(game.world.centerX, game.world.centerY, 'screen-start');
        let scaleFactor = game.gameHeight / this.background.height;
        this.background.anchor.setTo(0.5, 0.5);
        this.background.scale.set(scaleFactor, scaleFactor);

        //this.testingShortcut();
	}


    update() {
        if (game.input.keyboard.isDown(Phaser.Keyboard.ENTER) || game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
            this.nextStep();
        }
    }


    nextStep() {
        game.state.start('StatePlayerSelect');
    }


    testingShortcut() {
        let allChars = game.characterFactory.getAllCharacters();
        let char = allChars[Math.floor(Math.random() * allChars.length)];
        game.gameState.selectedCharKey = char.key;
        game.isDebug = true;
        game.state.start('StatePlaying');
    }

}
