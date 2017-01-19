import Portrait from 'client/objects/Portrait';

export default class StatePlayerSelect extends Phaser.State {


    /**
     *
     */
	create() {

        this.selectIndex = 0;

        this.initBackground();
        this.initPortraits();
        this.initCursor();
        this.initControls();

        this.portraits[this.selectIndex].select();
	}


    /**
     *
     */
    initBackground() {

        let background = game.add.image(game.world.centerX, game.world.centerY, 'screen-background');
        background.anchor.setTo(0.5, 0.5);
        background.scale.set(game.scaleFactor, game.scaleFactor);

        let titleText = game.add.bitmapText(0, 0, 'font-color', game.texts.TITLE_SELECT_PLAYER, 38);
        titleText.anchor.setTo(0.5, 0);
        titleText.position.setTo(game.world.centerX, 40);

        this.textContinue = game.add.bitmapText(0, 0, 'font-white-big', game.texts.PRESS_TO_CONTINUE, 28);
        this.textContinue.anchor.setTo(0.5, 1);
        this.textContinue.position.setTo(game.world.centerX, game.world.height - 40);
    }


    /**
     *
     */
    initCursor() {
        this.selectCursor = game.add.image(0, 0, 'select-cursor');
        this.selectCursor.scale.set(game.scaleFactor, game.scaleFactor);
        this.moveCursor(this.selectIndex, false);
    }


    /**
     *
     */
    initPortraits() {

        this.portraitBoxes = game.add.group();
        this.portraits = game.characterFactory.getAllPortraits();

        this.portraits.forEach((portrait) => {
            this.portraitBoxes.add(portrait.portraitBox);
        });

        let paddingX = 20;
        let paddingY = 40;
        let gridWidth = this.portraitBoxes.getAt(0).width + paddingX;
        let gridHeight = this.portraitBoxes.getAt(0).height + paddingY;
        this.portraitBoxes.align(4, -1, gridWidth, gridHeight);
        this.portraitBoxes.x = game.world.centerX - ((4 * gridWidth) / 2) + (paddingX / 2);
        this.portraitBoxes.y = game.world.centerY - ((2 * gridHeight) / 2) + (paddingY / 2);

    }


    /**
     *
     */
    initControls() {
        this.cursors = game.input.keyboard.createCursorKeys();
        this.leftPressed = false;
        this.rightPressed = false;
        this.upPressed = false;
        this.downPressed = false;

        if(game.mobile) {
            this.portraits.forEach((portrait) => {
                portrait.portraitBox.inputEnabled = true;
                portrait.portraitBox.events.onInputDown.add(() => {
                    this.moveCursor(this.portraits.indexOf(portrait), true);
                }, this);
            });

            this.textContinue.inputEnabled = true;
            this.textContinue.events.onInputDown.add(() => {
                this.nextStep();
            }, this);
        }

    }


    /**
     *
     */
    nextStep() {
        let chosenCharacterKey = this.portraits[this.selectIndex].key;
        game.gameState.selectedCharKey = chosenCharacterKey;

        game.sounds.clickOk.play();
        game.state.start('StateNameSelect');
    }


    /**
     *
     */
    update() {

        if (game.input.keyboard.isDown(Phaser.Keyboard.ENTER) || game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
            this.nextStep();
        }

        if (this.cursors.left.isDown && !this.leftPressed) {
            this.leftPressed = true;
            if(this.selectIndex - 1 >= 0 && this.selectIndex != 4) {
                this.moveCursor(this.selectIndex - 1, true);
            }
        } else if (this.cursors.right.isDown && !this.rightPressed) {
            this.rightPressed = true;
            if(this.selectIndex + 1 < this.portraits.length && this.selectIndex != 3) {
                this.moveCursor(this.selectIndex + 1, true);
            }
        } else if (this.cursors.up.isDown && !this.upPressed) {
            this.upPressed = true;
            if(this.selectIndex - 4 >= 0) {
                this.moveCursor(this.selectIndex - 4, true);
            }
        } else if (this.cursors.down.isDown && !this.downPressed) {
            this.downPressed = true;
            if(this.selectIndex + 4 < this.portraits.length) {
                this.moveCursor(this.selectIndex + 4, true);
            }
        }

        if (this.cursors.left.isUp) { this.leftPressed = false; }
        if (this.cursors.right.isUp) { this.rightPressed = false; }
        if (this.cursors.up.isUp) { this.upPressed = false; }
        if (this.cursors.down.isUp) { this.downPressed = false; }

    }


    /**
     *
     */
    moveCursor(newIndex, animate) {
        this.portraits[this.selectIndex].deselect();
        this.selectIndex = newIndex;
        this.portraits[this.selectIndex].select();

        let newCursorX = this.portraitBoxes.x + this.portraits[this.selectIndex].portraitBox.x;
        let newCursorY = this.portraitBoxes.y + this.portraits[this.selectIndex].portraitBox.y;

        if(animate) {
            game.sounds.click.play();
            game.add.tween(this.selectCursor).to( { x: newCursorX, y: newCursorY }, 100, Phaser.Easing.Linear.None, true);
        } else {
            this.selectCursor.position.setTo(newCursorX, newCursorY);
        }
    }


}

