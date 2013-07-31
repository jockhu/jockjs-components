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
    var a = '.anjuke.', c = 'dev.fang', u = 'http://' + ( /dev/.test(J.D.location.host) ? c + a + 'test' : 'm' + a + 'com' ) + '/ts.html';
    J.add('logger', {
        loggerUrl:u,
        autoLogger:true,
        onError:null
    });
})(J);
