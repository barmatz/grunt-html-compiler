'use strict';

function Attrs(attrs) {
    this._attrs = attrs;
}

Attrs.prototype.forEach = function (callback) {
    var attrs = this._attrs,
    key;

    for (key in attrs) {
        callback(key, attrs[key]);
    }
};

Attrs.prototype.toString = function () {
    var returnVal = [];

    this.forEach(function (key, value) {
        returnVal.push(key + '="' + value + '"');
    });

    return returnVal.join(', ');
};

Attrs.prototype.toHtml = function () {
    var returnVal = [];

    this.forEach(function (key, value) {
        returnVal.push(key + '="' + value + '"');
    });

    return returnVal.join(' ');
};

module.exports = Attrs;