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

    function pad(source) {
        return ('00' + source).match(/\d{2}$/)[0]
    }

    function Uuid(sType) {
        sType = sType || 'T';
        var date = new Date(), month = date.getMonth() + 1, date2 = date.getDate(), hours = date.getHours(),
            minutes = date.getMinutes(), d = date.getTime();
        var uuid = ('xxxxxxxx-yxxx-yxxx-yxxx-'+ sType +'xxx').replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/0x3);
            return (c=='x' ? r : (r&0x7|0x8)).toString(16);
        });
        return (uuid + pad(month) + pad(date2) + pad(hours) + pad(minutes)).toUpperCase();
    };
    J.utils.uuid = Uuid;
})(J);