import SnapshotHelper from 'shared/util/SnapshotHelper';
import MathHelper from 'shared/util/MathHelper';

export default class Player {


	constructor(charKey, isHost) {

        this.id = null;
        this.isHost = isHost;

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


    getFullSnapshot() {
        return {
            id: this.id,
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


    setPos(x, y) {
        this.char.body.x = x;
        this.char.body.y = y;
    }


    moveLeft() {
        this.char.moveLeft();
        this.setCarryAnchor();
    }


    moveRight() {
        this.setCarryAnchor();
        this.char.moveRight();
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

        if(this.activeThrowable && this.activeThrowable.isCarried()) {
            this.activeThrowable.throw();
        } else {
            game.gameState.throwables.forEach((throwable) => {
                if(throwable.canBePickedUp()) {
                    throwable.pickup();
                }
            });
        }

    }


    hitAsEnemy(playerBody, throwableBody) {
        let throwable = throwableBody.sprite;
        if(throwable.isThrown()) {
            console.log("got hit as enemy");
        }
    }


    hitAsPlayer(playerBody, throwableBody) {
        let player = playerBody.sprite.player;
        let throwable = throwableBody.sprite;

        if(throwable.isThrown()) {
            if(throwable == player.activeThrowable) {
                console.log("got hit as player BY OWN");
            } else {
                console.log("got hit as player BY ENEMY");
            }
        }
    }


    setCarryAnchor() {

        if(this.activeThrowable && this.activeThrowable.isCarried()) {
            switch(this.char.facing) {
                case 'left':
                    this.activeThrowable.anchor.setTo(1.25, 0.5);
                    break;
                case 'right':
                    this.activeThrowable.anchor.setTo(-0.25, 0.5);
                    break;
                case 'up':
                    this.activeThrowable.anchor.setTo(0.5, 1.25);
                    break;
                case 'down':
                    this.activeThrowable.anchor.setTo(0.5, -0.25);
                    break;
            }
        }
    }


}
