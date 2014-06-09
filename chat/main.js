/**
 * Anjuke Javascript Framework.
 * Copyright 2014 ANJUKE Inc. All rights reserved.
 *
 * @path: chat/main.js
 * @author: Jock
 * @version: 1.0.0
 * @date: 2014/05/08
 *
 */


/// require('chat.chat');
/// require('chat.opened');
/// require('chat.tabs');
/// require('chat.pdata');

(function(C){


    /**
     * chat 主函数
     * @param opened J.chat.opened instance
     * @constructor
     */
    function Main(opened){

        var container = C.container, cookie = J.cookie, pdata = C.pdata;

        //initialize
        (function() {
            /**
             * brlist 联系人列表的box
             * brlistNum 共xx名
             * allUnreadMsg 显示“所有经纪人”按钮的未读消息数
             * tabContainer tab
             */
            J.each(['brlist','brlistNum','allUnreadMsg','tabContainer'], function(i, v){
                container[v] = J.g(v);
            });

            opened.setSuccess(function(oInfo){
                showTab(oInfo)
            });

            J.on(J.W, 'resize', function(e) {
                C.tabs.calcTabsWidth();
                changeHeight();
            });

        })();

        function changeHeight(){
            var ch = document.documentElement.clientHeight||document.body.clientHeight,
            chatbox = J.s('.chatbox'),
            othbox = J.s('.othslist');
            chatbox.each(function(e,v){
                v.setStyle({
                    'height':ch-220+'px'
                });
            });
            othbox.each(function(e,v){
                v.setStyle({
                    'height':ch-366+'px'
                });
            });
            J.g('brlist').get().style.height=ch-146+'px';
        }

        function showTab(oInfo){
            var boxObject;
            if( boxObject = C.tabs.getCurrentBox()[oInfo.chatId]){
                boxObject.show();
            }else{
                if(!oInfo.brokerId&&!oInfo.chatId)return;
                pdata.getBrokerInfo(oInfo.brokerId, oInfo.chatId, function(res){
                    if (!res.retcode) {
                        var data = res.retdata;
                        C.tabs.show(new C.Broker({
                            icon: data.photo,
                            name: data.name,
                            brokerId: oInfo.brokerId,
                            id: oInfo.chatId,
                            houseId: oInfo.propId,
                            cityId: oInfo.cityId
                        }));
                    }
                })


            }
        }


        function start(data){
            var telNumber = data.telNumber;
            //长轮询
            C.uid = cookie.getCookie('chat_uid');
            C.guid = cookie.getCookie('aQQ_ajkguid');
            C.auth = cookie.getCookie('auth');
            //开始监听ｃｏｏｋｉｅ值　变化
            C.opened.start();

            J.chat.phone =telNumber; //1
            C.brlist.init();//需要phone作为参数
            showTab(opened.getInfo());
            C.pdata.getPollListener(callbackPollListener);

        }


        function callbackPollListener(data) {
            //当data.result返回的是string时，它表示某种原因断开
            if(!data){
                C.pdata.getPollListener(callbackPollListener);
                return;
            }


            if ( data.status == 'OK' && (typeof data.result == 'object')) {
                C.pdata.getChatList(function(ret){
                    C.brlist.update(ret);
                    C.pdata.getPollListener(callbackPollListener);
                });
            }

        }

        function closeWindow(){
            J.on(window,'beforeunload',function(e){
                var e = e || window.event;
                e.returnValue = '暂时关闭这次微聊？您可点击屏幕右侧微聊按钮继续进入';
                J.un(window,'beforeunload')
            })
        }

        //closeWindow();

        function docIsVisiable(){
            if(typeof document.visible === 'undefined' || document.visible === true){
                return true;
            }
            return false;
        }
        return {
            start:start,
            changeHeight: changeHeight
        }
    }

    // C.Main = Main;
    // C.Main.init();
    C.main = new Main(C.opened);

})(J.chat);

