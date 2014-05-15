/**
 * test data
 *
 */


/// require('chat.chat');

(function(C){


    /**
     * Pdata
     * @constructor
     */
    function Pdata(){

        /**
         * 初始化
         */
        function init(){

        }

        /**
         *
         */
        function getFriends(){

        }

        /**
         *
         */
        function getChatList(){

        }

        /**
         *
         */
        function getChatDetail(opts,callback){
            J.get({
                type : 'json',
                url : '/message/getChatDetail/2000000029/0/2000019285/2',
                data : {
                    from_idc : opts.from_idc
                },
                onSuccess : function(data){
                    //temp
                    var data = {
                            "result": [
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
                                    "body": "aaaahttp://www.baidu.com ffff<script>aaA</script>"
                                },
                                {
                                    "msg_id": "2000019284",
                                    "msg_type": "2",
                                    "to_uid": "2000000029",
                                    "from_uid": "2000000028",
                                    "status": "9",
                                    "is_pushed": "0",
                                    "created": "1398839983",
                                    "account_type": "1",
                                    "sync_status": "2",
                                    "last_update": "2014-04-30 14:39:48",
                                    "body": "http://p.anjuke.com/img/balabala.jpg"
                                },
                                {
                                    "msg_id": "2000019283",
                                    "msg_type": "3",
                                    "to_uid": "2000000029",
                                    "from_uid": "2000000028",
                                    "status": "9",
                                    "is_pushed": "0",
                                    "created": "1398839983",
                                    "account_type": "1",
                                    "sync_status": "2",
                                    "last_update": "2014-04-30 14:39:40",
                                    "body": {
                                        "id":"12345678",
                                        "des":"1室0厅0卫 1平",
                                        "img":"http://pic1.ajkimg.com/display/hz/0b291a7f8ea98bf2eb32906e3888a6bf/420x315.jpg",
                                        "name":"。usisijsjsuxsuusisisisisusus",
                                        "price":"1111元",
                                        "url":"http://anjuke.com/test/12345678",
                                        "jsonVersion":"1",
                                        "tradeType":1
                                    }
                                },
                                {
                                    "msg_id": "2000019282",
                                    "msg_type": "5",
                                    "to_uid": "2000000029",
                                    "from_uid": "2000000028",
                                    "status": "9",
                                    "is_pushed": "0",
                                    "created": "1398839983",
                                    "account_type": "1",
                                    "sync_status": "2",
                                    "last_update": "2014-04-30 14:39:38",
                                    "body": {
                                        "file_id":"13951350418726",
                                        "length":"60",
                                         "jsonVersion":"1"
                                     }
                                },
                                {
                                    "msg_id": "2000019282",
                                    "msg_type": "6",
                                    "to_uid": "2000000029",
                                    "from_uid": "2000000028",
                                    "status": "9",
                                    "is_pushed": "0",
                                    "created": "1398839983",
                                    "account_type": "1",
                                    "sync_status": "2",
                                    "last_update": "2014-04-30 14:39:28",
                                    "body": {
                                        "baidu_lat":"12.202",
                                        "baidu_lng":"23.223",
                                        "google_lat":"12.202",
                                        "google_lng":"23.223",
                                        "from_map_type":"google",
                                        "city":"上海",
                                        "region":"浦东新区",
                                        "address":"安居客大厦",
                                        "jsonVersion":"1"
                                    }
                                },
                                {
                                    "msg_id": "2000019281",
                                    "msg_type": "106",
                                    "to_uid": "2000000029",
                                    "from_uid": "2000000028",
                                    "status": "9",
                                    "is_pushed": "0",
                                    "created": "1398839983",
                                    "account_type": "1",
                                    "sync_status": "2",
                                    "last_update": "2014-04-30 14:39:18",
                                    "body": {
                                        "content":"balabala",
                                         "jsonVersion":"1"
                                     }
                                }
                            ],
                        "errorCode": "0",
                        "errorMessage": "",
                        "status": "OK"
                    };
                    var ret = callback&&callback(data);
                    if(ret === false)return;
                }
            });
        }

        /**
         *
         */
        function getFriendInfo(){

        }

        /**
         *
         */
        function getRecomm(opts,callback){
            J.get({
                type:'json',
                url:'/api/rec',
                data:{
                    broker_id : opts.broker_id
                },
                onSuccess:function(data){
                    var ret = callback&&callback(data);
                    if(ret === false)return;
                }
            });
        }

        /**
         *
         */
        function getPropertyInfo(opts,callback){
            J.get({
                type:'json',
                url:'/property/info',
                data:{
                    property_id : opts.property_id
                },
                onSuccess:function(data){
                    //temp
                    var data=
{"retcode":0,"retmsg":"\u83b7\u53d6\u623f\u6e90\u4fe1\u606f\u6210\u529f","retdata":{"id":"202080197","pic":"","title":"\u94fe\u5bb6\u6d4b\u8bd5","community":"\u4e34\u6c7e\u8def1555\u5f04","size":"100.00","price":"3050000","room":"2\u5ba41\u53851\u536b"}};
                    var ret = callback&&callback(data);
                    if(ret === false)return;
                }
            });
        }

        /**
         *
         */
        function getBrokerInfo(opts,callback){
             J.get({
                type:'json',
                url:'/broker/info',
                data:{
                    broker_id : opts.broker_id
                },
                onSuccess:function(data){
                    //temp
                    var data ={"retcode":0,"retmsg":"\u83b7\u53d6\u7ecf\u7eaa\u4eba\u4fe1\u606f\u6210\u529f","retdata":{"id":"100","name":"lazarus","phone":"","company":"\u84dd\u601d\u623f\u5730","company_id":"","store":"\u798f\u7f8e\u6765\u4e0d\u52a8\u4ea7\u4e1c\u5efa\u5e97","photo":"http:\/\/images.anjukestatic.com\/broker\/icon\/v1\/10\/04\/07\/6\/4\/3\/100407643018a1a280fb673ec1a6035004f510_l.gif"}};
                    var ret = callback&&callback(data);
                    if(ret === false)return;
                }
            });
        }

        /**
         *
         */
        function getPollListener(){

        }

        return {
            getRecomm : getRecomm,
            getPropertyInfo : getPropertyInfo,
            getBrokerInfo : getBrokerInfo,
            getChatDetail : getChatDetail
        }
    }

    C.Pdata = Pdata();

})(J.chat);

