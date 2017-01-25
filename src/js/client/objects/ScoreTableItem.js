

export default class ScoreTableItem extends Phaser.Sprite {


    /**
     *
     */
    constructor(player) {

        super(game, 0, 0, null);

        this.character = game.add.sprite(0, 0, 'sprite-' + player.char.key);
        this.character.smoothed = false;
        this.character.scale.set(1, 1);
        this.character.anchor.setTo(0, 0.5);
        this.character.position.setTo(0, 0);
        this.character.frame = 1;

        let posName = 60;
        this.name = game.add.bitmapText(0, 0, 'font-white', player.name.toLowerCase(), 16);
        this.name.anchor.setTo(0, 0.5);
        this.name.position.setTo(posName, 0);

        let posScore = 220;
        this.score = game.add.bitmapText(0, 0, 'font-white', player.score.toString(), 16);
        this.score.anchor.setTo(1, 0.5);
        this.score.position.setTo(posScore, 0);

        let posDeaths = 340;
        this.deaths = game.add.bitmapText(0, 0, 'font-white', player.deaths.toString(), 16);
        this.deaths.anchor.setTo(1, 0.5);
        this.deaths.position.setTo(posDeaths, 0);

        this.addChild(this.character);
        this.addChild(this.name);
        this.addChild(this.score);
        this.addChild(this.deaths);

    }


}
