/**
 * Anjuke Javascript Framework.
 * Copyright 2014 ANJUKE Inc. All rights reserved.
 *
 * @path: chat/chat.js
 * @author: Jock
 * @version: 1.0.0
 * @date: 2014/05/07
 *
 */

J.add('chat', {
    isDev:/\.dev/.test(J.D.location.host),
    isPg:/\.test/.test(J.D.location.host),
    version:'1.0.0',

    chatDomain:/\.test/.test(J.D.location.host) ? 'http://www.app-chat-web.hotfix-23574-site.anjuke.test': (!/\.dev/.test(J.D.location.host) ? 'http://chat.anjuke.com':'http://www.app-chat-web.'+ (J.D.location.host.match(/^\w+\.(\w+)\./) ? J.D.location.host.match(/^\w+\.(\w+)\./)[1] : "")+'.dev.anjuke.com/'),
//    chatDomain:'http://chat.anjuke.com',
    cookie:{
        name:'chatconf', //轮询的cookie名字
        domain: /\.test/.test(J.D.location.host) ?  'anjuke.test' : 'anjuke.com'
    },
    windowName:'wchat',
    windowSize:{
        //会话窗口尺寸
        dialog:{
            width:985,
            height:600
            /*,
            left:200,
            top:200*/
        },
        //经纪人列表窗口尺寸
        list:{
            width:200,
            height:500,
            offsetLeft:300,
            offsetTop:0

            /*,
            left:200,
            top:200*/
        }
    },
    windowAttrs:'status=no,resizable=no,' +
        'scrollbars=no,toolbar=no,titlebar=no,' +
        'location=no,directories=no,menubar=no,' +
        'copyhistory=no,menubar=no',
    windowOpener:null,
    container:{
        brlist:'',
        brlistNum: '',
        allUnreadMsg: '',
        tabContainer: ''
    },
    phone: '' //18602158988' 18721381560
});
