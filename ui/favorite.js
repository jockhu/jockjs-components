

/**
 * Aifang Javascript Framework.
 * Copyright 2012 ANJUKE Inc. All rights reserved.
 *
 * @path: ui/favorite.js
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
                onHide:null,
                onClose:null
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
            },
            Baidu:{
                title:'收藏安居客',
                content:'添加书签',
                class:'baidubox'
            },
            BaiduSearch:{
                title:'收藏安居客',
                content:'添加书签',
                class:'baiduSearch'
            }
        };
        (function(){
            opts = J.mix(defaultOptions, options || {}, true);
            if(getStorage()==0){
                createTip();
                // alert(navigator.userAgent);
            }
        })();
        function createTip(){
            var browser = getUaKey()?UA_STASH[getUaKey()]:false;
            if(browser){
                var tpl = '<div class="fav_tip"><b></b><div><i></i><span>'+browser.title+'</span><span class="sIcon">请点击</span><span>选择“'+browser.content+'”</span><em>我知道了</em><em>×</em></div></div>',
                tip = J.create('div',{
                    class: browser.class
                }).html(tpl).appendTo(opts.target||'body');
                setStorage((new Date()).valueOf(),false);
                bindEvents(tip);
            }
        }
        function getStorage(){
            var v, timestamp = parseInt((new Date()).valueOf());
            if(localStorage) v = localStorage.tip ? localStorage.tip : 0;
            else v = J.getCookie('tip') ? J.getCookie('tip') : 0;
            timestamp = timestamp - parseInt(v);
            if(timestamp<86400000) return 1;
            else return 0;

        }
        function setStorage(v,f){
            if(f){
                v = parseInt(v) + 2592000000;
            }
            if(localStorage){
                try{localStorage.tip = v;}catch(e){};
            }
            else{
                J.setCookie("tip", v, 365);
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
                return ua.match(/(?:Android)|(?:iPhone)/)+'UC'+ ua.match(/UCBrowser\/(\d)/)[1];
            }
            else if(ua.match(/10A523/i)){ //is UC8.9
                return 'iPhoneUC9';
            }
            //QQ android/ios
            else if(ua.match(/MQQBrowser/i)){
                return 'QQBrowser';
            }
            else if(ua.match(/qq/i)){
                return false; //for qq
            }
            //baidu
            else if(ua.match(/[(?:Android)|(?:iPhone)].*baidubox/i)){
                var reg = /anjuke/;
                if(!document.referrer) return 'Baidu';
                else return 'BaiduSearch';
            }
            //safari 6.x
            else if(ua.match(/Mac.*OS.*Version\/[456].*Mobile/i)){
                return 'iPhone_6';
            }
            //safari 7.x
            else if(ua.match(/Mac.*OS.*Version\/7.*Mobile/i)){
                return 'iPhone_7';
            }
            //MIUI browser
            else if(ua.match(/MI.*Version\/4/i)||ua.match(/Version\/4.*XiaoMi\/MiuiBrowser/i)){
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
            tip.s('em').each(function(i,v){
                v.on('click',function(){
                    tip.hide();
                    opts.onClose && opts.onClose();
                    if(i==0) setStorage((new Date()).valueOf(),true);

                    //首页app浮动框是否显示
                    var app_down_new = J.g("app_down_new");
                    if (app_down_new) {
                        document.addEventListener("touchmove",function(event){
                            T.trackEvent("track_down_fixed_show");
                            app_down_new.show();
                            var app_down = J.g("app_down");
                            var app_fork = J.g("app_fork");
                            app_down&&app_down.on("click", function(e){
                                T.trackEvent(app_down.attr("data-track"));
                                setTimeout(function(){
                                    location.href = app_down.attr("data-link");
                                }, 200);
                            });
                            app_fork&&app_fork.on("click", function(e){
                                e.stop();
                                app_down_new.setStyle({"display":"none"});
                                var nowDate = new Date();
                                var now = nowDate.getFullYear() + "-" + (nowDate.getMonth()+1) + "-" + nowDate.getDate();
                                J.setCookie("app_download_date", now, "1");
                                T.trackEvent("track_down_fixed_close");
                            });
                        });
                    }
                });
            });
        }
    }
    J.ui.favorite = favorite;
})(J);