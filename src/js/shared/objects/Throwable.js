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


    constructor(id, x, y, throwableType) {

        this.id = id;
        this.state = ThrowableStates.IDLE;

        if(isClient) {
            this.initClient(x, y, throwableType);
        } else {
            this.initServer(x, y, throwableType);
        }

        this.lastSnapshot = {};
    }


    initClient(x, y, throwableType) {
        this.item = game.add.sprite(x, y, 'throwables', throwableType);
    }


    initServer(x, y, throwableType) {
        this.item = {
            type: throwableType,
            body: {
                x: x,
                y: y,
                angle: 0,
            }
        }
    }


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

    // canBePickedUp() {

    //     if(!this.isIdle()) {
    //         return false;
    //     }

    //     let char = game.gameState.player.char;
    //     let widthThrowable = game.physics.p2.mpx(this.body.data.aabb.upperBound[0] - this.body.data.aabb.lowerBound[0]);
    //     let heightThrowable = game.physics.p2.mpx(this.body.data.aabb.upperBound[1] - this.body.data.aabb.lowerBound[1]);
    //     let widthPlayer = game.physics.p2.mpx(char.body.data.aabb.upperBound[0] - char.body.data.aabb.lowerBound[0]);
    //     let heightPlayer = game.physics.p2.mpx(char.body.data.aabb.upperBound[1] - char.body.data.aabb.lowerBound[1]);

    //     if(char.x < this.x + (widthThrowable / 2 * 0.8) &&
    //        char.x > this.x - (widthThrowable / 2 * 0.8) &&
    //        char.y < this.y - (heightThrowable / 2) &&
    //        char.y > this.y - (heightThrowable / 2 + heightPlayer / 2 * 1.2)  &&
    //        char.facing == 'down') {
    //         console.log('yes, can pickup from look down');
    //         return true;
    //     } else if(char.x < this.x + (widthThrowable / 2 * 0.8) &&
    //        char.x > this.x - (widthThrowable / 2 * 0.8) &&
    //        char.y > this.y + (heightThrowable / 2) &&
    //        char.y < this.y + (heightThrowable / 2 + heightPlayer / 2 * 1.2)  &&
    //        char.facing == 'up') {
    //         console.log('yes, can pickup from look up');
    //         return true;
    //     } else if(char.y < this.y + (heightThrowable / 2 * 0.8) &&
    //        char.y > this.y - (heightThrowable / 2 * 0.8) &&
    //        char.x < this.x - (widthThrowable / 2) &&
    //        char.x > this.x - (widthThrowable / 2 + heightPlayer / 2 * 1.2)  &&
    //        char.facing == 'right') {
    //         console.log('yes, can pickup from look right');
    //         return true;
    //     } else if(char.y < this.y + (heightThrowable / 2 * 0.8) &&
    //        char.y > this.y - (heightThrowable / 2 * 0.8) &&
    //        char.x > this.x + (widthThrowable / 2) &&
    //        char.x < this.x + (widthThrowable / 2 + heightPlayer / 2 * 1.2)  &&
    //        char.facing == 'left') {
    //         console.log('yes, can pickup from look left');
    //         return true;
    //     }

    //     return false;
    // }


    // isCarried() {
    //     return this.state == ThrowableStates.CARRIED;
    // }


    // isIdle() {
    //     return this.state == ThrowableStates.IDLE;
    // }


    // isThrown() {
    //     return this.state == ThrowableStates.THROWN;
    // }


    // pickup() {
    //     let player = game.gameState.player;
    //     this.state = ThrowableStates.CARRIED;
    //     this.body.setCollisionGroup(game.physics.p2.createCollisionGroup());
    //     this.body.static = false;
    //     this.pickupConstraint = game.physics.p2.createLockConstraint(player.char, this, [0, 0], 0);
    //     player.activeThrowable = this;
    //     player.setCarryAnchor();
    // }


    // throw() {
    //     let player = game.gameState.player;
    //     this.state = ThrowableStates.THROWN;
    //     game.physics.p2.removeConstraint(this.pickupConstraint);

    //     setTimeout(() => {
    //         this.body.setCollisionGroup(game.physicsState.throwablesCollisionGroup);
    //     }, 200);

    //     this.anchor.setTo(0.5,0.5);
    //     this.body.fixedRotation = false;

    //     switch(player.char.facing) {
    //         case 'left':
    //             this.body.velocity.x = ThrowableConfig.THROW_SPEED * -1;
    //             this.body.rotateLeft(ThrowableConfig.THROW_ROTATION);
    //             break;
    //         case 'right':
    //             this.body.velocity.x = ThrowableConfig.THROW_SPEED;
    //             this.body.rotateRight(ThrowableConfig.THROW_ROTATION);
    //             break;
    //         case 'up':
    //             this.body.velocity.y = ThrowableConfig.THROW_SPEED * -1;
    //             this.body.rotateLeft(ThrowableConfig.THROW_ROTATION);
    //             break;
    //         case 'down':
    //             this.body.velocity.y = ThrowableConfig.THROW_SPEED;
    //             this.body.rotateRight(ThrowableConfig.THROW_ROTATION);
    //             break;
    //     }

    //     setTimeout(() => {
    //         this.land();
    //     }, ThrowableConfig.THROW_TIME);
    // }


    // land() {
    //     this.state = ThrowableStates.IDLE;
    //     this.body.static = true;
    //     this.body.angle = 0;
    //     this.angle = 0;
    //     this.body.fixedRotation = true;
    //     this.body.setZeroVelocity();
    //     game.gameState.player.activeThrowable = null;

    // }

}
