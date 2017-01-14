import Portrait from 'client/objects/Portrait';

export default class StatePlayerSelect extends Phaser.State {

	create() {

        this.portraits = game.add.group();
        this.selectIndex = 0;
        this.selectPosX = 0;
        this.selectPosY = 0;

        game.characterFactory.getAllPortraits().forEach((portrait) => {
            this.portraits.add(portrait);
        });

        let portraitWidth = this.portraits.getAt(0).width + 10;
        let portraitHeight = this.portraits.getAt(0).height + 80;

        this.portraits.align(4, -1, portraitWidth, portraitHeight);
        this.portraits.x = game.world.centerX - (4 * portraitWidth) / 2;
        this.portraits.y = game.world.centerY - (2 * portraitHeight) / 2;

        this.cursors = game.input.keyboard.createCursorKeys();
        this.leftPressed = false;
        this.rightPressed = false;
        this.upPressed = false;
        this.downPressed = false;

        this.portraits.getAt(this.selectIndex).select();
	}


    startGame() {
        let chosenCharacterKey = this.portraits.getAt(this.selectIndex).key;
        game.gameState.selectedCharKey = chosenCharacterKey;
        game.state.start('StateNameSelect');
    }

    update() {

        if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
            this.startGame();
        }

        if (this.cursors.left.isDown && !this.leftPressed) {
            this.leftPressed = true;
            if(this.selectIndex - 1 >= 0 && this.selectIndex != 4) {
                this.selectIndex--;
                this.portraits.callAll('deselect');
                this.portraits.getAt(this.selectIndex).select();
            }
        } else if (this.cursors.right.isDown && !this.rightPressed) {
            this.rightPressed = true;
            if(this.selectIndex + 1 < this.portraits.length && this.selectIndex != 3) {
                this.selectIndex++;
                this.portraits.callAll('deselect');
                this.portraits.getAt(this.selectIndex).select();
            }
        } else if (this.cursors.up.isDown && !this.upPressed) {
            this.upPressed = true;
            if(this.selectIndex - 4 >= 0) {
                this.selectIndex -= 4;
                this.portraits.callAll('deselect');
                this.portraits.getAt(this.selectIndex).select();
            }
        } else if (this.cursors.down.isDown && !this.downPressed) {
            this.downPressed = true;
            if(this.selectIndex + 4 < this.portraits.length) {
                this.selectIndex += 4;
                this.portraits.callAll('deselect');
                this.portraits.getAt(this.selectIndex).select();
            }
        }

        if (this.cursors.left.isUp) { this.leftPressed = false; }
        if (this.cursors.right.isUp) { this.rightPressed = false; }
        if (this.cursors.up.isUp) { this.upPressed = false; }
        if (this.cursors.down.isUp) { this.downPressed = false; }

    }


    preload() {

    }

}

