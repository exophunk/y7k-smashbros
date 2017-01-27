import "babel-polyfill";
import express from 'express';
import http from 'http';
import SocketIO from 'socket.io';
import path from 'path';
import fs from 'fs';

import {ServerConfig} from 'shared/configs/GameConfig';

import AdminBoard from 'server/admin/AdminBoard';
import GameRoom from 'server/GameRoom';
import Player from 'shared/objects/Player';

if (process.env.NODE_ENV !== 'production') require('dotenv').config();

global.isClient = false;
global.isServer = true;

export default class Server {


    /**
     *
     */
    constructor() {

        this.app = express();
        this.server = http.Server(this.app);
        this.port = process.env.PORT || 3000;
        this.app.use(express.static(path.resolve('public')))
        this.server.listen(this.port, () => { this.onListen() });

        this.io = new SocketIO(this.server);

        this.gameRooms = [];
        this.data = {};
        this.data.throwablesData = JSON.parse(fs.readFileSync(ServerConfig.THROWABLES_DATA_PATH, 'utf8'));

        this.io.on('connection', (socket) => { this.onConnection(socket) });

        let adminData = {
            gameRooms: this.gameRooms,
            ServerConfig: ServerConfig
        }
        this.adminBoard = new AdminBoard(this.app, adminData);

    }


    /**
     *
     */
    onListen() {
        console.log('Listening on Port ' + this.port + '...');
    }


    /**
     *
     */
    onConnection(socket) {
        socket.on('join', (data) => { this.joinPlayer(socket, data); });
        socket.on('join_spectator', (roomKey) => { this.joinSpectator(socket, roomKey); });
        socket.on('disconnect', () => { this.closeEmptyRooms(); });
    }


    /**
     *
     */
    joinPlayer(socket, data) {

        let id = new Date().getTime().toString();
        id = id.substr(id.length - 6, 6);
        let playerId = data.playerData.char.key + '-' + id;

        let player = new Player();
        player.update(data.playerData);
        player.id = playerId;

        let gameRoom = data.forcedRoom ? this.getGameRoom(data.forcedRoom) : this.getNewGameRoom();
        if(gameRoom) {
            gameRoom.joinRoom(socket, player);
            socket.join(gameRoom.roomKey);
        } else {
            socket.emit('room_not_found');
        }

    }


    /**
     *
     */
    joinSpectator(socket, roomKey) {
        let gameRoom = this.getGameRoom(roomKey);

        if(gameRoom) {
            gameRoom.joinSpectator(socket);
            socket.join(roomKey);
        } else {
            console.log('Room to spectate doesn\'t exist');
            socket.emit('room_not_found');
        }
    }


    /**
     *
     */
    getNewGameRoom() {
        let room = null;
        for(let gameRoom of this.gameRooms) {
            if(gameRoom.getPlayersCount() < ServerConfig.MAX_ROOM_PLAYERS) {
                room = gameRoom;
                break;
            }
        };

        if(!room) {
            let roomKey = 'room-' + (this.gameRooms.length + 1);
            room = new GameRoom(this.io, roomKey, this.data);
            this.gameRooms.push(room);
            console.log('New Room created! (' + roomKey + ') Currently: ' + this.gameRooms.length + ' open rooms');
        }

        return room;
    }


    /**
     *
     */
    getGameRoom(roomKey) {
        for(let gameRoom of this.gameRooms) {
            if(gameRoom.roomKey == roomKey) {
                return gameRoom;
            }
        }
    }


    /**
     *
     */
    closeEmptyRooms() {
        setTimeout(() => {
            for(let gameRoom of this.gameRooms) {
                if(gameRoom.getPlayersCount() == 0) {
                    gameRoom.closeRoom();
                    this.gameRooms.splice(this.gameRooms.indexOf(gameRoom), 1);
                    console.log('Closing empty room (' + gameRoom.roomKey + ') Now: ' + this.gameRooms.length + ' open rooms');
                } else {
                    console.log('Can\'t close');
                }
            };
        }, 500);


    }
}

const server = new Server();

