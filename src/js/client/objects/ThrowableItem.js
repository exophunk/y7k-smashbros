import {ThrowableConfig, ParticlesConfig} from 'shared/configs/GameConfig';
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
        this.forceDisablePickup = false;
        this.particleEmitterType = null;
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
    initEmitter() {
        this.particlesEmitter = game.add.emitter(this.x, this.y, 10);
        this.particlesEmitter.enableBody = true;
        this.particlesEmitter.physicsBodyType = Phaser.Physics.P2JS;
        this.particlesEmitter.minParticleSpeed.setTo(-50, -20);
        this.particlesEmitter.maxParticleSpeed.setTo(50, 30);
        this.particlesEmitter.minParticleScale = 0.8;
        this.particlesEmitter.maxParticleScale = 1.3;
        this.particlesEmitter.gravity.setTo(0, 60);

        if(this.particleEmitterType == ParticlesConfig.TYPE_PLANT) {
            this.particlesEmitter.makeParticles(ParticlesConfig.PARTICLES_PLANT);
        }

    }


    /**
     *
     */
    runEmitter() {
        if(this.particleEmitterType) {
            if(!this.particlesEmitter) {
                this.initEmitter();
            }
            this.particlesEmitter.x = this.x;
            this.particlesEmitter.y = this.y - 20;
            this.particlesEmitter.start(true, 800, null, Math.floor(Math.random() * 5));
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
