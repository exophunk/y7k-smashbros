import Robert from 'client/objects/characters/Robert';
import Julie from 'client/objects/characters/Julie';

let instance = null;

export default class CharacterFactory {

    constructor() {
        if(!instance) {
            instance = this;
        }
        return instance;
    }


    get(key) {
        switch(key) {
            case 'robert': return new Robert();
            case 'julie': return new Julie();
        }
    }


    getAll() {
        return {
            'robert' : new Robert(),
            'julie' : new Julie(),
        }
    }


    getAllAsArray() {
        let chars = this.getAll();
        return Object.keys(chars).map((k) => chars[k]);
    }

}
