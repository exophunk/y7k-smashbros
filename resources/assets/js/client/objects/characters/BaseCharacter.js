import * as config from 'client/config/Config';

export default class BaseCharacter extends Phaser.Sprite {

    constructor(key) {

        let spriteKey = key + '.sprite';
        super(game, 0, 0, spriteKey, 1);

        this.player = null;
        this.key = key;
        this.spriteKey = spriteKey;
        this.portraitKey = key + '.portrait';
        this.jingleKey = key + '.jingle';
        this.facing = 'idle';
        this.isMoving = false;
        this.anchor.setTo(0.5,0.5);
        //this.portraitImage = game.cache.getImage(portraitKey);
        //this.portraitJingle = game.cache.getSound(jingleKey);

        this.addAnimations();
    }


    addAnimations() {
        this.animations.add('walk-down', [0,1,2], 8, true);
        this.animations.add('walk-left', [3,4,5], 8, true);
        this.animations.add('walk-right', [6,7,8], 8, true);
        this.animations.add('walk-up', [9,10,11], 8, true);
        //this.frame = 1;
    }


    setPhysics() {
        game.physics.p2.enable(this, game.isDebug);
        this.body.fixedRotation = true;
        this.body.data.gravityScale = 0;
        this.body.setZeroDamping();
        this.body.setMaterial(game.physicsState.materialPlayer);
    }


    moveLeft() {
        this.isMoving = true;
        this.body.setZeroVelocity();
        this.body.moveLeft(config.WALK_SPEED);

        if (this.facing != 'left') {
            this.animations.play('walk-left');
            this.facing = 'left';
        }
    }


    moveRight() {
        this.isMoving = true;
        this.body.setZeroVelocity();
        this.body.moveRight(config.WALK_SPEED);

        if (this.facing != 'right') {
            this.animations.play('walk-right');
            this.facing = 'right';
        }
    }


    moveUp() {
        this.isMoving = true;
        this.body.setZeroVelocity();
        this.body.moveUp(config.WALK_SPEED);

        if (this.facing != 'up') {
            this.animations.play('walk-up');
            this.facing = 'up';
        }
    }


    moveDown() {
        this.isMoving = true;
        this.body.setZeroVelocity();
        this.body.moveDown(config.WALK_SPEED);

        if (this.facing != 'down') {
            this.animations.play('walk-down');
            this.facing = 'down';
        }
    }


    idle() {
        this.body.setZeroVelocity();
        if (this.isMoving) {
            this.animations.stop();

            switch(this.facing) {
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

            this.isMoving = false;
        }
    }

}
