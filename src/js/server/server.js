import "babel-polyfill";
import express from 'express';
import http from 'http';
import SocketIO from 'socket.io';
import dotenv from 'dotenv';
//import UUID from 'uuid/v1';
import path from 'path';
import fs from 'fs';

import Config from 'shared/config/Config';
import Player from 'shared/objects/Player';
import {PlayerStates} from 'shared/objects/Player';
import Throwable from 'shared/objects/Throwable';
import {ThrowableStates} from 'shared/objects/Throwable';
import SnapshotHelper from 'shared/util/SnapshotHelper';

dotenv.config();

global.isClient = false;
global.isServer = true;

const TICK_RATE = 66;
const UPDATE_RATE = 22;

export default class Server {


    constructor() {

        this.app = express();
        this.server = http.Server(this.app);
        this.port = process.env.WEBSOCKET_PORT || 3000;
        this.app.use(express.static(path.resolve('public')))
        this.server.listen(this.port, () => { this.onListen() });

        this.io = new SocketIO(this.server);
        this.io.on('connection', (socket) => { this.onConnection(socket) });

        this.sockets = [];
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

        let throwablesData = JSON.parse(fs.readFileSync('public/assets/data/throwables.json', 'utf8'));

        throwablesData.forEach((throwableData) => {
            let throwable = new Throwable(throwableData.id, throwableData.type);
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
        this.simulationLoopTimeout = setTimeout(this.simulationLoop.bind(this), 1000 / TICK_RATE);
    }


    updateLoop() {
        let snapshot = this.getWorldDelta();
        //let snapshot = this.getWorldSnapshot();

        if(snapshot) {
            snapshot.serverTime = new Date().getTime();
            this.io.emit('update_world', snapshot);
        }

        this.updateLoopTimeout = setTimeout(this.updateLoop.bind(this), 1000 / UPDATE_RATE);
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
        this.lastWorldSnapshot = snapshot;
        return delta;
    }


    getPlayer(id) {
        return this.state.players[id];
    }


    getThrowable(id) {
        return this.state.throwables[id];
    }


    onListen() {
        console.log('Listening on Port ' + this.port + '...');
    }


    joinPlayer(socket, newPlayer, playerId) {
        let player = new Player();
        player.update(newPlayer);
        player.id = playerId;
        this.state.players[player.id] = player;

        const data = { id: player.id, worldSnapshot: this.getWorldSnapshot() };
        socket.emit('confirm_join', data);
        socket.broadcast.emit('enemy_joined', player.getFullSnapshot());
        console.log('Player joined (' + player.id + ')');
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

                setTimeout(() => {
                    player.state = PlayerStates.ALIVE;
                }, Config.HIT_FREEZE_TIME);

            }

            this.io.emit('player_hit', player.getFullSnapshot());

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
        delete this.sockets[socket.id];
        socket.broadcast.emit('enemy_left', playerId);
        console.log('Player left');
    }


    onConnection(socket) {
        console.log('new connection');

        let playerId = new Date().getTime();
        this.sockets[socket.id] = socket;
        socket.on('join', (player) => { this.joinPlayer(socket, player, playerId); });
        socket.on('update_from_client', (updates) => { this.updateFromClient(socket, updates); });
        socket.on('player_hit', (playerId) => { this.hitPlayer(playerId); });
        socket.on('disconnect', () => { this.leavePlayer(socket, playerId); });
    }

}

const server = new Server();

