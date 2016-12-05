import Preloader from 'client/handler/Preloader';

export default class StateMenu extends Phaser.State {

	create() {

        let button = game.add.button(game.world.centerX, game.world.centerY, 'btn_start', this.startSelectPlayer, this);
	}


    startSelectPlayer() {
        this.state.start('StatePlayerSelect');
    }


    preload() {

    }

}
