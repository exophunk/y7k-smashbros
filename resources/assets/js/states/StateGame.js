import * as assets from 'config/CacheKeys';
import Player from 'objects/Player';
import Preloader from 'handler/Preloader';

export default class StateMenu extends Phaser.State {

	create() {

        this.addMap();
        this.player = game.gameState.player;
        this.player.addToGame(32, 32);

        this.cursors = game.input.keyboard.createCursorKeys();

        game.camera.follow(this.player.character, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);

	}

    addMap() {
        game.stage.backgroundColor = '#000000';
        this.map = game.add.tilemap(assets.TILEMAP_LEVEL_1_MAP);
        this.map.addTilesetImage('tmw_desert_spacing', assets.TILEMAP_LEVEL_1_TILES);

        this.layerBackground = this.map.createLayer('background');
        this.layerWalls = this.map.createLayer('walls');
        this.layerItems = this.map.createLayer('items');
        this.layerBackground.resizeWorld();
        this.map.setCollisionByExclusion([], true, this.layerWalls);
    }

    update() {

        game.physics.arcade.collide(this.player.character, this.layerWalls);
        this.player.handleMovement(this.cursors);

    }

    preload() {
        new Preloader().loadMap();
    }

}
