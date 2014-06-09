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
        s = h.match(/^(\w+)\.(\w+)\./), site = /iPad/.test('iPad') ? 'pad' : s ? s[1] === 'm' ? 'touch' : s[2] === 'fang' ? 'fang' : 'pc' : 'unknown', eC = encodeURIComponent;

    J.add('logger', {
        site: site,
        logUrl:logUrl,
        sojUrl:sojUrl,
        isDev:isDev,
        autoLogger:true,
        onError:null,
        log: log,
        setBackList: setBackList
    });

    var logger = J.logger, BLACKLIST = ['Player','baiduboxapphomepagetag','onTouchMoveInPage'];


    function getBackList(){
        return BLACKLIST;
    }

    /**
     * 添加黑名单
     * @param list Array|String
     * @param rewrite 重写默认的黑名单
     */
    function setBackList(list, rewrite){
        if(J.isString(list)){
            if(rewrite) return (BLACKLIST = [list]);
            BLACKLIST.push(list);
        }else if(J.isArray(list)){
            if(rewrite) return (BLACKLIST = list);
            BLACKLIST = BLACKLIST.concat(list);
        }
    }

    function log(message, customMessage){
        var m = getEx(message, customMessage);

        if(J.each(getBackList(),
            function(i, v){
                if((new RegExp(v,'g')).test(m)) return false;
            }
        ) == false) return;

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
