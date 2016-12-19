
export default class ThrowableItem extends Phaser.Sprite {

    constructor(throwableType) {
        let spriteKey = key + '.sprite';
        super(game, 0, 0, 'throwables', throwableType);
        this.anchor.setTo(0.5,0.5);
    }


    setPhysics() {
        game.physics.p2.enable(this, game.isDebug);
        this.body.static = true;
        this.body.fixedRotation = true;
        this.body.damping = ThrowableConfig.DAMPING;
        this.body.angularDamping = ThrowableConfig.ANGULAR_DAMPING;
        this.body.setMaterial(game.physicsState.materialThrowable);
    }


}
