
export default class StateTutorial extends Phaser.State {

	create() {
        this.background = game.add.image(game.world.centerX, game.world.centerY, 'screen-tutorial');
        let scaleFactor = game.gameHeight / this.background.height;
        this.background.anchor.setTo(0.5, 0.5);
        this.background.scale.set(scaleFactor, scaleFactor);
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

