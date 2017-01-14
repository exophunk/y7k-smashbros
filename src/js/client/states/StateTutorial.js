
export default class StateTutorial extends Phaser.State {

	create() {

	}


    update() {
        if (game.input.keyboard.isDown(Phaser.Keyboard.ENTER) || game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
            this.startPlaying();
        }
    }


    startPlaying() {
        game.state.start('StatePlaying');
    }


}

