import Preloader from 'client/handler/Preloader';
import Player from 'client/objects/Player';

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
        game.gameState.player = new Player(game.characterFactory.get('robert'));

        game.server.emit('join', game.gameState.player.getState());


        let enemy = new Player(game.characterFactory.get('julie'));
        game.gameState.enemies.push(enemy);

        game.isDebug = true;
        this.state.start('StateGame');
    }

}
