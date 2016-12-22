import Gabriella from 'client/objects/characters/Gabriella';
import Joris from 'client/objects/characters/Joris';
import Julie from 'client/objects/characters/Julie';
import Robert from 'client/objects/characters/Robert';
import Ruben from 'client/objects/characters/Ruben';
import Tore from 'client/objects/characters/Tore';
import Yassin from 'client/objects/characters/Yassin';
import Yves from 'client/objects/characters/Yves';

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
            case 'gabriella': return new Gabriella();
            case 'joris': return new Joris();
            case 'julie': return new Julie();
            case 'robert': return new Robert();
            case 'ruben': return new Ruben();
            case 'tore': return new Tore();
            case 'yassin': return new Yassin();
            case 'yves': return new Yves();
        }
    }


    getAll() {
        return {
            'gabriella': new Gabriella(),
            'joris': new Joris(),
            'julie': new Julie(),
            'robert': new Robert(),
            'ruben': new Ruben(),
            'tore': new Tore(),
            'yassin': new Yassin(),
            'yves': new Yves()
        }
    }


    getAllAsArray() {
        let chars = this.getAll();
        return Object.keys(chars).map((k) => chars[k]);
    }

}
