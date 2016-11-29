

export default class Player {


	constructor(character) {
        this.character = character;
    }

    addToGame(x, y) {
        this.character.x = x;
        this.character.y = y;
        game.add.existing(this.character);
    }


    handleMovement(cursors) {

        this.character.handleMovement(cursors);

        // if (cursors.left.isDown) {

        // } else if (cursors.right.isDown) {

        // } else if (cursors.up.isDown) {

        // } else if (cursors.down.isDown) {

        // } else {

        // }

    }


}
