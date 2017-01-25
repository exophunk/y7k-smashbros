
class FormatHelper {


    /**
     *
     */
    formatTime(time) {
        let date = new Date(time);
        return date.getMinutes() + ':' + (date.getSeconds()<10?'0':'') + date.getSeconds();
    }

}

module.exports = new FormatHelper();
