import {PlayerConfig} from 'shared/objects/Player';

export default class Spectator {


	constructor() {
        this.id = null;
        this.char = game.add.sprite(game.world.centerX, game.world.centerY, null);
        game.physics.p2.enable(this.char);
        this.char.body.fixedRotation = true;
        this.char.body.static = true;
        this.char.body.setZeroDamping();
    }

    setPos(x, y) {
        this.char.body.x = x;
        this.char.body.y = y;
    }


    moveLeft() {
        this.char.body.setZeroVelocity();
        this.char.body.moveLeft(PlayerConfig.WALK_SPEED * 1.5);
    }


    moveRight() {
        this.char.body.setZeroVelocity();
        this.char.body.moveRight(PlayerConfig.WALK_SPEED * 1.5);
    }


    moveUp() {
        this.char.body.setZeroVelocity();
        this.char.body.moveUp(PlayerConfig.WALK_SPEED * 1.5);
    }


    moveDown() {
        this.char.body.setZeroVelocity();
        this.char.body.moveDown(PlayerConfig.WALK_SPEED * 1.5);
    }

    idle() {
        this.char.body.setZeroVelocity();
    }


    doAction() {

    }

}
