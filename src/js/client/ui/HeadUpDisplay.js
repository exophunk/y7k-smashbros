import {GameConfig} from 'shared/configs/GameConfig';

export default class HeadUpDisplay {


    /**
     *
     */
    constructor() {

        this.playerHealth = null;
        this.playerScore = null;
        this.roundTime = null;
        this.isRoundRunning = null;

        this.parent = game.add.sprite(0, 0, null);
        this.parent.fixedToCamera = true;

        this.roundTimer = game.add.bitmapText(0, 0, 'font-white-big', '', 28);
        this.roundTimer.anchor.setTo(0.5, 0);
        this.roundTimer.position.setTo(game.centerX, 2);

        this.playerName = game.add.bitmapText(0, 0, 'font-white', game.gameState.player.name.toLowerCase(), 16);
        this.playerName.anchor.setTo(0, 0);
        this.playerName.position.setTo(8, 35);

        this.score = game.add.bitmapText(0, 0, 'font-white', '', 16);
        this.score.anchor.setTo(1, 0);
        this.score.position.setTo(game.gameWidth - 10, 10);

        this.healthHeartsGray = game.add.group();
        this.healthHearts = game.add.group();

        for(let i = 0; i < GameConfig.PLAYER_HEALTH; i++) {
            let x = 2 + (i * 30);
            let y = 2;
            this.healthHeartsGray.add(game.add.sprite(x, y, 'hearth-gray'));
            this.healthHearts.add(game.add.sprite(x, y, 'hearth'));
        }

        this.waitForPlayerText = game.add.bitmapText(0, 0, 'font-white-big', game.texts.WAIT_FOR_PLAYERS, 28);
        this.waitForPlayerText.anchor.setTo(0.5, 0.5);
        this.waitForPlayerText.position.setTo(game.centerX, game.centerY - 100);


        this.parent.addChild(this.roundTimer);
        this.parent.addChild(this.score);
        this.parent.addChild(this.healthHeartsGray);
        this.parent.addChild(this.healthHearts);
        this.parent.addChild(this.playerName);
        this.parent.addChild(this.waitForPlayerText);


    }


    /**
     *
     */
    update() {
        if(game.gameState.roundTime != this.roundTime) {
            this.roundTimer.text = this.formatTime(game.gameState.roundTime);
        }

        if(game.gameState.player.health != this.playerHealth) {
            for(let healthHeart of this.healthHearts.children) {
                healthHeart.alpha = 0;
            }

            for(let i = 0; i < game.gameState.player.health; i++) {
                if(this.healthHearts.children[i]) {
                    this.healthHearts.children[i].alpha = 1;
                }
            }
        }

        if(game.gameState.player.score != this.playerScore) {
            this.score.text = 'score: ' + game.gameState.player.score;
        }

        if(game.gameState.isRoundRunning != this.isRoundRunning) {
            this.waitForPlayerText.alpha = game.gameState.isRoundRunning ? 0 : 1;
        }

        this.playerHealth = game.gameState.player.health;
        this.playerScore = game.gameState.player.score;
        this.roundTime = game.gameState.roundTime;
        this.isRoundRunning = game.gameState.isRoundRunning;
    }


    /**
     *
     */
    formatTime(time) {
        let date = new Date(time);
        return date.getMinutes() + ':' + (date.getSeconds()<10?'0':'') + date.getSeconds();
    }

}
