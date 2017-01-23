
export default class HeadUpDisplay {


    /**
     *
     */
    constructor() {

        this.parent = game.add.sprite(0, 0, null);
        this.parent.fixedToCamera = true;

        this.roundTimer = game.add.bitmapText(0, 0, 'font-white-big', '', 28);
        this.roundTimer.anchor.setTo(0.5, 0);
        this.roundTimer.position.setTo(game.centerX, 2);

        this.score = game.add.bitmapText(0, 0, 'font-white', '', 16);
        this.score.anchor.setTo(1, 0);
        this.score.position.setTo(game.gameWidth - 10, 10);

        this.health = game.add.group();
        this.health.anchor.setTo(0, 0);
        this.health.position.setTo(10, 10);

        this.parent.addChild(this.roundTimer);
        this.parent.addChild(this.score);
        this.parent.addChild(this.health);


    }


    /**
     *
     */
    update() {
        this.roundTimer.text = this.formatTime(game.gameState.roundTime);
        this.score.text = 'score: ' + game.gameState.player.score;
        this.health.text = 'health: ' + game.gameState.player.health;
    }


    /**
     *
     */
    formatTime(time) {
        let date = new Date(time);
        return date.getMinutes() + ':' + (date.getSeconds()<10?'0':'') + date.getSeconds();
    }

}
