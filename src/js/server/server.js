import "babel-polyfill";
import express from 'express';
import http from 'http';
import SocketIO from 'socket.io';
import dotenv from 'dotenv';
//import UUID from 'uuid/v1';
import path from 'path';
import fs from 'fs';

import ServerConfig from 'server/ServerConfig';
import GameRoom from 'server/GameRoom';
import Player from 'shared/objects/Player';

dotenv.config();

global.isClient = false;
global.isServer = true;


export default class Server {


    constructor() {

        this.app = express();
        this.server = http.Server(this.app);
        this.port = process.env.WEBSOCKET_PORT || 3000;
        this.app.use(express.static(path.resolve('public')))
        this.server.listen(this.port, () => { this.onListen() });
        this.io = new SocketIO(this.server);

        this.gameRooms = [];
        this.data = {};
        this.data.throwablesData = JSON.parse(fs.readFileSync(ServerConfig.THROWABLES_DATA_PATH, 'utf8'));

        this.io.on('connection', (socket) => { this.onConnection(socket) });


    }


    onListen() {
        console.log('Listening on Port ' + this.port + '...');
    }


    onConnection(socket) {
        socket.on('join', (playerData) => { this.joinPlayer(socket, playerData); });
        socket.on('disconnect', () => { this.closeEmptyRooms(); });
    }


    joinPlayer(socket, playerData) {

        let id = new Date().getTime().toString();
        id = id.substr(id.length - 6, 6);
        let playerId = playerData.char.key + '-' + id;

        let player = new Player();
        player.update(playerData);
        player.id = playerId;

        let gameRoom = this.getGameRoom();
        gameRoom.joinRoom(socket, player);
        socket.join(gameRoom.roomKey);
    }


    getGameRoom() {
        let room = null;
        for(let gameRoom of this.gameRooms) {
            if(gameRoom.getPlayersCount() < ServerConfig.MAX_ROOM_PLAYERS) {
                room = gameRoom;
                break;
            }
        };

        if(!room) {
            let roomKey = 'Room ' + (this.gameRooms.length + 1);
            room = new GameRoom(this.io, roomKey, this.data);
            this.gameRooms.push(room);
            console.log('New Room created! (' + roomKey + ') Currently: ' + this.gameRooms.length + ' open rooms');
        }

        return room;
    }


    closeEmptyRooms() {
        for(let gameRoom of this.gameRooms) {
            if(gameRoom.getPlayersCount() == 0) {
                console.log('Closing empty room (' + gameRoom.roomKey + ') Currently: ' + this.gameRooms.length + ' open rooms');
                this.gameRooms.splice(this.gameRooms.indexOf(gameRoom), 1);
            }
        };

    }
}

const server = new Server();

