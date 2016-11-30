import express from 'express';
import http from 'http';
import SocketIO from 'socket.io';


export default class Server {

    constructor() {
        this.app = express();
        this.server = http.Server(this.app);
        this.io = new SocketIO(this.server);
        this.port = process.env.PORT || 3000;

        this.io.on('connection', this.onConnection);

    }

    onConnection(socket) {
        console.log("connect");
    }

}

const server = new Server();

