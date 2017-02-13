import ScoreTableItem from 'client/objects/ScoreTableItem';

export default class OverlayRoundOver {


    /**
     *
     */
    constructor(roundData) {

        this.roundData = roundData;

        this.parent = game.add.sprite(0, 0, null);
        this.parent.alpha = 0;
        this.parent.fixedToCamera = true;

        this.background = game.add.image(game.gameWidth / 2, game.gameHeight / 2, 'screen-background');
        this.background.anchor.setTo(0.5, 0.5);
        this.background.scale.set(game.scaleFactor, game.scaleFactor);

        this.roundOverText = game.add.bitmapText(0, 0, 'font-color', game.texts.ROUND_OVER, 38);
        this.roundOverText.anchor.setTo(0.5, 0);
        this.roundOverText.position.setTo(game.centerX, 40);

        this.parent.addChild(this.background);
        this.parent.addChild(this.roundOverText);

        this.createScoreTable();

        game.add.tween(this.parent).to( { alpha: 1 }, 1000, Phaser.Easing.Quadratic.InOut, true);
        game.add.tween(this.roundOverText).to( { alpha: 1 }, 2000, Phaser.Easing.Quadratic.InOut, true, 1000);

    }


    /**
     *
     */
    createScoreTable() {

        this.scoreTable = game.add.group();
        this.scoreTable.x = game.centerX - 165;
        this.scoreTable.y = 150;

        this.scoreLabel = game.add.bitmapText(220, -30, 'font-white', 'score', 16);
        this.scoreLabel.anchor.setTo(1, 0.5);
        this.scoreTable.add(this.scoreLabel);

        this.deathsLabel = game.add.bitmapText(340, -30, 'font-white', 'deaths', 16);
        this.deathsLabel.anchor.setTo(1, 0.5);
        this.scoreTable.add(this.deathsLabel);

        let players = Object.values(this.roundData.players).sort(function (a, b) {
            if (a.score == b.score) {
                return (a.health - b.health);
            } else {
                return (b.score - a.score);
            }
        });

        let offsetY = 0;
        for(let player of players) {
            let scoreTableItem = new ScoreTableItem(player);
            scoreTableItem.y = offsetY;
            this.scoreTable.add(scoreTableItem);
            offsetY += 50;
        }

        this.parent.addChild(this.scoreTable);

        if(isTouchDevice) {
            this.scoreTable.scale.set(game.scaleFactor, game.scaleFactor);
            this.scoreTable.y = 120;
        }

    }


    /**
     *
     */
    hide() {
        let tween = game.add.tween(this.parent);
        tween.onComplete.add(() => {
            this.parent.destroy(true);
        }, this);
        tween.to( { alpha: 0 }, 1000, Phaser.Easing.Quadratic.InOut, true);
    }


}
