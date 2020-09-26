"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReport = exports.addLog = void 0;
var TRAFFIC_PER_SEC_THRESHOLD = 100;
var totalHits = 0;
var startTime = 0;
// Each element will be a 10sec bucket of logs
var tenSecBuckets = new Array(12);
var c = {
    totalSum: 100,
    totalCount: 100,
    latest: 1234,
    perTenSecond: [
        {
            sum: 2,
            count: 2,
            start: 1234,
            logs: [{ date: 1234 }, { date: 1234 }],
        },
        {
            sum: 2,
            logs: [{ date: 1234 }, { date: 1234 }],
        },
    ],
};
var getNearestTenSec = function (ts) {
    return Math.round(ts / 10) * 10;
};
var isClientError = function (status) {
    return String(status)[0] === '4';
};
var isServerError = function (status) {
    return String(status)[0] === '5';
};
/**
 *
 * @param log Incomming log
 * @returns `true` if incomming log caused log window to move
 */
exports.addLog = function (log) {
    var bucketTime = getNearestTenSec(log.date);
    if (startTime === 0) {
        startTime = bucketTime;
    }
    var bucketIndex = (bucketTime - startTime) / 10;
    // ignoring any logs that occurred at least 5sec before first log
    if (bucketIndex < 0) {
        return false;
    }
    else if (bucketIndex >= 12) {
        moveLogWindow(bucketTime);
        exports.addLog(log);
        return true;
    }
    else {
        // Update bucket info
        var bucket = tenSecBuckets[bucketIndex];
        bucket.logs.push(log);
        isClientError && bucket.clientErrors++;
        isServerError && bucket.serverErrors++;
        var section = log.request.section;
        if (!bucket.sectionHits[section]) {
            bucket.sectionHits[section] = 0;
        }
        bucket.sectionHits[section]++;
        if (bucket.maxSection.section === section) {
            bucket.maxSection.hits++;
        }
        else if (bucket.sectionHits[section] > bucket.maxSection.hits) {
            bucket.maxSection = {
                section: section,
                hits: bucket.sectionHits[section],
            };
        }
        // Update total info
        totalHits++;
        return false;
    }
};
/**
 * Moves window of logs stored to purge old logs and keep store new ones
 * @param bucketTime timestamp of new log bucket
 */
var moveLogWindow = function (bucketTime) {
    var moveAmount = (bucketTime - startTime) / 10;
    tenSecBuckets = __spreadArrays(tenSecBuckets.slice(moveAmount));
    startTime += moveAmount * 10;
};
exports.getReport = function () {
    // Get latest ten sec bucket
    var bucket = tenSecBuckets[tenSecBuckets.length - 1];
    return {
        hitsPerSecond: bucket.logs.length / 10,
        maxSection: bucket.maxSection,
    };
};
//# sourceMappingURL=index.js.map