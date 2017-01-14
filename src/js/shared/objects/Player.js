import SnapshotHelper from 'shared/util/SnapshotHelper';
import MathHelper from 'shared/util/MathHelper';

export const PlayerStates = {
    ALIVE: 0,
    HIT: 1,
    DEAD: 3,
    SPAWNED: 4
}


export const PlayerConfig = {
    HEALTH: 5,
    HIT_IMMUNE_TIME: 2000,
    HIT_FREEZE_TIME: 500,
    SPAWN_FREEZE_TIME: 1000,
    WALK_SPEED: 200
}

export default class Player {


	constructor(charKey, isHost) {

        this.id = null;
        this.isHost = isHost;
        this.health = PlayerConfig.HEALTH;
        this.state = PlayerStates.SPAWNED;

        if(isClient) {
            this.initClient(charKey);
        } else {
            this.initServer(charKey);
        }

        this.lastSnapshot = {};
    }


    initClient(charKey) {
        this.char = game.characterFactory.get(charKey);
        this.char.isHost = this.isHost;
        this.char.player = this;
    }


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


    setPos(x, y) {
        this.char.body.x = x;
        this.char.body.y = y;
    }


    moveLeft() {
        this.char.moveLeft();
        this.setCarryAnchor();
    }


    moveRight() {
        this.char.moveRight();
        this.setCarryAnchor();
    }


    moveUp() {
        this.char.moveUp();
        this.setCarryAnchor();
    }


    moveDown() {
        this.char.moveDown();
        this.setCarryAnchor();
    }


    idle() {
        this.char.idle();
    }


    doAction() {

        if(game.gameState.activeThrowable && game.gameState.activeThrowable.isCarried()) {
            game.gameState.activeThrowable.throw();
        } else {
            let throwablesArr = Object.values(game.gameState.throwables);
            for(let throwable of Object.values(game.gameState.throwables)) {
                if(throwable.canBePickedUp()) {
                    throwable.pickup();
                    break;
                }
            }
        }

    }


    hitAsEnemy(playerBody, throwableBody) {
        let throwable = throwableBody.sprite.throwable;
        let player = playerBody.sprite.player;
        if(throwable.isThrown() && player.state == PlayerStates.ALIVE) {
            let enemy = playerBody.sprite.player;
            game.server.emit('player_hit', enemy.id);
        }
    }


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


    getFullSnapshot() {
        return {
            id: this.id,
            health: this.health,
            state: this.state,
            char: {
                key: this.char.key,
                facing: this.char.facing,
                isMoving: this.char.isMoving,
                body: {
                    x: this.char.body.x,
                    y: this.char.body.y,
                }
            }
        }
    }


    getDeltaSnapshot() {
        let snapshot = this.getFullSnapshot();
        let delta = SnapshotHelper.getObjectDelta(snapshot, this.lastSnapshot, ['id']);
        this.lastSnapshot = snapshot;
        return delta;
    }


    update(snapshot) {
        SnapshotHelper.patchObject(this, snapshot);
    }


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
