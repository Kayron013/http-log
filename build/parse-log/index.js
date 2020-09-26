"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseLog = void 0;
exports.parseLog = function (logStr) {
    var parts = logStr.split(',');
    return {
        ip: JSON.parse(parts[0]),
        rfc931: JSON.parse(parts[1]),
        authUser: JSON.parse(parts[2]),
        date: JSON.parse(parts[3]),
        request: parseRequest(JSON.parse(parts[4])),
        status: JSON.parse(parts[5]),
        bytes: JSON.parse(parts[6]),
    };
};
var parseRequest = function (reqStr) {
    var parts = reqStr.split(' ');
    return {
        method: parts[0],
        path: parts[1],
        section: getSectionFromPath(parts[1]),
        protocol: parts[2],
    };
};
var getSectionFromPath = function (path) {
    var matches = /^\/[^\/]+/.exec(path);
    return matches ? matches[0] : '';
};
//# sourceMappingURL=index.js.map