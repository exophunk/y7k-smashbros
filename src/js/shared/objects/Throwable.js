import SnapshotHelper from 'shared/util/SnapshotHelper';
import MathHelper from 'shared/util/MathHelper';
import {ThrowableConfig} from 'shared/configs/GameConfig';
import {ThrowableStates} from 'shared/configs/ObjectStates';

export default class Throwable {


    /**
     *
     */
    constructor(id, key) {
        this.id = id;
        this.key = key;
        this.state = ThrowableStates.IDLE;
        this.carryingPlayerId = null;
        this.isDangerous = false;

        if(isClient) {
            this.initClient(key);
        } else {
            this.initServer(key);
        }

        this.lastSnapshot = {};
    }


    /**
     *
     */
    initClient(key) {
        this.item = game.throwableItemFactory.get(key);
        this.item.throwable = this;
    }


    /**
     *
     */
    initServer(key) {
        this.item = {
            key: key,
            particleEmitterType: null,
            soundGroup: null,
            body: {
                x: 0,
                y: 0,
                angle: 0,
            }
        }
    }


    /**
     *
     */
    setPos(x, y) {
        this.item.body.x = x;
        this.item.body.y = y;
    }


    /**
     *
     */
    canBePickedUp() {
        if(!this.isIdle() || this.item.forceDisablePickup) {
            return false;
        }

        let char = game.gameState.player.char;
        let checkCoord = new Phaser.Point();
        checkCoord.copyFrom(char.position);

        if(char.facing == 'down') {
            checkCoord.y += char.height / 2;
        } else if(char.facing == 'up') {
            checkCoord.y -= char.height / 2;
        } else if(char.facing == 'right') {
            checkCoord.x += char.width / 2;
        } else if(char.facing == 'left') {
            checkCoord.x -= char.width / 2;
        }

        let itemRect = new Phaser.Rectangle(this.item.x - this.item.width / 2, this.item.y - this.item.height / 2, this.item.width, this.item.height);
        return itemRect.contains(checkCoord.x, checkCoord.y);
    }


    /**
     *
     */
    isCarried() {
        return this.state == ThrowableStates.CARRIED;
    }


    /**
     *
     */
    isIdle() {
        return this.state == ThrowableStates.IDLE;
    }


    /**
     *
     */
    isThrown() {
        return this.state == ThrowableStates.THROWN;
    }


    /**
     *
     */
    pickup() {
        let player = game.gameState.player;
        this.state = ThrowableStates.CARRIED;
        this.item.setStatePhysics();

        this.pickupConstraint = game.physics.p2.createLockConstraint(player.char.body, this.item.body, [0, 0], 0);

        this.carryingPlayerId = player.id;
        game.gameState.activeThrowable = this;

        player.setCarryAnchor();
        this.item.runEmitter();
        this.item.playPickupSound();
    }


    /**
     *
     */
    throw() {
        let player = game.gameState.player;
        this.state = ThrowableStates.THROWN;
        this.item.setStatePhysics();
        this.isDangerous = true;

        game.physics.p2.removeConstraint(this.pickupConstraint);
        this.item.body.setCollisionGroup(game.physicsState.throwablesActiveCollisionGroup);
        this.item.anchor.setTo(0.5,0.5);
        this.item.overlay.anchor.setTo(0.5,0.5);
        this.item.playThrowSound();

        switch(player.char.facing) {
            case 'left':
                this.item.body.velocity.x = ThrowableConfig.THROW_SPEED * -1 * game.gameState.deltaMultiplier;
                this.item.body.rotateLeft(ThrowableConfig.THROW_ROTATION);
                break;
            case 'right':
                this.item.body.velocity.x = ThrowableConfig.THROW_SPEED * game.gameState.deltaMultiplier;
                this.item.body.rotateRight(ThrowableConfig.THROW_ROTATION);
                break;
            case 'up':
                this.item.body.velocity.y = ThrowableConfig.THROW_SPEED * -1 * game.gameState.deltaMultiplier;
                this.item.body.rotateLeft(ThrowableConfig.THROW_ROTATION);
                break;
            case 'down':
                this.item.body.velocity.y = ThrowableConfig.THROW_SPEED * game.gameState.deltaMultiplier;
                this.item.body.rotateRight(ThrowableConfig.THROW_ROTATION);
                break;
        }

        setTimeout(() => {
            this.land();
        }, ThrowableConfig.THROW_DURATION);

    }


    /**
     *
     */
    land() {
        this.state = ThrowableStates.IDLE;
        this.item.setStatePhysics();
        this.item.forceDisablePickup = true;
        this.isDangerous = false;
        this.item.runEmitter();

        setTimeout(() => {
            game.gameState.activeThrowable = null;
            this.carryingPlayerId = null;
            this.item.forceDisablePickup = false;
        }, 200);

    }


    /**
     *
     */
    reset() {
        game.gameState.activeThrowable = null;
        this.carryingPlayerId = null;
        this.state = ThrowableStates.IDLE;
        this.item.setStatePhysics();
        game.physics.p2.removeConstraint(this.pickupConstraint);
        this.item.forceDisablePickup = false;
        this.item.anchor.setTo(0.5,0.5);
        this.item.overlay.anchor.setTo(0.5,0.5);
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
            state: this.state,
            carryingPlayerId: this.carryingPlayerId,
            item: {
                particleEmitterType: this.item.particleEmitterType,
                soundGroup: this.item.soundGroup,
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

        interpolatedSnapshot.item.body.x = MathHelper.interpolate(previousSnapshot.item.body.x, interpolatedSnapshot.item.body.x, lerpAmmount);
        interpolatedSnapshot.item.body.y = MathHelper.interpolate(previousSnapshot.item.body.y, interpolatedSnapshot.item.body.y, lerpAmmount);
        interpolatedSnapshot.item.body.angle = MathHelper.interpolate(previousSnapshot.item.body.angle, interpolatedSnapshot.item.body.angle, lerpAmmount);
        this.update(interpolatedSnapshot);

        if(previousSnapshot.state != interpolatedSnapshot.state) {
            this.item.setStatePhysics();
        }

    }

}
