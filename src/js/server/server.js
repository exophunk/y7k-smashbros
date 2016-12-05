import express from 'express';
import http from 'http';
import SocketIO from 'socket.io';

export default class Server {

    constructor() {
        console.log("laalal", process.env);
        this.app = express();
        this.server = http.Server(this.app);
        this.io = new SocketIO(this.server);
        this.port = process.env.WEBSOCKET_PORT || 3000;
        this.io.on('connection', this.onConnection);

        this.app.use(express.static(__dirname + '/../public'));

        this.server.listen(this.port, () => { this.onListen() });
    }


    onListen() {
        console.log('Listening on Port ' + this.port + '...');
    }


    onConnection(socket) {
        console.log('connect');

        socket.on('disconnect', function(){
            console.log('user disconnected');
        });

        socket.on('client_update', function(clientData){
            console.log('client: ' + clientData);
        });

        socket.on('move', function(clientData){
            console.log('clientmove: ' + clientData);
        });
    }

}

const server = new Server();

