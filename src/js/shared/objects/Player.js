import SnapshotHelper from 'shared/util/SnapshotHelper';
import MathHelper from 'shared/util/MathHelper';
import {PlayerConfig, GameConfig} from 'shared/configs/GameConfig';
import {PlayerStates} from 'shared/configs/ObjectStates';

export default class Player {


    /**
     *
     */
	constructor(charKey, name, isHost) {

        this.id = null;
        this.isHost = isHost;
        this.health = GameConfig.PLAYER_HEALTH;
        this.state = PlayerStates.SPAWNED;
        this.score = 0;
        this.name = name ? name : 'Unknown';

        if(isClient) {
            this.initClient(charKey);
        } else {
            this.initServer(charKey);
        }

        this.lastSnapshot = {};
    }


    /**
     *
     */
    initClient(charKey) {
        this.char = game.characterFactory.getCharacter(charKey);
        this.char.isHost = this.isHost;
        this.char.player = this;
        this.char.addNameText(this.name);
    }


    /**
     *
     */
    initServer(charKey) {
        this.char = {
            key: charKey,
            facing: '',
            isMoving: false,
            body: {
                x: 0,
                y: 0,
            }
        }
    }


    /**
     *
     */
    spawn() {
        let randomSpawnPoint = game.spawnPoints[Math.floor(Math.random() * game.spawnPoints.length)]
        this.char.body.x = randomSpawnPoint.x;
        this.char.body.y = randomSpawnPoint.y;
        this.char.blink(250, PlayerConfig.SPAWN_FREEZE_TIME);

        setTimeout(() => {
            this.state = PlayerStates.ALIVE;
        }, PlayerConfig.SPAWN_FREEZE_TIME);
    }


    /**
     *
     */
    moveLeft() {
        this.char.moveLeft();
        this.setCarryAnchor();
    }


    /**
     *
     */
    moveRight() {
        this.char.moveRight();
        this.setCarryAnchor();
    }


    /**
     *
     */
    moveUp() {
        this.char.moveUp();
        this.setCarryAnchor();
    }


    /**
     *
     */
    moveDown() {
        this.char.moveDown();
        this.setCarryAnchor();
    }


    /**
     *
     */
    idle() {
        this.char.idle();
    }


    /**
     *
     */
    doAction() {

        if(game.gameState.activeThrowable && game.gameState.activeThrowable.isCarried()) {
            game.gameState.activeThrowable.throw();
        } else {
            let throwablesArr = Object.values(game.gameState.throwables);
            let foundAThrowable = false;
            for(let throwable of Object.values(game.gameState.throwables)) {
                if(throwable.canBePickedUp()) {
                    throwable.pickup();
                    foundAThrowable = true;
                    break;
                }
            }

            if(!foundAThrowable) {
                for(let throwable of Object.values(game.gameState.throwables)) {
                    throwable.item.showObjectGlow();
                }
            }
        }

    }


    /**
     *
     */
    hitAsEnemy(playerBody, throwableBody) {
        let throwable = throwableBody.sprite.throwable;
        let player = playerBody.sprite.player;
        if(throwable.isThrown() && player.state == PlayerStates.ALIVE) {
            let enemy = playerBody.sprite.player;
            game.networking.sendHitEnemy(enemy.id);
        }
    }


    /**
     *
     */
    setCarryAnchor() {

        if(game.gameState.activeThrowable && game.gameState.activeThrowable.isCarried()) {
            switch(this.char.facing) {
                case 'left':
                    game.gameState.activeThrowable.item.anchor.setTo(1.125, 0.5);
                    game.gameState.activeThrowable.item.overlay.anchor.setTo(1.125, 0.5);
                    break;
                case 'right':
                    game.gameState.activeThrowable.item.anchor.setTo(-0.125, 0.5);
                    game.gameState.activeThrowable.item.overlay.anchor.setTo(-0.125, 0.5);
                    break;
                case 'up':
                    game.gameState.activeThrowable.item.anchor.setTo(0.5, 1.125);
                    game.gameState.activeThrowable.item.overlay.anchor.setTo(0.5, 1.125);
                    break;
                case 'down':
                    game.gameState.activeThrowable.item.anchor.setTo(0.5, -0.125);
                    game.gameState.activeThrowable.item.overlay.anchor.setTo(0.5, -0.125);
                    break;
            }
        }
    }



    // --------------------------------------------------------------------------------------------------
    // NETWORKING METHODS
    //


    /**
     *
     */
    getFullSnapshot() {
        return {
            id: this.id,
            health: this.health,
            name: this.name,
            score: this.score,
            state: this.state,
            char: {
                key: this.char.key,
                facing: this.char.facing,
                isMoving: this.char.isMoving,
                body: {
                    x: this.char.body ? this.char.body.x : 0,
                    y: this.char.body ? this.char.body.y : 0,
                }
            }
        }
    }


    /**
     *
     */
    getDeltaSnapshot() {
        let snapshot = this.getFullSnapshot();
        let delta = SnapshotHelper.getObjectDelta(snapshot, this.lastSnapshot, ['id']);
        this.lastSnapshot = snapshot;
        return delta;
    }


    /**
     *
     */
    update(snapshot) {
        SnapshotHelper.patchObject(this, snapshot);
    }


    /**
     *
     */
    updateInterpolated(previousSnapshot, targetSnapshot, lerpAmmount) {
        previousSnapshot = SnapshotHelper.patchObject(this.getFullSnapshot(), previousSnapshot);
        let interpolatedSnapshot = SnapshotHelper.patchObject(this.getFullSnapshot(), targetSnapshot);

        let prevFacing = this.facing;
        let prevIsMoving = this.isMoving;

        interpolatedSnapshot.char.body.x = MathHelper.interpolate(previousSnapshot.char.body.x, interpolatedSnapshot.char.body.x, lerpAmmount);
        interpolatedSnapshot.char.body.y = MathHelper.interpolate(previousSnapshot.char.body.y, interpolatedSnapshot.char.body.y, lerpAmmount);
        this.update(interpolatedSnapshot);

        this.char.updateAnimation(prevFacing, prevIsMoving, interpolatedSnapshot.char.facing, interpolatedSnapshot.char.isMoving);

    }


}
