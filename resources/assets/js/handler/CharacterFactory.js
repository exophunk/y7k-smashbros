import Robert from 'objects/characters/Robert';
import Julie from 'objects/characters/Julie';

let instance = null;

export default class CharacterFactory {

    constructor() {
        if(!instance) {
            this.characters = {};
            instance = this;
        }

        return instance;
    }

    loadCharacters() {
        this.characters['robert'] = new Robert();
        this.characters['julie'] = new Julie();
    }

    get(key) {
        return this.characters[key];
    }

    getAll() {
        return this.characters;
    }

    getAllAsArray() {
        return Object.keys(this.characters).map((k) => this.characters[k]);
    }

}
