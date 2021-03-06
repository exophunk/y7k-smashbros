
export default class DebugDisplay {


    /**
     *
     */
    constructor() {


    }



    /**
     *
     */
    render() {
        if(game.isDebug) {
            let fpsText = 'FPS: ' + game.time.fps;
            game.debug.text(fpsText, 10, 80);
            let pingText = 'Ping: ' + game.gameState.ping;
            game.debug.text(pingText, 10, 100);
            let deltaText = 'Delta Multiplier: ' + game.gameState.deltaMultiplier;
            game.debug.text(deltaText, 10, 120);
        }
    }


}
