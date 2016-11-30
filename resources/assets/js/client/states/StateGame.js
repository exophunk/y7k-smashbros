import * as assets from 'client/config/CacheKeys';
import Player from 'client/objects/Player';
import Preloader from 'client/handler/Preloader';

export default class StateMenu extends Phaser.State {


	create() {

        this.initMap();
        this.player = game.gameState.player;
        this.player.addToGame(32, 32);
        this.cursors = game.input.keyboard.createCursorKeys();
        game.camera.follow(this.player.character, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
	}


    initMap() {

        game.stage.backgroundColor = '#000000';
        this.map = game.add.tilemap('tilemap_data');
        this.map.addTilesetImage('tileset_1', 'tilemap_tiles');

        this.layerBackground = this.map.createLayer('ground');
        this.layerWalls = this.map.createLayer('walls');
        this.layerObjectsCollide = this.map.createLayer('objects_collide');
        this.layerObjectsNonCollide = this.map.createLayer('objects_non_collide');
        this.layerBackground.resizeWorld();
        this.map.setCollisionByExclusion([], true, this.layerWalls);
        this.map.setCollisionByExclusion([], true, this.layerObjectsCollide);
    }


    update() {
        game.physics.arcade.collide(this.player.character, this.layerWalls);
        game.physics.arcade.collide(this.player.character, this.layerObjectsCollide);
        this.player.handleMovement(this.cursors);
    }


    preload() {
        new Preloader().loadMap();
    }

}
