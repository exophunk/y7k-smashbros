import SnapshotHelper from 'shared/util/SnapshotHelper';
import MathHelper from 'shared/util/MathHelper';

export const ThrowableStates = {
    IDLE: 0,
    CARRIED: 1,
    THROWN: 2
}

export const ThrowableConfig = {
    THROW_DURATION: 500,
    THROW_SPEED: 400,
    THROW_ROTATION: 270,
    DAMPING: 0.7,
    BODY_SIZE: 20,
    ANGULAR_DAMPING: 0.9,
    GLOW_ANIM_SPEED: 400,
    GLOW_ANIM_FREQUENCY: 7000,
}

export default class Throwable {


    constructor(id, spriteKey) {
        this.id = id;
        this.state = ThrowableStates.IDLE;
        this.carryingPlayerId = null;

        if(isClient) {
            this.initClient(spriteKey);
        } else {
            this.initServer(spriteKey);
        }

        this.lastSnapshot = {};
    }


    initClient(spriteKey) {
        this.item = game.throwableItemFactory.get(spriteKey);
        this.item.throwable = this;
    }


    initServer(spriteKey) {
        this.item = {
            key: spriteKey,
            body: {
                x: 0,
                y: 0,
                angle: 0,
            }
        }
    }


    setPos(x, y) {
        this.item.body.x = x;
        this.item.body.y = y;
    }


    canBePickedUp() {
        if(!this.isIdle()) {
            return false;
        }

        let char = game.gameState.player.char;
        let widthThrowable = this.item.width;//game.physics.p2.mpx(this.item.body.data.aabb.upperBound[0] - this.item.body.data.aabb.lowerBound[0]);
        let heightThrowable = this.item.height;//game.physics.p2.mpx(this.item.body.data.aabb.upperBound[1] - this.item.body.data.aabb.lowerBound[1]);
        let widthPlayer = game.physics.p2.mpx(char.body.data.aabb.upperBound[0] - char.body.data.aabb.lowerBound[0]);
        let heightPlayer = game.physics.p2.mpx(char.body.data.aabb.upperBound[1] - char.body.data.aabb.lowerBound[1]);

        if(char.x < this.item.x + (widthThrowable / 2 * 0.8) &&
           char.x > this.item.x - (widthThrowable / 2 * 0.8) &&
           char.y < this.item.y - (heightThrowable / 2) &&
           char.y > this.item.y - (heightThrowable / 2 + heightPlayer / 2 * 1.2)  &&
           char.facing == 'down') {
            return true;
        } else if(char.x < this.item.x + (widthThrowable / 2 * 0.8) &&
           char.x > this.item.x - (widthThrowable / 2 * 0.8) &&
           char.y > this.item.y + (heightThrowable / 2) &&
           char.y < this.item.y + (heightThrowable / 2 + heightPlayer / 2 * 1.2)  &&
           char.facing == 'up') {
            return true;
        } else if(char.y < this.item.y + (heightThrowable / 2 * 0.8) &&
           char.y > this.item.y - (heightThrowable / 2 * 0.8) &&
           char.x < this.item.x - (widthThrowable / 2) &&
           char.x > this.item.x - (widthThrowable / 2 + heightPlayer / 2 * 1.2)  &&
           char.facing == 'right') {
            return true;
        } else if(char.y < this.item.y + (heightThrowable / 2 * 0.8) &&
           char.y > this.item.y - (heightThrowable / 2 * 0.8) &&
           char.x > this.item.x + (widthThrowable / 2) &&
           char.x < this.item.x + (widthThrowable / 2 + heightPlayer / 2 * 1.2)  &&
           char.facing == 'left') {
            return true;
        }

        return false;
    }


    isCarried() {
        return this.state == ThrowableStates.CARRIED;
    }


    isIdle() {
        return this.state == ThrowableStates.IDLE;
    }


    isThrown() {
        return this.state == ThrowableStates.THROWN;
    }


    pickup() {
        let player = game.gameState.player;
        this.state = ThrowableStates.CARRIED;
        this.item.setStatePhysics();
        this.pickupConstraint = game.physics.p2.createLockConstraint(player.char.body, this.item.body, [0, 0], 0);

        this.carryingPlayerId = player.id;
        game.gameState.activeThrowable = this;

        player.setCarryAnchor();
    }


    throw() {
        let player = game.gameState.player;
        this.state = ThrowableStates.THROWN;
        this.item.setStatePhysics();

        game.physics.p2.removeConstraint(this.pickupConstraint);
        this.item.body.setCollisionGroup(game.physicsState.throwablesActiveCollisionGroup);
        this.item.anchor.setTo(0.5,0.5);
        this.item.overlay.anchor.setTo(0.5,0.5);

        switch(player.char.facing) {
            case 'left':
                this.item.body.velocity.x = ThrowableConfig.THROW_SPEED * -1;
                this.item.body.rotateLeft(ThrowableConfig.THROW_ROTATION);
                break;
            case 'right':
                this.item.body.velocity.x = ThrowableConfig.THROW_SPEED;
                this.item.body.rotateRight(ThrowableConfig.THROW_ROTATION);
                break;
            case 'up':
                this.item.body.velocity.y = ThrowableConfig.THROW_SPEED * -1;
                this.item.body.rotateLeft(ThrowableConfig.THROW_ROTATION);
                break;
            case 'down':
                this.item.body.velocity.y = ThrowableConfig.THROW_SPEED;
                this.item.body.rotateRight(ThrowableConfig.THROW_ROTATION);
                break;
        }

        setTimeout(() => {
            this.land();
        }, ThrowableConfig.THROW_DURATION);

    }


    land() {
        this.state = ThrowableStates.IDLE;
        this.item.setStatePhysics();

        setTimeout(() => {
            game.gameState.activeThrowable = null;
            this.carryingPlayerId = null;
        }, 200);

    }


    reset() {
        game.gameState.activeThrowable = null;
        this.carryingPlayerId = null;
        this.state = ThrowableStates.IDLE;
        this.item.setStatePhysics();
        game.physics.p2.removeConstraint(this.pickupConstraint);
        this.item.anchor.setTo(0.5,0.5);
        this.item.overlay.anchor.setTo(0.5,0.5);
    }


    // --------------------------------------------------------------------------------------------------
    // NETWORKING METHODS
    //


    getFullSnapshot() {
        return {
            id: this.id,
            state: this.state,
            carryingPlayerId: this.carryingPlayerId,
            item: {
                body: {
                    x: this.item.body.x,
                    y: this.item.body.y,
                    angle: this.item.body.angle,
                },
                anchor: {
                    x: this.item.anchor.x,
                    y: this.item.anchor.y,
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

        interpolatedSnapshot.item.body.x = MathHelper.interpolate(previousSnapshot.item.body.x, interpolatedSnapshot.item.body.x, lerpAmmount);
        interpolatedSnapshot.item.body.y = MathHelper.interpolate(previousSnapshot.item.body.y, interpolatedSnapshot.item.body.y, lerpAmmount);
        interpolatedSnapshot.item.body.angle = MathHelper.interpolate(previousSnapshot.item.body.angle, interpolatedSnapshot.item.body.angle, lerpAmmount);
        this.update(interpolatedSnapshot);

        if(previousSnapshot.state != interpolatedSnapshot.state) {
            this.item.setStatePhysics();
        }

    }

}
