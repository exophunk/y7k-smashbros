import {PlayerConfig, GameConfig} from 'shared/configs/GameConfig';
import {PlayerStates} from 'shared/configs/ObjectStates';
import Player from 'shared/objects/Player';
import Spectator from 'client/objects/Spectator';
import Throwable from 'shared/objects/Throwable';
import OverlayDead from 'client/ui/OverlayDead';
import OverlayRoundOver from 'client/ui/OverlayRoundOver';
import HeadUpDisplay from 'client/ui/HeadUpDisplay';
import DebugDisplay from 'client/ui/DebugDisplay';


export default class StatePlaying extends Phaser.State {


    /**
     *
     */
	create() {

        game.stage.disableVisibilityChange = true;
        game.time.advancedTiming = true;
        game.paused = true;
        game.networking.statePlaying = this;

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
            game.networking.joinSpectator();
        } else {
            this.initHostPlayer();
            game.networking.join();
        }

        this.initHUD();
        this.initCamera();
        this.initControls();

        if(game.isDebug) {
            this.initDebugInfos();
        }
	}


    // --------------------------------------------------------------------------------------------
    // GAME INIT
    // --------------------------------------------------------------------------------------------

    /**
     *
     */
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


    /**
     *
     */
    initHostPlayer() {
        let player = new Player(game.gameState.selectedCharKey, game.gameState.selectedName, true);
        player.char.setPhysics();
        game.paintLayers.chars.add(player.char);
        game.gameState.player = player;
        player.spawn();
    }


    /**
     *
     */
    initSpectator() {
        game.gameState.player = new Spectator();
    }


    /**
     *
     */
    initCamera() {
        game.camera.follow(game.gameState.player.char, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
    }


    /**
     *
     */
    initControls() {
        this.cursors = game.input.keyboard.createCursorKeys();
        this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
        this.spaceBarPressed = false;
        this.lastSpacePressed = 0;

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


    /**
     *
     */
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
        contactMaterialPlayerWall.restitution = 0.5;
        contactMaterialPlayerWall.stiffness = 10000;

        let contactMaterialPlayerThrowable = game.physics.p2.createContactMaterial(game.physicsState.materialPlayer, game.physicsState.materialThrowable);
        contactMaterialPlayerThrowable.restitution = 0.2;
        contactMaterialPlayerThrowable.stiffness = 10000;

        let contactMaterialWallThrowable = game.physics.p2.createContactMaterial(game.physicsState.materialWall, game.physicsState.materialThrowable);
        contactMaterialWallThrowable.restitution = 0.2;
        contactMaterialWallThrowable.stiffness = 5000;

        let contactMaterialThrowableThrowable = game.physics.p2.createContactMaterial(game.physicsState.materialThrowable, game.physicsState.materialThrowable);
        contactMaterialThrowableThrowable.restitution = 0.2;
        contactMaterialThrowableThrowable.stiffness = 5000;

        let contactMaterialPlayerPlayer = game.physics.p2.createContactMaterial(game.physicsState.materialPlayer, game.physicsState.materialPlayer);
        contactMaterialPlayerPlayer.restitution = 0.5;
        contactMaterialPlayerPlayer.stiffness = 10000;

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


    /**
     *
     */
    initHUD() {
        this.HUD = new HeadUpDisplay();
        this.HUD.update();
    }


    /**
     *
     */
    initDebugInfos() {

        this.debugDisplay = new DebugDisplay();

        for(let spawnPoint of game.spawnPoints) {
            let spawnPointMark = game.add.graphics(0, 0);
            spawnPointMark.lineStyle(3, 0xFF0000, 1);
            spawnPointMark.drawCircle(spawnPoint.x, spawnPoint.y, 10);
            spawnPointMark.alpha = 0.4;
        }

    }


    /**
     *
     */
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


    // --------------------------------------------------------------------------------------------
    // GAME LOOP
    // --------------------------------------------------------------------------------------------

    /**
     *
     */
    update() {

        if(game.gameState.isPlaying) {
            this.calculateDeltaMultiplier();
            this.handleInputControls();
            game.networking.applyServerUpdates();
            this.HUD.update();
        } else {
            game.gameState.player.idle();
        }

    }


    /**
     *
     */
    calculateDeltaMultiplier() {
        if(game.time.totalElapsedSeconds() < 5) {
            game.gameState.deltaMultiplier = 1;
        } else {
            let multiplier = 1 / game.time.fps * game.time.desiredFps;
            multiplier = multiplier.toFixed(2)
            if(multiplier > 2) multiplier = 2;
            if(multiplier < 1) multiplier = 1;
            game.gameState.deltaMultiplier = multiplier;
        }
    }


    /**
     *
     */
    handleInputControls() {

        if(game.gameState.freezeInput) {
            game.gameState.player.idle();
            return;
        }

        if (this.spaceKey.isDown && !this.spaceBarPressed && new Date().getTime() - GameConfig.ACTION_INPUT_THROTTLE > this.lastSpacePressed) {
            this.spaceBarPressed = true;
            game.gameState.player.doAction();
            this.lastSpacePressed = new Date().getTime();
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


    /**
     *
     */
    render() {
        if(game.isDebug) {
            this.debugDisplay.render();
        }
    }


    // --------------------------------------------------------------------------------------------
    // GAME METHODS
    // --------------------------------------------------------------------------------------------

    /**
     *
     */
    playerGotHit(hitData) {
        let playerData = hitData.victim;
        let throwable = game.gameState.throwables[hitData.throwableId];
        if(playerData.id == game.gameState.player.id) {
            let player = game.gameState.player;
            player.health = playerData.health;
            player.state = playerData.state;

            if(player.state == PlayerStates.DEAD) {
                this.hostDied(throwable);
            } else {
                this.hostGotHit(throwable);
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


    /**
     *
     */
    hostGotHit(throwable) {
        game.camera.shake(0.01, 1000);
        game.gameState.player.char.showHitEffects();
        game.gameState.player.char.updateHealthBar();
        game.gameState.freezeInput = true;

        setTimeout(() => {
            game.gameState.player.state = PlayerStates.ALIVE;
        }, PlayerConfig.HIT_IMMUNE_TIME);

        setTimeout(() => {
            game.gameState.freezeInput = false;
        }, PlayerConfig.HIT_FREEZE_TIME);
    }


    /**
     *
     */
    hostDied(throwable) {
        let player = game.gameState.player;
        game.camera.shake(0.01, 2000);
        game.gameState.freezeInput = true;
        player.char.body.setCollisionGroup(game.physics.p2.createCollisionGroup());
        player.char.showDyingEffects();
        let overlayDead = new OverlayDead();

        if(game.gameState.activeThrowable) {
            game.gameState.activeThrowable.reset();
        }

        setTimeout(() => {
            overlayDead.hide();
            player.char.scale.setTo(1,1);
            player.char.alpha = 1;
            player.char.body.setCollisionGroup(game.physicsState.playerCollisionGroup);
            player.health = GameConfig.PLAYER_HEALTH;
            game.gameState.freezeInput = false;
            player.spawn();
        }, GameConfig.PLAYER_DEAD_TIME);

    }


    /**
     *
     */
    enemyGotHit(enemy) {
        enemy.char.showHitEffects();
        enemy.char.updateHealthBar();
    }


    /**
     *
     */
    enemyDied(enemy) {
        enemy.char.body.setCollisionGroup(game.physics.p2.createCollisionGroup());
        enemy.char.showDyingEffects();

        setTimeout(() => {
            enemy.char.scale.setTo(1,1);
            enemy.char.alpha = 1;
            enemy.char.nameText.alpha = 1;
            enemy.char.healthBar.alpha = 1;
            enemy.char.body.setCollisionGroup(game.physicsState.enemiesCollisionGroup);
            enemy.char.updateHealthBar(true);

        }, GameConfig.PLAYER_DEAD_TIME);
    }


    /**
     *
     */
    roundStart() {
        game.gameState.isRoundRunning = true;
    }


    /**
     *
     */
    roundOver(roundData) {
        game.gameState.isRoundRunning = false;
        game.gameState.isPlaying = false;
        game.gameState.freezeInput = true;
        this.overlayRoundOver = new OverlayRoundOver(roundData);
    }


    /**
     *
     */
    roundReset() {
        game.gameState.isRoundRunning = true;
        game.gameState.isPlaying = true;
        game.gameState.freezeInput = false;
        game.gameState.player.health = GameConfig.PLAYER_HEALTH;
        game.gameState.player.score = 0;
        game.gameState.player.deaths = 0;
        game.gameState.player.spawn();

        if(this.overlayRoundOver) {
            this.overlayRoundOver.hide();
        }
    }

}
