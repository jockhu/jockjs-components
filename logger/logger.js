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
    var a = '.anjuke', c = 'soj.dev.aifang', cm = '.com', h = J.D.location.host, http = 'http://', isDev = /dev|test/.test(h),
        logUrl = http + ( isDev ? c + cm : 'm' + a + cm ) + '/ts.html',
        sojUrl = http + (isDev ? c + cm : 's' + a + cm) + '/stb',
        s = h.match(/^(\w+)\.(\w+)\./), site = /iPad/.test(J.ua.ua) ? 'iPad' : s ? s[1] === 'm' ? 'm' : s[2] : 'unknow', eC = encodeURIComponent;

    J.add('logger', {
        site: site,
        logUrl:logUrl,
        sojUrl:sojUrl,
        isDev:isDev,
        autoLogger:true,
        onError:null,
        add: add,
        log: log
    });

    var logger = J.logger;

    function log(message, customMessage){
        var m = getEx(message, customMessage);
        var errorInfo = '?tp=error'
            + '&site=' + site
            + '&v=' + (J.W.PHPVERSION || '')
            + '&msg=' + m;
        new Image().src = logUrl + errorInfo;
        logger.onError && logger.onError(m);
    }

    function getEx(ex, cM){
        cM = cM ? 'Custom:' +cM+ ',' : '';
        if(J.isString(ex)) return cM + ex;
        var m = [];
        J.each(['name','message','description','url','stack','fileName','lineNumber','number','line'], function(i, v){
            if(v in ex){
                if(v == 'stack'){
                    m.push( v + ':' + eC(ex[v].split(/\n/)[0]) )
                }else{
                    m.push( v + ':' + eC(ex[v]) )
                }
            }
        });
        return cM + m.join(',')
    }

    function add(instance){
        /*for (item in instance || {}){
            if(J.isFunction( instance[item] )){
                applyLogger(instance, item);
            }
        }

        function applyLogger(instance, item){
            var method = instance[item];
            if(method.logged) return false;
            instance[item] = function(method){
                return function(){
                    try{
                        return method.apply(this, arguments);
                    }catch(ex){
                        log(ex)
                    }
                }
            }(method);
            method.logged = true;
        }*/
    }

    J.W.onerror = function(message, url, line){
        if(J.logger.autoLogger){
            log({
                message:message,
                url:url,
                line:line
            });
        }
    };

})(J);
