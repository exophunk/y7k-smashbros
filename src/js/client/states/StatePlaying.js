import SocketIO from 'socket.io-client';
import MathHelper from 'shared/util/MathHelper';
import Player from 'shared/objects/Player';
import {PlayerStates, PlayerConfig} from 'shared/objects/Player';
import Throwable from 'shared/objects/Throwable';


const INPUT_RATE = 30;
const NET_OFFSET = 100;

export default class StatePlaying extends Phaser.State {


	create() {

        game.server = SocketIO();
        this.netBuffer = [];

        game.stage.disableVisibilityChange = true;


        this.level = game.add.group();
        game.paintLayers.background = game.add.group(this.level);
        game.paintLayers.throwables = game.add.group(this.level);
        game.paintLayers.chars = game.add.group(this.level);
        game.paintLayers.overlay = game.add.group(this.level);
        game.paintLayers.ui = game.add.group();

        this.initMap();
        this.initPhysics();
        this.initHostPlayer();
        this.initCamera();
        this.initControls();

        game.server.on('confirm_join', this.confirmJoin.bind(this));
        this.join();



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
        this.interpolateEntities();
    }


    inputLoop() {

        let updatesDelta = {
            player: game.gameState.player.getDeltaSnapshot()
        };

        if(game.gameState.activeThrowable) {
            updatesDelta.throwable = game.gameState.activeThrowable.getDeltaSnapshot();
        }

        if(Object.keys(updatesDelta.player).length > 1 || (updatesDelta.throwable && Object.keys(updatesDelta.throwable).length > 1)) {
            game.server.emit('update_from_client', updatesDelta);
        }

        this.inputLoopTimeout = setTimeout(this.inputLoop.bind(this), 1000 / INPUT_RATE);
    }



    handleInputControls() {

        if(this.freezeInput) return;

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


    playerGotHit(playerData) {
        console.log('playa got hit', playerData.id);
        if(playerData.id == game.gameState.player.id) {
            let player = game.gameState.player;
            player.health = playerData.health;
            player.state = playerData.state;

            if(player.state == PlayerStates.DEAD) {
                this.hostDied();
            } else {
                this.hostGotHit();
            }
        } else {
            let enemy = game.gameState.enemies[playerData.id];
            if(enemy) {
                enemy.update(playerData);
                if(enemy.state == PlayerStates.DEAD) {
                    this.enemyDied(enemy);
                } else {
                    this.enemyGotHit(enemy);
                }
            }
        }

    }


    hostGotHit() {
        console.log("host got hit");
        game.camera.shake(0.01, 1000);
        game.gameState.player.char.showHitEffects();
        this.freezeInput = true;

        setTimeout(() => {
            game.gameState.player.state = PlayerStates.ALIVE;
        }, PlayerConfig.HIT_IMMUNE_TIME);

        setTimeout(() => {
            this.freezeInput = false;
        }, PlayerConfig.HIT_FREEZE_TIME);
    }


    hostDied() {
        this.freezeInput = true;
        game.gameState.player.char.showDyingEffects();
    }


    enemyGotHit(enemy) {
        console.log("enemy got hit");
        enemy.char.showHitEffects();
    }


    enemyDied(enemy) {
        console.log("enemy died");
        enemy.char.showDyingEffects();
    }


    // --------------------------------------------------------------------------------------------------
    // NETWORKING METHODS
    //



    join() {
        game.server.emit('join', game.gameState.player.getFullSnapshot());
    }


    disconnected() {
        console.log('DISCONNECT FROM SERVER');
        clearTimeout(this.inputLoopTimeout);
        game.state.start('StateMenu');
    }


    confirmJoin(data) {

        game.gameState.player.id = data.id;
        this.syncWorldSnapshot(data.worldSnapshot);

        game.server.on('update_world', this.bufferServerUpdates.bind(this));
        game.server.on('player_got_hit', this.playerGotHit.bind(this));
        game.server.on('enemy_joined', this.addEnemy.bind(this));
        game.server.on('enemy_left', this.removeEnemy.bind(this));
        game.server.on('disconnect', this.disconnected.bind(this));

        this.inputLoop();
    }


    bufferServerUpdates(snapshot) {
        snapshot.clientTime = new Date().getTime();
        this.netBuffer.push(snapshot);

        if(this.netBuffer.length > 8) {
            this.netBuffer.shift();
        }
    }


    interpolateEntities() {
        let renderTime = new Date().getTime() - NET_OFFSET;

        let previousSnapshot;
        let targetSnapshot;

        for(let i = 0; i < this.netBuffer.length; i++) {

            let prev = this.netBuffer[i];
            let next = this.netBuffer[i+1];

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

            if(previousSnapshot.players && targetSnapshot.players) {
                Object.keys(game.gameState.enemies).forEach((id) => {
                    if(game.gameState.enemies[id] && id != game.gameState.player.id) {
                        game.gameState.enemies[id].updateInterpolated(previousSnapshot.players[id], targetSnapshot.players[id], lerpAmmount);
                    }
                });

            }

            Object.keys(game.gameState.throwables).forEach((id) => {
                if(!game.gameState.activeThrowable || id != game.gameState.activeThrowable.id) {
                    game.gameState.throwables[id].updateInterpolated(previousSnapshot.throwables[id], targetSnapshot.throwables[id], lerpAmmount);
                }
            });
        }


    }

    syncWorldSnapshot(snapshot) {
        this.syncPlayers(snapshot.players);
        this.syncThrowables(snapshot.throwables);
    }


    syncPlayers(serverPlayers) {
        Object.values(serverPlayers).forEach((serverPlayer) => {
            if(game.gameState.player.id != serverPlayer.id) {
                let localPlayer = game.gameState.enemies[serverPlayer.id];
                if(localPlayer) {
                    localPlayer.update(serverPlayer);
                } else {
                    this.addEnemy(serverPlayer);
                }
            }
        });
    }


    syncThrowables(serverThrowables) {
        Object.values(serverThrowables).forEach((serverThrowable) => {
            if(!game.gameState.activeThrowable || game.gameState.activeThrowable.id != serverThrowable.id) {
                let localThrowable = game.gameState.throwables[serverThrowable.id];
                if(localThrowable) {
                    localThrowable.update(serverThrowable);
                } else {
                    this.addThrowable(serverThrowable);
                }
            }
        });
    }


    addEnemy(enemySnapshot) {
        let enemy = new Player(enemySnapshot.char.key, enemySnapshot.name, false);
        enemy.char.setPhysics();
        enemy.update(enemySnapshot);
        game.gameState.enemies[enemy.id] = enemy;
        game.paintLayers.chars.add(enemy.char);
        console.log('Enemy joined');
    }


    removeEnemy(enemyId) {
        if(game.gameState.enemies[enemyId]) {
            game.gameState.enemies[enemyId].char.destroy();
            delete game.gameState.enemies[enemyId];
            console.log('Enemy left', enemyId);
        }
    }


    addThrowable(throwableSnapshot) {
        let throwable = new Throwable(throwableSnapshot.id, throwableSnapshot.item.key);
        throwable.item.setPhysics();
        throwable.update(throwableSnapshot);
        game.gameState.throwables[throwable.id] = throwable;
        game.paintLayers.throwables.add(throwable.item);
    }





}
