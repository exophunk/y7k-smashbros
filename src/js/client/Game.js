import StateMenu from 'client/states/StateMenu';
import StateBoot from 'client/states/StateBoot';
import StatePlayerSelect from 'client/states/StatePlayerSelect';
import StatePlaying from 'client/states/StatePlaying';

import CharacterFactory from 'client/handler/CharacterFactory';

export default class Game extends Phaser.Game {

	constructor() {

        // const canvasWidth = window.innerWidth * window.devicePixelRatio * 0.6;
        // const canvasHeight = window.innerHeight * window.devicePixelRatio * 0.6;

		super(640, 480, Phaser.AUTO, 'app', null);

		this.state.add('StateBoot', StateBoot, false);
        this.state.add('StateMenu', StateMenu, false);
        this.state.add('StatePlayerSelect', StatePlayerSelect, false);
        this.state.add('StatePlaying', StatePlaying, false);

        this.server = null;
        //this.gameState = new GameState();
        this.characterFactory = new CharacterFactory();

        this.gameState = {
            player: null,
            enemies: {},
            throwables: {}
        };

        this.physicsState = {};
    }

    start() {
		this.state.start('StateBoot');
    }
}
