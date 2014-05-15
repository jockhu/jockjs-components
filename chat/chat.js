/**
 * Anjuke Javascript Framework.
 * Copyright 2014 ANJUKE Inc. All rights reserved.
 *
 * @path: chat/caht.js
 * @author: Jock
 * @version: 1.0.0
 * @date: 2014/05/07
 *
 */


J.add('chat', {
    version:'1.0.0',
    chatDomain:'//shanghai.app-chat-web.jockhu.dev.anjuke.com/',
    cookie:{
        name:'chat_conf', //轮询的cookie名字
        domain:'anjuke.com'
    },
    windowName:'wchat',
    windowSize:{
        //会话窗口尺寸
        dialog:{
            width:800,
            height:500,
            left:200,
            top:200
        },
        //经纪人列表窗口尺寸
        list:{
            width:200,
            height:500,
            left:200,
            top:200
        }
    },
    windowAttrs:'status=no,resizable=no,' +
        'scrollbars=no,toolbar=no,titlebar=no,' +
        'location=no,directories=no,menubar=no,' +
        'copyhistory=no,menubar=no',
    windowOpener:null,
    container:{
        brlist:''
    }
});