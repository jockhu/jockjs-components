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
            BBlock,//经济人版块
            FBlock,//房源消息版块
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
            //拿推荐数据
            opts.container = container.s('.othslist').eq(0);
            Recommend.getRecomm(opts);
            BrokerInfo = new C.Broker(opts);
            //拿经济人消息
            BBlock =opts.container = container.s('.binfo').eq(0);
            C.finfo.getPropertyInfo(opts);

            FBlock = opts.container = container.s('.binfo').eq(0)
            C.finfo.getBrokerInfo(opts);

            //请求６条记录
            C.pdata.getChatDetail(opts.id,0,0,6,function(data){
                if(data.status == 'OK'){
                    J.each(data.result,function(k,v){
                        shiftMessage(v);
                    })
                }
            })

           /* Recommend = new C.Recomm(opts);
            BrokerInfo = new C.Broker(opts);*/
       //     FInfo = new C.Finfo(opts);

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
            var inputTxt = container.s('.input_txt').eq(0);
            chatBox = container.s(".chatbox").eq(0);
            txtSend = container.s(".tarea").eq(0).s('textarea').eq(0);
            var mask = J.s(".p_msk").eq(0);
            var mapPanel = J.g('map_panel');
            var imgPanel = J.g('img_panel');

            var scrollTopElm = chatBox.first();
            var scrollIsReturn = false;


            //聊天信息点击事件
            chatList.on('click',function(e){
                var e = e || window.event;
                var target = e.target || e.srcElement;
                while(target !== chatList.get()){
                    if(target.className.indexOf('event_map_click')>-1){
                        var center = target.getAttribute('data-center');
                        var text = target.getAttribute('data-content')
                        mask.show();
                        mapPanel.show();
                        mapPanel.s('img').eq(0).attr('src','http://api.map.baidu.com/staticimage?center='+center+'&width=600&height=500&zoom=17')
                        mapPanel.s('.msktxt').eq(0).html(text)
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
                        src =src.replace(/(\d+)x(\d+)$/,ret.width+'x'+ret.height);
                        var imgDom = imgPanel.s('img').eq(0);
                        imgDom.attr('src',src);
                        imgDom.attr('width',ret.width);
                        imgDom.attr('height',ret.height);
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

            mapPanel.s('.btn_close').eq(0).on('click',function(){
                mapPanel.hide();
                mask.hide();
            })


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
                    J.chat.pdata.getChatDetail(opts.id, 0,minMsgId,20,function(data){
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


            var FB = container.s(".tabs").eq(0).s("a");
            var FB_Block = container.s(".tabcon");

            var aF = FB.eq(0);
            var aB = FB.eq(1);


            var FBlock = FB_Block.eq(0);
            var BBlock = FB_Block.eq(1);



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
            var len =2000;
            var leaveChatCount = len-txtSend.val().length;
            if(leaveChatCount<=0){
                leaveChatCount=0;
                txtSend.val(txtSend.val().substr(0,len));
            }

            // calcTextLength = function(){  
                labTip.html(labTip.html().replace(/\d+/g,leaveChatCount))
            // }
            // calcTextLength();
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

                //brlist 里面没有数据的情况下，发送消息添加联系人
                if(type != 3 && !J.chat.brlist.BROKERSCACHE[opts.id]){
                    opts.created = msg.created;
                    J.fire(document,'chat:newBroker',opts)
                }

                messageBox = pushMessage(msg);
                C.pdata.sendMsgToBroker(msg, opts.id, function (ret) {
                    //发送失败处理逻辑
                    if ( ret.retcode == -1) {
                        sendError(msg.body,messageBox);
                        return false;
                    }
                    if(!ret.retcode){
                        !maxMsgId&&(maxMsgId = ret.retdata.result);
                    }
                });
                //如果是房源卡面，要转换为ｊｓｏｎ
            }
            //首次发送需要发送房源卡片
            houseId? (function(){
                J.chat.pdata.getHouseCard(houseId,function(data){
                    if(!data.retcode){
                        //返回正确的房源卡片
                        sendMessage(3,data.retdata);
                        sendMessage(1,content);
                    }
                });
            })():sendMessage(type,content);
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
                ret && C.pdata.sendMsgToBroker({
                    body: content,
                    msg_type: 1
                },function(data){
                    if (data&&!data.retcode) {
                        aWrong.parentNode.removeChild(aWrong);
                        aWrong.onclick = null;
                        maxMsgId = data.retdata.result;
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
            (msg.msg_type!=1 && msg.msg_type!=2 && msg.msg_type!=106&&msg.msg_type!=107)&&(msg.body = eval('('+ msg.body+')'));
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
            
            fn = msg.from_uid == C.uid ? J.chat.template.getSendMessageTpl: J.chat.template.getShiftMessageTpl;
            (msg.msg_type!=1&&msg.msg_type!=2&&msg.msg_type!=106&&msg.msg_type!=107)&&(msg.body = eval('('+ msg.body+')'));

            messageBox = fn(msg.msg_type,msg.body, opts.icon);
            var dom = chatList.first();
            timerDom = timerTasker(parseInt(msg.created));
            dom ? dom.insertBefore(messageBox):chatList.append(messageBox);
            timerDom&&messageBox.insertBefore(timerDom);
            minMsgId = msg.msg_id;
            !maxMsgId&&(maxMsgId=msg.msg_id);
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
            C.brlist.showAllUnreadMsgCount(C.brlist.allUnreadMsgNum - unReadMsg);
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


        function updateMessage(msgCount){
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
            hideCloseButton:Tab.hideCloseButton
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

