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
    function Box(brokerObject){
        var defOpts={
            brokerId:2001230,
            name:'万钟玲',
            count:0,//消息未读数
            houseId:0//如果房源单过页，首次聊天需要发送房源卡片
            },opts;

        var Tab,
            brokerObject, //broker的实例
            Recommend,
            FInfo,
            chatList,
            chatBox,
            txtSend,
            BrokerInfo,
            maxMsgId,//最大消息的id
            minMsgId,
            container;


        /**
         * 初始化
         */
        (function(){
            opts = brokerObject.getOpts();
            container = createElement();
            opts.container = container;
           // Tab = new C.Tab(brokerObject);
            //opts brokerId 经纪人id propId 房源id container 容器
            recomm = new C.recomm;
            Recomm = recomm.getRecomm({
                brokerId : 147468,
                propId : 205133226,
                container : J.s('.othslist').eq(0)
            });
            BrokerInfo = new C.Broker(opts);
            FInfo = C.finfo.getPropertyInfo({
                propId : 202080197,
                container : J.s('.finfo').eq(0)
            });
            BInfo = C.finfo.getBrokerInfo({
                brokerId : 100,
                container : J.s('.binfo').eq(0)
            });
            eventBind();
        })();



        function createElement(isFromList){
            var dom = J.create('div',{
                'class':'tab_con cf'
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
            chatBox = container.s(".chatbox").eq(0);
            txtSend = container.s(".tarea").eq(0).s('textarea').eq(0);
            var mask = J.s(".p_msk").eq(0);



            var scrollIsReturn = false;



            //聊天信息点击事件
            chatList.on('click',function(e){
                var e = e || window.event;
                var target = e.target;
                while(target !== chatList.get()){
                    if(target.className.indexOf('event_map_click')>-1){

                        mask.show();


                        return true;
                        //map click
                    }
                    if(target.className.indexOf('event_image_click')>-1){
                        //image click
                        alert('image click');
                        mask.show();
                        return true;
                    }
                    target = target.parentNode;
                }

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
                    J.chat.pdata.getChatDetail(opts.id, 0,maxMsgId,20,function(data){
                        scrollIsReturn = false;
                      /*  var data =  [
                            {
                                "msg_id": "2000019285",
                                "msg_type": "1",
                                "to_uid": "2000000029",
                                "from_uid": "2000000028",
                                "status": "9",
                                "is_pushed": "0",
                                "created": "1398840350",
                                "account_type": "1",
                                "sync_status": "2",
                                "last_update": "2014-04-30 14:45:52",
                                "body": "哈哈！"
                            },
                            {
                                "msg_id": "2000019284",
                                "msg_type": "1",
                                "to_uid": "2000000029",
                                "from_uid": "2000000028",
                                "status": "9",
                                "is_pushed": "0",
                                "created": "1398839983",
                                "account_type": "1",
                                "sync_status": "2",
                                "last_update": "2014-04-30 14:39:48",
                                "body": "哈哈！"
                            }
                        ];*/
                        J.each(data,function(k,v){
                            shiftMessage(v);
                            maxMsgId= v.msg_id;
                        })
                    });
                }
            });




        }

        /**
         * 生成
         */



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
                var messageBox;
                var msg;
                msg = {
                    msg_type:type,
                    body:content,
                    from_uid: C.uid,
                    to_uid:opts.id,
                    created:new Date().getTime()
                };
                messageBox = pushMessage(msg);
                J.chat.pdata.sendMsgToBroker({
                    body: msg.body,
                    type: msg.msg_type
                }, function (ret) {
                    //发送失败处理逻辑
                    if ( ret.retcode == -1) {
                        sendError(msg.body,messageBox);
                        return false;
                    }
                    if(!ret.retcode){
                        !maxMsgId&&(maxMsgId = ret.retdata.result)
                    }
                });
                //如果是房源卡面，要转换为ｊｓｏｎ
                if (type == 3) {
                    content = eval('(' + msg.body + ')');
                }
            }
            !houseId&&sendMessage(type,content);
        }

        /**
         * 消息发送正常回掉
         * @param statusCode 状态吗
         */
        function sendSuccess(ret){
            switch (ret.retcode){
                case -1:

                    //message send wrong
                    break;
                case  -2:
                    //message send empty
                    break;
                case 0:
                    //message send success;


            }
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
                ret&&J.chat.pdata.sendMsgToBroker({
                    body: content,
                    type: 1
                },function(data){
                    if (data&&!data.retcode) {
                        aWrong.parentNode.removeChild(aWrong);
                        aWrong.onclick = null;
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
            var messageBox,fn,timerDom;
            fn = msg.from_uid == C.uid ? J.chat.template.getSendMessageTpl: J.chat.template.getShiftMessageTpl;
            messageBox = fn(msg.msg_type,msg.body);
            chatList.append(messageBox);
            chatBox.get().scrollTop =1000000;
            timerDom = timerTasker(msg.created);
            timerDom&&chatList.append(timerDom);
            maxMsgId = msg.msg_id;
            return messageBox
        }

        /**
         * 查看历史消息
         * @param msg
         * {
                "msg_id": "2000019285",
                "msg_type": "1",
                "to_uid": "2000000029",
                "from_uid": "2000000028",
                "status": "9",
                "is_pushed": "0",
                "created": "1398840350",
                "account_type": "1",
                "sync_status": "2",
                "last_update": "2014-04-30 14:45:52",
                "body": "哈哈！"
            };
         * @param
         * @returns {HTMLObject}
         */
        function shiftMessage(msg){
            var messageBox,fn,timerDom;
            fn = msg.from_uid != C.uid ? J.chat.template.getSendMessageTpl: J.chat.template.getShiftMessageTpl;
            messageBox = fn(msg.msg_type,msg.body);
            var dom = chatList.first();
            timerDom = timerTasker(parseInt(msg.created));
            dom ? dom.insertBefore(messageBox):chatList.append(messageBox);
            timerDom&&messageBox.insertBefore(timerDom);
            minMsgId = msg.msg_id;
            !maxMsgId&&(maxMsgId=msg.msg.msg_id);
            return messageBox
        }
        window.shiftMessage = shiftMessage;
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
            var begainTime = t;
            timerTasker = function(t){
                var curTime = t;
                if(curTime -begainTime > 600000){
                    begainTime = curTime;
                    return J.chat.template.getTimeTpl(curTime);
                }
            }
        }

        /**
         * 显示或激活和经纪人的聊天会话box
         * @param brokerObject
         */
        function show(brokerObject){
            Tab.show();
            container.show();
        }

        /**
         * 隐藏和经纪人的对话box
         * @param brokerObject
         */
        function hide(brokerObject){
            Tab.hide();
            container.hide();

        }

        /**
         * 移除和经纪人的对话box
         * @param brokerObject
         */
        function remove(brokerObject){
            Tab.remove();
            container.remove();

        }

        function updateUnreadMsg(new_msg_count) {
            Tab.update(new_msg_count);
        }




        return {
            show:show,
            updateUnreadMsg: updateUnreadMsg,
            remove:remove,
            shiftMessage:shiftMessage
        }
    }
    C.Box = Box;
    var brokerObject = new J.chat.Broker({
        icon: '',
        name: '万钟宁',
        id: '123456',
        houseId:'123456789',
        count: 0,
        lasttime:'',
        html: ''
    });
    new C.Box(brokerObject);

})(J.chat);

