

export default class Portrait {


    /**
     *
     */
    constructor(key, charData) {

        this.key = key;
        this.name = charData.name;
        this.selected = false;

        this.portraitBox = game.add.sprite(0, 0, 'portrait-box');
        this.portraitBox.smoothed = false;
        let boxCenterX = this.portraitBox.width / 2;
        let boxCenterY = this.portraitBox.height / 2;

        this.character = game.add.sprite(0, 0, 'sprite-' + key);
        this.character.smoothed = false;
        this.character.scale.set(2, 2);
        this.character.anchor.setTo(0.5, 0.5);
        this.character.position.setTo(boxCenterX, boxCenterY);
        this.character.animations.add('walk', [0,1,2], 8, true);
        this.character.frame = 1;

        this.name = game.add.bitmapText(0, 0, 'font-white', this.name.toLowerCase(), 16);
        this.name.anchor.setTo(0.5, 0);
        this.name.position.setTo(boxCenterX, this.portraitBox.height + 4);

        this.portraitBox.addChild(this.character);
        this.portraitBox.addChild(this.name);

        this.portraitBox.scale.set(game.scaleFactor, game.scaleFactor);

    }


    /**
     *
     */
    select() {
        this.selected = true;
        this.character.animations.play('walk');
    }


    /**
     *
     */
    deselect() {
        this.selected = false;
        this.character.animations.stop();
        this.character.frame = 1;
    }
}
