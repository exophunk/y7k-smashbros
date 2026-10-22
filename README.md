

# Y7K Smash Bros

![Smashbros](https://raw.githubusercontent.com/exophunk/y7k-smashbros/master/src/assets/images/meta/readme-image.jpg)

![Smashbros Game](https://raw.githubusercontent.com/exophunk/y7k-smashbros/master/src/assets/images/meta/readme-image2.jpg)

**Version 1.0.0**

Having a bad day? Breathe in and out slowly… or throw some chairs at your collegues. Welcome to the Y7K office brawl!


Y7K Smash Bros is a WebGL/Canvas based topdown arcade game crafted using [Phaser](https://phaser.io) as the client-side JS framework and [Socket.io](https://socket.io) for the multiplayer networking. You can chose a character and run around the [Y7K](https:77y7k.com) office. You can pick up objects and throw them around. You score if you hit others with the objects :)

The game supports multiple game rooms with up to 8 players per room.

## Installation

Use **Node.js 26** (the version is pinned in `.nvmrc`). With nvm installed:

```sh
nvm install
nvm use
npm ci
```

Dependencies install without building the game automatically.

## Development

```sh
npm run dev
```

Open **http://127.0.0.1:5173**. This starts Vite and the multiplayer server together.
Vite reloads the browser when game modules or assets change, updates styles live,
and proxies `/socket.io` (including WebSockets) and `/admin` to the Node server.
Server and shared-code edits rebuild the server and restart it automatically;
restarting the server clears active rooms. Stop both processes with Ctrl+C.

The backend uses port 3000 by default. Set `PORT` in your environment or `.env`
to change it; the Vite proxy uses the same value. Vite uses port 5173.
Copy `.env.example` to `.env` if you need local admin credentials.

## Production build

```sh
npm run build
npm start
```

Open **http://localhost:3000**. Vite writes the browser build to `dist/`; esbuild
writes the Node 26 server bundle and admin templates to `server/`. Run commands
from the project root. Deploy `dist/`, `server/`, `package.json`, and
`package-lock.json`, then use `npm ci --omit=dev` and `NODE_ENV=production npm start`.
Supply `PORT`, `ADMIN_USER`, and `ADMIN_PWHASH` through the production environment.

`npm run build-prod` remains an alias for the production build.
`npm run build-dev` produces a non-minified browser build with source maps, without
starting watchers. `npm test` builds the app and checks HTTP assets, authenticated
admin rendering, and a two-player round over polling and WebSocket connections.

The build uses Vite 8, Dart Sass, and esbuild, with no Gulp, Webpack, Babel, or native
Node Sass dependency. Phaser CE and the multiplayer/runtime libraries remain at
their previous locked versions to preserve gameplay and protocol behavior. The
Phaser plugins still load as ordered classic scripts because they share browser
globals. Updating those legacy runtime dependencies is a separate migration.

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
