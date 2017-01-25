import SocketIO from 'socket.io-client';
import MathHelper from 'shared/util/MathHelper';
import Player from 'shared/objects/Player';
import Throwable from 'shared/objects/Throwable';
import {ServerConfig, PlayerConfig} from 'shared/configs/GameConfig';
import {PlayerStates} from 'shared/configs/ObjectStates';

export default class Networking {

    /**
     *
     */
    constructor() {
        this.server = SocketIO();
        this.netBuffer = [];
        this.stateNetworking = null;

        this.server.on('confirm_join', (data) => {
            this.dispatchServerUpdate(this.confirmJoin, data, false);
        });

        this.server.on('room_not_found', (data) => {
            this.dispatchServerUpdate(this.disconnected, data, false);
        });

        this.server.on('disconnect', (data) => {
            this.dispatchServerUpdate(this.disconnected, data, false);
        });

        this.server.on('update_world', (data) => {
            this.dispatchServerUpdate(this.bufferServerUpdates, data, true);
        });

        this.server.on('player_got_hit', (data) => {
            this.dispatchServerUpdate(this.playerGotHit, data, true);
        });

        this.server.on('enemy_joined', (data) => {
            this.dispatchServerUpdate(this.addEnemy, data, false);
        });

        this.server.on('enemy_left', (data) => {
            this.dispatchServerUpdate(this.removeEnemy, data, false);
        });

        this.server.on('reset_throwables', (data) => {
            this.dispatchServerUpdate(this.resetThrowables, data, false);
        });

        this.server.on('round_over', (data) => {
            this.dispatchServerUpdate(this.roundOver, data, false);
        });

        this.server.on('round_reset', (data) => {
            this.dispatchServerUpdate(this.roundReset, data, false);
        });

        this.server.on('round_start', (data) => {
            this.dispatchServerUpdate(this.roundStart, data, false);
        });

    }



    // --------------------------------------------------------------------------------------------
    // SENDING TO SERVER
    // --------------------------------------------------------------------------------------------

    /**
     *
     */
    join() {
        this.server.emit('join', {
            playerData: game.gameState.player.getFullSnapshot(),
            forcedRoom: game.gameState.forcedRoom
        });
    }


    /**
     *
     */
    joinSpectator() {
        this.server.emit('join_spectator', game.gameState.forcedRoom);
    }


    /**
     *
     */
    sendUpdates(updatesDelta) {
        this.server.emit('update_from_client', updatesDelta);
    }


    /**
     *
     */
    inputSendLoop() {
        if(game.gameState.isPlaying) {
            let updatesDelta = {
                player: game.gameState.player.getDeltaSnapshot()
            };

            if(game.gameState.activeThrowable) {
                updatesDelta.throwable = game.gameState.activeThrowable.getDeltaSnapshot();
            }

            if(Object.keys(updatesDelta.player).length > 1 || (updatesDelta.throwable && Object.keys(updatesDelta.throwable).length > 1)) {
                this.sendUpdates(updatesDelta);
            }
        }

        this.inputLoopTimeout = setTimeout(this.inputSendLoop.bind(this), 1000 / ServerConfig.CLIENT_INPUT_RATE);
    }


    /**
     *
     */
    sendHitEnemy(enemyId) {
        this.server.emit('player_hit', enemyId);
    }



    // --------------------------------------------------------------------------------------------
    // RECEIVING FROM SERVER
    // --------------------------------------------------------------------------------------------

    /**
     *
     */
    dispatchServerUpdate(func, data, needPlaying) {
        if(!needPlaying || game.gameState.isPlaying) {
            func.apply(this, [data]);
        }
    }


    /**
     *
     */
    confirmJoin(data) {
        game.gameState.player.id = data.id;
        this.syncWorldSnapshot(data.worldSnapshot);

        if(!game.gameState.spectate) {
            this.inputSendLoop();
        }

        game.gameState.isPlaying = true;
        game.gameState.isRoundRunning = data.isRoundRunning;
        game.paused = false;

    }


    /**
     *
     */
    disconnected() {
        console.log('DISCONNECT FROM SERVER');
        clearTimeout(this.inputLoopTimeout);
        window.location = window.location.href.split("?")[0];
    }


    /**
     *
     */
    bufferServerUpdates(snapshot) {
        snapshot.clientTime = new Date().getTime();
        this.netBuffer.push(snapshot);

        if(this.netBuffer.length > 8) {
            this.netBuffer.shift();
        }
    }


    /**
     *
     */
    applyServerUpdates() {

        let renderTime = new Date().getTime() - ServerConfig.CLIENT_NET_OFFSET;

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

            if(targetSnapshot.roundTime) {
                game.gameState.roundTime = targetSnapshot.roundTime < 0 ? 0 : targetSnapshot.roundTime;
            }

            game.gameState.ping = targetSnapshot.clientTime - targetSnapshot.serverTime;
        }


    }


    /**
     *
     */
    syncWorldSnapshot(snapshot) {
        this.syncPlayers(snapshot.players);
        this.syncThrowables(snapshot.throwables);
    }


    /**
     *
     */
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


    /**
     *
     */
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


    /**
     *
     */
    addEnemy(enemySnapshot) {
        let enemy = new Player(enemySnapshot.char.key, enemySnapshot.name, false);
        enemy.char.setPhysics();
        enemy.update(enemySnapshot);
        enemy.char.updateHealthBar();
        game.gameState.enemies[enemy.id] = enemy;
        game.paintLayers.chars.add(enemy.char);
        console.log('Enemy joined');
    }


    /**
     *
     */
    removeEnemy(enemyId) {
        if(game.gameState.enemies[enemyId]) {
            game.gameState.enemies[enemyId].char.destroy();
            delete game.gameState.enemies[enemyId];
            console.log('Enemy left', enemyId);
        }
    }


    /**
     *
     */
    addThrowable(throwableSnapshot) {
        let throwable = new Throwable(throwableSnapshot.id, throwableSnapshot.item.key);
        throwable.item.setPhysics();
        throwable.update(throwableSnapshot);
        game.gameState.throwables[throwable.id] = throwable;
        game.paintLayers.throwables.add(throwable.item);
    }


    /**
     *
     */
    resetThrowables() {
        for(let throwable of Object.values(game.gameState.throwables)) {
            throwable.reset();
        }
    }


    /**
     *
     */
    playerGotHit(playerData) {
        this.statePlaying.playerGotHit(playerData);
    }


    /**
     *
     */
    roundOver(roundData) {
        this.statePlaying.roundOver(roundData);
    }


    /**
     *
     */
    roundReset() {
        this.statePlaying.roundReset();
    }


    /**
     *
     */
    roundStart() {
        this.statePlaying.roundStart();
    }

}
