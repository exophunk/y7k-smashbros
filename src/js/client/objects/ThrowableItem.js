import {ThrowableConfig} from 'shared/objects/Throwable';
import {ThrowableStates} from 'shared/objects/Throwable';

export default class ThrowableItem extends Phaser.Sprite {

    constructor(spriteKey) {
        super(game, 0, 0, spriteKey);

        this.throwable = null;
        this.anchor.setTo(0.5,0.5);
    }


    setPhysics() {
        game.physics.p2.enable(this, game.isDebug);
        this.body.setCircle(12);
        this.body.damping = ThrowableConfig.DAMPING;
        this.body.angularDamping = ThrowableConfig.ANGULAR_DAMPING;
        this.body.setMaterial(game.physicsState.materialThrowable);
        this.setStatePhysics();

        this.body.collides([
            game.physicsState.backgroundCollisionGroup,
            game.physicsState.playerCollisionGroup,
            game.physicsState.enemiesCollisionGroup,
            game.physicsState.throwablesActiveCollisionGroup,
            game.physicsState.throwablesCollisionGroup
        ]);
    }


    setStatePhysics() {
        switch(this.throwable.state) {
            case ThrowableStates.IDLE:
                this.body.static = true;
                this.body.fixedRotation = true;
                this.body.angle = 0;
                this.angle = 0;
                this.body.setCollisionGroup(game.physicsState.throwablesCollisionGroup);
                this.body.setZeroVelocity();
                break;
            case ThrowableStates.CARRIED:
                this.body.static = false;
                this.body.setCollisionGroup(game.physics.p2.createCollisionGroup());
                break;
            case ThrowableStates.THROWN:
                this.body.fixedRotation = false;
                break;
        }
    }


}
