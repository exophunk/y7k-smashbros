
export default class StateMenu extends Phaser.State {

	create() {
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
