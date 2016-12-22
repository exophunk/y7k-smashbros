import * as assets from 'shared/config/CacheKeys';
import Preloader from 'client/handler/Preloader';
import Throwable from 'shared/objects/Throwable';
import Player from 'shared/objects/Player';
import {ThrowableTypes} from 'shared/objects/Throwable';

import MathHelper from 'shared/util/MathHelper';

const TICK_RATE = 66;
const NET_OFFSET = 100;

export default class StatePlaying extends Phaser.State {


	create() {

        this.buffer = [];

        game.stage.disableVisibilityChange = true;

        this.level = game.add.group();
        this.background = game.add.group(this.level);
        game.gameState.playerChars = game.add.group(this.level);
        game.gameState.throwables = game.add.group(this.level);
        this.decoOverlay = game.add.group(this.level);

        this.initMap();
        this.initPhysics();
        this.initHostPlayer();
        // this.initThrowables();
        this.initCamera();
        this.initControls();

        game.server.on('confirm_join', this.confirmJoin.bind(this));
        this.join();

	}



    initMap() {

        game.stage.backgroundColor = '#000000';

        this.map = game.add.tilemap('tilemap_data');
        this.map.addTilesetImage('tileset_1', 'tilemap_tiles');

        this.layerGround = this.map.createLayer('ground', null, null, this.background);
        this.layerGround2 = this.map.createLayer('ground2', null, null, this.background);
        this.layerWalls = this.map.createLayer('walls', null, null, this.background);
        this.layerFurniture = this.map.createLayer('furniture', null, null, this.background);
        this.layerDeco = this.map.createLayer('deco', null, null, this.decoOverlay);
        this.layerGround.resizeWorld();

    }



    initHostPlayer() {
        let player = new Player(game.gameState.selectedCharKey);
        player.char.setPhysics();
        player.setHostPlayer();
        player.setPos(300,300);
        game.gameState.playerChars.add(player.char);
        game.gameState.player = player;
    }


    // initThrowables() {
    //     let throwable = new Throwable(ThrowableTypes.BARREL);
    //     throwable.placeAt(900,300);
    //     game.gameState.throwables.add(throwable);

    // }


    initCamera() {
        game.camera.follow(game.gameState.player.char, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
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
        this.map.setCollisionByExclusion([], true, this.layerFurniture);
        this.layerWallsTiles = game.physics.p2.convertTilemap(this.map, this.layerWalls);
        this.layerFurnitureTiles = game.physics.p2.convertTilemap(this.map, this.layerFurniture);
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


        // let player = game.gameState.player;
        // player.char.setPhysics();
        // player.char.body.setCollisionGroup(game.physicsState.playerCollisionGroup);
        // player.char.body.collides([game.physicsState.backgroundCollisionGroup, game.physicsState.enemiesCollisionGroup]);
        // player.char.body.collides(game.physicsState.throwablesCollisionGroup, player.hitAsPlayer, player);

        // this.layerWallsTiles.forEach((tile) => {
        //     tile.setMaterial(game.physicsState.materialWall);
        //     tile.setCollisionGroup(game.physicsState.backgroundCollisionGroup);
        //     tile.collides([game.physicsState.playerCollisionGroup, game.physicsState.enemiesCollisionGroup, game.physicsState.throwablesCollisionGroup]);
        // });

        // this.layerFurnitureTiles.forEach((tile) => {
        //     tile.setMaterial(game.physicsState.materialWall);
        //     tile.setCollisionGroup(game.physicsState.backgroundCollisionGroup);
        //     tile.collides([game.physicsState.playerCollisionGroup, game.physicsState.enemiesCollisionGroup, game.physicsState.throwablesCollisionGroup]);
        // });

        // game.gameState.enemies.forEach((enemy) => {
        //     enemy.char.setPhysics();
        //     enemy.char.body.static = true;
        //     enemy.char.body.setCollisionGroup(game.physicsState.enemiesCollisionGroup);
        //     enemy.char.body.collides([game.physicsState.backgroundCollisionGroup, game.physicsState.playerCollisionGroup]);
        //     enemy.char.body.collides(game.physicsState.throwablesCollisionGroup, enemy.hitAsEnemy, enemy);
        // });

        // game.gameState.throwables.forEach((throwable) => {
        //     throwable.setPhysics();
        //     throwable.body.setCollisionGroup(game.physicsState.throwablesCollisionGroup);
        //     throwable.body.collides([game.physicsState.backgroundCollisionGroup, game.physicsState.playerCollisionGroup, game.physicsState.enemiesCollisionGroup]);
        // });

    }


    join() {
        game.server.emit('join', game.gameState.player.getFullSnapshot());
    }


    disconnected() {
        console.log('DISCONNECT FROM SERVER');
        clearTimeout(this.gameLoopTimeout);
        //window.location.reload();
    }

    confirmJoin(data) {

        game.gameState.player.id = data.id;
        this.syncWorldSnapshot(data.worldSnapshot);

        game.server.on('update_world', this.bufferServerUpdates.bind(this));
        //game.server.on('confirm_player', this.confirmPlayerInput.bind(this));
        game.server.on('enemy_joined', this.addEnemy.bind(this));
        game.server.on('enemy_left', this.removeEnemy.bind(this));
        game.server.on('disconnect', this.disconnected.bind(this));

        console.log("join confirmed");
        this.gameLoop();
    }


    // confirmPlayerInput(updatedPlayer) {
    //     //game.gameState.player.update(updatedPlayer);
    // }


    bufferServerUpdates(snapshot) {
        snapshot.clientTime = new Date().getTime();
        this.buffer.push(snapshot);

        if(this.buffer.length > 8) {
            this.buffer.shift();
        }
    }

    interpolateEntities() {
        let renderTime = new Date().getTime() - NET_OFFSET;

        let previousSnapshot;
        let targetSnapshot;

        for(let i = 0; i < this.buffer.length; i++) {

            let prev = this.buffer[i];
            let next = this.buffer[i+1];

            if(next) {
                if(renderTime >= prev.clientTime && renderTime <= next.clientTime ) {
                    previousSnapshot = prev;
                    targetSnapshot = next;
                    break;
                }
            }
        }

        if(previousSnapshot && targetSnapshot) {
            let lerpAmmount = MathHelper.mapToNormal(renderTime, previousSnapshot.clientTime, targetSnapshot.clientTime);

            Object.keys(game.gameState.enemies).forEach((id) => {
                if(game.gameState.enemies[id] && id != game.gameState.player.id) {
                    game.gameState.enemies[id].updateInterpolated(previousSnapshot.players[id], targetSnapshot.players[id], lerpAmmount);
                }
            });
        }


    }

    syncWorldSnapshot(snapshot) {
        this.syncPlayers(snapshot.players);
    }


    syncPlayers(serverPlayers) {
        // Object.keys(game.gameState.enemies).forEach((id) => {
        //     if(!serverPlayers[id]) {
        //         game.gameState.enemies[id].char.destroy();
        //         delete game.gameState.enemies[id];
        //     }
        // });

        Object.values(serverPlayers).forEach((serverPlayer) => {
            if(game.gameState.player.id !== serverPlayer.id) {
                let localPlayer = game.gameState.enemies[serverPlayer.id];
                if(localPlayer) {
                    localPlayer.update(serverPlayer);
                } else {
                    this.addEnemy(serverPlayer);
                }
            }
        });
    }


    addEnemy(enemySnapshot) {
        let enemy = new Player(enemySnapshot.char.key);
        enemy.char.setPhysics();
        enemy.update(enemySnapshot);
        game.gameState.enemies[enemy.id] = enemy;
        game.gameState.playerChars.add(enemy.char);
        console.log('Enemy joined');
    }


    removeEnemy(enemyId) {
        if(game.gameState.enemies[enemyId]) {
            game.gameState.enemies[enemyId].char.destroy();
            delete game.gameState.enemies[enemyId];
            console.log('Enemy left', enemyId);
        }
    }


    update() {

        this.interpolateEntities();

    }


    gameLoop() {

        this.handleInputControls();

        let delta = game.gameState.player.getDeltaSnapshot();
        if(Object.keys(delta).length > 1) {
            game.server.emit('update_player', delta);
        }

        this.gameLoopTimeout = setTimeout(this.gameLoop.bind(this), 1000 / TICK_RATE);
    }



    handleInputControls() {

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


    preload() {

    }

}
