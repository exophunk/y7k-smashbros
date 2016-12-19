
class MathHelper {

    interpolate(start, stop, amt) {
        amt = amt < 0 ? 0 : amt;
        amt = amt > 1 ? 1 : amt;
        return start + (stop-start) * amt;
    }


    map(value, istart, istop, ostart, ostop) {
        return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
    }


    mapToNormal(value, istart, istop) {
        return this.map(value, istart, istop, 0, 1);
    }

}

module.exports = new MathHelper();
