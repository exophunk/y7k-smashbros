import StateBoot from 'client/states/StateBoot';
import StateLoadAssets from 'client/states/StateLoadAssets';
import StateMenu from 'client/states/StateMenu';
import StateNameSelect from 'client/states/StateNameSelect';
import StatePlayerSelect from 'client/states/StatePlayerSelect';
import StatePlaying from 'client/states/StatePlaying';
import StatePrepareAssets from 'client/states/StatePrepareAssets';
import StateTutorial from 'client/states/StateTutorial';

export default class Game extends Phaser.Game {

	constructor() {

        // const canvasWidth = window.innerWidth * window.devicePixelRatio * 0.6;
        // const canvasHeight = window.innerHeight * window.devicePixelRatio * 0.6;

        let gameWidth, gameHeight, mobile;

        if(window.innerWidth > 667) {
            mobile = false;
            gameWidth = 640;
            gameHeight = 480;
        } else {
            mobile = true;
            gameWidth = 667;
            gameHeight = 375;
        }

		super(gameWidth, gameHeight, Phaser.AUTO, 'app', null);

        this.state.add('StateBoot', StateBoot, false);
        this.state.add('StateLoadAssets', StateLoadAssets, false);
        this.state.add('StateMenu', StateMenu, false);
        this.state.add('StateNameSelect', StateNameSelect, false);
        this.state.add('StatePlayerSelect', StatePlayerSelect, false);
        this.state.add('StatePlaying', StatePlaying, false);
        this.state.add('StatePrepareAssets', StatePrepareAssets, false);
        this.state.add('StateTutorial', StateTutorial, false);

        this.gameHeight = gameHeight;
        this.gameWidth = gameWidth;
        this.mobile = mobile;
        this.scaleFactor = this.gameHeight / 480;

    }


    /**
     *
     */
    start() {
		this.state.start('StateBoot');
    }
}
