import Preloader from 'client/handler/Preloader';
import Player from 'shared/objects/Player';

export default class StateLoadAssets extends Phaser.State {

	create() {

        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        //this.state.start('StateMenu');
        this.testingShortCut();
	}


    testingShortCut() {
        let allChars = game.characterFactory.getAll();
        let char = allChars[Math.floor(Math.random() * allChars.length)];
        game.gameState.selectedCharKey = char.key;

        game.isDebug = false;
        this.state.start('StatePlaying');
    }


    preload() {
        this.loadMap();
        this.loadCharacters();
        this.loadThrowables();
    }


    loadMap() {
        game.load.tilemap('tilemap_data', '/build/assets/tilemaps/tilemap-y7k.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('tilemap_tiles', '/build/assets/tilemaps/tilemap-y7k.png');
        game.load.image('collision_dummy', '/build/assets/sprites/other/collision-dummy.png');
    }


    loadCharacters() {
        let characters = game.cache.getJSON('characters');

        Object.keys(characters).forEach((key) => {
            game.load.pack(key, '/build/assets/data/character-assets.json');
        });

    }


    loadThrowables() {
        game.load.pack('throwables', '/build/assets/data/throwable-assets.json');
    }

}
