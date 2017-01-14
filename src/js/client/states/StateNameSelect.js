import Portrait from 'client/objects/Portrait';

export default class StateNameSelect extends Phaser.State {

	create() {

        let fontSize = 50;
        let padding = 20;
        let nameFieldWidth = 400;
        let nameFieldHeight = padding * 2 + fontSize;
        let nameFieldX = game.world.centerX - nameFieldWidth / 2;
        let nameFieldY = game.world.centerY - nameFieldHeight / 2;

        this.nameField = game.add.inputField(nameFieldX, nameFieldY, {
            width: nameFieldWidth,
            padding: padding,
            blockInput: true,
            fillAlpha: 0,
            textAlign: 'center',
            font: fontSize +'px Arial',
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
        game.state.start('StateTutorial');
    }


}

