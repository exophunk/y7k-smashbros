import addContinueTouchArea from 'client/ui/ContinueTouchArea';

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

        const continueLabel = isTouchDevice ? game.texts.PRESS_TO_CONTINUE : 'PRESS ENTER TO CONTINUE';
        this.textContinue = game.add.bitmapText(0, 0, 'font-white-big', continueLabel, 28);
        this.textContinue.anchor.setTo(0.5, 1);
        this.textContinue.position.setTo(game.centerX, game.world.height - 40);
    }


    /**
     *
     */
    initNameBox() {

        this.nameBox = game.add.sprite(game.centerX, game.centerY, 'name-box');
        this.nameBox.anchor.setTo(0.5,0.5);

        this.nameField = document.createElement('input');
        this.nameField.type = 'text';
        this.nameField.className = 'player-name-input';
        this.nameField.setAttribute('aria-label', 'Player name');
        this.nameField.setAttribute('enterkeyhint', 'done');
        this.nameField.autocomplete = 'off';
        this.nameField.autocapitalize = 'off';
        this.nameField.spellcheck = false;
        this.nameField.maxLength = 10;
        document.getElementById('app').appendChild(this.nameField);
        this.render();

    }


    /**
     *
     */
    initControls() {

        this.keyListenerFunc = this.checkKeydown.bind(this);
        document.addEventListener('keydown', this.keyListenerFunc);

        if(isTouchDevice) {
            addContinueTouchArea(this.nextStep, this);
        }

    }


    /**
     *
     */
    checkKeydown(e) {
        if (e.isComposing) return;
        if(e.keyCode == Phaser.Keyboard.ENTER ||
            (e.keyCode == Phaser.Keyboard.SPACEBAR && e.target !== this.nameField)) {
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
            this.nameField.blur();
            game.sounds.ui.clickOk.play();
            game.state.start('StateTutorial');
        }

    }

    render() {
        // Keep the native input over the canvas box when the keyboard or browser
        // bars change the canvas size. Moving it never changes its focus.
        const canvas = game.canvas.getBoundingClientRect();
        const parent = game.canvas.parentElement.getBoundingClientRect();
        const scaleX = canvas.width / game.gameWidth;
        const scaleY = canvas.height / game.gameHeight;
        const style = this.nameField.style;
        style.left = `${canvas.left - parent.left + game.centerX * scaleX}px`;
        style.top = `${canvas.top - parent.top + game.centerY * scaleY}px`;
        style.width = `${(this.nameBox.width - 16) * scaleX}px`;
        style.height = `${(this.nameBox.height - 16) * scaleY}px`;
        style.fontSize = `${Math.max(16, 25 * scaleY)}px`;
    }

    shutdown() {
        document.removeEventListener('keydown', this.keyListenerFunc);
        this.nameField.remove();
    }
}

