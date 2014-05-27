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

        var container = C.container, cookie = J.cookie, pdata = C.pdata, oInfo = opened.getInfo();

        //initialize
        (function() {
            C.connect = true;//表示是否连接

            /**
             * c_brlist 联系人列表的box
             * brokersCount 共xx名
             * allUnreadMsg 显示“所有经纪人”按钮的未读消息数
             * tab_container tab
             */
            J.each(['brlist','brlistNum','allUnreadMsg','tabContainer'], function(i, v){
                container[v] = J.g(v);
            });

            //长轮询
            C.uid = cookie.getCookie('chat_uid');
            C.guid = cookie.getCookie('aQQ_ajkguid');
            C.auth = 1;


            if(oInfo.viewType == 1){
               /* console.log('oInfo',oInfo);
                C.tabs.show(new C.Broker({
                    id: oInfo.brokerId,
                    name: 'aaa'
                }));*/
                pdata.getBrokerInfo(oInfo.brokerId, function(res){
                    console.log('res---',res)
                    /*
                    *
                    * {
                     icon: '',
                     name: '',
                     id: '',
                     houseId:'',
                     count: 0,
                     lasttime: '',
                     html: ''
                     }
                    * */
                    if (!res.retcode) {
                        var data = res.retdata;
                        var opts = {
                            icon: data.photo,
                            name: data.name,
                            id: data.id
                        };
                        !res.retcode && C.tabs.show(new C.Broker(opts));

                    }else{
                        //show list
                    }
                })


            }



         /*   if (C.uid && C.guid) {
                C.pdata.getPollListener(callbackPollListener);
            }*/

        })();


        function start(data){
            var telNumber = data.telNumber;
            J.chat.phone =telNumber, //1
            C.pdata.getPollListener(callbackPollListener);
        }


        function callbackPollListener(data) {
            //当data.result返回的是string时，它表示某种原因断开
            if (data.status == 'OK' && (typeof data.result == 'object')) {  
                C.pdata.getChatList(function(ret){
                    C.brlist.update(ret);
                    pdata.getPollListener(callbackPollListener);
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

        function windowResize() {
            J.on(window, 'resize', function(e) {
                C.tabs.calcTabsWidth();
            });
        }

        windowResize();






        function docIsVisiable(){
            if(typeof document.visible === 'undefined' || document.visible === true){
                return true;
            }
            return false;
        }
        return {
            start:start
        }
    }

    // C.Main = Main;
    // C.Main.init();
    C.main = new Main(C.opened);

})(J.chat);

