import "babel-polyfill";
import Game from 'client/Game';
import SocketIO from 'socket.io-client';

const socket = SocketIO();

global.game = new Game();
global.isClient = true;
global.isServer = false;
game.server = socket;

game.start();

