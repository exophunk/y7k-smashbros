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
            selectedCharKey: null,
            selectedName: null,
        };

        game.physicsState = {};
        game.sounds = {};
        game.texts = {};

        window.WebFontConfig = {

            //  'active' means all requested fonts have finished loading
            //  We set a 1 second delay before calling 'createText'.
            //  For some reason if we don't the browser cannot render the text the first time it's created.
            active: function() {},

            //  The Google Fonts we want to load (specify as many as you like in the array)
            google: {
                families: ['Press Start 2P']
            }

        };

        game.state.start('StateLoadAssets');
	}


    preload() {
        game.load.json('throwables', '/build/assets/data/throwables.json');
        game.load.json('characters', '/build/assets/data/characters.json');
    }

}
