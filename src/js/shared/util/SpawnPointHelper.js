
class SpawnPointHelper {


    /**
     *
     */
    isSpawnPointFree(spawnPoint) {
        let isFree = true;
        for(let enemy of Object.values(game.gameState.enemies)) {
            if(Math.abs(spawnPoint.x - enemy.char.body.x) < 30 && Math.abs(spawnPoint.y - enemy.char.body.y) < 30) {
                isFree = false;
                break;
            }
        }

        if(isFree) {
            for(let throwable of Object.values(game.gameState.throwables)) {
                if(Math.abs(spawnPoint.x - throwable.item.body.x) < 30 && Math.abs(spawnPoint.y - throwable.item.body.y) < 30) {
                    isFree = false;
                    break;
                }
            }
        }

        return isFree;
    }

}

module.exports = new SpawnPointHelper();
