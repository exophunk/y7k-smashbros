import ThrowableItem from 'client/objects/ThrowableItem';

let instance = null;

export default class ThrowableItemFactory {


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
    get(throwableKey) {
        return new ThrowableItem(throwableKey);
    }

}
