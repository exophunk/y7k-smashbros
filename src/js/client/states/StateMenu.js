
export default class StateMenu extends Phaser.State {

	create() {
        let button = game.add.button(game.world.centerX, game.world.centerY, 'btn_start', this.startSelectPlayer, this);

        this.testingShortcut();
	}


    startSelectPlayer() {
        this.state.start('StatePlayerSelect');
    }


    testingShortcut() {
        let allChars = game.characterFactory.getAll();
        let char = allChars[Math.floor(Math.random() * allChars.length)];
        game.gameState.selectedCharKey = char.key;
        game.isDebug = true;
        this.state.start('StatePlaying');
    }

}
