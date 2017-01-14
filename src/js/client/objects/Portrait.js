

export default class Portrait extends Phaser.Sprite {


    constructor(key, name) {
        let spriteKey = 'sprite-' + key;
        super(game, 0, 0, spriteKey);

        this.key = key;

        this.scale.set(2, 2);
        this.animations.add('walk', [0,1,2], 8, true);
        this.frame = 1;

    }


    select() {
        this.selected = true;
        this.animations.play('walk');
    }

    deselect() {
        this.selected = false;
        this.animations.stop();
        this.frame = 1;
    }
}
