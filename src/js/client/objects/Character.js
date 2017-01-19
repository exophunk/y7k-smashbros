import {PlayerConfig} from 'shared/objects/Player';

export default class Character extends Phaser.Sprite {


    /**
     *
     */
    constructor(key, name) {

        let spriteKey = 'sprite-' + key;
        super(game, 0, 0, spriteKey, 1);
        this.key = key;
        this.player = null;
        this.isHost = false;
        this.name = name;
        this.facing = 'idle';
        this.isMoving = false;
        this.anchor.setTo(0.5,0.5);

        this.addAnimations();
    }


    /**
     *
     */
    addAnimations() {
        this.animations.add('walk-down', [0,1,2], 8, true);
        this.animations.add('walk-left', [3,4,5], 8, true);
        this.animations.add('walk-right', [6,7,8], 8, true);
        this.animations.add('walk-up', [9,10,11], 8, true);
        this.frame = 1;
    }


    /**
     *
     */
    addNameText(name) {
        let style = {
            font: "12px VT323",
            fill: "#fff",
        };
        this.nameText = game.add.text(0, 0, name.toLowerCase(), style);
        this.nameText.anchor.setTo(0.5, 1);
        this.nameText.position.setTo(0, - this.height / 2 - 5);
    }


    /**
     *
     */
    setPhysics() {
        game.physics.p2.enable(this, game.isDebug);
        this.body.setRectangle(24,30);
        this.body.fixedRotation = true;
        this.body.setZeroDamping();
        this.body.setMaterial(game.physicsState.materialPlayer);

        if(this.isHost) {
            this.body.setCollisionGroup(game.physicsState.playerCollisionGroup);
            this.body.collides([game.physicsState.backgroundCollisionGroup, game.physicsState.enemiesCollisionGroup, game.physicsState.throwablesCollisionGroup]);
        } else {
            this.body.kinematic = true;
            this.body.setCollisionGroup(game.physicsState.enemiesCollisionGroup);
            this.body.collides([game.physicsState.backgroundCollisionGroup, game.physicsState.playerCollisionGroup, game.physicsState.throwablesCollisionGroup]);
            this.body.collides(game.physicsState.throwablesActiveCollisionGroup, this.player.hitAsEnemy, this.player);
        }

        this.addChild(this.nameText);
    }


    /**
     *
     */
    moveLeft() {
        this.body.setZeroVelocity();
        this.body.moveLeft(PlayerConfig.WALK_SPEED);
        this.updateAnimation(this.facing, this.isMoving, 'left', true);
    }


    /**
     *
     */
    moveRight() {
        this.body.setZeroVelocity();
        this.body.moveRight(PlayerConfig.WALK_SPEED);
        this.updateAnimation(this.facing, this.isMoving, 'right', true);
    }


    /**
     *
     */
    moveUp() {
        this.body.setZeroVelocity();
        this.body.moveUp(PlayerConfig.WALK_SPEED);
        this.updateAnimation(this.facing, this.isMoving, 'up', true);
    }


    /**
     *
     */
    moveDown() {
        this.body.setZeroVelocity();
        this.body.moveDown(PlayerConfig.WALK_SPEED);
        this.updateAnimation(this.facing, this.isMoving, 'down', true);
    }


    /**
     *
     */
    idle() {
        this.body.setZeroVelocity();
        if (this.isMoving) {
            this.updateAnimation(this.facing, this.isMoving, this.facing, false);
        }
    }


    /**
     *
     */
    updateAnimation(prevFacing, prevIsMoving, facing, isMoving) {
        if(isMoving) {
            if((isMoving && prevFacing != facing) || !prevIsMoving) {
                this.animations.play('walk-' + facing);
                this.facing = facing;
            }
        } else {
            this.animations.stop();
            switch(facing) {
                case 'left':
                    this.frame = 4;
                    break;
                case 'right':
                    this.frame = 7;
                    break;
                case 'up':
                    this.frame = 10;
                    break;
                case 'down':
                    this.frame = 1;
                    break;
            }
        }

        this.isMoving = isMoving;

    }


    /**
     *
     */
    showHitEffects() {
        this.blink(150, PlayerConfig.HIT_IMMUNE_TIME);
    }


    /**
     *
     */
    showDyingEffects() {
        this.blink(100, 1300);
        this.frame = 1;
        game.add.tween(this.scale).to( { x: 1.5, y: 1.5 }, 500, Phaser.Easing.Quadratic.Out, true);
        game.add.tween(this).to( { angle: 720 }, 1300, Phaser.Easing.Linear.None, true, 200);
        this.nameText.alpha = 0;
        game.add.tween(this.scale).to( { x: 0, y: 0 }, 1000, Phaser.Easing.Quadratic.In, true, 500);

    }


    /**
     *
     */
    blink(speed, duration) {
        let repetitions = Math.floor(duration / speed) - 1;
        game.add.tween(this).to( { alpha: 0 }, speed/2, Phaser.Easing.Linear.None, true, 0, repetitions, true);

        setTimeout(() => {
            this.alpha = 1;
        }, duration);
    }


}
