
let instance = null;

export default class GameState {

    constructor() {
        if(!instance) {
            this.player = null;
            instance = this;
        }

        return instance;
    }


}
