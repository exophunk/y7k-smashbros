
export default class StateLoadAssets extends Phaser.State {


    /**
     *
     */
	create() {
        game.state.start('StatePrepareAssets');
	}


    /**
     *
     */
    preload() {
        this.showLoadingBar();
        this.loadMap();
        this.loadCharacters();
        this.loadThrowables();
        this.loadImages();
        this.loadAudio();
        this.loadVideo();
        this.loadData();
        this.loadFonts();
    }


    /**
     *
     */
    showLoadingBar() {
        let background = game.add.image(game.centerX, game.centerY, 'screen-background');
        background.anchor.setTo(0.5, 0.5);
        background.scale.set(game.scaleFactor, game.scaleFactor);

        let progressBar = game.add.sprite(0, 0, 'progress-bar');
        progressBar.position.setTo(game.centerX - progressBar.width / 2, game.centerY - progressBar.height / 2);

        let progressBarInner = game.add.sprite(0, 0, 'progress-bar-inner');
        progressBarInner.position.setTo(game.centerX - progressBarInner.width / 2, game.centerY - progressBarInner.height / 2);
        this.load.setPreloadSprite(progressBarInner);

        let textStyle = {
            font: "16px Helvetica",
            fill: "#fff",
        };
        let textLoading = game.add.text(0, 0, 'Loading...', textStyle);
        textLoading.anchor.setTo(0.5, 0.5);
        textLoading.position.setTo(game.centerX, game.centerY);
    }


    /**
     *
     */
    loadMap() {
        game.load.tilemap('tilemap_data', '/build/assets/tilemaps/tilemap-y7k-collision-only.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('tile-collision', '/build/assets/tilemaps/tile-collision.png');
        game.load.image('map-ground', '/build/assets/tilemaps/tilemap-y7k-ground.png');
        game.load.image('map-overlay', '/build/assets/tilemaps/tilemap-y7k-overlay.png');
    }


    /**
     *
     */
    loadCharacters() {
        game.load.json('characters', '/build/assets/data/characters.json');
        game.load.pack('characters', '/build/assets/data/character-assets.json');
    }


    /**
     *
     */
    loadThrowables() {
        // TODO create atlas maybe?
        game.load.pack('throwables', '/build/assets/data/throwable-assets.json');
        game.load.pack('throwable-overlays', '/build/assets/data/throwable-assets.json');
    }


    /**
     *
     */
    loadData() {
        game.load.json('spawnpoints', '/build/assets/data/spawnpoints.json');
        game.load.json('audio', '/build/assets/data/audio.json');
        game.load.json('collision-shapes', '/build/assets/data/collision-shapes.json');
        game.load.json('texts', '/build/assets/data/texts.json');

        if(isTouchDevice) {
            game.load.json('texts-device', '/build/assets/data/texts-mobile.json');
        } else {
            game.load.json('texts-device', '/build/assets/data/texts-desktop.json');
        }
    }


    /**
     *
     */
    loadImages() {
        // TODO add pack/atlas
        game.load.image('screen-start', '/build/assets/images/screen-start.png');
        game.load.image('portrait-box', '/build/assets/images/portrait-box.png');
        game.load.image('name-box', '/build/assets/images/name-box.png');
        game.load.image('tutorial-box', '/build/assets/images/tutorial-box.png');
        game.load.image('select-cursor', '/build/assets/images/select-cursor.png');
        game.load.image('hearth-gray', '/build/assets/images/hearth-gray.png');
        game.load.image('hearth', '/build/assets/images/hearth.png');
        game.load.image('leave-1', '/build/assets/sprites/particles/leave-1.png');
        game.load.image('leave-2', '/build/assets/sprites/particles/leave-2.png');
        game.load.image('tutorial-1', '/build/assets/images/tutorial-1.png');
        game.load.image('tutorial-2', '/build/assets/images/tutorial-2.png');
        game.load.atlas('dpad', '/build/assets/tilemaps/dpad.png', '/build/assets/tilemaps/dpad.json');
    }


    /**
     *
     */
    loadFonts() {
        game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
        game.load.bitmapFont('font-white', '/build/assets/fonts/font-white.png', '/build/assets/fonts/font-white.fnt');
        game.load.bitmapFont('font-white-big', '/build/assets/fonts/font-white-big.png', '/build/assets/fonts/font-white-big.fnt');
        game.load.bitmapFont('font-color', '/build/assets/fonts/font-color.png', '/build/assets/fonts/font-color.fnt');
    }


    /**
     *
     */
    loadAudio() {
        game.load.pack('music', '/build/assets/data/audio.json');
        game.load.pack('effects', '/build/assets/data/audio.json');
        game.load.pack('ui', '/build/assets/data/audio.json');
        game.load.pack('announcer', '/build/assets/data/audio.json');
    }


    /**
     *
     */
    loadVideo() {
        game.load.video('tutorial-video-1', '/build/assets/video/tutorial-video-1.mp4');
        game.load.video('tutorial-video-2', '/build/assets/video/tutorial-video-2.mp4');
    }

}
