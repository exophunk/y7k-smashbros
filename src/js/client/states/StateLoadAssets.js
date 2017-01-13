
export default class StateLoadAssets extends Phaser.State {

	create() {
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.state.start('StateMenu');
	}


    preload() {
        this.loadMap();
        this.loadCharacters();
        this.loadThrowables();
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
    }


    loadData() {
        game.load.json('collision-shapes', '/build/assets/data/collision-shapes.json');
    }

}
