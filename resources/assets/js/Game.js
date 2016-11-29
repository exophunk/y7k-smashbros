import StateMenu from 'states/StateMenu';
import StatePlayerSelect from 'states/StatePlayerSelect';
import StateGame from 'states/StateGame';

import GameState from 'handler/GameState';
import CharacterFactory from 'handler/CharacterFactory';

export default class Game extends Phaser.Game {

	constructor() {

        // const canvasWidth = window.innerWidth * window.devicePixelRatio * 0.6;
        // const canvasHeight = window.innerHeight * window.devicePixelRatio * 0.6;

		super(640, 480, Phaser.AUTO, 'app', null);
		this.state.add('StateMenu', StateMenu, false);
        this.state.add('StatePlayerSelect', StatePlayerSelect, false);
        this.state.add('StateGame', StateGame, false);

        this.gameState = new GameState();
        this.characterFactory = new CharacterFactory();
    }

    start() {
		this.state.start('StateMenu');
    }
}
