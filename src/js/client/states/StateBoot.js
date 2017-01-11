import Preloader from 'client/handler/Preloader';

export default class StateBoot extends Phaser.State {

	create() {
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.state.start('StateLoadAssets');
	}


    preload() {
        const preloader = new Preloader();
        preloader.loadData();
    }

}
