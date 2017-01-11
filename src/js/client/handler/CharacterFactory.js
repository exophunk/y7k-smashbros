import Character from 'client/objects/Character';

let instance = null;

export default class CharacterFactory {

    constructor() {
        if(!instance) {
            instance = this;
        }
        return instance;
    }


    get(key) {
        let characterData = game.cache.getJSON('characters');
        return new Character(key, characterData[key].name);
    }


    getAll() {
        let characterData = game.cache.getJSON('characters');
        let characters = [];
        Object.keys(characterData).forEach((key) => {
            characters.push(this.get(key));
        });
        return characters;
    }

}
