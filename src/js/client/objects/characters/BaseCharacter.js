
export const CharacterConfig = {
    WALK_SPEED: 300,
}

export default class BaseCharacter extends Phaser.Sprite {

    constructor(key) {

        let spriteKey = key + '.sprite';
        super(game, 0, 0, spriteKey, 1);

        this.player = null;
        this.isHost = false;
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
        this.body.setRectangle(24,30);
        this.body.fixedRotation = true;
        this.body.setZeroDamping();
        this.body.setMaterial(game.physicsState.materialPlayer);

        if(this.isHost) {
            this.body.setCollisionGroup(game.physicsState.playerCollisionGroup);
            this.body.collides([game.physicsState.backgroundCollisionGroup, game.physicsState.enemiesCollisionGroup, game.physicsState.throwablesCollisionGroup]);
            //this.body.collides(game.physicsState.throwablesActiveCollisionGroup, this.player.hitAsPlayer, this.player);
        } else {
            this.body.kinematic = true;
            this.body.setCollisionGroup(game.physicsState.enemiesCollisionGroup);
            this.body.collides([game.physicsState.backgroundCollisionGroup, game.physicsState.playerCollisionGroup, game.physicsState.throwablesCollisionGroup]);
            this.body.collides(game.physicsState.throwablesActiveCollisionGroup, this.player.hitAsEnemy, this.player);
        }
    }


    moveLeft() {
        this.body.setZeroVelocity();
        this.body.moveLeft(CharacterConfig.WALK_SPEED);
        this.updateAnimation(this.facing, this.isMoving, 'left', true);
    }


    moveRight() {
        this.body.setZeroVelocity();
        this.body.moveRight(CharacterConfig.WALK_SPEED);
        this.updateAnimation(this.facing, this.isMoving, 'right', true);
    }


    moveUp() {
        this.body.setZeroVelocity();
        this.body.moveUp(CharacterConfig.WALK_SPEED);
        this.updateAnimation(this.facing, this.isMoving, 'up', true);
    }


    moveDown() {
        this.body.setZeroVelocity();
        this.body.moveDown(CharacterConfig.WALK_SPEED);
        this.updateAnimation(this.facing, this.isMoving, 'down', true);
    }


    idle() {
        this.body.setZeroVelocity();
        if (this.isMoving) {
            this.updateAnimation(this.facing, this.isMoving, this.facing, false);
        }
    }

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

}
