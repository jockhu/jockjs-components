/**
 * Aifang Javascript Framework.
 * Copyright 2012 ANJUKE Inc. All rights reserved.
 *
 * @path: logger/logger.js
 * @author: Jock
 * @version: 1.0.0
 * @date: 2013/07/26
 *
 */

(function(J){
    var a = '.anjuke.', c = 'dev.fang', h = J.D.location.host, u = 'http://' + ( /dev|test/.test(h) ? c + a + 'test' : 'm' + a + 'com' ) + '/ts.html',
        s = h.match(/^(\w)\.(\w+)\./);
    J.add('logger', {
        site: s ? s[1] === 'm' ? 'm' : s[2] : 'unknow',
        loggerUrl:u,
        autoLogger:true,
        onError:null
    });
})(J);
