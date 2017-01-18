import Networking from 'client/handler/Networking';
import {NetworkConfig} from 'client/handler/Networking';
import Player from 'shared/objects/Player';
import Spectator from 'client/objects/Spectator';
import {PlayerStates, PlayerConfig} from 'shared/objects/Player';
import Throwable from 'shared/objects/Throwable';

export default class StatePlaying extends Phaser.State {

	create() {



        game.stage.disableVisibilityChange = true;

        game.networking = new Networking();

        this.level = game.add.group();
        game.paintLayers.background = game.add.group(this.level);
        game.paintLayers.throwables = game.add.group(this.level);
        game.paintLayers.chars = game.add.group(this.level);
        game.paintLayers.overlay = game.add.group(this.level);
        game.paintLayers.ui = game.add.group();

        this.initMap();
        this.initPhysics();

        if(game.gameState.spectate) {
            this.initSpectator();
        } else {
            this.initHostPlayer();
        }

        this.initCamera();
        this.initControls();


        if(game.gameState.spectate) {
            game.networking.joinSpectator();
        } else {
            game.networking.join();
        }



	}

    initMap() {

        game.stage.backgroundColor = '#000000';

        this.map = game.add.tilemap('tilemap_data');
        this.map.addTilesetImage('tileset_1', 'tilemap_tiles');

        this.layerCollision = this.map.createLayer('collision', null, null, game.paintLayers.background);
        this.layerGround = this.map.createLayer('ground', null, null, game.paintLayers.background);
        this.layerGround2 = this.map.createLayer('ground2', null, null, game.paintLayers.background);
        this.layerWalls = this.map.createLayer('walls', null, null, game.paintLayers.background);
        this.layerFurniture = this.map.createLayer('furniture', null, null, game.paintLayers.background);
        this.layerDeco = this.map.createLayer('deco', null, null, game.paintLayers.overlay);
        this.layerGround.resizeWorld();

    }


    initHostPlayer() {
        let player = new Player(game.gameState.selectedCharKey, game.gameState.selectedName, true);
        player.char.setPhysics();

        let spawnPoints = game.cache.getJSON('spawnpoints');
        let randomSpawnPoint = spawnPoints[Math.floor(Math.random() * spawnPoints.length)]
        player.setPos(randomSpawnPoint.x,randomSpawnPoint.y);

        player.char.blink(250, PlayerConfig.SPAWN_FREEZE_TIME);
        game.paintLayers.chars.add(player.char);
        game.gameState.player = player;

        setTimeout(() => {
            player.state = PlayerStates.ALIVE;
        }, PlayerConfig.SPAWN_FREEZE_TIME);
    }


    initSpectator() {
        game.gameState.player = new Spectator();
    }


    initCamera() {
        game.camera.follow(game.gameState.player.char, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
    }


    initControls() {
        this.cursors = game.input.keyboard.createCursorKeys();
        this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
        this.spaceBarPressed = false;

        window.onblur = () => {
            this.cursors.left.isDown = false;
            this.cursors.right.isDown = false;
            this.cursors.up.isDown = false;
            this.cursors.down.isDown = false;
            game.gameState.player.char.body.setZeroVelocity();
            game.input.enabled = false;
        };

        window.onfocus = () => {
            game.input.enabled = true;
        };
    }


    initPhysics() {
        game.physics.startSystem(Phaser.Physics.P2JS);
        game.physics.p2.setImpactEvents(true);
        game.physics.p2.updateBoundsCollisionGroup();

        this.map.setCollisionByExclusion([], true, this.layerCollision);
        this.layerCollisionTiles = game.physics.p2.convertTilemap(this.map, this.layerCollision);
        game.physics.p2.setBoundsToWorld(true, true, true, true, false);

        game.physicsState.playerCollisionGroup = game.physics.p2.createCollisionGroup();
        game.physicsState.enemiesCollisionGroup = game.physics.p2.createCollisionGroup();
        game.physicsState.throwablesCollisionGroup = game.physics.p2.createCollisionGroup();
        game.physicsState.throwablesActiveCollisionGroup = game.physics.p2.createCollisionGroup();
        game.physicsState.backgroundCollisionGroup = game.physics.p2.createCollisionGroup();

        game.physicsState.materialWall = game.physics.p2.createMaterial('material-wall');
        game.physicsState.materialPlayer = game.physics.p2.createMaterial('material-player');
        game.physicsState.materialThrowable = game.physics.p2.createMaterial('material-throwable');

        let contactMaterialPlayerWall = game.physics.p2.createContactMaterial(game.physicsState.materialPlayer, game.physicsState.materialWall);
        contactMaterialPlayerWall.restitution = 1;
        contactMaterialPlayerWall.stiffness = 8000;

        let contactMaterialPlayerThrowable = game.physics.p2.createContactMaterial(game.physicsState.materialPlayer, game.physicsState.materialThrowable);
        contactMaterialPlayerThrowable.restitution = 0.2;
        contactMaterialPlayerThrowable.stiffness = 8000;

        let contactMaterialWallThrowable = game.physics.p2.createContactMaterial(game.physicsState.materialWall, game.physicsState.materialThrowable);
        contactMaterialWallThrowable.restitution = 0.2;
        contactMaterialWallThrowable.stiffness = 5000;

        let contactMaterialThrowableThrowable = game.physics.p2.createContactMaterial(game.physicsState.materialThrowable, game.physicsState.materialThrowable);
        contactMaterialThrowableThrowable.restitution = 0.2;
        contactMaterialThrowableThrowable.stiffness = 5000;

        let contactMaterialPlayerPlayer = game.physics.p2.createContactMaterial(game.physicsState.materialPlayer, game.physicsState.materialPlayer);
        contactMaterialPlayerPlayer.restitution = 1;
        contactMaterialPlayerPlayer.stiffness = 8000;

        let collisionShapes = game.cache.getJSON('collision-shapes');
        collisionShapes.forEach((shape) => {
            this.addCollisionShape(shape.x, shape.y, shape.w, shape.h);
        })

        this.layerCollisionTiles.forEach((tile) => {
            tile.setMaterial(game.physicsState.materialWall);
            tile.setCollisionGroup(game.physicsState.backgroundCollisionGroup);
            tile.collides([game.physicsState.playerCollisionGroup, game.physicsState.enemiesCollisionGroup, game.physicsState.throwablesActiveCollisionGroup]);
        });

    }


    addCollisionShape(x, y, w, h) {
        let collisionShape = game.add.sprite(x + w/2, y + h/2, null);
        game.physics.p2.enable(collisionShape, game.isDebug);
        collisionShape.body.static = true;
        collisionShape.body.setRectangle(w,h);
        collisionShape.body.setMaterial(game.physicsState.materialWall);
        collisionShape.body.setCollisionGroup(game.physicsState.backgroundCollisionGroup);
        collisionShape.body.collides([game.physicsState.playerCollisionGroup, game.physicsState.enemiesCollisionGroup, game.physicsState.throwablesActiveCollisionGroup]);
        collisionShape.renderable = false;
    }


    update() {
        this.handleInputControls();
        game.networking.interpolateEntities();
    }






    handleInputControls() {

        if(game.gameState.freezeInput) return;

        if (this.spaceKey.isDown && !this.spaceBarPressed) {
            this.spaceBarPressed = true;
            game.gameState.player.doAction();
        }
        if (this.spaceKey.isUp) { this.spaceBarPressed = false; }

        if (this.cursors.left.isDown) {
            game.gameState.player.moveLeft();
        } else if (this.cursors.right.isDown) {
            game.gameState.player.moveRight();
        } else if (this.cursors.up.isDown) {
            game.gameState.player.moveUp();
        } else if (this.cursors.down.isDown) {
            game.gameState.player.moveDown();
        } else {
            game.gameState.player.idle();
        }
    }


}
