import assignDeep from 'assign-deep';


class SnapshotHelper {


    /**
     *
     */
    getObjectDelta(newObj, oldObj, keepKeys) {

        let delta = {};
        if(oldObj && newObj) {
            Object.keys(newObj).forEach((key) => {
                if(keepKeys && keepKeys.includes(key)) {
                    delta[key] = newObj[key];
                } else if(typeof newObj[key] == 'object' && oldObj[key]) {
                    let res = this.getObjectDelta(newObj[key], oldObj[key], keepKeys);
                    if(res != null) delta[key] = res;
                }   else {
                    if(newObj[key] !== oldObj[key]) {
                        delta[key] = newObj[key];
                    }
                }
            });
        }

        return Object.keys(delta).length != 0 ? delta : null;
    }


    /**
     *
     */
    patchObject(target, patch) {
        if(patch) {
            return assignDeep(target, patch);
        } else {
            return target;
        }
    }

}

module.exports = new SnapshotHelper();
