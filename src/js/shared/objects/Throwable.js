import SnapshotHelper from 'shared/util/SnapshotHelper';

export const ThrowableStates = {
    IDLE: 0,
    CARRIED: 1,
    THROWN: 2
}

export const ThrowableTypes = {
    BARREL: 186,
}

export const ThrowableConfig = {
    THROW_TIME: 600,
    THROW_SPEED: 600,
    THROW_ROTATION: 270,
    DAMPING: 0.7,
    ANGULAR_DAMPING: 0.9
}

export default class Throwable {


    constructor(throwableType) {
        this.id = null;
        this.state = ThrowableStates.IDLE;

        if(isClient) {
            this.initClient(throwableType);
        } else {
            this.initServer(throwableType);
        }

        this.lastSnapshot = {};
    }


    initClient(throwableType) {
        this.item = game.throwableItemFactory.get(throwableType);
        this.item.throwable = this;
    }


    initServer(throwableType) {
        this.item = {
            type: throwableType,
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
        let widthThrowable = game.physics.p2.mpx(this.item.body.data.aabb.upperBound[0] - this.item.body.data.aabb.lowerBound[0]);
        let heightThrowable = game.physics.p2.mpx(this.item.body.data.aabb.upperBound[1] - this.item.body.data.aabb.lowerBound[1]);
        let widthPlayer = game.physics.p2.mpx(char.body.data.aabb.upperBound[0] - char.body.data.aabb.lowerBound[0]);
        let heightPlayer = game.physics.p2.mpx(char.body.data.aabb.upperBound[1] - char.body.data.aabb.lowerBound[1]);

        if(char.x < this.item.x + (widthThrowable / 2 * 0.8) &&
           char.x > this.item.x - (widthThrowable / 2 * 0.8) &&
           char.y < this.item.y - (heightThrowable / 2) &&
           char.y > this.item.y - (heightThrowable / 2 + heightPlayer / 2 * 1.2)  &&
           char.facing == 'down') {
            console.log('yes, can pickup from look down');
            return true;
        } else if(char.x < this.item.x + (widthThrowable / 2 * 0.8) &&
           char.x > this.item.x - (widthThrowable / 2 * 0.8) &&
           char.y > this.item.y + (heightThrowable / 2) &&
           char.y < this.item.y + (heightThrowable / 2 + heightPlayer / 2 * 1.2)  &&
           char.facing == 'up') {
            console.log('yes, can pickup from look up');
            return true;
        } else if(char.y < this.item.y + (heightThrowable / 2 * 0.8) &&
           char.y > this.item.y - (heightThrowable / 2 * 0.8) &&
           char.x < this.item.x - (widthThrowable / 2) &&
           char.x > this.item.x - (widthThrowable / 2 + heightPlayer / 2 * 1.2)  &&
           char.facing == 'right') {
            console.log('yes, can pickup from look right');
            return true;
        } else if(char.y < this.item.y + (heightThrowable / 2 * 0.8) &&
           char.y > this.item.y - (heightThrowable / 2 * 0.8) &&
           char.x > this.item.x + (widthThrowable / 2) &&
           char.x < this.item.x + (widthThrowable / 2 + heightPlayer / 2 * 1.2)  &&
           char.facing == 'left') {
            console.log('yes, can pickup from look left');
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
        // this.item.body.setCollisionGroup(game.physics.p2.createCollisionGroup());
        // this.item.body.static = false;
        // this.pickupConstraint = game.physics.p2.createLockConstraint(player.char, this.item, [0, 0], 0);
        //player.activeThrowable = this;
        //player.setCarryAnchor();
    }


    throw() {
        let player = game.gameState.player;
        this.state = ThrowableStates.THROWN;
        game.physics.p2.removeConstraint(this.pickupConstraint);

        setTimeout(() => {
            this.item.body.setCollisionGroup(game.physicsState.throwablesCollisionGroup);
        }, 200);

        this.anchor.setTo(0.5,0.5);
        this.item.body.fixedRotation = false;

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
        }, ThrowableConfig.THROW_TIME);
    }


    land() {
        this.state = ThrowableStates.IDLE;
        this.item.body.static = true;
        this.item.body.angle = 0;
        this.item.angle = 0; // NEEDED?
        this.item.body.fixedRotation = true;
        this.item.body.setZeroVelocity();
        game.gameState.player.activeThrowable = null;

    }



    // --------------------------------------------------------------------------------------------------
    // NETWORKING METHODS
    //


    getFullSnapshot() {
        return {
            id: this.id,
            item: {
                body: {
                    x: this.item.body.x,
                    y: this.item.body.y,
                    angle: this.item.body.angle,
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


}
