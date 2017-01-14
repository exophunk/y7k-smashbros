
export default class StateLoadAssets extends Phaser.State {

	create() {
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.state.start('StateMenu');
        //game.state.start('StatePlayerSelect');
	}


    preload() {
        this.loadMap();
        this.loadCharacters();
        this.loadThrowables();
        this.loadImages();
        this.loadAudio();
        this.loadData();
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
        game.load.pack('throwable-overlays', '/build/assets/data/throwable-assets.json');
    }


    loadData() {
        game.load.json('spawnpoints', '/build/assets/data/spawnpoints.json');
        game.load.json('collision-shapes', '/build/assets/data/collision-shapes.json');
    }


    loadImages() {
        game.load.image('screen-start', '/build/assets/images/screen-start.png');
        game.load.image('screen-playerselect', '/build/assets/images/screen-playerselect.png');
        game.load.image('screen-name', '/build/assets/images/screen-name.png');
        game.load.image('screen-tutorial', '/build/assets/images/screen-tutorial.png');
        game.load.image('select-cursor', '/build/assets/images/select-cursor.png');
        game.load.image('text-1-credit', '/build/assets/images/text-1-credit.png');
    }


    loadAudio() {

    }

}
