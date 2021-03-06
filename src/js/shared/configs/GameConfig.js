
/**
 *
 */
export const GameConfig = {
    PLAYER_HEALTH: 3,
    ROUND_TIME: 5 * 60 * 1000,
    //ROUND_TIME: 30 * 1000,
    ROUND_OVER_TIME: 10 * 1000,
    PLAYER_DEAD_TIME: 4000,
    ACTION_INPUT_THROTTLE: 100,
}


/**
 *
 */
export const ThrowableConfig = {
    THROW_DURATION: 500,
    THROW_SPEED: 400,
    THROW_ROTATION: 270,
    DAMPING: 0.7,
    BODY_SIZE: 20,
    ANGULAR_DAMPING: 0.9,
    GLOW_ANIM_SPEED: 400,
    GLOW_ANIM_FREQUENCY: 7000,
}


/**
 *
 */
export const PlayerConfig = {
    HIT_IMMUNE_TIME: 2000,
    HIT_FREEZE_TIME: 500,
    SPAWN_FREEZE_TIME: 1000,
    WALK_SPEED: 180,
}


/**
 *
 */
export const ServerConfig = {
    CLIENT_INPUT_RATE: 30,
    CLIENT_NET_OFFSET: 80,
    SERVER_SIM_TICK_RATE: 5,
    SERVER_UPDATE_RATE: 22,
    MAX_ROOMS: 10,
    MAX_ROOM_PLAYERS: 8,
    THROWABLES_DATA_PATH: 'public/build/assets/data/throwables.json',
}


/**
 *
 */
export const ParticlesConfig = {
    TYPE_PLANT: 'plant',
    PARTICLES_PLANT: ['leave-1', 'leave-2'],
}


/**
 *
 */
export const SoundTypes = {
    HIT: 'hit',
    DIE: 'die',
    THROW: 'throw',
    TAUNT: 'taunt',
    PICK: 'pick',
    THROW: 'throw',
    LAND: 'land',
}


/**
 *
 */
export const ThrowableSoundGroups = {
    objSmall: {
        pick: ['obj-pick-2', 'obj-pick-3'],
        throw: ['obj-throw-1', 'obj-throw-2', 'obj-throw-3'],
        hit: ['obj-land-4'],
    },
    objDefault: {
        pick: ['obj-pick-1'],
        throw: ['obj-throw-1', 'obj-throw-2', 'obj-throw-3'],
        hit: ['obj-land-3'],
    },
    objPlant: {
        pick: ['obj-pick-4'],
        throw: ['obj-throw-1', 'obj-throw-2', 'obj-throw-3'],
        hit: ['obj-land-5'],
    },
}


