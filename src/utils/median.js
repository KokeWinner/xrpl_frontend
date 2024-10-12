MedianFilter = function (size) {

    var that = this;
    that.values = []; // Changed from vales to values
    that.sorted = [];
    that.size = size || 7;
    that.middelIndex = Math.round(that.size / 2);

};

MedianFilter.prototype = {};

MedianFilter.prototype.input = function (val) {

    var that = this;

    //If it's empty fill it up
    if (that.values.length === 0) { // Changed from vales to values
        that.fill(val);
        return val;
    }

    //Remove last
    that.values.shift(); // Changed from vales to values
    //Add new value
    that.values.push(val); // Changed from vales to values

    //Sort
    that.sorted = that.values.slice(0); // Changed from vales to values
    that.sorted = that.sorted.sort(function (a, b) { return a - b; });
    //return medium value
    return that.sorted[that.middelIndex];

};

MedianFilter.prototype.fill = function (val) {

    var that = this;
    if (that.values.length === 0) { // Changed from vales to values
        for (var i = 0; i < that.size; i++) {
            that.values.push(val); // Changed from vales to values
        }
    }

};

// Remove or comment out the following lines:
// var toucheFix = new MedianFilter(10);
// var val = toucheFix.input(touches);

// Optionally, you can add an export statement if you want to use this module elsewhere:
// module.exports = MedianFilter;