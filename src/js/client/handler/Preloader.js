
let instance = null;

export default class Preloader {

    constructor() {
        if(!instance) {
            instance = this;
        }

        return instance;
    }

    loadMap() {
        game.load.tilemap('tilemap_data', '/assets/tilemaps/maps/tilemap-y7k-2.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('tilemap_tiles', '/assets/tilemaps/tiles/tilemap-y7k-2.png');
        game.load.image('collision_dummy', '/assets/sprites/collision-dummy.png');
    }

    loadCharacters() {
        game.load.pack('gabriella', '/assets/data/characters.json');
        game.load.pack('joris', '/assets/data/characters.json');
        game.load.pack('julie', '/assets/data/characters.json');
        game.load.pack('robert', '/assets/data/characters.json');
        game.load.pack('ruben', '/assets/data/characters.json');
        game.load.pack('tore', '/assets/data/characters.json');
        game.load.pack('yassin', '/assets/data/characters.json');
        game.load.pack('yves', '/assets/data/characters.json');
    }

    loadThrowables() {
        game.load.spritesheet('throwables', '/assets/sprites/throwables.png', 32, 32);
    }

}
