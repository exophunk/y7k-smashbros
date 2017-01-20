import Player from 'shared/objects/Player';
import {PlayerStates} from 'shared/objects/Player';
import Throwable from 'shared/objects/Throwable';
import {ThrowableStates} from 'shared/objects/Throwable';
import SnapshotHelper from 'shared/util/SnapshotHelper';
import {ServerConfig, GameConfig} from 'shared/configs/GameConfig';

export default class GameRoom {


    /**
     *
     */
    constructor(io, roomKey, data) {

        this.io = io;
        this.roomKey = roomKey;
        this.data = data;
        this.playTime = 0;
        this.updateCounter = 0;
        this.openedOn = new Date();
        this.forceFullWorldSnapshot = false;

        this.state = {
            players: {},
            throwables: {}
        };

        this.initThrowables();

        this.lastWorldSnapshot = this.state;

        this.simulationLoop();
        this.updateLoop();
        this.debugLoop();
    }


    // --------------------------------------------------------------------------------------------
    // INITIALIZATION
    // --------------------------------------------------------------------------------------------

    /**
     *
     */
    initThrowables() {

        this.data.throwablesData.forEach((throwableData) => {
            let throwable = new Throwable(throwableData.id, throwableData.key);
            throwable.setPos(throwableData.x, throwableData.y);
            this.state.throwables[throwable.id] = throwable;
        })

    }


    // --------------------------------------------------------------------------------------------
    // LOOPS
    // --------------------------------------------------------------------------------------------


    /**
     *
     */
    debugLoop() {
        console.log('----------');
        console.log('THROWABLES: ' + Object.keys(this.state.throwables).length);
        Object.values(this.state.throwables).forEach((throwable) => {
            console.log(throwable.item.body.x, throwable.item.body.y);
        });
        this.debugLoopTimeout = setTimeout(this.debugLoop.bind(this), 1000);
    }


    /**
     *
     */
    simulationLoop() {

        Object.values(this.state.throwables).forEach((throwable) => {
            if(throwable.carryingPlayerId && !this.state.players[throwable.carryingPlayerId]) {
                console.log('Reset stuck throwable ID: ' + throwable.id);
                this.resetThrowable(throwable);
            }
        });

        this.simulationLoopTimeout = setTimeout(this.simulationLoop.bind(this), 1000 / ServerConfig.SERVER_SIM_TICK_RATE);
    }


    /**
     *
     */
    updateLoop() {
        this.updateCounter++;

        let snapshot;
        if(this.updateCounter%(ServerConfig.SERVER_UPDATE_RATE * 3) == 0 || this.forceFullWorldSnapshot) {
            this.forceFullWorldSnapshot = false;
            snapshot = this.getWorldSnapshot();
        } else {
            snapshot = this.getWorldDelta();
        }

        if(snapshot) {
            snapshot.serverTime = new Date().getTime();
            this.io.to(this.roomKey).emit('update_world', snapshot);
        }

        this.updateLoopTimeout = setTimeout(this.updateLoop.bind(this), 1000 / ServerConfig.SERVER_UPDATE_RATE);
    }



    // --------------------------------------------------------------------------------------------
    // LOCAL METHODS
    // --------------------------------------------------------------------------------------------


    /**
     *
     */
    getWorldSnapshot() {
        return {
            players: JSON.parse(JSON.stringify(this.state.players)),
            throwables: JSON.parse(JSON.stringify(this.state.throwables)),
        };
    }


    /**
     *
     */
    getWorldDelta() {
        let snapshot = this.getWorldSnapshot();
        let delta = SnapshotHelper.getObjectDelta(snapshot, this.lastWorldSnapshot, ['id']);

        if(delta.players == null) delta.players = {};
        if(delta.throwables == null) delta.throwables = {};

        this.lastWorldSnapshot = snapshot;
        return delta;
    }


    /**
     *
     */
    getPlayer(id) {
        return this.state.players[id];
    }


    /**
     *
     */
    getThrowable(id) {
        return this.state.throwables[id];
    }


    /**
     *
     */
    getPlayersCount() {
        return Object.keys(this.state.players).length;
    }


    /**
     *
     */
    updatePlayer(updatedPlayer) {
        let player = this.getPlayer(updatedPlayer.id);
        player.update(updatedPlayer);
    }


    /**
     *
     */
    updateThrowable(updatedThrowable) {
        let throwable = this.getThrowable(updatedThrowable.id);
        throwable.update(updatedThrowable);
    }


    /**
     *
     */
    resetThrowable(throwable) {
        throwable.state = ThrowableStates.IDLE;
        throwable.carryingPlayerId = null;
        throwable.item.anchor = { x: 0.5, y: 0.5 };
    }


    /**
     *
     */
    resetAllThrowables() {
        this.initThrowables();
        this.forceFullWorldSnapshot = true;
        this.io.to(this.roomKey).emit('reset_throwables');
    }


    // --------------------------------------------------------------------------------------------
    // NETWORKING  METHODS
    // --------------------------------------------------------------------------------------------

    /**
     *
     */
    joinRoom(socket, player) {

        this.state.players[player.id] = player;

        const confirmData = { id: player.id, worldSnapshot: this.getWorldSnapshot() };
        socket.emit('confirm_join', confirmData);

        socket.broadcast.to(this.roomKey).emit('enemy_joined', player.getFullSnapshot());

        socket.on('update_from_client', (updates) => { this.updateFromClient(updates); });
        socket.on('player_hit', (hitPlayerId) => { this.hitPlayer(hitPlayerId); });
        socket.on('disconnect', () => { this.leavePlayer(socket, player.id); });

        console.log('Client (' + player.id + ') entered Room ' + this.roomKey);
    }


    /**
     *
     */
    joinSpectator(socket) {
        const confirmData = { id: null, worldSnapshot: this.getWorldSnapshot() };
        socket.emit('confirm_join', confirmData);
    }


    /**
     *
     */
    updateFromClient(clientUpdates) {

        if(clientUpdates.player && this.getPlayer(clientUpdates.player.id)) {
            this.updatePlayer(clientUpdates.player);
        }

        if(clientUpdates.throwable && this.getThrowable(clientUpdates.throwable.id)) {
            this.updateThrowable(clientUpdates.throwable);
        }

    }


    /**
     *
     */
    hitPlayer(playerId) {
        let player = this.getPlayer(playerId);

        if(player) {
            player.health--;

            if(player.health < 0) {
                player.state = PlayerStates.DEAD;

                Object.values(this.state.throwables).forEach((throwable) => {
                    if(throwable.carryingPlayerId == playerId) {
                        console.log('Reset DEAD throwable ID: ' + throwable.id);
                        this.resetThrowable(throwable);
                    }
                });

            } else {
                player.state = PlayerStates.HIT;
            }

            this.io.to(this.roomKey).emit('player_got_hit', player.getFullSnapshot());

        }

    }


    /**
     *
     */
    leavePlayer(socket, playerId) {

        Object.values(this.state.throwables).forEach((throwable) => {
            if(throwable.carryingPlayerId == playerId) {
                this.resetThrowable(throwable);
            }
        });

        delete this.state.players[playerId];
        socket.broadcast.to(this.roomKey).emit('enemy_left', playerId);
        console.log('Player left');
    }


    /**
     *
     */
    closeRoom() {
        this.io.to(this.roomKey).emit('disconnect');
        clearTimeout(this.debugLoopTimeout);
        clearTimeout(this.simulationLoopTimeout);
        clearTimeout(this.updateLoopTimeout);
    }


}
