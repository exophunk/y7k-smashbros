
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

export default class Throwable extends Phaser.Sprite {


    constructor(throwableType) {
        super(game, 0, 0, 'throwables', throwableType);
        this.state = ThrowableStates.IDLE;
        this.anchor.setTo(0.5,0.5);
    }


    setPhysics() {
        game.physics.p2.enable(this, game.isDebug);
        this.body.static = true;
        this.body.fixedRotation = true;
        this.body.damping = ThrowableConfig.DAMPING;
        this.body.angularDamping = ThrowableConfig.ANGULAR_DAMPING;
        this.body.setMaterial(game.physicsState.materialThrowable);
    }


    placeAt(x, y) {
        this.x = x;
        this.y = y;
        //game.add.existing(this);
    }


    canBePickedUp() {

        if(!this.isIdle()) {
            return false;
        }

        let character = game.gameState.player.character;
        let widthThrowable = game.physics.p2.mpx(this.body.data.aabb.upperBound[0] - this.body.data.aabb.lowerBound[0]);
        let heightThrowable = game.physics.p2.mpx(this.body.data.aabb.upperBound[1] - this.body.data.aabb.lowerBound[1]);
        let widthPlayer = game.physics.p2.mpx(character.body.data.aabb.upperBound[0] - character.body.data.aabb.lowerBound[0]);
        let heightPlayer = game.physics.p2.mpx(character.body.data.aabb.upperBound[1] - character.body.data.aabb.lowerBound[1]);

        if(character.x < this.x + (widthThrowable / 2 * 0.8) &&
           character.x > this.x - (widthThrowable / 2 * 0.8) &&
           character.y < this.y - (heightThrowable / 2) &&
           character.y > this.y - (heightThrowable / 2 + heightPlayer / 2 * 1.2)  &&
           character.facing == 'down') {
            console.log('yes, can pickup from look down');
            return true;
        } else if(character.x < this.x + (widthThrowable / 2 * 0.8) &&
           character.x > this.x - (widthThrowable / 2 * 0.8) &&
           character.y > this.y + (heightThrowable / 2) &&
           character.y < this.y + (heightThrowable / 2 + heightPlayer / 2 * 1.2)  &&
           character.facing == 'up') {
            console.log('yes, can pickup from look up');
            return true;
        } else if(character.y < this.y + (heightThrowable / 2 * 0.8) &&
           character.y > this.y - (heightThrowable / 2 * 0.8) &&
           character.x < this.x - (widthThrowable / 2) &&
           character.x > this.x - (widthThrowable / 2 + heightPlayer / 2 * 1.2)  &&
           character.facing == 'right') {
            console.log('yes, can pickup from look right');
            return true;
        } else if(character.y < this.y + (heightThrowable / 2 * 0.8) &&
           character.y > this.y - (heightThrowable / 2 * 0.8) &&
           character.x > this.x + (widthThrowable / 2) &&
           character.x < this.x + (widthThrowable / 2 + heightPlayer / 2 * 1.2)  &&
           character.facing == 'left') {
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
        this.body.setCollisionGroup(game.physics.p2.createCollisionGroup());
        this.body.static = false;
        this.pickupConstraint = game.physics.p2.createLockConstraint(player.character, this, [0, 0], 0);
        player.activeThrowable = this;
        player.setCarryAnchor();
    }


    throw() {
        let player = game.gameState.player;
        this.state = ThrowableStates.THROWN;
        game.physics.p2.removeConstraint(this.pickupConstraint);

        setTimeout(() => {
            this.body.setCollisionGroup(game.physicsState.throwablesCollisionGroup);
        }, 200);

        this.anchor.setTo(0.5,0.5);
        this.body.fixedRotation = false;

        switch(player.character.facing) {
            case 'left':
                this.body.velocity.x = ThrowableConfig.THROW_SPEED * -1;
                this.body.rotateLeft(ThrowableConfig.THROW_ROTATION);
                break;
            case 'right':
                this.body.velocity.x = ThrowableConfig.THROW_SPEED;
                this.body.rotateRight(ThrowableConfig.THROW_ROTATION);
                break;
            case 'up':
                this.body.velocity.y = ThrowableConfig.THROW_SPEED * -1;
                this.body.rotateLeft(ThrowableConfig.THROW_ROTATION);
                break;
            case 'down':
                this.body.velocity.y = ThrowableConfig.THROW_SPEED;
                this.body.rotateRight(ThrowableConfig.THROW_ROTATION);
                break;
        }

        setTimeout(() => {
            this.land();
        }, ThrowableConfig.THROW_TIME);
    }


    land() {
        this.state = ThrowableStates.IDLE;
        this.body.static = true;
        this.body.angle = 0;
        this.angle = 0;
        this.body.fixedRotation = true;
        this.body.setZeroVelocity();
        game.gameState.player.activeThrowable = null;

    }

}
