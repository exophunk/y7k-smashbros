import {GameConfig} from 'shared/configs/GameConfig';

export default class InputController {


    /**
     *
     */
    constructor() {

        this.actionInputPressed = false;
        this.lastActionInputPressed = 0;

        if(game.mobile) {
            this.pad = game.plugins.add(Phaser.VirtualJoystick);
            this.stick = this.pad.addDPad(0, 0, 200, 'dpad');
            this.stick.scale = 0.6;
            this.stick.alignBottomLeft(0);

            this.actionButton = this.pad.addButton(0, 0, 'dpad', 'button1-up', 'button1-down');
            this.actionButton.onDown.add(this.pressActionButton, this);
            this.actionButton.onUp.add(this.releaseActionButton, this);
            this.actionButton.scale = 0.8;
            this.actionButton.alignBottomRight(0);

        } else {
            this.cursors = game.input.keyboard.createCursorKeys();
            this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
            game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
        }

        window.onblur = () => {
            if(this.stick) {
                this.stick.isDown = false;
            }
            if(this.cursors) {
                this.cursors.left.isDown = false;
                this.cursors.right.isDown = false;
                this.cursors.up.isDown = false;
                this.cursors.down.isDown = false;
            }
            game.gameState.player.char.body.setZeroVelocity();
            game.input.enabled = false;
        };

        window.onfocus = () => {
            game.input.enabled = true;
        };

    }


    /**
     *
     */
    pressActionButton() {
        this.actionButton.isDown = true;
    }


    /**
     *
     */
    releaseActionButton() {
        this.actionButton.isDown = false;
    }


    /**
     *
     */
    handleInputControls() {

        if(game.gameState.freezeInput) {
            game.gameState.player.idle();
            return;
        }

        if(game.mobile) {
            this.handleMobileInput();
        } else {
            this.handleInput();
        }

    }


    /**
     *
     */
    handleInput() {
        if (this.spaceKey.isDown && !this.actionInputPressed && new Date().getTime() - GameConfig.ACTION_INPUT_THROTTLE > this.lastActionInputPressed) {
            this.actionInputPressed = true;
            game.gameState.player.doAction();
            this.lastActionInputPressed = new Date().getTime();
        }
        if (this.spaceKey.isUp) { this.actionInputPressed = false; }

        if (this.cursors.left.isDown) {
            game.gameState.player.moveLeft();
        } else if (this.cursors.right.isDown) {
            game.gameState.player.moveRight();
        } else if (this.cursors.up.isDown) {
            game.gameState.player.moveUp();
        } else if (this.cursors.down.isDown) {
            game.gameState.player.moveDown();
        } else {
            game.gameState.player.idle();
        }
    }


    /**
     *
     */
    handleMobileInput() {
        if (this.actionButton.isDown && !this.actionInputPressed && new Date().getTime() - GameConfig.ACTION_INPUT_THROTTLE > this.lastActionInputPressed) {
            this.actionInputPressed = true;
            game.gameState.player.doAction();
            this.lastActionInputPressed = new Date().getTime();
        }
        if (this.actionButton.isUp) { this.actionInputPressed = false; }

        if (this.stick.isDown && this.stick.direction === Phaser.LEFT) {
            game.gameState.player.moveLeft();
        } else if (this.stick.isDown && this.stick.direction === Phaser.RIGHT) {
            game.gameState.player.moveRight();
        } else if (this.stick.isDown && this.stick.direction === Phaser.UP) {
            game.gameState.player.moveUp();
        } else if (this.stick.isDown && this.stick.direction === Phaser.DOWN) {
            game.gameState.player.moveDown();
        } else {
            game.gameState.player.idle();
        }
    }

}
