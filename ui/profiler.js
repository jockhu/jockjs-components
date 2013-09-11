/**
 * Aifang Javascript Framework.
 * Copyright 2012 ANJUKE Inc. All rights reserved.
 *
 * @path: ui/profiler.js
 * @author: Jock
 * @version: 1.0.0
 * @date: 2013/09/08
 *
 */

/// require('ui.ui');
/// require('page.page');

(function(J){
    var win = J.W, per = win.performance || {}, tim = per.timing, ns = '__J',pageWidth, box,container, header, close;


    function Profiler(){
        function start(){

            if(!(tim && tim.navigationStart)){
                showInfo('Navigation Timing API is not supported by your browser.');
                return
            }

            container.show();
            /*var a = +new Date();
            var tim = {
                navigationStart:a,
                redirectStart:a,
                redirectEnd:a+20,
                fetchStart:a+20,
                domainLookupStart:a+40,
                domainLookupEnd:a+60,
                connectStart:a+100,
                connectEnd:a+120,
                requestStart:a+140,
                requestEnd:a+160,
                responseStart:a+180,
                responseEnd:a+200,
                domLoading:a+220,
                domInteractive:a+240,
                domContentLoadedEventStart:a+260,
                loadEventStart:a+280,
                };*/
            var navigationStart = tim.navigationStart, timing = {
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
            },
                networkTim = tim.connectEnd - navigationStart,
                serverTim = tim.responseEnd - navigationStart,
                browserTim = tim.loadEventStart - navigationStart,
                domainOffset = tim.redirectStart > 0 ? tim.domainLookupStart - tim.redirectStart : 0,
                connectOffset = tim.connectStart - tim.domainLookupStart,
                responseOffset = tim.responseStart - tim.requestStart,
                allTim = networkTim  + browserTim + domainOffset + connectOffset + responseOffset,
                timingType,
                timingStart,
                timingLen,
                timingOffset;

            if(timing.windowLoadedTime <= 0){
                win.addEventListener('load', start);
                return;
            }

            box.html('');

            box.append(header = J.create('div',{style:'height:40px;line-height:40px;padding-left:10px; border-bottom:1px solid #ad9825; margin-bottom:20px; background:#fef0a5;'}).html(' Anjuke JockJs Timing &nbsp; / <span style="color:'+getColor('network').t+'">network</span> / <span style="color:'+getColor('server').t+'">server</span> / <span style="color:'+getColor('browser').t+'">browser</span> / <span style="margin-left:50px">Site : ' + document.location.host + '</span>'));
            header.append(close = J.create('a',{style:"position: absolute; top:3px; right:15px; font-size:12px; color:#999;cursor:pointer;"}).html('Close X'));
            header.get().onclick = function(){
                container.hide();
            };

            J.each(timing, function(i, v){
                switch (i){
                    case 'redirectTime':
                        timingType = 'network';
                        timingStart = 0;
                        timingLen = networkTim;
                        timingOffset = 0;
                        break;
                    case 'domainLookupTime':
                        timingType = 'network';
                        timingStart = 0;
                        timingLen = networkTim;
                        timingOffset = domainOffset;
                        break;
                    case 'connectTime':
                        timingType = 'network';
                        timingStart = 0;
                        timingLen = networkTim;
                        timingOffset = connectOffset;
                        break;
                    case 'requestTime':
                        timingType = 'server';
                        timingStart = networkTim;
                        timingLen = serverTim;
                        timingOffset = 0;
                        break;
                    case 'responseTime':
                        timingType = 'server';
                        timingStart = networkTim;
                        timingLen = serverTim;
                        timingOffset = responseOffset;
                        break;
                    case 'domParsingTime':
                    case 'firstScreenTime':
                    case 'resourcesLoadedTime':
                    case 'domContentLoadedTime':
                    case 'windowLoadedTime':
                        timingType = 'browser';
                        timingStart = tim.redirectEnd ? tim.redirectEnd - navigationStart : 0;
                        timingLen = browserTim;
                        timingOffset = 0;
                        break;
                }



                //console.log('timingType:'+timingType, 'timingStart:'+timingStart, 'timingLen:'+timingLen, 'v:'+v, 'timingOffset:'+timingOffset, 'allTim:'+allTim)
                var color = getColor(timingType);

                box.append(J.create('div', {style:'background:'+color.b+'; position:relative; overflow:hidden; margin:8px 4px 8px; '}).html(buildItem(i, v, timingStart, timingLen, timingOffset, allTim, color)));
            })
        }

        function buildItem(i, v, timingStart, timingLen, timingOffset, allTim, color){
            var p = pageWidth - 300, t = (p / allTim), tm = (v * t) + 1;
            v = (v < 1000) ? v + 'ms' : (v / 1000) + 's'
            timingStart = timingStart * t + 1;
            timingOffset = timingOffset * t + 1;
            timingLen = timingLen * t + 2;
            return '<div style="background:'+color.s+';height:20px;padding-left:300px;width:'+timingLen+'px;margin-left:'+timingStart+'px"><div style="background:'+color.t+';margin-left:'+timingOffset+'px; width:'+tm+'px;height:20px;"></div></div><div style="position:absolute;top:0;left:0;height:28px;width:290px;padding:0 5px;background:#fffdf2;color:'+color.t+'">'+i+' : <strong>'+v+'</strong></div>'
        }

        function getColor(type){
            var colors;
            switch (type) {
                case 'network':
                    colors = {
                        b:'#fef5ea',
                        s:'#fbc9b5',
                        t:'#e0543f'
                    }
                    break;
                case 'server':
                    colors = {
                        b:'#fbf7f3',
                        s:'#ffedb8',
                        t:'#ffba00'
                    }
                    break;
                case 'browser':
                    colors = {
                        b:'#f9fdf5',
                        s:'#c6e9e0',
                        t:'#10adab'
                    }
                    break;
            }
            return colors || {};
        }

        function showInfo(str){
            box && box.html('<div style="padding:10px 0;font-size:13px;line-height:23px;text-align: center">'+str+'</div>');
        }

        function resize(){
            pageWidth = J.page.width() - 2;
            pageWidth = pageWidth < 500 ? 500 : pageWidth;
            box && box.setStyle({width:pageWidth+'px'});
        }

        (function(){

            container = J.create('div', {style:'position:fixed;top:0;left:0;z-index:99999;font-size:13px;'})
                .append(box = J.create('div',{style:'text-align:left;font-size:13px;font-family:Arial;position:relative;border:1px solid #f8d4c7;background:#fffdf2;box-shadow:0px 4px 20px #555;'}));
            container.appendTo('body');
            resize();

            showInfo( tim ? 'Running...' : 'Navigation Timing API is not supported by your browser' );

            win.addEventListener('resize', function(){
                resize();
                start();
            });
        })();

        return {
            start:start
        }

    }
    win[ns] = win[ns] || new Profiler();

})(J);

