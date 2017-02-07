import {ServerConfig, GameConfig, PlayerConfig} from 'shared/configs/GameConfig';
import {PlayerStates, ThrowableStates} from 'shared/configs/ObjectStates';
import Player from 'shared/objects/Player';
import Throwable from 'shared/objects/Throwable';
import SnapshotHelper from 'shared/util/SnapshotHelper';

export default class GameRoom {


    /**
     *
     */
    constructor(io, roomKey, data) {

        this.io = io;
        this.roomKey = roomKey;
        this.data = data;
        this.lastSimLoopTime = new Date().getTime();
        this.updateCounter = 0;
        this.openedOn = new Date();
        this.forceFullWorldSnapshot = false;

        this.state = {
            isRoundRunning: false,
            isWaitingForPlayers: true,
            roundTime: GameConfig.ROUND_TIME,
            players: {},
            throwables: {}
        };

        this.initThrowables();

        this.lastWorldSnapshot = this.state;

        this.simulationLoop();
        this.updateLoop();
        this.debugLoop();
    }


    // --------------------------------------------------------------------------------------------
    // INITIALIZATION
    // --------------------------------------------------------------------------------------------

    /**
     *
     */
    initThrowables() {

        this.data.throwablesData.forEach((throwableData) => {
            let throwable = new Throwable(throwableData.id, throwableData.key);
            throwable.setPos(throwableData.x, throwableData.y);
            throwable.item.particleEmitterType = throwableData.particleEmitterType ? throwableData.particleEmitterType : null;
            throwable.item.soundGroup = throwableData.soundGroup ? throwableData.soundGroup : null;
            this.state.throwables[throwable.id] = throwable;
        })

    }


    // --------------------------------------------------------------------------------------------
    // LOOPS
    // --------------------------------------------------------------------------------------------


    /**
     *
     */
    debugLoop() {
        // console.log('----------');
        // console.log('THROWABLES: ' + Object.keys(this.state.throwables).length);
        // Object.values(this.state.throwables).forEach((throwable) => {
        //     console.log(throwable.item.body.x, throwable.item.body.y);
        // });
        this.debugLoopTimeout = setTimeout(this.debugLoop.bind(this), 1000);
    }


    /**
     *
     */
    simulationLoop() {

        Object.values(this.state.throwables).forEach((throwable) => {
            if(throwable.carryingPlayerId && !this.state.players[throwable.carryingPlayerId]) {
                this.resetThrowable(throwable);
            }
        });

        let now = new Date().getTime();

        if(this.state.isRoundRunning) {
            if(this.state.roundTime > 0) {
                this.state.roundTime -= (now - this.lastSimLoopTime);
            } else {
                this.state.roundTime = 0;
                this.roundOver();
            }

        }

        this.lastSimLoopTime = now;
        this.simulationLoopTimeout = setTimeout(this.simulationLoop.bind(this), 1000 / ServerConfig.SERVER_SIM_TICK_RATE);
    }


    /**
     *
     */
    updateLoop() {
        this.updateCounter++;

        let snapshot;
        if(this.updateCounter%(ServerConfig.SERVER_UPDATE_RATE * 3) == 0 || this.forceFullWorldSnapshot) {
            this.forceFullWorldSnapshot = false;
            snapshot = this.getWorldSnapshot();
        } else {
            //snapshot = this.getWorldDelta();
            snapshot = this.getWorldSnapshot();
        }

        if(snapshot) {
            snapshot.serverTime = new Date().getTime();
            this.io.to(this.roomKey).emit('update_world', snapshot);
        }

        this.updateLoopTimeout = setTimeout(this.updateLoop.bind(this), 1000 / ServerConfig.SERVER_UPDATE_RATE);
    }



    // --------------------------------------------------------------------------------------------
    // LOCAL METHODS
    // --------------------------------------------------------------------------------------------


    /**
     *
     */
    getWorldSnapshot() {
        return {
            roundTime: this.state.roundTime,
            players: JSON.parse(JSON.stringify(this.state.players)),
            throwables: JSON.parse(JSON.stringify(this.state.throwables)),
        };
    }


    /**
     *
     */
    getWorldDelta() {
        let snapshot = this.getWorldSnapshot();
        let delta = SnapshotHelper.getObjectDelta(snapshot, this.lastWorldSnapshot, ['id']);

        if(delta.players == null) delta.players = {};
        if(delta.throwables == null) delta.throwables = {};

        this.lastWorldSnapshot = snapshot;
        return delta;
    }


    /**
     *
     */
    getPlayer(id) {
        return this.state.players[id];
    }


    /**
     *
     */
    getThrowable(id) {
        return this.state.throwables[id];
    }


    /**
     *
     */
    getPlayersCount() {
        return Object.keys(this.state.players).length;
    }


    /**
     *
     */
    updatePlayer(updatedPlayer) {
        let player = this.getPlayer(updatedPlayer.id);
        player.update(updatedPlayer);
    }


    /**
     *
     */
    updateThrowable(updatedThrowable) {
        let throwable = this.getThrowable(updatedThrowable.id);
        throwable.update(updatedThrowable);
    }


    /**
     *
     */
    resetThrowable(throwable) {
        throwable.state = ThrowableStates.IDLE;
        throwable.carryingPlayerId = null;
        throwable.item.anchor = { x: 0.5, y: 0.5 };
    }


    /**
     *
     */
    resetAllThrowables() {
        this.initThrowables();
        this.forceFullWorldSnapshot = true;
        this.io.to(this.roomKey).emit('reset_throwables');
    }


    // --------------------------------------------------------------------------------------------
    // NETWORKING  METHODS
    // --------------------------------------------------------------------------------------------

    /**
     *
     */
    joinRoom(socket, player) {

        this.state.players[player.id] = player;

        socket.on('update_from_client', (updates) => { this.updateFromClient(updates); });
        socket.on('player_hit', (hitData) => { this.hitPlayer(socket, hitData); });
        socket.on('disconnect', () => { this.leavePlayer(socket, player.id); });

        socket.broadcast.to(this.roomKey).emit('enemy_joined', player.getFullSnapshot());

        if(this.state.isWaitingForPlayers && Object.values(this.state.players).length > 1) {
            this.startRound();
        }

        const confirmData = {
            id: player.id,
            worldSnapshot: this.getWorldSnapshot(),
            isRoundRunning: this.state.isRoundRunning
        };

        socket.emit('confirm_join', confirmData);

        console.log('Client (' + player.id + ') entered Room ' + this.roomKey);
    }


    /**
     *
     */
    joinSpectator(socket) {
        const confirmData = { id: null, worldSnapshot: this.getWorldSnapshot() };
        socket.emit('confirm_join', confirmData);
    }


    /**
     *
     */
    updateFromClient(clientUpdates) {

        if(clientUpdates.player && this.getPlayer(clientUpdates.player.id)) {
            this.updatePlayer(clientUpdates.player);
        }

        if(clientUpdates.throwable && this.getThrowable(clientUpdates.throwable.id)) {
            this.updateThrowable(clientUpdates.throwable);
        }

    }


    /**
     *
     */
    hitPlayer(socket, hitData) {
        let victim = this.getPlayer(hitData.victimId);

        if(victim) {
            victim.health--;

            if(victim.health <= 0) {
                victim.state = PlayerStates.DEAD;
                victim.increaseDeaths();

                Object.values(this.state.throwables).forEach((throwable) => {
                    if(throwable.carryingPlayerId == victim.id) {
                        this.resetThrowable(throwable);
                    }
                });

                let attacker = this.getPlayer(hitData.attackerId);
                if(attacker) {
                    attacker.increaseScore();
                    socket.emit('player_scores');
                }

            } else {
                victim.state = PlayerStates.HIT;
            }

            let hitReturnData = {
                victim: victim.getFullSnapshot(),
                throwableId: hitData.throwableId
            }
            this.io.to(this.roomKey).emit('player_got_hit', hitReturnData);

        }

    }


    /**
     *
     */
    leavePlayer(socket, playerId) {

        Object.values(this.state.throwables).forEach((throwable) => {
            if(throwable.carryingPlayerId == playerId) {
                this.resetThrowable(throwable);
            }
        });

        delete this.state.players[playerId];
        socket.broadcast.to(this.roomKey).emit('enemy_left', playerId);
        console.log('Player left');
    }


    /**
     *
     */
    startRound() {
        this.state.isRoundRunning = true;
        this.state.isWaitingForPlayers = false;
        this.io.to(this.roomKey).emit('round_start');
    }



    /**
     *
     */
    roundOver() {
        this.state.isRoundRunning = false;

        let roundData = {
            players: this.getWorldSnapshot().players,
        };
        this.io.to(this.roomKey).emit('round_over', roundData);

        setTimeout(() => {
            this.roundReset();
        }, GameConfig.ROUND_OVER_TIME);
    }


    /**
     *
     */
    roundReset() {
        this.resetAllThrowables();
        this.state.roundTime = GameConfig.ROUND_TIME;
        this.state.isRoundRunning = true;

        for(let player of Object.values(this.state.players)) {
            player.health = GameConfig.PLAYER_HEALTH;
            player.score = 0;
            player.deaths = 0;
        }

        this.io.to(this.roomKey).emit('round_reset', this.getWorldSnapshot());
    }


    /**
     *
     */
    closeRoom() {
        this.io.to(this.roomKey).emit('disconnect');
        clearTimeout(this.debugLoopTimeout);
        clearTimeout(this.simulationLoopTimeout);
        clearTimeout(this.updateLoopTimeout);
    }


}
