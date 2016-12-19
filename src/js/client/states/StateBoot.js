import Preloader from 'client/handler/Preloader';
import Player from 'shared/objects/Player';

export default class StateBoot extends Phaser.State {

	create() {

        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        //this.state.start('StateMenu');
        this.testingShortCut();
	}


    preload() {
        const preloader = new Preloader();
        preloader.loadMap();
        preloader.loadCharacters();
        preloader.loadThrowables();
    }



    testingShortCut() {

        game.gameState.selectedCharKey = 'robert';

        game.isDebug = true;
        this.state.start('StatePlaying');
    }

}
