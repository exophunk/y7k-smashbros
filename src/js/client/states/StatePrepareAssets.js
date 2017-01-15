
export default class StatePrepareAssets extends Phaser.State {

	create() {

        let texts = game.cache.getJSON('texts');
        let textsDevice = game.cache.getJSON('texts-device');
        game.texts = Object.assign(game.texts, texts, textsDevice);

        game.sounds.click = game.add.audio('click');
        game.sounds.clickOk = game.add.audio('click-ok');

        game.sounds.music = game.add.audio('music');
        game.sounds.music.volume = 0.3;

        game.state.start('StateMenu');
	}




}
