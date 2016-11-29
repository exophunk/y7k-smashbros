

export default class Portrait extends Phaser.Sprite {


    constructor(character) {
        super(game, 0, 0, character.portraitKey);
        this.character = character;
        this.selected = false;

        var style = { font: "12px Arial", fill: "#fff" };

        this.label = game.make.text(0, this.height, character.name, style);
        this.addChild(this.label);
    }



    select() {
        this.selected = true;
        this.label.addColor('#f00', 0);
    }

    deselect() {
        this.selected = false;
        this.label.addColor('#fff', 0);
    }
}
