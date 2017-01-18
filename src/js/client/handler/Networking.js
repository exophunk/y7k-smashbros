import SocketIO from 'socket.io-client';
import MathHelper from 'shared/util/MathHelper';
import Player from 'shared/objects/Player';
import Throwable from 'shared/objects/Throwable';
import {PlayerStates, PlayerConfig} from 'shared/objects/Player';


export const NetworkConfig = {
    INPUT_RATE: 30,
    NET_OFFSET: 100,
}


export default class Networking {


    constructor() {
        this.server = SocketIO();
        this.netBuffer = [];
    }


    join() {
        this.server.on('confirm_join', this.confirmJoin.bind(this));
        this.server.on('room_not_found', this.disconnected.bind(this));
        this.server.on('disconnect', this.disconnected.bind(this));

        this.server.emit('join', {
            playerData: game.gameState.player.getFullSnapshot(),
            forcedRoom: game.gameState.forcedRoom
        });
    }


    joinSpectator() {
        this.server.on('confirm_join', this.confirmJoin.bind(this));
        this.server.on('disconnect', this.disconnected.bind(this));
        this.server.on('room_not_found', this.disconnected.bind(this));
        this.server.emit('join_spectator', game.gameState.forcedRoom);
    }


    disconnected() {
        console.log('DISCONNECT FROM SERVER');
        clearTimeout(this.inputLoopTimeout);
        //game.state.start('StateMenu', true);
        window.location = window.location.href.split("?")[0];
    }


    confirmJoin(data) {

        game.gameState.player.id = data.id;
        this.syncWorldSnapshot(data.worldSnapshot);

        this.server.on('update_world', this.bufferServerUpdates.bind(this));
        this.server.on('player_got_hit', this.playerGotHit.bind(this));
        this.server.on('enemy_joined', this.addEnemy.bind(this));
        this.server.on('enemy_left', this.removeEnemy.bind(this));
        this.server.on('reset_throwables', this.resetThrowables.bind(this));

        if(!game.gameState.spectate) {
            this.inputSendLoop();
        }

    }


    inputSendLoop() {

        let updatesDelta = {
            player: game.gameState.player.getDeltaSnapshot()
        };

        if(game.gameState.activeThrowable) {
            updatesDelta.throwable = game.gameState.activeThrowable.getDeltaSnapshot();
        }

        if(Object.keys(updatesDelta.player).length > 1 || (updatesDelta.throwable && Object.keys(updatesDelta.throwable).length > 1)) {
            this.sendUpdates(updatesDelta);
        }

        this.inputLoopTimeout = setTimeout(this.inputSendLoop.bind(this), 1000 / NetworkConfig.INPUT_RATE);
    }


    sendUpdates(updatesDelta) {
        this.server.emit('update_from_client', updatesDelta);
    }


    bufferServerUpdates(snapshot) {
        snapshot.clientTime = new Date().getTime();
        this.netBuffer.push(snapshot);

        if(this.netBuffer.length > 8) {
            this.netBuffer.shift();
        }
    }


    interpolateEntities() {
        let renderTime = new Date().getTime() - NetworkConfig.NET_OFFSET;

        let previousSnapshot;
        let targetSnapshot;

        for(let i = 0; i < this.netBuffer.length; i++) {

            let prev = this.netBuffer[i];
            let next = this.netBuffer[i+1];

            if(next) {
                if(renderTime >= prev.clientTime && renderTime <= next.clientTime ) {
                    previousSnapshot = prev;
                    targetSnapshot = next;
                    break;
                }
            }
        }


        if(previousSnapshot && targetSnapshot) {
            let lerpAmmount = MathHelper.mapToNormal(renderTime, previousSnapshot.clientTime, targetSnapshot.clientTime);

            if(previousSnapshot.players && targetSnapshot.players) {
                Object.keys(game.gameState.enemies).forEach((id) => {
                    if(game.gameState.enemies[id] && id != game.gameState.player.id) {
                        game.gameState.enemies[id].updateInterpolated(previousSnapshot.players[id], targetSnapshot.players[id], lerpAmmount);
                    }
                });

            }

            Object.keys(game.gameState.throwables).forEach((id) => {
                if(!game.gameState.activeThrowable || id != game.gameState.activeThrowable.id) {
                    game.gameState.throwables[id].updateInterpolated(previousSnapshot.throwables[id], targetSnapshot.throwables[id], lerpAmmount);
                }
            });
        }


    }

    syncWorldSnapshot(snapshot) {
        this.syncPlayers(snapshot.players);
        this.syncThrowables(snapshot.throwables);
    }


    syncPlayers(serverPlayers) {
        Object.values(serverPlayers).forEach((serverPlayer) => {
            if(game.gameState.player.id != serverPlayer.id) {
                let localPlayer = game.gameState.enemies[serverPlayer.id];
                if(localPlayer) {
                    localPlayer.update(serverPlayer);
                } else {
                    this.addEnemy(serverPlayer);
                }
            }
        });
    }


    syncThrowables(serverThrowables) {
        Object.values(serverThrowables).forEach((serverThrowable) => {
            if(!game.gameState.activeThrowable || game.gameState.activeThrowable.id != serverThrowable.id) {
                let localThrowable = game.gameState.throwables[serverThrowable.id];
                if(localThrowable) {
                    localThrowable.update(serverThrowable);
                } else {
                    this.addThrowable(serverThrowable);
                }
            }
        });
    }


    addEnemy(enemySnapshot) {
        let enemy = new Player(enemySnapshot.char.key, enemySnapshot.name, false);
        enemy.char.setPhysics();
        enemy.update(enemySnapshot);
        game.gameState.enemies[enemy.id] = enemy;
        game.paintLayers.chars.add(enemy.char);
        console.log('Enemy joined');
    }


    removeEnemy(enemyId) {
        if(game.gameState.enemies[enemyId]) {
            game.gameState.enemies[enemyId].char.destroy();
            delete game.gameState.enemies[enemyId];
            console.log('Enemy left', enemyId);
        }
    }


    addThrowable(throwableSnapshot) {
        let throwable = new Throwable(throwableSnapshot.id, throwableSnapshot.item.key);
        throwable.item.setPhysics();
        throwable.update(throwableSnapshot);
        game.gameState.throwables[throwable.id] = throwable;
        game.paintLayers.throwables.add(throwable.item);
    }


    sendHitEnemy(enemyId) {
        this.server.emit('player_hit', enemyId);
    }


    playerGotHit(playerData) {
        console.log('playa got hit', playerData.id);
        if(playerData.id == game.gameState.player.id) {
            let player = game.gameState.player;
            player.health = playerData.health;
            player.state = playerData.state;

            if(player.state == PlayerStates.DEAD) {
                this.hostDied();
            } else {
                this.hostGotHit();
            }
        } else {
            let enemy = game.gameState.enemies[playerData.id];
            if(enemy) {
                enemy.update(playerData);
                if(enemy.state == PlayerStates.DEAD) {
                    this.enemyDied(enemy);
                } else {
                    this.enemyGotHit(enemy);
                }
            }
        }

    }


    hostGotHit() {
        game.camera.shake(0.01, 1000);
        game.gameState.player.char.showHitEffects();
        game.gameState.freezeInput = true;

        setTimeout(() => {
            game.gameState.player.state = PlayerStates.ALIVE;
        }, PlayerConfig.HIT_IMMUNE_TIME);

        setTimeout(() => {
            game.gameState.freezeInput = false;
        }, PlayerConfig.HIT_FREEZE_TIME);
    }


    hostDied() {
        game.gameState.freezeInput = true;
        game.gameState.player.char.showDyingEffects();
    }


    enemyGotHit(enemy) {
        enemy.char.showHitEffects();
    }


    enemyDied(enemy) {
        enemy.char.showDyingEffects();
    }


    resetThrowables() {
        for(let throwable of Object.values(game.gameState.throwables)) {
            throwable.reset();
        }
    }


}
