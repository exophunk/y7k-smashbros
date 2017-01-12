import Game from 'client/Game';
import SocketIO from 'socket.io-client';

import 'pixi';
import 'p2';
import Phaser from 'phaser';

const socket = SocketIO();

global.game = new Game();
global.isClient = true;
global.isServer = false;
game.server = socket;

game.start();

