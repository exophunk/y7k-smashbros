import * as assets from 'client/config/CacheKeys';
import Player from 'client/objects/Player';
import Preloader from 'client/handler/Preloader';
import Throwable from 'client/objects/Throwable';
import {ThrowableTypes} from 'client/objects/Throwable';

export default class StateGame extends Phaser.State {


	create() {

        this.level = game.add.group();
        this.background = game.add.group(this.level);
        game.gameState.playerChars = game.add.group(this.level);
        game.gameState.throwables = game.add.group(this.level);
        this.decoOverlay = game.add.group(this.level);

        this.initMap();
        this.initPlayers();
        this.initThrowables();
        this.initCamera();
        this.initControls();
        this.initPhysics();

	}



    initMap() {

        game.stage.backgroundColor = '#000000';

        this.map = game.add.tilemap('tilemap_data');
        this.map.addTilesetImage('tileset_1', 'tilemap_tiles');

        this.layerBackground = this.map.createLayer('ground', null, null, this.background);
        this.layerWalls = this.map.createLayer('walls', null, null, this.background);
        this.layerObjectsCollide = this.map.createLayer('objects_collide', null, null, this.background);
        this.layerObjectsNonCollide = this.map.createLayer('objects_non_collide', null, null, this.background);
        this.layerBackground.resizeWorld();

    }



    initPlayers() {
        this.player = game.gameState.player;
        this.player.placeAt(850, 250);
        game.gameState.playerChars.add(this.player.character);

        let enemy = game.gameState.enemies[0];
        enemy.placeAt(750, 350);
        game.gameState.playerChars.add(enemy.character);

    }


    initThrowables() {
        let throwable = new Throwable(ThrowableTypes.BARREL);
        throwable.placeAt(900,300);
        game.gameState.throwables.add(throwable);

    }


    initCamera() {
        game.camera.follow(this.player.character, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
    }


    initControls() {
        this.cursors = game.input.keyboard.createCursorKeys();
        this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
        this.spaceBarPressed = false;
    }


    initPhysics() {
        game.physics.startSystem(Phaser.Physics.P2JS);
        game.physics.p2.setImpactEvents(true);
        game.physics.p2.updateBoundsCollisionGroup();

        this.map.setCollisionByExclusion([], true, this.layerWalls);
        this.map.setCollisionByExclusion([], true, this.layerObjectsCollide);
        this.layerWallsTiles = game.physics.p2.convertTilemap(this.map, this.layerWalls);
        this.layerObjectsCollideTiles = game.physics.p2.convertTilemap(this.map, this.layerObjectsCollide);
        game.physics.p2.setBoundsToWorld(true, true, true, true, false);

        game.physicsState.playerCollisionGroup = game.physics.p2.createCollisionGroup();
        game.physicsState.enemiesCollisionGroup = game.physics.p2.createCollisionGroup();
        game.physicsState.throwablesCollisionGroup = game.physics.p2.createCollisionGroup();
        game.physicsState.backgroundCollisionGroup = game.physics.p2.createCollisionGroup();

        game.physicsState.materialWall = game.physics.p2.createMaterial('material-wall');
        game.physicsState.materialPlayer = game.physics.p2.createMaterial('material-player');
        game.physicsState.materialThrowable = game.physics.p2.createMaterial('material-throwable');

        let contactMaterialPlayerWall = game.physics.p2.createContactMaterial(game.physicsState.materialPlayer, game.physicsState.materialWall);
        contactMaterialPlayerWall.restitution = 0.01;
        contactMaterialPlayerWall.stiffness = Number.MAX_VALUE;

        let contactMaterialPlayerThrowable = game.physics.p2.createContactMaterial(game.physicsState.materialPlayer, game.physicsState.materialThrowable);
        contactMaterialPlayerThrowable.restitution = 0.2;
        contactMaterialPlayerThrowable.stiffness = Number.MAX_VALUE;

        let contactMaterialWallThrowable = game.physics.p2.createContactMaterial(game.physicsState.materialWall, game.physicsState.materialThrowable);
        contactMaterialWallThrowable.restitution = 0.01;
        contactMaterialWallThrowable.stiffness = Number.MAX_VALUE;

        let contactMaterialPlayerPlayer = game.physics.p2.createContactMaterial(game.physicsState.materialPlayer, game.physicsState.materialPlayer);
        contactMaterialPlayerPlayer.restitution = 0.2;
        contactMaterialPlayerPlayer.stiffness = 1000;


        let player = game.gameState.player;
        player.character.setPhysics();
        player.character.body.setCollisionGroup(game.physicsState.playerCollisionGroup);
        player.character.body.collides([game.physicsState.backgroundCollisionGroup, game.physicsState.enemiesCollisionGroup]);
        player.character.body.collides(game.physicsState.throwablesCollisionGroup, player.hitAsPlayer, player);

        this.layerWallsTiles.forEach((tile) => {
            tile.setMaterial(game.physicsState.materialWall);
            tile.setCollisionGroup(game.physicsState.backgroundCollisionGroup);
            tile.collides([game.physicsState.playerCollisionGroup, game.physicsState.enemiesCollisionGroup, game.physicsState.throwablesCollisionGroup]);
        });

        this.layerObjectsCollideTiles.forEach((tile) => {
            tile.setMaterial(game.physicsState.materialWall);
            tile.setCollisionGroup(game.physicsState.backgroundCollisionGroup);
            tile.collides([game.physicsState.playerCollisionGroup, game.physicsState.enemiesCollisionGroup, game.physicsState.throwablesCollisionGroup]);
        });

        game.gameState.enemies.forEach((enemy) => {
            enemy.character.setPhysics();
            enemy.character.body.static = true;
            enemy.character.body.setCollisionGroup(game.physicsState.enemiesCollisionGroup);
            enemy.character.body.collides([game.physicsState.backgroundCollisionGroup, game.physicsState.playerCollisionGroup]);
            enemy.character.body.collides(game.physicsState.throwablesCollisionGroup, enemy.hitAsEnemy, enemy);
        });

        game.gameState.throwables.forEach((throwable) => {
            throwable.setPhysics();
            throwable.body.setCollisionGroup(game.physicsState.throwablesCollisionGroup);
            throwable.body.collides([game.physicsState.backgroundCollisionGroup, game.physicsState.playerCollisionGroup, game.physicsState.enemiesCollisionGroup]);
        });

    }


    update() {

        this.handleInputControls();
    }


    handleInputControls() {

        if (this.spaceKey.isDown && !this.spaceBarPressed) {
            this.spaceBarPressed = true;
            this.player.doAction();
        }
        if (this.spaceKey.isUp) { this.spaceBarPressed = false; }

        if (this.cursors.left.isDown) {
            this.player.moveLeft();
        } else if (this.cursors.right.isDown) {
            this.player.moveRight();
        } else if (this.cursors.up.isDown) {
            this.player.moveUp();
        } else if (this.cursors.down.isDown) {
            this.player.moveDown();
        } else {
            this.player.idle();
        }
    }


    preload() {

    }

}
