import CharacterFactory from 'client/handler/CharacterFactory';
import ThrowableItemFactory from 'client/handler/ThrowableItemFactory';
import Networking from 'client/handler/Networking';
import {GameConfig} from 'shared/configs/GameConfig';

export default class StateBoot extends Phaser.State {


    /**
     *
     */
	create() {

        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.add.plugin(Fabrique.Plugins.InputField);
        game.characterFactory = new CharacterFactory();
        game.throwableItemFactory = new ThrowableItemFactory();
        game.networking = new Networking();

        game.gameState = {
            player: null,
            enemies: {},
            throwables: {},
            selectedCharKey: null,
            selectedName: null,
            freezeInput: false,
            isRoundRunning: false,
            isPlaying: false,
            spectate: false,
            forcedRoom: null,
            roundTime: GameConfig.ROUND_TIME
        };

        game.paintLayers = {};
        game.physicsState = {};
        game.sounds = {};
        game.texts = {};

        this.handleUrlParams();
        this.loadWebFonts();

        game.state.start('StateLoadAssets');
	}


    /**
     *
     */
    loadWebFonts() {
        window.WebFontConfig = {

            //  'active' means all requested fonts have finished loading
            //  We set a 1 second delay before calling 'createText'.
            //  For some reason if we don't the browser cannot render the text the first time it's created.
            active: function() {

            },

            //  The Google Fonts we want to load (specify as many as you like in the array)
            google: {
                families: ['Press Start 2P', 'VT323']
            }

        };
    }


    /**
     *
     */
    handleUrlParams() {
        let params = {};

        if (location.search) {
        let parts = location.search.substring(1).split('&');

        for (let i = 0; i < parts.length; i++) {
            let nv = parts[i].split('=');
            if (!nv[0]) continue;
                params[nv[0]] = nv[1] || true;
            }
        }

        game.gameState.spectate = params.spectate ? true : false;
        game.gameState.forcedRoom = params.room ? params.room : null;
    }


    /**
     *
     */
    preload() {
        game.load.json('throwables', '/build/assets/data/throwables.json');
        game.load.json('characters', '/build/assets/data/characters.json');
        game.load.image('screen-background', '/build/assets/images/screen-background.png');
        game.load.image('progress-bar', '/build/assets/images/progress-bar.png');
        game.load.image('progress-bar-inner', '/build/assets/images/progress-bar-inner.png');
    }

}
