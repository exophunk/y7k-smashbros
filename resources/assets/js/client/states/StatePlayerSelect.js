import Preloader from 'client/handler/Preloader';
import Player from 'client/objects/Player';
import Portrait from 'client/objects/Portrait';

export default class StatePlayerSelect extends Phaser.State {

	create() {

        this.portraits = game.add.group();
        this.selectIndex = 0;
        this.selectPosX = 0;
        this.selectPosY = 0;

        let characters = game.characterFactory.getAllAsArray();

        characters.forEach((character) => {
            this.portraits.add(new Portrait(character));
        });

        let portraitWidth = 64 + 10;
        let portraitHeight = 64 + 12 + 10;

        this.portraits.align(4, -1, portraitWidth, portraitHeight);
        this.portraits.x = game.world.centerX - (4 * portraitWidth) / 2;
        this.portraits.y = game.world.centerY - (2 * portraitHeight) / 2;

        this.cursors = game.input.keyboard.createCursorKeys();
        this.leftPressed = false;
        this.rightPressed = false;
        this.upPressed = false;
        this.downPressed = false;
	}


    startGame() {

        let chosenCharacter = this.portraits.getAt(this.selectIndex).character;
        game.gameState.player = new Player(chosenCharacter);

        this.state.start('StateGame');
    }

    update() {

        if (game.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
            this.startGame();
        }

        if (this.cursors.left.isDown && !this.leftPressed) {
            this.leftPressed = true;
            this.selectIndex--;
        } else if (this.cursors.right.isDown && !this.rightPressed) {
            this.rightPressed = true;
            this.selectIndex++;
        } else if (this.cursors.up.isDown && !this.upPressed) {
            this.upPressed = true;
            this.selectIndex -= 4;
        } else if (this.cursors.down.isDown && !this.downPressed) {
            this.downPressed = true;
            this.selectIndex += 4;
        }

        if (this.cursors.left.isUp) { this.leftPressed = false; }
        if (this.cursors.right.isUp) { this.rightPressed = false; }
        if (this.cursors.up.isUp) { this.upPressed = false; }
        if (this.cursors.down.isUp) { this.downPressed = false; }

        if(this.selectIndex > this.portraits.length - 1) {
            this.selectIndex = this.portraits.length - 1;
        }

        if(this.selectIndex < 0) {
            this.selectIndex = 0
        }

        this.portraits.callAll('deselect');
        this.portraits.getAt(this.selectIndex).select();
    }


    preload() {
        new Preloader().loadCharacters();
    }

}

