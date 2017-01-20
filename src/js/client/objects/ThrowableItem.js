import {ThrowableConfig} from 'shared/configs/GameConfig';
import {ThrowableStates} from 'shared/configs/ObjectStates';

export default class ThrowableItem extends Phaser.Sprite {


    /**
     *
     */
    constructor(key) {
        let spriteKey = 'sprite-' + key;
        let overlayKey = 'overlay-' + key;
        super(game, 0, 0, spriteKey);


        this.throwable = null;
        this.anchor.setTo(0.5,0.5);

        this.overlay = game.add.sprite(0, 0, overlayKey, this.paintLayerThrowables);
        this.overlay.anchor.setTo(0.5,0.5);
        this.overlay.alpha = 0;
        this.isGlowAnimRunning = false;
        //game.time.events.repeat(ThrowableConfig.GLOW_ANIM_FREQUENCY, Number.MAX_VALUE, this.showObjectGlow, this);
    }


    /**
     *
     */
    setPhysics() {
        game.physics.p2.enable(this, game.isDebug);
        this.body.setRectangle(ThrowableConfig.BODY_SIZE, ThrowableConfig.BODY_SIZE);
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

        this.addChild(this.overlay);
    }


    /**
     *
     */
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


    /**
     *
     */
    showObjectGlow() {
        if(this.throwable.isIdle() && !this.isGlowAnimRunning) {
            this.isGlowAnimRunning = true;
            game.add.tween(this.overlay).to( { alpha: 0.6 }, ThrowableConfig.GLOW_ANIM_SPEED, Phaser.Easing.Linear.None, true, 0, 0, true);

            setTimeout(() => {
                this.isGlowAnimRunning = false;
                this.overlay.alpha = 0;
            }, ThrowableConfig.GLOW_ANIM_SPEED * 2 + 1000);
        }
    }


}
