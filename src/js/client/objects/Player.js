

export default class Player {


	constructor(character) {
        this.character = character;
        this.character.player = this;
    }

    placeAt(x, y) {
        this.character.x = x;
        this.character.y = y;
    }


    moveLeft() {
        game.server.emit('update_player', this.getPosition());
        this.character.moveLeft();
        this.setCarryAnchor();
    }


    moveRight() {
        game.server.emit('update_player', this.getPosition());
        this.setCarryAnchor();
        this.character.moveRight();
    }


    moveUp() {
        game.server.emit('update_player', this.getPosition());
        this.character.moveUp();
        this.setCarryAnchor();
    }


    moveDown() {
        game.server.emit('update_player', this.getPosition());
        this.character.moveDown();
        this.setCarryAnchor();
    }


    idle() {
        this.character.idle();
    }


    doAction() {

        if(this.activeThrowable && this.activeThrowable.isCarried()) {
            this.activeThrowable.throw();
        } else {
            game.gameState.throwables.forEach((throwable) => {
                if(throwable.canBePickedUp()) {
                    throwable.pickup();
                }
            });
        }

    }


    hitAsEnemy(playerBody, throwableBody) {
        let throwable = throwableBody.sprite;
        if(throwable.isThrown()) {
            console.log("got hit as enemy");
        }
    }


    hitAsPlayer(playerBody, throwableBody) {
        let player = playerBody.sprite.player;
        let throwable = throwableBody.sprite;

        if(throwable.isThrown()) {
            if(throwable == player.activeThrowable) {
                console.log("got hit as player BY OWN");
            } else {
                console.log("got hit as player BY ENEMY");
            }
        }
    }


    setCarryAnchor() {
        if(this.activeThrowable && this.activeThrowable.isCarried()) {
            switch(this.character.facing) {
                case 'left':
                    this.activeThrowable.anchor.setTo(1.25, 0.5);
                    break;
                case 'right':
                    this.activeThrowable.anchor.setTo(-0.25, 0.5);
                    break;
                case 'up':
                    this.activeThrowable.anchor.setTo(0.5, 1.25);
                    break;
                case 'down':
                    this.activeThrowable.anchor.setTo(0.5, -0.25);
                    break;
            }
        }

    }


    getState() {
        return {
            character: this.character.key,
            x: this.character.x,
            y: this.character.y,
        }
    }

    getPosition() {
        return {
            x: this.character.x,
            y: this.character.y,
            bodyX: this.character.body.x,
            bodyY: this.character.body.y,
            velocityX: this.character.body.velocity.x,
            velocityY: this.character.body.velocity.y,
            angle: this.character.body.angle,
            angularVelocity: this.character.body.angularVelocity,
        }
    }

    updatePlayer() {

    }

}
