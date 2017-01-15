import CharacterFactory from 'client/handler/CharacterFactory';
import ThrowableItemFactory from 'client/handler/ThrowableItemFactory';

export default class StateBoot extends Phaser.State {

	create() {
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

        game.add.plugin(Fabrique.Plugins.InputField);

        game.characterFactory = new CharacterFactory();
        game.throwableItemFactory = new ThrowableItemFactory();

        game.gameState = {
            player: null,
            enemies: {},
            throwables: {},
        };

        game.physicsState = {};
        game.sounds = {};
        game.texts = {};

        game.state.start('StateLoadAssets');
	}


    preload() {
        game.load.json('throwables', '/build/assets/data/throwables.json');
        game.load.json('characters', '/build/assets/data/characters.json');
    }

}
