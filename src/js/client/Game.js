import StateMenu from 'client/states/StateMenu';
import StateBoot from 'client/states/StateBoot';
import StateLoadAssets from 'client/states/StateLoadAssets';
import StatePlayerSelect from 'client/states/StatePlayerSelect';
import StateNameSelect from 'client/states/StateNameSelect';
import StateTutorial from 'client/states/StateTutorial';
import StatePlaying from 'client/states/StatePlaying';

export default class Game extends Phaser.Game {

	constructor() {

        // const canvasWidth = window.innerWidth * window.devicePixelRatio * 0.6;
        // const canvasHeight = window.innerHeight * window.devicePixelRatio * 0.6;

		super(640, 480, Phaser.AUTO, 'app', null);

		this.state.add('StateBoot', StateBoot, false);
        this.state.add('StateLoadAssets', StateLoadAssets, false);
        this.state.add('StateMenu', StateMenu, false);
        this.state.add('StatePlayerSelect', StatePlayerSelect, false);
        this.state.add('StateNameSelect', StateNameSelect, false);
        this.state.add('StateTutorial', StateTutorial, false);
        this.state.add('StatePlaying', StatePlaying, false);

        this.server = null;
    }

    start() {
		this.state.start('StateBoot');
    }
}
