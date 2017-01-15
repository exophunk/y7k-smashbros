import Portrait from 'client/objects/Portrait';

export default class StateNameSelect extends Phaser.State {

	create() {

        this.initBackground();
        this.initNameBox();

	}


    initBackground() {
        this.background = game.add.image(game.world.centerX, game.world.centerY, 'screen-background');
        this.background.anchor.setTo(0.5, 0.5);
        this.background.scale.set(game.scaleFactor, game.scaleFactor);

        let titleText = game.add.bitmapText(0, 0, 'font-color', game.texts.TITLE_SELECT_NAME, 38);
        titleText.anchor.setTo(0.5, 0);
        titleText.position.setTo(game.world.centerX, 40);

        let textContinue = game.add.bitmapText(0, 0, 'font-white-big', game.texts.PRESS_TO_CONTINUE, 28);
        textContinue.anchor.setTo(0.5, 1);
        textContinue.position.setTo(game.world.centerX, game.world.height - 40);
    }



    initNameBox() {

        this.nameBox = game.add.sprite(game.world.centerX, game.world.centerY, 'name-box');
        this.nameBox.anchor.setTo(0.5,0.5);

        let fontSize = 40;
        let nameFieldWidth = 400;
        let nameFieldHeight = fontSize;
        let nameFieldX = game.world.centerX - nameFieldWidth / 2;
        let nameFieldY = game.world.centerY - nameFieldHeight / 2 - 5;

        this.nameField = game.add.inputField(nameFieldX, nameFieldY, {
            width: nameFieldWidth,
            padding: 0,
            blockInput: true,
            fillAlpha: 0,
            textAlign: 'center',
            font: fontSize +'px arial',
            fontWeight: 'bold',
            fill: '#ffffff',
            cursorColor: '#ffffff',
        });

        this.nameField.startFocus();
        this.keyListenerFunc = this.checkKeydown.bind(this);
        document.addEventListener('keydown', this.keyListenerFunc);
    }

    checkKeydown(e) {
        if(e.keyCode == Phaser.Keyboard.ENTER || e.keyCode == Phaser.Keyboard.SPACEBAR) {
            this.nextStep();
        }
    }


    nextStep() {
        this.nameField.endFocus();
        document.removeEventListener('keydown', this.keyListenerFunc);
        game.sounds.clickOk.play();
        game.state.start('StateTutorial');
    }


}

