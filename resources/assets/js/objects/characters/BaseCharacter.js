import * as config from 'config/Config';

export default class BaseCharacter extends Phaser.Sprite {

    constructor(key) {

        let spriteKey = key + '.sprite';
        super(game, 0, 0, spriteKey, 1);

        this.key = key;
        this.spriteKey = spriteKey;
        this.portraitKey = key + '.portrait';
        this.jingleKey = key + '.jingle';
        this.facing = 'idle';
        //this.portraitImage = game.cache.getImage(portraitKey);
        //this.portraitJingle = game.cache.getSound(jingleKey);

        this.addAnimations();
        this.addPhysics();
    }


    addAnimations() {
        this.animations.add('walk-down', [0,1,2], 8, true);
        this.animations.add('walk-left', [3,4,5], 8, true);
        this.animations.add('walk-right', [6,7,8], 8, true);
        this.animations.add('walk-up', [9,10,11], 8, true);
        //this.frame = 1;
    }


    addPhysics() {
        game.physics.enable(this, Phaser.Physics.ARCADE);
        this.body.collideWorldBounds = true;
        this.body.setSize(20, 28, 6, 2);
    }


    handleMovement(cursors) {

        this.body.velocity.x = 0;
        this.body.velocity.y = 0;

        if (cursors.left.isDown) {
            this.body.velocity.x = -1 * config.WALK_SPEED;

            if (this.facing != 'left') {
                this.animations.play('walk-left');
                this.facing = 'left';
            }
        } else if (cursors.right.isDown) {
            this.body.velocity.x = config.WALK_SPEED;

            if (this.facing != 'right') {
                this.animations.play('walk-right');
                this.facing = 'right';
            }
        } else if (cursors.up.isDown) {
            this.body.velocity.y = -1 * config.WALK_SPEED;

            if (this.facing != 'up') {
                this.animations.play('walk-up');
                this.facing = 'up';
            }
        } else if (cursors.down.isDown) {
            this.body.velocity.y = config.WALK_SPEED;

            if (this.facing != 'down') {
                this.animations.play('walk-down');
                this.facing = 'down';
            }
        } else {
            if (this.facing != 'idle') {
                this.animations.stop();

                if (this.facing == 'left') {
                    this.frame = 4;
                } else if (this.facing == 'right') {
                    this.frame = 7;
                } else if (this.facing == 'up') {
                    this.frame = 10;
                } else if (this.facing == 'down') {
                    this.frame = 1;
                }

                this.facing = 'idle';
            }
        }

    }
}
