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
/// require('chat.finfo');
/// require('chat.recomm');
/// require('chat.broker');
/// require('chat.template');
/// require('chat.tab');

;(function(C){


    /**
     * Box
     * @returns {{show: show, remove: remove}}
     * @constructor
     */
    function Box(option){
        var defOpts={
            brokerId:0,
            brokerName:'万钟玲',
            unReadNum:0,//消息未读数
            houseId:216097039//如果房源单过页，首次聊天需要发送房源卡片
            },opts;

        var Tab,
            Recommend,
            FInfo,
            chatList,
            txtSend,
            BrokerInfo,
            container;


        /**
         * 初始化
         */
        (function(){
            opts = J.mix(defOpts,option);
            container = createElement();
            opts.container = container;
            Tab = new C.Tab(opts);


            /*    Recommend = new C.Recomm(opts);
                BrokerInfo = new C.Broker(opts);
                FInfo = new C.Finfo(opts);*/
            eventBind();
        })();



        function createElement(isFromList){
            var dom = J.create('div',{
                'class':'tab_conf_cf'
            })
            var html= J.g("tpl_chat_box").html();
            dom.html(html);
            J.g("box_container").append(dom)
            return dom;
        }


        /**
         * 绑定事件
         */
        function eventBind(){
             chatList = container.s(".chatlist").eq(0);
            var btnSend =  container.s(".btn_sub").eq(0);

            txtSend = container.s(".tarea").eq(0).s('textarea').eq(0);



            //聊天信息点击事件
            chatList.on('click',function(e){
                var e = e || window.event;
                var target = e.target;
                //while(target.className=='map'||target.className=='map')

            })
            //发送消息事件
            btnSend.on('click',function(){
                var txt;
                txt=txtSend.val();
                if(!txt){
                    return false;
                }
                sendMessage(1,txtSend.val());
                txtSend.val('')
            })

            if(!+[1,]){
                txtSend.get().onpropertychange =calcTextLength;
            }else{
                txtSend.get().oninput = calcTextLength;
            }



        }

        /**
         * 计算input框的字数
         */
        function calcTextLength(){
            var labTip = container.s(".inputTip").eq(0);
            var len =2000;
            var leaveChatCount = len-txtSend.val().length;
            if(leaveChatCount<=0){
                leaveChatCount=0;
                txtSend.val(txtSend.val().substr(0,len));
            }

            calcTextLength = function(){
                labTip.html(labTip.html().replace(/\d+/g,leaveChatCount))
            }
            calcTextLength();
        }



        /**
         * 发送消息
         * @param content 消息内容
         * @param messageBox 消息盒子，可为空
         */
        function sendMessage(type,content){
            var houseId = opts.houseId;
            houseId&&(function(){
                J.chat.pdata.getHouseCard(houseId,function(data){
                    data =  {
                        retcode: 0,
                        retmsg: "",
                        retdata: '{"id":202080197,"des":"2\u5ba41\u53851\u536b 100.00\u5e73","img":"http:\/\/include.app-chat-web.haipengchen.dev.anjuke.com\/anjuke\/img\/global\/1\/gallery_img_default.png","name":"\u94fe\u5bb6\u6d4b\u8bd5","price":"305.00\u4e07\u5143","url":"http:\/\/www.anjuke.com\/prop\/view\/202080197?from=card","jsonVersion":1,"tradeType":"1"}'
                     };
                    if(!data.retcode){
                        //返回正确的房源卡片
                        sendMessage(3,data.retdata);
                        sendMessage(1,content);
                    }
                });

            })();
            sendMessage =function(type,content){
                J.chat.pdata.sendMsgToBroker({
                    body:content,
                    type:1
                });
                //如果是房源卡面，要转换为ｊｓｏｎ
                if(type == 3){
                    content = eval('('+content+')');
                }
                pushMessage(type,content,true);
            }
            !houseId&&sendMessage(1,content);
        }

        /**
         * 消息发送正常回掉
         * @param statusCode 状态吗
         */
        function sendSuccess(statusCode){

        }

        /**
         * 消息发送非法（超时，断网，意外中断）
         * @param content 消息内容
         * @param messageBox 消息盒子，可为空
         */
        function sendError(content, messageBox){

        }

        /**
         * 发送新消息
         * @param type 消息类型
         * @param content 消息内容
         * @param isSend 是发送还是接收
         * @returns {HTMLObject}
         */
        function pushMessage(type, content,isSend){
            var messageBox,fn;
            fn = isSend ? J.chat.template.getSendMessageTpl: J.chat.template.getShiftMessageTpl;
            console.log('sendText:',content)
            messageBox = fn(type,content);
            chatList.append(messageBox);
            return messageBox
        }

        /**
         * 查看历史消息
         * @param type 消息类型
         * @param content 消息内容
         * @returns {HTMLObject}
         */
        function shiftMessage(type, content){
            var messageBox;
            return messageBox
        }

        /**
         * 显示消息（消息，提醒，时间...）
         * @param content 信息内容
         * @param showType 0:新消息，1:历史消息（取决显示的位置）
         */
        function showMessage(content, showType){

        }

        /**
         * 时间任务处理
         */
        function timerTasker(){

        }

        /**
         * 显示或激活和经纪人的聊天会话box
         * @param brokerObject
         */
        function show(brokerObject){
            tab.show(opts);
            container.show();

            
        }

        /**
         * 隐藏和经纪人的对话box
         * @param brokerObject
         */
        function hide(brokerObject){

        }

        /**
         * 移除和经纪人的对话box
         * @param brokerObject
         */
        function remove(brokerObject){

        }



        return {
            show:show,
            remove:remove
        }
    }
    C.Box = Box;
    new C.Box();

})(J.chat);

