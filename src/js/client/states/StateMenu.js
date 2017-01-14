
export default class StateMenu extends Phaser.State {

	create() {
        let button = game.add.button(game.world.centerX, game.world.centerY, 'btn_start', this.startSelectPlayer, this);

        //this.testingShortcut();
	}


    startSelectPlayer() {
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
