;(function (J, D) {

    function LoginPanel(opts){
        var baseUrl = opts.baseUrl || '';
        var eleBroker,content;
        var showSimple = opts.showSimple || false;//显示科易头部
        var isgetFav = false,loginUrl='';

        J.ready(init)
        function init(){
            eleBroker = J.s(".glbR").length&&J.s(".glbR").eq(0)||false;
            content = J.s(".R_user").length&&J.s(".R_user").eq(0)||false;
            if(!eleBroker || !content){
                return false;
            }
            baseUrl = content.attr("url");
            loginUrl =content.s("a").eq(0).attr("href");
            (J.getCookie('aQQ_ajkauthinfos')&&sendAjax())||bindEvent();

        };
        /**
         * 网络门店用户
         *
         * */

        function getGeneralHTML(config){
            var msgHTML = getMessageHTML(config.msgCount);
            var expertHTML = config.isExpert?'<li><a href="'+config.expert_home+'">专家主页</a></li>':'';//专家主页
            var managerHTML = config.isMananer?'<li><a href="'+config.ask_center+'">问答中心</a></li>':'';//管理员用户
            var perHTML = expertHTML+managerHTML;

            perHTML = perHTML ? perHTML+'<li class="sep"></li>':'';
            var notifyHTML = config.showNotiy ? '<div class="login_tip"> <a href="javascript:void(0);" url="'+config.qa_url+'" style="margin-left:5px;">'+config.msg_title+'</a>'+
                '<span class="login_close"></span><span class="t_d"></span></div>':'';
            var html='<div class="login_info"><span class="tip_d"></span><div class="l" id="login_l"><div class="m"><a href="'+config.my_anjuke+'" class="usr">'+config.userName+'</a>'+
                '</div><div class="o_b"><ul>'+perHTML+
                '<li><a href="'+config.my_favorite+'">我的收藏</a></li>'+
                '<li><a href="'+config.view_history+'">浏览历史</a></li>'+
                '<li><a href="'+config.subscription_management+'">订阅管理</a></li>'+
                '<li><a href="'+config.my_ask+'">我的问答</a></li>'+
                '<li style="text-align: left;padding-left: 27px;"><a href="'+config.my_msg+'">我的消息'+ msgHTML+'</a></li>'+
                '<li class="sep"></li>'+
                (config.publish_sell=='#'? '':'<li><a href="'+config.publish_sell+'">发布出售</a></li>')+
                '<li><a href="'+config.publish_rent+'">发布出租</a></li>'+
                (config.publish_shop=='#'? '':'<li><a href="'+config.publish_shop+'">发布商铺</a></li>')+
                '<li class="sep"></li>'+
                '<li class="exit"><a class="exit" href="'+config.exit+'">退出</a></li>'+
                '</ul></div>  '+
                '</div>'+
                '<div class="r" id="login_r"><a class="my" href="'+config.my_favorite+'">收藏夹（0）</a><ul class="m_l" style="display: none">'+
                '<li class="empty"><span>您的收藏夹是空的，赶紧收藏吧！</span></li>'+
                '</ul></div></div>';
            content&&content.html(html);
            eleBroker&&eleBroker.html(notifyHTML);
        }
        /**
         * 简头
         * @param config
         * @returns {string}*/

        /**
         * 网络门店用户4*/


        function getInternetHTML(config){
            var msgHTML = getMessageHTML(config.msgCount);
            var notifyHTML = config.showNotiy ? '<div class="login_tip"> <a href="javascript:void(0);" url="'+config.qa_url+'" style="margin-left:5px;">'+config.msg_title+'</a>'+
                '<span class="login_close"></span><span class="t_d"></span></div>':'';
            var html='<div class="login_info">    <span class="tip_d"></span><div class="l" id="login_l"><div class="m"><a href="'+config.my_anjuke+'" class="usr">'+config.userName+'</a>'+
                '</div><div class="o_b"><ul>'+
                '<li class="exit"><a class="exit" href="'+config.exit+'">退出</a></li>'+
                '</ul></div>  '+
                '</div>'+
                '<div class="r" id="login_r"><a class="my" href="'+config.my_favorite+'">收藏夹（0）</a><ul class="m_l" style="display: none">'+
                '<li class="empty"><span>您的收藏夹是空的，赶紧收藏吧！</span></li>'+
                '</ul></div></div>';
            eleBroker&&eleBroker.html(notifyHTML);
            return html;
        }
        /**
         * 经济人
         * @param data
         * @returns {string}*/


        function getBrokerHTML(data){
            var msgHTMl = getMessageHTML(data.msgCount);
            var html='<div class="broker_info">' +
                '<span style="margin-right: 8px;">您好，'+data.userName+'</span>'+
                '[<a class="a_logoout" href="'+data.exit+'" style="margin:0 2px;">退出</a>]&nbsp;&nbsp;'+
                '<a href="'+data.msgUrl+'" class="a_logoout">消息&nbsp;'+msgHTMl+'</a>'+
                '<span class="sep_l"></span><a href="'+data.myanjuke+'">中国网络经纪人</a>'+
                '<span class="sep_l"></span><a href="'+data.developUrl+'">新房分销平台</a>'+
                '</div>';
            content&&content.html('');
            eleBroker&&eleBroker.html(html);
        }
        /**
         * 开发商
         * @param data
         * @returns {string}*/


        function getDeveloperHTML(data){
            var msgHTMl = getMessageHTML(data.msgCount);
            var fytStr = data.fytUrl?'<span class="sep_l"></span><a href="'+data.fytUrl+'">房易通</a>':'';
            var fxsStr = data.developUrl ?'<span class="sep_l"></span><a href="'+data.developUrl+'">新房分销平台</a>':'';
            var html='<div class="broker_info">' +
                '<span style="margin-right: 8px;">您好，'+data.userName+'</span>'+
                '[<a class="a_logoout" href="'+data.exit+'" style="margin:0 2px;">退出</a>]'+
                '<a href="'+data.msgUrl+'" style="margin-left:8px;" class="a_logoout">消息&nbsp;'+msgHTMl+'</a>'+
                fytStr+fxsStr+ '</div>';
            content&&content.html('');
            eleBroker&&eleBroker.html(html);
        }
        /*
         *
         * 获各消息HTML
         * @param data
         * @returns {string}

         */

        function getMessageHTML(data){
            var totalMsg = data;
            var msgClassName  = totalMsg >0 ?"m_count":"z_count" ;
            var msgNum = totalMsg >0?(totalMsg>99?"99+":totalMsg):0;
            return '<span class="'+msgClassName+'">'+msgNum+'</span>';
        }
        function bindEvent(){
            var thirdBlock = content.s(".o_b").length?content.s(".o_b").eq(0):null;
            thirdBlock&&J.g("login_l").on("mouseenter",function(){
                J.g("login_l").addClass("over");
            }).on("mouseleave",function(){
                    J.g("login_l").removeClass("over");
                })
            J.g("login_r")&& J.g("login_r").on("mouseenter",function(){
                J.g("login_r").addClass("over");
                !isgetFav&&(getMyFavorites(),isgetFav=true);
            }).on("mouseleave",function(){
                    J.g("login_r").removeClass("over");
                })

            var closeDom = J.s(".login_close").length?J.s(".login_close").eq(0):false;
            closeDom&& closeDom.on('click',function(){
                var url = baseUrl +'ajax/usersetting/?key=shutNotify&value=1&_r='+Math.random();
                (new Image()).src= url;
                closeDom.up(0).remove();
                //发送ａｊａｘ清楚ｃｏｏｋｉｅ
            });
            var view = closeDom&&closeDom.prev();
            view && view.on('click',function(){
                var view_url = view.attr("url");
                var set_url = baseUrl +'ajax/usersetting/?key=viewNotify&value=1&callback=url_callback&url='+encodeURIComponent(view_url)+'&_r='+Math.random();
                //关闭小黄条
                closeDom.up(0).remove();
                //新窗口打开链接
                if (!(window.attachEvent && navigator.userAgent.indexOf('Opera') === -1)) {
                    window.open(view.attr("url"),'_blank');
                } else {
                    var a = document.createElement('a');
                    a.href = view.attr("url");
                    a.target = '_blank';
                    document.body.appendChild(a);
                    a.click();
                }
                //发送设置已读的AJAX
                J.load(set_url, "js");
                return false;
            });
            getFavoriteCount();
            J.s(".glbR").length&&J.s(".glbR").eq(0).show();
            J.s(".R_user").length&&J.s(".R_user").eq(0).show();
        }
        /*

         * 初始化发送AJAX确定是否登录

         */
        function sendAjax(){
            J.get({
                url: baseUrl + 'ajax/checklogin/'+'?r='+Math.random(),
                type:'jsonp',
                callback:' loginObj.successCallBack'
            });
            return true;
        }
        function successCallBack(data){
            var html ='';
            if(data.common.userid >0){
                var userType =  data.common.usertype;
                if(userType ==1){
                    var loginData={
                        my_anjuke:data.righturl.myanjuke,
                        showNotiy:!parseInt(data.shutNotify),
                        isExpert:data.qamember.cons> -1 ||0,
                        isMananer:data.qamember.admin|| false,
                        msgCount:data.common.totalUnreadCount,
                        userName:data.common.usernamestr,
                        my_favorite:data.righturl.links.my_favorite,
                        my_recommend:data.righturl.links.my_recommend,
                        view_history:data.righturl.links.view_history,
                        subscription_management:data.righturl.links.subscription_management,
                        my_ask:data.righturl.links.my_ask,
                        my_msg:data.lefturl.pmurl,
                        qa_url:data.lefturl.qaurl,
                        msg_title:data.lefturl.title,
                        publish_sell:data.righturl.links.publish_sell || '#',
                        publish_rent:data.righturl.links.publish_rent || '#',
                        publish_shop:data.righturl.links.publish_shop || '#',//发布商铺
                        exit:data.lefturl.logouturl,
                        expert_home:data.righturl.links.expert_home || '#',
                        ask_center:data.righturl.links.ask_center || '#',
                        my_house:data.common.my_house||'#'
                    }
                    this.my_favorite = loginData.my_favorite;
                    html = getGeneralHTML(loginData);
                }else if(userType == 2){
                    var data = {
                        userName:data.common.usernamestr||'',
                        exit:data.lefturl.logouturl||'#',
                        myanjuke:data.righturl.myanjuke||'#',
                        msgUrl:data.lefturl.pmurl ||'#',
                        msgCount:data.common.totalUnreadCount,
                        my_house:data.common.my_house||'#',
                        developUrl:data.common.developUrl|| false//新房分销平台
                    };
                    html = getBrokerHTML(data);
                }else if(userType == 4){
                    var data = {
                        showNotiy:!parseInt(data.shutNotify),
                        userName:data.common.usernamestr||'',
                        exit:data.lefturl.logouturl||'#',
                        myanjuke:data.righturl.myanjuke||'#',
                        qa_url:data.lefturl.qaurl,
                        msg_title:data.lefturl.title,
                        msgUrl:data.lefturl.pmurl ||'#',
                        msgCount:data.common.totalUnreadCount
                    };
                    html = getInternetHTML(data);
                }else if(userType == 8){
                    var data = {
                        userName:data.common.usernamestr||'',
                        exit:data.lefturl.logouturl||'#',
                        myanjuke:data.righturl.links.fang_anjuke||'#',
                        msgUrl:data.lefturl.pmurl ||'#',
                        msgCount:data.common.totalUnreadCount,
                        fytUrl : data.common.fytUrl||false,//房易通URL
                        developUrl:data.common.developUrl|| false//新房分销平台
                    };
                    html = getDeveloperHTML(data);
                }
            }else{
            }
            bindEvent();
        }
        function getMyFavorites(data){
            if(!data){
                isgetFav = true;
                var url = baseUrl+'ajax/favorite/list_4_favorite';
                J.get({
                    url:url,
                    type:'jsonp',
                    data:{r:Math.random()},callback:' loginObj.getFavorite'});
                return;
            }
            var countDom = J.g("login_r").s(".my").eq(0);
            var delUrl = baseUrl+'ajax/favorite/del_favorite';
            var content = J.g("login_r")&&J.g("login_r").s("ul").eq(0);
            if(!data.code&&data.val.length){
                var isLogin = J.getCookie('aQQ_ajkauthinfos');
                var loginStr = isLogin?'':'<li style="border: 1px solid #fc6;background-color: #fefded;padding: 0;text-indent: 10px;line-height: 34px;margin: 10px 0;">该收藏仅在本设备暂时保存，若需永久保存并同步请<a style="display: inline" _target="blank" href="'+loginUrl+'&from=collectionheadertop">登录</a>。</li>';
                var arr = data.val,html='<li class="t">最近加入的房子</li>'+loginStr;
                countDom.html(countDom.html().replace(/\d+/,data.num.num));
                for(var i=0,len=arr.length;i<len;i++){
                    var str = '<li><a href="'+arr[i].link+'" class="li_a"><img src="'+arr[i].image+'" alt=""/></a>'+
                        '<div class="li_c"><a href="'+arr[i].link+'">['+arr[i].category+']'+arr[i].title+'</a><div>'+arr[i].info+'</div></div>'+
                        '<div class="li_r"><em>'+arr[i].price+'</em><a onclick="return false;" href="javascript:void(0)" data-cids="'+arr[i].id+'">删除</a></div></li>';
                    html=html+str;
                }
                var count = J.g("login_r").s(".my").eq(0).html().match(/\d+/)[0];
                html = html + '<li class="nav_count">收藏夹里共有'+count+'个收藏</li><li style="padding-top: 0px!important;padding-bottom: 3px!important;"><a class="li_btn" href="'+ J.g('login_r').s("a").eq(0).attr("href")+'">查看全部收藏</a></li>';
                content.html(html);
                var lis =content.s("li");
                lis.each(function(k,v){
                    if(!k||k==lis.length-1){
                        return;
                    }
                    v.on('mouseenter',function(){
                        v.addClass("active");
                    });
                    v.on('mouseleave',function(){
                        v.removeClass("active");
                    });
                    v.on('click',function(){
                        location.href= v.s("a").eq(0).attr("href");
                    });
                    v.s("a").each(function(k,v){
                        v.on('click',function(e){
                            if(e&& e.stopPropagation){ e.stopPropagation()}else{
                                window.event.cancelBubble = true;
                            };
                            if(v.html()==='删除'){
                                //删除收藏的房源操作。
                                J.get({url:delUrl,callback:' loginObj.delFavorite',type:"jsonp",data:{cids: v.attr("data-cids")}});
                            }
                        });
                    });
                });
                return;
            }
            countDom.html(countDom.html().replace(/\d+/,0));
            content.html('<li class="empty"><span>您的收藏夹是空的，赶紧收藏吧！</span></li>');
        }
        function delMyFavorite(data){
            var content = J.g("login_r")&&J.g("login_r").s("ul").eq(0);
            !data.code&&(function(){
                var cid = data.cid;
                content.s("a").each(function(k,v){
                    if(v.attr("href")===cid)
                        unBindEvent(J.g("login_r").s("li"));
                    if(content.s("li").length==2){
                        content.html('<li class="empty"><span>您的收藏夹是空的，赶紧收藏吧！</span></li>');
                    }
                });
                getMyFavorites();
            })()
        }
        function getFavoriteCount(data){
            if(!data){
                var url = baseUrl+'ajax/favorite/count_favorite';
                J.get({url:url,type:'jsonp',data:{r:Math.random()},callback:' loginObj.getFavoriteCount'});
                return;
            }
            !data.code&&data.num&&(function(){
                J.g("login_r")&&J.g("login_r").s(".my").eq(0).html("收藏夹（"+data.num+"）");
                var count = content.s(".nav_count").length;
                if(count){
                    var dom = content.s(".nav_count").eq(0);
                    dom.html(dom.html().replace(/\d+/,data.num));
                }
            })();
        }
        function unBindEvent(doms){
            doms.each(function(k,v){
                v.un('mouseenter');
                v.un('mouseleave');
                v.s("a").each(function(kk,vv){
                    v.un("click");
                });
            });
        }
        return {
            refresh:init,
            successCallBack:successCallBack,
            getFavorite:getMyFavorites,
            delFavorite:delMyFavorite,
            getFavoriteCount:getFavoriteCount
        }
    }
    (function(){}.require([''], ['ui.login'], true))
    J.ui.login = LoginPanel;
})(J, document);
