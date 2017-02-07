
export default class StatePrepareAssets extends Phaser.State {


    /**
     *
     */
	create() {

        let texts = game.cache.getJSON('texts');
        let textsDevice = game.cache.getJSON('texts-device');
        game.texts = Object.assign(game.texts, texts, textsDevice);
        game.spawnPoints = game.cache.getJSON('spawnpoints');

        game.sounds.ui.click = game.add.audio('ui-click-1');
        game.sounds.ui.click.volume = 0.5;
        game.sounds.ui.swish = game.add.audio('ui-swish');
        game.sounds.ui.swish.volume = 0.5;
        game.sounds.ui.clickOk = game.add.audio('ui-click-2');
        game.sounds.ui.clickOk.volume = 0.5;

        let audioFiles = game.cache.getJSON('audio');
        game.sounds.effects = {};
        game.sounds.announcer = {};

        for(let audioFile of audioFiles.effects) {
            let effect = game.add.audio(audioFile.key);
            effect.volume = audioFile.volume ? audioFile.volume : 1;
            game.sounds.effects[audioFile.key] = effect;
        }


        for(let audioFile of audioFiles.announcer) {
            let voice = game.add.audio(audioFile.key);
            voice.volume = audioFile.volume ? audioFile.volume : 1;
            game.sounds.announcer[audioFile.key] = voice;
        }

        game.sounds.music = game.add.audio('music');
        game.sounds.music.volume = 0.2;
        game.sounds.music.loop = true;

        game.state.start('StateMenu');
	}




}
