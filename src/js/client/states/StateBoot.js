
export default class StateBoot extends Phaser.State {

	create() {
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.state.start('StateLoadAssets');
        game.add.plugin(Fabrique.Plugins.InputField);
	}


    preload() {
        game.load.json('throwables', '/build/assets/data/throwables.json');
        game.load.json('characters', '/build/assets/data/characters.json');
    }

}
