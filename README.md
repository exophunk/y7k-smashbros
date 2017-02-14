

# Y7K Smash Bros

![Smashbros](https://raw.githubusercontent.com/exophunk/y7k-smashbros/master/src/assets/images/meta/readme-image.jpg)

![Smashbros Game](https://raw.githubusercontent.com/exophunk/y7k-smashbros/master/src/assets/images/meta/readme-image2.jpg)

**Version 1.0.0**

Having a bad day? Breathe in and out slowly… or throw some chairs at your collegues. Welcome to the Y7K office brawl!


Y7K Smash Bros is a WebGL/Canvas based topdown arcade game crafted using [Phaser](https://phaser.io) as the client-side JS framework and [Socket.io](https://socket.io) for the multiplayer networking. You can chose a character and run around the [Y7K](https:77y7k.com) office. You can pick up objects and throw them around. You score if you hit others with the objects :)

The game supports multiple game rooms with up to 8 players per room.

## Installation

1. Run `npm install` to install all dependencies.
2. Run `gulp build-prod` or `gulp build-dev` to build all bundles (You can also use `npm run`)
3. Run the node server with `node server/server.js` or `npm run start`
4. Open the game in the browser at `localhost:3000` 

## Development

Javascript Code is based on ES2016/Babel and built with Webpack. Serverside-Code is also bundled with Webpack, because we use Babel aswell. vendor packages are packed in their own build bundle.

- Use `gulp watch` to run webpack with filewatching and running the nodeserver with nodemon.
- Check gulpfile for other, more specific run tasks

#### Game Engine

The client side game code is built on [Phaser](https://phaser.io). Phaser renders the game to HTML5 Canvas (Canvas mode is forced over WebGL for performance reasons). For the physics simulation, [p2.js](https://github.com/schteppe/p2.js) (phaser built-in release) is used. 

Most Game Logic is handled in the main game state [StatePlaying](https://github.com/exophunk/y7k-smashbros/blob/master/src/js/client/states/StatePlaying.js).

There are two main entities in the game: Players and Throwables (Objects that a player can throw).
    
#### Networking

The serverside Code is built based on [Socket.io](https://socket.io) and exchanges game state between different game clients via websockets. The game simulation is not run serverside and the server is therefore only authorative in some cases. The client is authorative about the own player position and any throwable object the player currently interacts with. By default, the client updates the server with a rate of 30x/s.

The server sends updates of the world state to all connected clients at a rate of 20x/s (Tick rate). The world state snapshots are compressed by a simplified delta compression that only sends data to clients, that actually changed.

To make enemy character movement smooth, entity interpolation is used with a default *Lerp Time* of 80ms. This gives clients enough time to smoothly render the entities positions even with network latency.

Most Networking Logic is handled by the clientside [Networking](https://github.com/exophunk/y7k-smashbros/blob/master/src/js/client/handler/Networking.js) Handler and the serverside [GameRoom](https://github.com/exophunk/y7k-smashbros/blob/master/src/js/server/GameRoom.js).

You can monitor the current server state and active rooms by visiting `/admin`. For accessing the serveradmin page, you need to set up `ADMIN_USER` and `ADMIN_PWHASH` (BCrypt hash) in the `.env` file.
