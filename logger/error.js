/**
 * Aifang Javascript Framework.
 * Copyright 2012 ANJUKE Inc. All rights reserved.
 *
 * @path: logger/error.js
 * @author: Jock
 * @version: 1.0.0
 * @date: 2013/07/26
 *
 */

/// require('logger.logger');

(function(J){
    var logger = J.logger, eC = encodeURIComponent;
    if(logger.autoTrack){
        J.W.onerror = function(message, url, line){
            var errorInfo = '?tp=error&msg=' + eC(message)
                + '&url=' + eC(url)
                + '&line=' + line;
            logger.loggerUrl && (new Image().src = logger.serverUrl + errorInfo);
        }

        console.log(J.W)
    }
})(J);