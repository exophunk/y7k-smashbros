import Preloader from 'handler/Preloader';

export default class StateMenu extends Phaser.State {

	create() {

        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        //this.scale.setMinMax(0, 0, 1000, 750);

		let center = { x: game.world.centerX, y: game.world.centerY };
        let button = game.add.button(center.x, center.y, 'btn_start', this.startSelectPlayer, this);

	}

    startSelectPlayer() {
        this.state.start('StatePlayerSelect');
    }


    preload() {

    }

}
