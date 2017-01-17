import Game from 'client/Game';

import 'pixi';
import 'p2';
import Phaser from 'phaser';

global.game = new Game();
global.isClient = true;
global.isServer = false;

game.start();

