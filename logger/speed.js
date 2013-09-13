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
    var logger = J.logger, win = J.W, per = win.performance || {}, tim = per.timing, timing;

    function getSpeed(){
        var tm = J.times, url = '&tp=speed'
        + '&PS='+ tm.PS
        + '&BS='+ tm.BS
        + '&CL='+ tm.CL
        + '&PL='+ tm.PL;
        return url
    }

    function getTiming(){
        var url = '&tp=timing',u=[],navigationStart = tim.navigationStart;
        timing = {
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
        var url, pageName = J.g('body');
        if(pageName && (pageName = pageName.attr('data-page'))){
            console.log(pageName)
            url = logger.url + '?pn=' + pageName + '&in=' + (J.iN || 0)
            + (tim && tim.navigationStart ? getTiming() : getSpeed());
            (new Image()).src = url;
        }
    }

    J.ready(function(){
        if( !(tim && !(tim.loadEventStart - tim.fetchStart <= 0) || false) || !J.times.PL){
            J.on && J.on(win, 'load', speed);
            return;
        }
        speed();
    });

    logger.speed = speed;

})(J);