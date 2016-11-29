import * as assets from 'config/CacheKeys';

let instance = null;

export default class Preloader {

    constructor() {
        if(!instance) {
            instance = this;
        }

        return instance;
    }

    loadMap() {
        game.load.tilemap(assets.TILEMAP_LEVEL_1_MAP, '/assets/tilemaps/maps/tilemap-level-1.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image(assets.TILEMAP_LEVEL_1_TILES, '/assets/tilemaps/tiles/tilemap-level-1.png');
        game.load.pack(assets.TILEMAP_LEVEL_1_TILES, '/assets/tilemaps/tiles/tilemap-level-1.png');
    }

    loadCharacters() {
        game.load.pack('robert', '/assets/data/characters.json');
        game.load.pack('julie', '/assets/data/characters.json');
    }

}

