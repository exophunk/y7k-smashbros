import Portrait from 'client/objects/Portrait';

export default class StateNameSelect extends Phaser.State {


    /**
     *
     */
	create() {
        this.initBackground();
        this.initNameBox();
        this.initControls();
	}


    /**
     *
     */
    initBackground() {
        let background = game.add.image(game.centerX, game.centerY, 'screen-background');
        background.anchor.setTo(0.5, 0.5);
        background.scale.set(game.scaleFactor, game.scaleFactor);

        let titleText = game.add.bitmapText(0, 0, 'font-color', game.texts.TITLE_SELECT_NAME, 38);
        titleText.anchor.setTo(0.5, 0);
        titleText.position.setTo(game.centerX, 40);

        this.textContinue = game.add.bitmapText(0, 0, 'font-white-big', game.texts.PRESS_TO_CONTINUE, 28);
        this.textContinue.anchor.setTo(0.5, 1);
        this.textContinue.position.setTo(game.centerX, game.world.height - 40);
    }


    /**
     *
     */
    initNameBox() {

        this.nameBox = game.add.sprite(game.centerX, game.centerY, 'name-box');
        this.nameBox.anchor.setTo(0.5,0.5);

        let fontSize = 25;
        let nameFieldWidth = 400;
        let nameFieldHeight = fontSize;
        let nameFieldX = game.centerX - nameFieldWidth / 2;
        let nameFieldY = game.centerY - nameFieldHeight / 2;

        this.nameField = game.add.inputField(nameFieldX, nameFieldY, {
            width: nameFieldWidth,
            padding: 0,
            fillAlpha: 0,
            textAlign: 'center',
            font: fontSize +'px Press Start 2P',
            fontWeight: 'normal',
            fill: '#ffffff',
            cursorColor: '#ffffff',
            max: 10
        });
        this.nameField.blockInput = false;
        this.nameField.focusOutOnEnter = false;

        setTimeout(() => {
            this.nameField.startFocus();
        }, 300);

    }


    /**
     *
     */
    initControls() {

        this.keyListenerFunc = this.checkKeydown.bind(this);
        document.addEventListener('keydown', this.keyListenerFunc);

        if(game.mobile) {
            this.textContinue.inputEnabled = true;
            this.textContinue.events.onInputDown.add(() => {
                this.nextStep();
            }, this);
        }

    }


    /**
     *
     */
    checkKeydown(e) {
        if(e.keyCode == Phaser.Keyboard.ENTER || e.keyCode == Phaser.Keyboard.SPACEBAR) {
            e.preventDefault();
            this.nextStep();
        }
    }


    /**
     *
     */
    nextStep() {
        let name = this.nameField.value;
        name = name.replace(/\s/g, '');
        name = name.trim();

        if(name.length > 3 && name.length <= 10) {
            game.gameState.selectedName = name;
            this.nameField.endFocus();
            document.removeEventListener('keydown', this.keyListenerFunc);
            game.sounds.ui.clickOk.play();
            game.state.start('StateTutorial');
        }

    }


}

