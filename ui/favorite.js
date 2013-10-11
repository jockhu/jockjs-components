

/**
 * Aifang Javascript Framework.
 * Copyright 2012 ANJUKE Inc. All rights reserved.
 *
 * @path: ui/searchpage.js
 * @author: hanhuizhang
 * @changed by :mingzhewang
 * @version: 1.0.0
 * @date: 2013/10/09
 *
 */

/// require('ui.ui');

(function(J){
    function favorite(options){
        var defaultOptions = {
                target:null,
                onShow:null,
                onHide:null
        },
        UA_STASH = {
            AndroidUC9:{
                title:'添加安居客到桌面',
                content:'发送至桌面',
                class:'uc_android'
            },
            iPhoneUC9:{
                title:'收藏安居客',
                content:'添加到首页导航',
                class:'uc_ios'
            },
            QQBrowser:{
                title:'收藏安居客',
                content:'添加书签',
                class:'qqbrowser'
            },
            iPhone_6:{
                title:'添加安居客到桌面',
                content:'添加至主屏幕',
                class:'ios6'
            },
            iPhone_7:{
                title:'添加安居客到桌面',
                content:'添加至主屏幕',
                class:'ios7'
            },
            Android_def:{
                title:'收藏安居客',
                content:'添加书签',
                class:'android_def'
            },
            MIUI:{
                title:'收藏安居客',
                content:'添加书签',
                class:'miui'
            }
        };
        (function(){
            opts = J.mix(defaultOptions, options || {}, true);
            if(getStorage()==0){
                createTip();
            }
        })();
        function createTip(){
            var browser = getUaKey()?UA_STASH[getUaKey()]:false;
            if(browser){
                var tpl = '<div class="fav_tip"><b></b><div><i></i><span>'+browser.title+'</span><span class="sIcon">请点击</span><span>选择“'+browser.content+'”</span><a>×</a><a>我知道了</a></div></div>',
                tip = J.create('div',{
                    class: browser.class
                }).html(tpl).appendTo(opts.target||'body');
                setStorage();
                bindEvents(tip);
            }
        }
        function getStorage(){
            if(localStorage){
                return localStorage.tip?1:0;
            }
            else{
                return J.getCookie('tip');
            }
        }
        function setStorage(){
            if(localStorage){
                try{localStorage.tip=1;}catch(e){};
            }
            else{
                J.setCookie("tip", '1', 365);
                J.setCookie();
            }
        }
        //get the browser
        function getUaKey(){
            var ua = navigator.userAgent;
            /*for weixin brower*/
            if(ua.match(/MicroMessenger/i)){
                return false;
            }
            //UC android/ios
            if(ua.match(/UCBrowser/i)){ //is UC
                return ua.match(/(?:Android)|(?:iPhone)/)+'UC'+ ua.match(/UCBrowser\/(\d)/)[1];    //(Android||iPhone)UC9
            }
            //QQ android/ios
            else if(ua.match(/MQQBrowser/i)){ //is qq
                return 'QQBrowser';
            }
            else if(ua.match(/qq/i)){
                return false; //for qq
            }
            //safari 6.x
            else if(ua.match(/Mozilla\/\d\.\d\s*\((?:iPhone)|(?:iPod).*Mac\s*OS.*\)\s*AppleWebKit\/\d*.*Version\/[456]\d.*Mobile\/\w*\s*Safari\/\d*\.\d*\.*\d*$/i)){
                return 'iPhone_6';
            }
            //safari 7.x
            else if(ua.match(/Mozilla\/\d\.\d\s*\((?:iPhone)|(?:iPod).*Mac\s*OS.*\)\s*AppleWebKit\/\d*.*Version\/7\.\d.*Mobile\/\w*\s*Safari\/\d*\.\d*\.*\d*$/i)){
                return 'iPhone_7';
            }
            
            //MIUI browser
            else if(ua.match(/MI.*\/.*AppleWebKit\/.*Version\/\d(?:\.\d)?\s?Mobile\s*Safari\/\w*\.\w*$/i)||ua.match(/AppleWebKit\/.*Version\/\d(?:\.\d)?\s?Mobile\s*Safari\/\w*\.\w*.*XiaoMi\/miuiBrowser/i)){ //is Mi self
                return 'MIUI';
            }
            //android default
            else if(ua.match(/AppleWebKit\/.*Version\/\d(?:\.\d)?\s?Mobile\s*Safari\/\w*\.\w*$/i)){ //is other android self
                return 'Android_def'
            }
            else if(ua.match(/Mozilla\/.*\(compatible\;Android\;.*\)/)){ //is special UC
                return 'AndroidUC9';
            }
            else{
                return false;//test
            }
        }
        function bindEvents(tip){
            tip.s('a').each(function(i,v){
                v.on('click',function(){
                    tip.hide();
                });
            });
        }
    }
    J.ui.favorite = favorite;
})(J);