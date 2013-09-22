/**
 * Aifang Javascript Framework.
 * Copyright 2012 ANJUKE Inc. All rights reserved.
 *
 * @path: ui/searchpage.js
 * @author: hanhuizhang
 * @version: 1.0.0
 * @date: 2013/08/22
 *
 */

/// require('ui.ui');

(function(J){

function Tip_favorit(options){
    var defaultOptions = {
            target:null,
            onShow:null,
            onHide:null
        },
        tpl_UC="<b style='border-bottom: 8px solid #fff;position: absolute;border-left: 7px solid transparent;border-right: 7px solid transparent;top:-7px;left:10px;'></b><div style='position: absolute; box-sizing: border-box; height:58px; width: 58px; border-radius: 15px;border-left: 1px solid #e3e3e3;border-top: 1px solid #eaeaea;-webkit-box-shadow: 3px 2px 2px #bfbfc0;background-image: -webkit-gradient(linear,left top,left bottom, color-stop(0,#fff),color-stop(1,#eaeaea))'><i class='logo' style='width:50px;margin: 14px 3px;'></i></div><div style='margin-left: 68px;color: #5f5f5f'><div style='padding-bottom: 8px; font-size: 13px; font-weight: 600;color: #333'>添加手机安居客到桌面</div><div style='font-size: 10px; margin-bottom: 3px'>请点击 <img src='/assets/touch/img/uc.png' width='15px' /></div><div id='tip_s' style='font-size: 10px'>选择&quot;发送至桌面&quot;</div><input id='tip_close' style='border: none;width: 9px;padding:0; margin:-5px 0 0 ;cursor: pointer;font-weight: 600;font-size: 9px;float: right;background: transparent; color: #666;' readonly value='X' /></div>",
        tpl_QQ=tpl_UC.replace('uc.png','qq.png').replace('发送至桌面','发到手机桌面'),
        tpl_Others_self=tpl_UC.replace('添加手机安居客到桌面','收藏手机安居客').replace('uc.png','def.png').replace(/<div\sid='tip_s'.*&quot;发送至桌面&quot;<\/div>/,'').replace('top:-7px;left:10px;','top:-7px;right:10px;'),
        tpl_Mi_self=tpl_UC.replace('添加手机安居客到桌面','收藏手机安居客').replace('uc.png','qq.png').replace(/<div\sid='tip_s'.*&quot;发送至桌面&quot;<\/div>/,''),
        tpl_i_self = "<b style='border-top: 8px solid #e6e6e6;position: absolute;border-left: 7px solid transparent;border-right: 7px solid transparent;bottom: -7px;left: 50%;margin-left: -4px;'></b><div style='position: absolute; box-sizing: border-box; height:58px; width: 58px; border-radius: 15px;border-left: 1px solid #e3e3e3;border-top: 1px solid #eaeaea;-webkit-box-shadow: 3px 2px 2px #bfbfc0;background-image: -webkit-gradient(linear,left top,left bottom, color-stop(0,#fff),color-stop(1,#eaeaea))'><i class='logo' style='width:50px;margin: 14px 3px;'></i></div><div style='margin-left: 68px;color: #5f5f5f'><input id='tip_close' style='border: 1px solid #666;width: 9px;padding: 0 2px;margin: -5px 0 0;cursor: pointer;font-weight: 600;font-size: 9px;float: right;background: transparent;color: #666;line-height: 9px;border-radius: 8px;' readonly value='X' /><div style='padding-bottom: 8px; font-size: 13px; font-weight: 600;color: #333;min-width: 150px'>添加手机安居客到桌面</div><div style='font-size: 10px; margin-bottom: 3px'>请点击 <img src='/assets/touch/img/i_def.png' width='15px' /></div><div id='tip_s' style='font-size: 10px'>选择&quot;添加至主屏幕&quot;</div></div>",
        pos=[8,false,false,7],//默认位置 上右下左
        pos_self=[8,7,false,false],// android self position
        pos_i_self=[false,false,10,40],
        opts, tipBox,masker,tip_close,tip_arrow,
        UA_STASH = {
            AndroidUC9:{
                tpl:tpl_UC,
                p:pos
            },
            iPhoneUC9:{
                tpl:tpl_UC,
                p:pos
            },
            self_iPhone:{
                tpl:tpl_i_self,
                p:pos_i_self
            },
            AndroidQQ4:{
                tpl:tpl_QQ,
                p:pos
            },
            iPhoneQQ4:{
                tpl:tpl_QQ,
                p:pos
            },
            self_Others:{
                tpl:tpl_Others_self,
                p:pos_self
            },
            self_MI:{
                tpl:tpl_Mi_self,
                p:pos
            }
        }
        ;
    (function(){
        opts = J.mix(defaultOptions, options || {}, true);
        if(valid()==0){ //没有storage或者cookie
            createTip(getTemplate());
        }
    })();
    function createTip (template){
        if(template){
            var posi='';
            template.p[0]?posi+='top:'+template.p[0]+'px;':posi;
            template.p[1]?posi+='right:'+template.p[1]+'px;':posi;
            template.p[2]?posi+='bottom:'+template.p[2]+'px;':posi;
            template.p[3]?posi+='left:'+template.p[3]+'px;':posi;
            J.create('div',{'id':'tipBox','style':posi+'position: fixed;z-index: 1001;padding: 10px 8px 6px 12px ; border-radius: 6px; min-height:60px;background-image: -webkit-gradient(linear,left top,left bottom, color-stop(0,#fff),color-stop(1,#e5e6e7))'}).html(template.tpl).appendTo(opts.target||'body');
            setStorage();
            createMasker();
            tipBox= J.g('tipBox');
            bindEvents();
        }
    }
    function valid(){
        return getStorage();
    }
    function getStorage(){
        if(localStorage){
            return localStorage.tip?1:0;
        }
        else{
            return J.getCookie('tip');
        }
        // cookie
    }
    function setStorage(){
        if(localStorage){
            try{localStorage.tip=1;}catch(e){};
        }
        else{
            J.setCookie("tip", '1', 365);
            J.setCookie();
        }
        // cookie
    }
    function getTemplate(){
        return getUaKey()?UA_STASH[getUaKey()]:false;
    }
    function getUaKey(){
        var ua = J.ua.ua;
        /*for weixin brower*/
        if(ua.match(/MicroMessenger/i)){
            return false;
        }
        if(ua.match(/UCBrowser/i)){ //is UC
            return ua.match(/(?:Android)|(?:iPhone)/)+'UC'+ ua.match(/UCBrowser\/(\d)/)[1];
        }
        else if(ua.match(/MQQBrowser/i)){ //is qq
            return ua.match(/(?:Android)|(?:iPhone)/)+'QQ'+ ua.match(/MQQBrowser\/(\d)/)[1];
        }
        else if(ua.match(/qq/i)){
            return false; //for qq  
        }
        else if(ua.match(/Mozilla\/\d\.\d\s*\((?:iPhone)|(?:iPod).*Mac\s*OS.*\)\s*AppleWebKit\/\d*.*Version\/\d.*Mobile\/\w*\s*Safari\/\d*\.\d*\.*\d*$/i)){//is iphone safari
            return 'self_iPhone';
        }
        else if(ua.match(/MI.*\/.*AppleWebKit\/.*Version\/\d(?:\.\d)?\s?Mobile\s*Safari\/\w*\.\w*$/i)||ua.match(/AppleWebKit\/.*Version\/\d(?:\.\d)?\s?Mobile\s*Safari\/\w*\.\w*.*XiaoMi\/miuiBrowser/i)){ //is Mi self
            return 'self_MI';
        }
        else if(ua.match(/AppleWebKit\/.*Version\/\d(?:\.\d)?\s?Mobile\s*Safari\/\w*\.\w*$/i)){ //is other android self
            return 'self_Others'
        }
        else if(ua.match(/Mozilla\/.*\(compatible\;Android\;.*\)/)){ //is special UC
            return 'AndroidUC9';
        }
        else{
            return false;//test
        }
    }
    function bindEvents(){
        masker.on('click',function(){
            tipHide();
        });
        J.g('tip_close')&&J.g('tip_close').on('click',function(){
            tipHide();
        });
    }
    function tipHide(){
        tipBox&&tipBox.hide();
        masker.hide();
        opts.onHide && opts.onHide();
    }
    function createMasker(){
        masker = J.create('div',{'style':'height:150%; width:100%;position:fixed;background-color:#999;z-index:1000;opacity:0.5;top:0;left:0'});
        masker.appendTo('body');
        return masker;
    }
}
    J.ui.tipfavorit = Tip_favorit;
})(J);