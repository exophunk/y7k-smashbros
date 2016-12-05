

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
        this.character.moveLeft();
        this.setCarryAnchor();
    }


    moveRight() {
        this.setCarryAnchor();
        this.character.moveRight();
    }


    moveUp() {
        this.character.moveUp();
        this.setCarryAnchor();
    }


    moveDown() {
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


}
