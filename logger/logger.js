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
        s = h.match(/^(\w)\.(\w+)\./), site = s ? s[1] === 'm' ? 'm' : s[2] : 'unknow', eC = encodeURIComponent;

    J.add('logger', {
        site: site,
        loggerUrl:u,
        autoLogger:true,
        onError:null,
        add: add,
        log: log
    });

    var logger = J.logger;

    function log(message){
        var m = J.isString(message) ? message : getEx(message);
        var errorInfo = '?tp=error'
            + '&site=' + site
            + '&v=' + PHPVERSION || ''
            + '&msg=' + m;
        new Image().src = u + errorInfo;
        logger.onError && logger.onError(m);
    }

    function getEx(ex){
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
        return m.join(',')
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
