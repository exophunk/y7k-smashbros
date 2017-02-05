import Character from 'client/objects/Character';
import Portrait from 'client/objects/Portrait';

let instance = null;

export default class CharacterFactory {

    /**
     *
     */
    constructor() {
        if(!instance) {
            instance = this;
        }
        return instance;
    }


    /**
     *
     */
    getCharacter(key) {
        let characterData = game.cache.getJSON('characters');
        return new Character(key, characterData[key]);
    }


    /**
     *
     */
    getPortrait(key) {
        let characterData = game.cache.getJSON('characters');
        return new Portrait(key, characterData[key]);
    }


    /**
     *
     */
    getAllCharacters() {
        let characterData = game.cache.getJSON('characters');
        let characters = [];
        Object.keys(characterData).forEach((key) => {
            characters.push(this.getCharacter(key));
        });
        return characters;
    }


    /**
     *
     */
    getAllPortraits() {
        let characterData = game.cache.getJSON('characters');
        let portraits = [];
        Object.keys(characterData).forEach((key) => {
            portraits.push(this.getPortrait(key));
        });
        return portraits;
    }

}
