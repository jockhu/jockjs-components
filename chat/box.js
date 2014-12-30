/**
 * Anjuke Javascript Framework.
 * Copyright 2014 ANJUKE Inc. All rights reserved.
 *
 * @path: chat/box.js
 * @author: 江仑
 * @version: 1.0.0
 * @date: 2014/05/08
 *
 */


/// require('chat.chat');
/// require('chat.tab');
/// require('chat.recomm');

;(function(C){


    /**
     * Box
     * @returns {{show: show, remove: remove}}
     * @constructor
     */
    function Box(brokerObject){
        var opts,
            Tab,
            Recommend,
            FInfo,
            chatList,
            chatBox,
            txtSend,
            BrokerInfo,
            maxMsgId,//最大消息的id
            minMsgId,
            container,
            unReadMsg = 0, //tab对应的未读消息数
            brokerEle; //对应联系人broker的dom元素，用于只更新未读消息数

        /**
         * 初始化
         */
        (function(){
            opts = brokerObject.getOpts();
            container = createElement();
            opts.container = container;
            Tab = new C.Tab(brokerObject);
            //opts brokerId 经纪人id propId 房源id container 容器
            Recommend = new C.recomm();
            changeRecBrName(container, opts.name);
            //拿推荐数据
            opts.container =container.s('.othslist').eq(0);
            var optsRecommend = J.mix({},opts);
            Recommend.getRecomm(optsRecommend);

            //拿经济人消息
            opts.container =container.s('.binfo').eq(0)
            var optsProp = J.mix({},opts);
            C.finfo.getBrokerInfo(optsProp);

            //请求６条记录
            C.pdata.getChatDetail(opts.id,0,0,6,function(data){
                if(data.status == 'OK'){
                    J.each(data.result,function(k,v){
                        shiftMessage(v);
                    })
                    //滚动条滚动至最下方
                    chatBox = container.s(".chatbox").eq(0);
                    chatBox && (chatBox.get().scrollTop =1000000);
                }
            })

            eventBind();
        })();


        /*
         * xxx的其他相似房源中名字的更改
         * @param container 整个box的
         */
        function changeRecBrName(container, name) {
            container.s('.recbrname').eq(0).html(name);
        }



        function createElement(isFromList){
            var dom = J.create('div',{
                'class':'tab_con cf'
            })
            var html= J.g("tpl_chat_box").html();
            dom.html(html);
            J.g("box_container").append(dom)

            var tabHtml = opts.houseId?'' +
                '<div class="tabs cf">'+
                    '<a href="javascript:void(0);" class="now">当前咨询房源</a><a href="javascript:void(0);" class="br0">当前咨询经纪人</a>'+
                '</div>':
                '<h5>当前咨询经纪人</h5>';
            dom.s(".infos").eq(0).first(true).html(tabHtml);
            return dom;
        }


        /**
         * 绑定事件
         */
        function eventBind(){
            chatList = container.s(".chatlist").eq(0);
            var btnSend =  container.s(".btn_sub").eq(0);
            var inputTxt = container.s('.input_txt').eq(0);
            chatBox = container.s(".chatbox").eq(0);
            txtSend = container.s(".tarea").eq(0).s('textarea').eq(0);
            var mask = J.s(".p_msk").eq(0);
            var mapPanel = J.g('map_panel');
            var imgPanel = J.g('img_panel');

            var scrollTopElm = chatBox.first(true);
            var scrollIsReturn = false;


            //聊天信息点击事件
            chatList.on('click',function(e){
                var e = e || window.event;
                var target = e.target || e.srcElement;
                while(target !== chatList.get()){
                    if(target.className.indexOf('event_map_click')>-1){
                        var center = target.getAttribute('data-center');
                        var text = target.getAttribute('data-content');
                        text = cutWords(text, 21);
                        mapPanel.s('img').eq(0).attr('src','http://api.map.baidu.com/staticimage?center='+center+'&width=600&height=500&zoom=17');
                        var msktxtEle = mapPanel.s('.msktxt').eq(0);
                        msktxtEle.html(text);
                        msktxtEle.hide();//先hide再show，是为了显示的位置不闪烁
                        mask.show();
                        mapPanel.show();
                        msktxtEle.show();
                        return true;
                        //map click
                    }
                    if(target.className.indexOf('event_image_click')>-1){
                        //image click
                        var src = target.getAttribute('data-src');
                        var wh =src.match(/(\d+)x(\d+).jpg$/);
                        var w = wh[1];
                        var h = wh[2];
                        var ret = autoToPic(w,h)
                        src =src.replace(/(\d+)x(\d+)/,parseInt(ret.width)+'x'+parseInt(ret.height));
                        var imgDom = imgPanel.s('img').eq(0);
                        imgDom.attr('src',src);
                        /**
                         * 等比例
                         */
                        mask.show();
                        imgPanel.show();
                        return true;
                    }
                    target = target.parentNode;
                }
                // e.stop()

            })


            //地图弹出框关闭
            mapPanel.s('.btn_close').eq(0).on('click',function(){
                mapPanel.hide();
                mask.hide();
            })
            //ie6样式错乱--地图大图下方的文字描述位置
            mapPanel.s('.btn_close').eq(0).on('mouseenter', function() {
                //ie6
                (J.ua.ua.indexOf('MSIE 6') > -1) && (mapPanel.s('.ct').eq(0).setStyle('left', '-50%'));
            });

            //大图弹出框关闭

            imgPanel.s('.btn_close').eq(0).on('click',function(){
                imgPanel.hide();
                mask.hide();
            })



            //发送消息事件
            btnSend.on('click',sendCallback);
            //enter键发送消息
            inputTxt.on('keydown', function(e) { 
                if (e.keyCode == 13) {
                    sendCallback();
                    e.stop();
                    // e.stop 内已经处理 Jock
                    //e.preventDefault ? e.preventDefault() : e.returnValue = false;
                }

            });

            inputTxt.on('focus', function(e) {
               inputTxt.up(0).addClass('focus');
            });

            inputTxt.on('blur', function(e) {
                inputTxt.up(0).removeClass('focus');
            });


            function sendCallback() {
                var txt;  
                txt=trim(txtSend.val());  
                function trim(str) {
                    return str.replace(/(^\s*)|(\s*$)/g, '');
                } 
                if(!txt){
                    txtSend.val('');//可能有空格
                    return false;
                }
                sendMessage(1,txtSend.val());
                txtSend.val('');
                calcTextLength();
            }

            //每次输入总数时时减少
            if(!+[1,]){
                txtSend.get().onpropertychange =calcTextLength;
            }else{
                txtSend.get().oninput = calcTextLength;
            }

            chatBox.on('scroll',function(){
                //滚动到顶部显示更多消息,向上查看，最小消息id应该为空
                if(!scrollIsReturn&&!chatBox.get().scrollTop){
                    scrollIsReturn = true;
                    J.chat.pdata.getChatDetail(opts.id, 0, minMsgId-1, 20,function(data){ //max_msg_id:闭区间
                        scrollIsReturn = false;
                        var h = scrollTopElm.height();
                        if(data.status == 'OK'){
                            J.each(data.result,function(k,v){
                                shiftMessage(v);
                            })
                        }
                        var tH = scrollTopElm.height()-h;
                        chatBox.get().scrollTop =tH;


                    });
                }
            });

            if(opts.houseId){
                opts.container=container.s('.finfo').eq(0);
                var optsBinfo = J.mix({},opts)
                C.finfo.getPropertyInfo(optsBinfo);


                var FB = container.s(".tabs").eq(0).s("a");
                var FB_Block = container.s(".tabcon");

                var aF = FB.eq(0);
                var aB = FB.eq(1);

                var FBlock = FB_Block.eq(0);
                var BBlock = FB_Block.eq(1);
                FBlock.show();
                aF.on('click',function(){
                    aF.addClass('now');
                    aB.removeClass('now');
                    FBlock.show();
                    BBlock.hide();
                });

                aB.on('click',function(){
                    aB.addClass('now');
                    aF.removeClass('now');
                    BBlock.show();
                    FBlock.hide();
                });
            }else{
                container.s('.binfo').eq(0).show();
            }
        }

        /*
        * 截字
        * @txt 需要截断的字
        * @legnth 截字的长度(例如21,超过21个字符 20+...)
        *
        */
        function cutWords(txt, length) {
            if (txt && txt.length <= length) return txt;
            var objectTxt = new String(txt);
            return (objectTxt.slice(0, length - 1) + '...');
        }

        /**
         * 生成图片宽高
         *
         */
        function autoToPic(w,h){
            w = parseInt(w)
            h = parseInt(h)
            var aw,ah;
            var maxW = 600;
            var maxH = 500;

            //长宽都大于规定尺寸　
            if(w>maxW&&h > maxH){
                if(w>h){
                    ah = maxW*h/w
                    aw = maxW;
                }
                if(w<h){
                    aw = maxH*w/h;
                    ah = maxH;
                }

            }else if(w>maxW){
                aw = maxW
                ah = maxW* h/w;
            }else if(h>maxH){
                ah = maxH;
                aw = maxH* w/h;
            }else{
                aw = w;
                ah =h;
            }
            return{
                width:aw,
                height:ah
            }

        }



        /**
         * 计算input框的字数
         */
        function calcTextLength(){
            var labTip = container.s(".inputTip").eq(0);
            var len = 500;
            var leaveChatCount = len-txtSend.val().length;
            if(leaveChatCount<=0){
                leaveChatCount=0;
                txtSend.val(txtSend.val().substr(0,len));
            }
            labTip.html(labTip.html().replace(/\d+/g,leaveChatCount))
        }



        /**
         * 发送消息
         * @param content 消息内容
         * @param messageBox 消息盒子，可为空
         */
        function sendMessage(type, content){
            var houseId = opts.houseId;

            sendMessage = function(type,content){
                var messageBox;
                var msg;
                msg = {
                    msg_type:type,
                    body:content,
                    from_uid: C.uid,
                    to_uid:opts.id,
                    created:J.getTime()/1000//保证跟服务器时间统一
                };

                messageBox = pushMessage(msg);
                C.pdata.sendMsgToBroker(msg, opts.id, function (ret) {
                    //发送失败处理逻辑
                    if (!ret || ret.retcode ) {
                        sendError(msg.body,messageBox);
                        return false;
                    }
                    if(!ret.retcode){
                        !maxMsgId&&(maxMsgId = ret.retdata.result.msg_id);
                        //brlist 里面没有数据的情况下，发送消息添加联系人
                        if(type != 3 && !C.brlist.BROKERSCACHE[opts.id]){
                            opts.created = msg.created;
                            J.fire(document,'chat:newBroker',opts);
                        }
                    }
                });
                //如果是房源卡面，要转换为ｊｓｏｎ
            }
            //首次发送需要发送房源卡片
            houseId? (function(){
                J.chat.pdata.getHouseCard(houseId, opts.cityId, function(data){
                    if(!data.retcode){
                        //返回正确的房源卡片
                        sendMessage(3,data.retdata);
                        sendMessage(1,content);
                    }
                });
            })():sendMessage(type,content);
            J.site.trackEvent('chat_user_count')
        }


        /**
         * 消息发送非法（超时，断网，意外中断）
         * @param content 消息内容
         * @param messageBox 消息盒子，可为空
         */
        function sendError(content, messageBox){
            var aWrong = document.createElement('a');
            aWrong.href = 'javascript:void(0)';
            aWrong.className = 'btn_re';
            aWrong.title = '点击重发';
            messageBox.append(aWrong)
            aWrong.onclick = function(){
                var ret = window.confirm('是否重新发送？');
                ret && C.pdata.sendMsgToBroker({
                    body: content,
                    msg_type: 1
                },opts.id,function(data){
                    if (data&&!data.retcode) {
                        aWrong.parentNode.removeChild(aWrong);
                        aWrong.onclick = null;
                        maxMsgId = data.retdata.result.msg_id;
                    }
                });
            }
        }

        /**
         * 发送新消息
         * @param type 消息类型
         * @param content 消息内容
         * @param isSend 是发送还是接收
         * @returns {HTMLObject}
         */
        function pushMessage(msg){
            var msg = J.mix({},msg);
            var messageBox,fn,timerDom;
            fn = msg.from_uid == C.uid ? J.chat.template.getSendMessageTpl: J.chat.template.getShiftMessageTpl;
            if (msg.msg_type!=1 && msg.msg_type!=2 && msg.msg_type!=106&&msg.msg_type!=107) {
                try {
                    msg.body = eval('('+ msg.body+')')
                } catch(e) {
                    msg.body = '';
                }
            }
            messageBox = fn(msg.msg_type,msg.body, opts.icon.replace(/\.[a-z]+$/,function(str){return 'c'+str}));//加ｃ
            //经纪人发给用户的图片，改成600*500
            (msg.msg_type == 2 && msg.to_uid == C.uid) ? msg.body = msg.body.replace(/(\d+)x(\d+)/, '599x499') : null;
            messageBox = fn(msg.msg_type,msg.body, opts.icon);
            chatList.append(messageBox);
            timerDom = timerTasker(msg.created);
            timerDom&&chatList.append(timerDom);
            chatBox.get().scrollTop =1000000;
            maxMsgId = msg.msg_id;
            return messageBox
        }

        /**
         * 查看历史消息
         * @param
         * @returns {HTMLObject}
         */
        function shiftMessage(msg){
            var messageBox,fn,timerDom;
            fn = msg.from_uid == C.uid ? J.chat.template.getSendMessageTpl: J.chat.template.getShiftMessageTpl;
            if (msg.msg_type!=1 && msg.msg_type!=2 && msg.msg_type!=106&&msg.msg_type!=107) {
                try {
                    msg.body = eval('('+ msg.body+')')
                } catch(e) {
                    msg.body = '';
                }
            }
            messageBox = fn(msg.msg_type,msg.body, opts.icon.replace(/\.[a-z]+$/,function(str){return 'c'+str}));//加ｃ
            //经纪人发给用户的图片，改成600*500
            (msg.msg_type == 2 && msg.from_uid != C.uid) ? msg.body = msg.body.replace(/(\d+)x(\d+)/, '599x499') : null;
            messageBox = fn(msg.msg_type,msg.body, opts.icon);
            var dom = chatList.first(true);
            timerDom = timerTasker(parseInt(msg.created));
            dom ? dom.insertBefore(messageBox):chatList.append(messageBox);
            timerDom&&messageBox.insertBefore(timerDom);
            minMsgId = msg.msg_id;
            !maxMsgId&&(maxMsgId=msg.msg_id);
            return messageBox
        }
        /**
         * 显示消息（消息，提醒，时间...）
         * @param content 信息内容
         * @param showType 0:新消息，1:历史消息（取决显示的位置）
         */
        function showMessage(content, showType){
            //新消息
            var messageBox;
            if(!showType){

                return messageBox;
            }
            //历史消息
            return messageBox;
        }

        /**
         * 时间任务处理
         */
        function timerTasker(t){
            var beginTime = parseInt(t);
            timerTasker = function(t){
                var curTime = parseInt(t);
                if(Math.abs(curTime -beginTime) >= 600){
                    beginTime = curTime;
                    return C.template.getTimeTpl(curTime*1000);
                }
            }
        }

        /**
         * 显示或激活和经纪人的聊天会话box
         * @param brokerObject
         */
        function show(brObject){
            if (!brObject) brObject = brokerObject;
            Tab.show();
            container.show();
            //根据未读消息数请求聊天记录，且联系人列表未读消息数更新
            (unReadMsg > 0) ? updateMessage(unReadMsg) : null;
            C.brlist.showAllUnreadMsgCount(C.brlist.getUnreadMsgCount() - unReadMsg);
            C.brlist.updateOnlyMsgCount(brObject);
        }

        /**
         * 隐藏和经纪人的对话box
         * @param brokerObject
         */
        function hide(){
            Tab.hide();
            container.hide();
        }

        /**
         * 移除和经纪人的对话box
         * @param brokerObject
         */
        function remove(){
            Tab.remove();
            container.remove();

        }

        function updateUnreadMsg(new_msg_count) {
            unReadMsg = new_msg_count;
            Tab.update(new_msg_count);
        }



        function getBrokerObject(){
            return brokerObject;
        }

        function updateMessage(msgCount){
            if (msgCount <= 0 ) return;
            J.chat.pdata.getChatDetail(opts.id, maxMsgId, 0, 500, function(data){ //可能有系统消息
                if(data.status == 'OK'){ 
                    //与返回的数据顺序相反
                    for (var i = (data.result.length -1); i >= 0; i--) {
                        pushMessage(data.result[i]);
                    }
                }
            })
        }


        return {
            show:show,
            hide:hide,
            updateUnreadMsg: updateUnreadMsg,
            remove:remove,
            shiftMessage:shiftMessage,
            updateMessage:updateMessage,
            id:opts.id,
            showCloseButton:Tab.showCloseButton,
            hideCloseButton:Tab.hideCloseButton,
            getBrokerObject:getBrokerObject
        }
    }
    C.Box = Box;
   /* var brokerObject = new J.chat.Broker({
        icon: '',
        name: '万钟宁',
        id: '123456',
        houseId:'123456789',
        count: 0,
        lasttime:'',
        html: ''
    });
    new C.Box(brokerObject);*/

})(J.chat);

