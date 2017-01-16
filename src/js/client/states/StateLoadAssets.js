
export default class StateLoadAssets extends Phaser.State {

	create() {
        game.state.start('StatePrepareAssets');
	}


    preload() {
        this.loadMap();
        this.loadCharacters();
        this.loadThrowables();
        this.loadImages();
        this.loadAudio();
        this.loadData();
        this.loadFonts();
    }


    loadMap() {
        game.load.tilemap('tilemap_data', '/build/assets/tilemaps/tilemap-y7k.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('tilemap_tiles', '/build/assets/tilemaps/tilemap-y7k.png');
        game.load.image('collision_dummy', '/build/assets/sprites/other/collision-dummy.png');
    }


    loadCharacters() {
        let characters = game.cache.getJSON('characters');

        Object.keys(characters).forEach((key) => {
            game.load.pack(key, '/build/assets/data/character-assets.json');
        });

    }


    loadThrowables() {
        game.load.pack('throwables', '/build/assets/data/throwable-assets.json');
        game.load.pack('throwable-overlays', '/build/assets/data/throwable-assets.json');
    }


    loadData() {
        game.load.json('spawnpoints', '/build/assets/data/spawnpoints.json');
        game.load.json('collision-shapes', '/build/assets/data/collision-shapes.json');
        game.load.json('texts', '/build/assets/data/texts.json');

        if(game.mobile) {
            game.load.json('texts-device', '/build/assets/data/texts-mobile.json');
        } else {
            game.load.json('texts-device', '/build/assets/data/texts-desktop.json');
        }
    }


    loadImages() {
        game.load.image('screen-start', '/build/assets/images/screen-start.png');
        game.load.image('screen-background', '/build/assets/images/screen-background.png');
        // game.load.image('screen-playerselect', '/build/assets/images/screen-playerselect.png');
        // game.load.image('screen-name', '/build/assets/images/screen-name.png');
        // game.load.image('screen-tutorial', '/build/assets/images/screen-tutorial.png');
        game.load.image('portrait-box', '/build/assets/images/portrait-box.png');
        game.load.image('name-box', '/build/assets/images/name-box.png');
        game.load.image('tutorial-box', '/build/assets/images/tutorial-box.png');
        game.load.image('select-cursor', '/build/assets/images/select-cursor.png');
    }


    loadFonts() {
        game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
        game.load.bitmapFont('font-white', '/build/assets/fonts/font-white.png', '/build/assets/fonts/font-white.fnt');
        game.load.bitmapFont('font-white-big', '/build/assets/fonts/font-white-big.png', '/build/assets/fonts/font-white-big.fnt');
        game.load.bitmapFont('font-color', '/build/assets/fonts/font-color.png', '/build/assets/fonts/font-color.fnt');
    }


    loadAudio() {
        game.load.audio('click', '/build/assets/audio/click.mp3');
        game.load.audio('click-ok', '/build/assets/audio/click-ok.mp3');
        game.load.audio('music', '/build/assets/audio/music-wham.mp3');
    }

}
