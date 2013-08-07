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
    J.W.onerror = function(message, url, line){
        if(logger.autoLogger){
            var errorInfo = '?tp=error&msg=' + eC(message)
                + '&url=' + eC(url)
                + '&line=' + line;
            new Image().src = logger.loggerUrl + errorInfo;
            logger.onError && logger.onError(message, url, line);
        }
    }
})(J);