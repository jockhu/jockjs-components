/**
 * Aifang Javascript Framework.
 * Copyright 2012 ANJUKE Inc. All rights reserved.
 *
 * @path: utils/uuid.js
 * @author: Jock
 * @version: 1.0.0
 * @date: 2013/09/12
 *
 */

/// require('utils.utils');
(function(J) {
    "use strict";

    function replaceW(s){
        return s ? s.replace(/\W|_/g,'') : Math.random().toString().replace(/\./,'')
    }

    function pad(source){
        return ('00'+source).match(/\d{2}$/)[0]
    }

    J.utils.uuid = function () {
        var userAgent = replaceW(navigator.userAgent),
            herf = replaceW(J.D.location.href),
            lastModifiled = replaceW(J.D.lastModified),
            keys = (userAgent + herf + lastModifiled + '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz').split(''), len = keys.length,
            uuid = [], i, r;

        var date = new Date(),
            month = date.getMonth()+1,
            date2   = date.getDate(),
            hours   = date.getHours(),
            minutes = date.getMinutes();

        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';
        uuid[24] = 'T';

        for (i = 0; i < 28; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random()*len;
                uuid[i] = keys[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
        return uuid.join('').toUpperCase() + pad(month) + pad(date2) + pad(hours) + pad(minutes);
    };
})(J);