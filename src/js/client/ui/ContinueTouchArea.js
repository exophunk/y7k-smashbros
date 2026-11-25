export default function addContinueTouchArea(callback, context) {
    // The whole bottom strip is tappable, including the space around the label.
    // Keep it below the character portraits and name input.
    const area = game.add.graphics(0, game.gameHeight - 85);
    area.beginFill(0, 0);
    area.drawRect(0, 0, game.gameWidth, 85);
    area.endFill();
    area.hitArea = new Phaser.Rectangle(0, 0, game.gameWidth, 85);
    area.inputEnabled = true;
    area.events.onInputDown.add(callback, context);
    return area;
}
