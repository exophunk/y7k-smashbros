import Game from 'client/Game';
import SocketIO from 'socket.io-client';

const socket = SocketIO();
global.game = new Game();

game.server = socket;

game.start();

