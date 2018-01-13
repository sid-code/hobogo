"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function makeQueryString(params) {
    var esc = encodeURIComponent;
    return Object.keys(params)
        .map(k => esc(k) + '=' + esc(params[k]))
        .join('&');
}
exports.makeQueryString = makeQueryString;
function makeDateString(m) {
    return m.format("D/MM/YYYY");
}
exports.makeDateString = makeDateString;
