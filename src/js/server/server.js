import "babel-polyfill";
import express from 'express';
import http from 'http';
import SocketIO from 'socket.io';
import dotenv from 'dotenv';
import UUID from 'uuid/v1';

dotenv.config();

export default class Server {

    constructor() {

        this.app = express();
        this.server = http.Server(this.app);
        this.port = process.env.WEBSOCKET_PORT || 3000;

        this.app.use(express.static(__dirname + '/../public'));
        this.server.listen(this.port, () => { this.onListen() });

        this.io = new SocketIO(this.server);
        this.io.on('connection', (socket) => { this.onConnection(socket) });

        this.players = [];
        this.throwables = [];
    }

    getPlayer(id) {
        return this.players.find((player) => player.id == id );
    }

    onListen() {
        console.log('Listening on Port ' + this.port + '...');
    }


    joinPlayer(player, clientId) {
        player.id = clientId;
        this.players.push(player);
        console.log('Player joined');
    }


    updatePlayer(updatedPlayer, clientId) {
        let player = this.getPlayer(clientId);
        player = Object.assign(player, updatedPlayer);
        this.io.emit('update_state', this.players);
    }


    leavePlayer(clientId) {
        const removePlayer = this.getPlayer(clientId);
        this.players.splice(this.players.indexOf(removePlayer), 1);
        console.log('Player left');
    }


    onConnection(socket) {
        socket.id = UUID();

        socket.on('join', (player) => { this.joinPlayer(player, socket.id); });
        socket.on('disconnect', () => { this.leavePlayer(socket.id); });
        socket.on('update_player', (player) => { this.updatePlayer(player, socket.id); });

    }

}

const server = new Server();

