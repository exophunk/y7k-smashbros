
let instance = null;

export default class GameState {

    constructor() {
        if(!instance) {
            this.player = null;
            this.enemies = [];
            this.throwables = null;
            instance = this;
        }

        return instance;
    }


}
