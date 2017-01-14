import Portrait from 'client/objects/Portrait';

export default class StatePlayerSelect extends Phaser.State {

	create() {

        this.initBackground();
        this.initPortraits();
        this.initCursor();
        this.initControls();

        this.portraits.getAt(this.selectIndex).select();
	}


    initBackground() {
        this.background = game.add.image(game.world.centerX, game.world.centerY, 'screen-playerselect');
        this.scaleFactor = game.gameHeight / this.background.height;
        this.background.anchor.setTo(0.5, 0.5);
        this.background.scale.set(this.scaleFactor, this.scaleFactor);
    }


    initCursor() {
        this.cursor = game.add.image(this.portraits.x - 12, this.portraits.y - 13, 'select-cursor');
        this.cursor.scale.set(this.scaleFactor, this.scaleFactor);
    }


    initPortraits() {
        this.portraits = game.add.group();
        this.selectIndex = 0;
        this.selectPosX = 0;
        this.selectPosY = 0;

        game.characterFactory.getAllPortraits().forEach((portrait) => {
            this.portraits.add(portrait);
        });

        let paddingX = 35;
        let paddingY = 70;
        let portraitWidth = this.portraits.getAt(0).width + paddingX;
        let portraitHeight = this.portraits.getAt(0).height + paddingY;

        this.portraits.align(4, -1, portraitWidth, portraitHeight);
        this.portraits.x = game.world.centerX - ((4 * portraitWidth) / 2) + (paddingX / 2);
        this.portraits.y = game.world.centerY - ((2 * portraitHeight) / 2) + (paddingY / 2) - 8;
    }


    initControls() {
        this.cursors = game.input.keyboard.createCursorKeys();
        this.leftPressed = false;
        this.rightPressed = false;
        this.upPressed = false;
        this.downPressed = false;
    }


    nextStep() {
        let chosenCharacterKey = this.portraits.getAt(this.selectIndex).key;
        game.gameState.selectedCharKey = chosenCharacterKey;
        game.state.start('StateNameSelect');
    }


    update() {

        if (game.input.keyboard.isDown(Phaser.Keyboard.ENTER) || game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
            this.nextStep();
        }

        if (this.cursors.left.isDown && !this.leftPressed) {
            this.leftPressed = true;
            if(this.selectIndex - 1 >= 0 && this.selectIndex != 4) {
                this.moveCursor(this.selectIndex - 1);
            }
        } else if (this.cursors.right.isDown && !this.rightPressed) {
            this.rightPressed = true;
            if(this.selectIndex + 1 < this.portraits.length && this.selectIndex != 3) {
                this.moveCursor(this.selectIndex + 1);
            }
        } else if (this.cursors.up.isDown && !this.upPressed) {
            this.upPressed = true;
            if(this.selectIndex - 4 >= 0) {
                this.moveCursor(this.selectIndex - 4);
            }
        } else if (this.cursors.down.isDown && !this.downPressed) {
            this.downPressed = true;
            if(this.selectIndex + 4 < this.portraits.length) {
                this.moveCursor(this.selectIndex + 4);
            }
        }

        if (this.cursors.left.isUp) { this.leftPressed = false; }
        if (this.cursors.right.isUp) { this.rightPressed = false; }
        if (this.cursors.up.isUp) { this.upPressed = false; }
        if (this.cursors.down.isUp) { this.downPressed = false; }

    }


    moveCursor(newIndex) {
        this.selectIndex = newIndex;
        this.portraits.callAll('deselect');
        this.portraits.getAt(this.selectIndex).select();

        let newCursorX = this.portraits.x + this.portraits.getAt(this.selectIndex).x - 12;
        let newCursorY = this.portraits.y + this.portraits.getAt(this.selectIndex).y - 13;
        game.add.tween(this.cursor).to( { x: newCursorX, y: newCursorY }, 100, Phaser.Easing.Linear.None, true);
    }

    preload() {

    }

}

