
let instance = null;

export default class Preloader {

    constructor() {
        if(!instance) {
            instance = this;
        }

        return instance;
    }

    loadMap() {
        game.load.tilemap('tilemap_data', '/assets/tilemaps/maps/tilemap-y7k-1.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('tilemap_tiles', '/assets/tilemaps/tiles/tilemap-y7k-1.png');
    }

    loadCharacters() {
        game.load.pack('robert', '/assets/data/characters.json');
        game.load.pack('julie', '/assets/data/characters.json');
    }

    loadThrowables() {
        game.load.spritesheet('throwables', '/assets/sprites/throwables.png', 32, 32);
    }

}
