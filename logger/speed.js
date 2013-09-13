/**
 * Aifang Javascript Framework.
 * Copyright 2012 ANJUKE Inc. All rights reserved.
 *
 * @path: logger/speed.js
 * @author: Jock
 * @version: 1.0.0
 * @date: 2013/07/26
 *
 */

/// require('logger.logger');

(function(J){
    var logger = J.logger, win = J.W, per = win.performance || {}, tim = per.timing, isNew = J.iN || 0;
    var a = '.anjuke.', c = 'dev.fang', h = J.D.location.host, isDev =/dev|test/.test(h), u = 'http://' + ( isDev ? c + a + 'test' : 'm' + a + 'com' ) + '/ts.html',
        s = h.match(/^(\w)\.(\w+)\./), site = s ? s[1] === 'm' ? 'm' : s[2] : 'unknow', eC = encodeURIComponent;

    function getSpeedUrl(pageName){
        return logger.url + '?pn=' + pageName + '&in=' + J.iN || 0
    }

    function getSpeed(){
        var tm = J.times, url = '&tp=speed'
        + '&PS='+ tm.PS
        + '&BS='+ tm.BS
        + '&CL='+ tm.CL
        + '&PL='+ tm.PL;
        return url
    }

    function getTiming(){
        var url = '&tp=timing',u=[],navigationStart = tim.navigationStart, timing = {
            redirectTime : tim.redirectEnd - tim.redirectStart,
            domainLookupTime : tim.domainLookupEnd - tim.domainLookupStart,
            connectTime : tim.connectEnd - tim.connectStart,
            requestTime : tim.responseStart - tim.requestStart,
            responseTime : tim.responseEnd - tim.responseStart,
            domParsingTime : tim.domInteractive - tim.domLoading,
            firstScreenTime : tim.domInteractive - navigationStart,
            resourcesLoadedTime : tim.loadEventStart - tim.domLoading,
            domContentLoadedTime : tim.domContentLoadedEventStart - tim.fetchStart,
            windowLoadedTime : tim.loadEventStart - tim.fetchStart
        };

        J.each(timing, function(i, v){
            u.push('&'+i+'='+v);
        });

        return url + u.join('');
    }

    function speed(){
        if(!(tim && tim.navigationStart)){
            showInfo('Navigation Timing API is not supported by your browser.');
            return
        }

    }

    logger.speed = function(){


        function speedSend(){

        }

    }

    J.add('logger', {
        site: site,
        loggerUrl:u,
        isDev:isDev,
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
