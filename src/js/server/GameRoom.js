import ServerConfig from 'server/ServerConfig';
import Player from 'shared/objects/Player';
import {PlayerStates} from 'shared/objects/Player';
import Throwable from 'shared/objects/Throwable';
import {ThrowableStates} from 'shared/objects/Throwable';
import SnapshotHelper from 'shared/util/SnapshotHelper';


export default class GameRoom {


    constructor(io, roomKey, data) {

        this.io = io;
        this.roomKey = roomKey;
        this.data = data;

        this.state = {
            players: {},
            throwables: {}
        };

        this.initThrowables();

        this.lastWorldSnapshot = this.state;

        //this.simulationLoop();
        this.updateLoop();
        this.debugLoop();
    }


    initThrowables() {

        this.data.throwablesData.forEach((throwableData) => {
            let throwable = new Throwable(throwableData.id, throwableData.key);
            throwable.setPos(throwableData.x, throwableData.y);
            this.state.throwables[throwable.id] = throwable;
        })

    }


    // ---------------------------------------------------------------------------------------------------------
    // LOOPS


    debugLoop() {
        // console.log('----------');
        // Object.keys(this.state.players).forEach((id) => {
        //     console.log(JSON.stringify(this.state.players[id]));
        // });
        this.debugLoopTimeout = setTimeout(this.debugLoop.bind(this), 2000);
    }


    simulationLoop() {
        this.simulationLoopTimeout = setTimeout(this.simulationLoop.bind(this), 1000 / ServerConfig.TICK_RATE);
    }


    updateLoop() {

        let snapshot = this.getWorldDelta();
        //let snapshot = this.getWorldSnapshot();

        if(snapshot) {
            snapshot.serverTime = new Date().getTime();
            this.io.to(this.roomKey).emit('update_world', snapshot);
        }

        this.updateLoopTimeout = setTimeout(this.updateLoop.bind(this), 1000 / ServerConfig.UPDATE_RATE);
    }


    // ---------------------------------------------------------------------------------------------------------


    getWorldSnapshot() {
        return {
            players: JSON.parse(JSON.stringify(this.state.players)),
            throwables: JSON.parse(JSON.stringify(this.state.throwables)),
        };
    }

    getWorldDelta() {
        let snapshot = this.getWorldSnapshot();
        let delta = SnapshotHelper.getObjectDelta(snapshot, this.lastWorldSnapshot, ['id']);

        if(delta.players == null) delta.players = {};
        if(delta.throwables == null) delta.throwables = {};

        this.lastWorldSnapshot = snapshot;
        return delta;
    }


    getPlayer(id) {
        return this.state.players[id];
    }


    getThrowable(id) {
        return this.state.throwables[id];
    }


    getPlayersCount() {
        return Object.keys(this.state.players).length;
    }


    joinRoom(socket, player) {

        this.state.players[player.id] = player;

        const confirmData = { id: player.id, worldSnapshot: this.getWorldSnapshot() };
        socket.emit('confirm_join', confirmData);
        socket.broadcast.to(this.roomKey).emit('enemy_joined', player.getFullSnapshot());

        socket.on('update_from_client', (updates) => { this.updateFromClient(socket, updates); });
        socket.on('player_hit', (hitPlayerId) => { this.hitPlayer(hitPlayerId); });
        socket.on('disconnect', () => { this.leavePlayer(socket, player.id); });
        console.log('Client (' + player.id + ') entered Room ' + this.roomKey);
    }


    updateFromClient(socket, clientUpdates) {

        if(clientUpdates.player && this.getPlayer(clientUpdates.player.id)) {
            this.updatePlayer(clientUpdates.player);
        } else {
            console.log('Unknown player????' + clientUpdates.player.id);
            socket.disconnect('unknown');
            return;
        }

        if(clientUpdates.throwable && this.getThrowable(clientUpdates.throwable.id)) {
            this.updateThrowable(clientUpdates.throwable);
        }

    }


    updatePlayer(updatedPlayer) {
        let player = this.getPlayer(updatedPlayer.id);
        player.update(updatedPlayer);
    }


    hitPlayer(playerId) {
        let player = this.getPlayer(playerId);

        if(player) {
            player.health--;

            if(player.health < 0) {
                player.state = PlayerStates.DEAD;
            } else {
                player.state = PlayerStates.HIT;
            }

            this.io.to(this.roomKey).emit('player_got_hit', player.getFullSnapshot());

        }

    }


    updateThrowable(updatedThrowable) {
        let throwable = this.getThrowable(updatedThrowable.id);
        throwable.update(updatedThrowable);
    }


    resetThrowable(throwable) {
        throwable.state = ThrowableStates.IDLE;
        throwable.item.anchor = { x: 0.5, y: 0.5 };
    }


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




}
