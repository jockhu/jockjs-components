;(function (J, D) {

    function LoginPanel(opts){
        var baseUrl = opts.baseUrl || '';
        var eleBroker,content;
        var showSimple = opts.showSimple || false;//显示科易头部
        var isgetFav = false,loginUrl='';
        var appdown = '';

        J.ready(init);
        function init(){
            eleBroker = J.s(".glbR").length&&J.s(".glbR").eq(0)||false;
            content = J.s(".R_user").length&&J.s(".R_user").eq(0)||false;
            appdown = J.s('.appContainer').length && getOuterHtml(J.s('.appContainer').eq(0).get());
            if(!content){
                return false;
            }
            baseUrl = content.attr("url");
            loginUrl =content.s("a").eq(0).attr("href");
            (J.getCookie('aQQ_ajkauthinfos')&&sendAjax())||bindEvent();

        };

        function getOuterHtml(ele) {
            var div = document.createElement('div');
            div.appendChild(ele.cloneNode(true));
            return J.g(div).html();
        }
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

            //小黄条
            var notifyHTML = config.showNotiy ? '<div class="login_tip"> <a href="javascript:void(0);" url="'+config.qa_url+'" style="margin-left:5px;">'+config.msg_title+'</a>'+
                '<span class="login_close"></span><span class="t_d"></span></div>':'';
            var html='<div class="login_info">' + getAllMsgHTML(config.msgCount)+ notifyHTML + '<div class="l" id="login_l"><div class="m"><a href="'+config.my_anjuke+'" class="usr">'+config.userName+'</a>'+
                '<span class="up_down_usr"></span></div><div class="o_b" style="display: none;"><ul>'+perHTML+
                '<li><a href="'+config.my_favorite+'">我的收藏</a></li>'+
                '<li><a href="'+config.view_history+'">浏览历史</a></li>'+
                '<li><a href="'+config.subscription_management+'">订阅管理</a></li>'+
                '<li><a href="'+config.my_ask+'">我的问答</a></li>'+
                '<li><a href="'+config.my_msg+'">我的消息'+ msgHTML+'</a></li>'+
                '<li class="sep"></li>'+
                '<li><a target="_blank" href="'+config.publish_sell+'?from=i_dhfa">我要发房</a></li>'+
                '<li><a target="_blank" href="'+config.my_house+'?from=i_dhmge">我的房源</a></li>'+
                '<li class="sep"></li>'+
                '<li class="exit"><a class="exit" href="'+config.exit+'">退出</a></li>'+
                '</ul></div>  '+
                '</div>'+
                '<div class="r" id="login_r"><a class="my" href="'+config.my_favorite+'">收藏夹（0）</a><span class="up_down_sc"></span><ul class="m_l" style="display: none">'+
                '<li class="empty"><span>您的收藏夹是空的，赶紧收藏吧！</span></li>'+
                '</ul></div>' + appdown + '</div>';
            setContainerHtml(html,'');

        }


        function getBrokerHTML(config) {
            var msgHTML = getMessageHTML(config.msgCount);
            var fxsStr = config.developUrl ? '<li><a href="'+config.developUrl+'">新房分销平台</a></li>' :'';
            config.my_anjuke = 'http://my.anjuke.com/user/broker/brokerhome';//临时处理方案，写死后台经纪人链接
            var html='<div class="login_info">' + getAllMsgHTML(config.msgCount) + '<div class="l" id="login_l"><div class="m"><a href="'+config.my_anjuke+'" class="usr">'+config.userName+'</a>'+
                '<span class="up_down_usr"></span></div><div class="o_b" style="display: none;"><ul>'+
                '<li><a href="'+config.msgUrl+'">我的消息'+ msgHTML+'</a></li>'+
                '<li class="sep"></li>'+
                '<li><a href="'+config.myanjuke+'">中国网络经纪人</a></li>'+
                fxsStr +
                '<li class="sep"></li>'+
                '<li class="exit"><a class="exit" href="'+config.exit+'">退出</a></li>'+
                '</ul></div>  '+
                '</div>'+ appdown+
                '</div>';
            var notifyHTML = '<a class="u" href="'+config.myanjuke+'">中国网络经纪人</a>' +
                (config.developUrl ? '<a class="u" href="'+config.developUrl+'">新房分销平台</a>' :'');
            setContainerHtml(html,notifyHTML);
        }





        /**
         * 开发商
         * @param data
         * @returns {string}*/

        function getDeveloperHTML(config){
            var msgHTML = getMessageHTML(config.msgCount);
            var fytStr = config.fytUrl ? '<li><a href="'+config.fytUrl+'">房易通</a></li>' : '';
            var fxsStr = config.developUrl ? '<li><a href="'+config.developUrl+'">新房分销平台</a></li>' :'';
            config.my_anjuke = 'http://svip.fang.anjuke.com/login';//临时处理方案
            var html='<div class="login_info">'+ getAllMsgHTML(config.msgCount) + '<div class="l" id="login_l"><div class="m"><a href="'+config.my_anjuke+'" class="usr">'+config.userName+'</a>'+
                '<span class="up_down_usr"></span></div><div class="o_b" style="display: none;"><ul>'+
                '<li><a href="'+config.msgUrl+'">我的消息'+ msgHTML+'</a></li>'+
                '<li class="sep"></li>'+
                fytStr +
                fxsStr +
                ((fytStr || fxsStr) ? '<li class="sep"></li>' : '')+
                '<li class="exit"><a class="exit" href="'+config.exit+'">退出</a></li>'+
                '</ul></div>  '+
                '</div>'+ appdown +
                '</div>';
            var notifyHTML = (config.fytUrl ? '<a class="u" href="'+config.fytUrl+'">房易通</a>' : '') +
                (config.developUrl ? '<a class="u" href="'+config.developUrl+'">新房分销平台</a>' :'');
            setContainerHtml(html,notifyHTML);
        }


        function setContainerHtml(clientHtml,brokerHtml){
            if(content){
                content.html(clientHtml);
            }
            if(eleBroker){
                eleBroker.html(brokerHtml);
            }else{
                content.setStyle({width:'auto'});
                J.create('span',{className:'glbR'}).appendTo(content).html(brokerHtml);
            }

        }

        function getAllMsgHTML(count) {
            count = count * 1;
            var width = count > 0 ? (count > 99 ? '25' : (count > 9 ? '19' : '14')) : 0;
            var msgCount = count > 0 ? (count > 99 ? '99+' : count) : 0;
            var html = count > 0 ? '<span class="tip_d" style="width:' + width + 'px">' + msgCount + '</span>' : '<span class="tip_d"></span>';
            return html;
        }

        /*
         *
         * 获各消息HTML
         * @param data
         * @returns {string}

         */

        function getMessageHTML(data){
            var totalMsg = data;
            var msgClassName  = "z_count" ;
            var msgNum = totalMsg >0?(totalMsg>99?"99+":totalMsg):0;
            return '<span class="'+msgClassName+'">'+msgNum+'</span>';
        }
        function bindEvent(){
            var thirdBlock = content.s(".o_b").length?content.s(".o_b").eq(0):null;
            thirdBlock&&J.g("login_l").on("mouseenter",function(){
                J.g("login_l").addClass("over");
                thirdBlock.show();
                J.s('.up_down_usr').length && (J.s('.up_down_usr').eq(0).get().style.backgroundPosition = '0 -172px');
            }).on("mouseleave",function(){
                J.g("login_l").removeClass("over");
                thirdBlock.hide();
                J.s('.up_down_usr').length && (J.s('.up_down_usr').eq(0).get().style.backgroundPosition = '0 -195px');
            });
            J.g("login_r")&& J.g("login_r").on("mouseenter",function(){
                J.g("login_r").addClass("over");
                J.site.trackEvent('navigation_favorite_hover');
                J.s('.m_l').length && J.s('.m_l').eq(0).show();
                J.s('.up_down_sc').length && (J.s('.up_down_sc').eq(0).get().style.backgroundPosition = '0 -172px');
            }).on("mouseleave",function(){
                J.g("login_r").removeClass("over");
                J.s('.m_l').length && J.s('.m_l').eq(0).hide();
                J.s('.up_down_sc').length && (J.s('.up_down_sc').eq(0).get().style.backgroundPosition = '0 -195px');
            }).on('click', function() {
                J.site.trackEvent('navigation_favorite_click');
            });

            //
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
            //

            getFavoriteCount();
            !isgetFav&&(getMyFavorites(),isgetFav=true);

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
                if(userType == 1 || userType == 9){//1: 网络门店或者用户 9:大业主
                    var loginData={
                        my_anjuke:data.righturl.myanjuke,
                        showNotiy:!parseInt(data.shutNotify),
                        isExpert:data.qamember.cons> -1 ||0,
                        isMananer:data.qamember.admin|| false,
                        msgCount:data.common.totalUnreadCount,
                        userName:data.common.usernamestr ? ((data.common.usernamestr.length > 5) ? data.common.usernamestr.slice(0, 4)+'...' : data.common.usernamestr) : '',
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
                }else if(userType == 2){//经济人
                    var data = {
                        userName:data.common.usernamestr ? data.common.usernamestr.slice(0, 5):'',
                        exit:data.lefturl.logouturl||'#',
                        myanjuke:data.righturl.myanjuke||'#',//中国网络经纪人
                        msgUrl:data.lefturl.pmurl ||'#',
                        msgCount:data.common.totalUnreadCount,
                        my_house:data.common.my_house||'#',
                        developUrl:data.common.developUrl|| false//新房分销平台
                    };
                    html = getBrokerHTML(data);
                }else if(userType == 8){//开发商(房易通/分销平台)
                    var data = {
                        userName:data.common.usernamestr ? data.common.usernamestr.slice(0, 5):'',
                        exit:data.lefturl.logouturl||'#',
                        myanjuke:data.righturl.links.fang_anjuke||'#',
                        msgUrl:data.lefturl.pmurl ||'#',
                        msgCount:data.common.totalUnreadCount,
                        fytUrl : data.common.fytUrl||false,//房易通URL
                        developUrl:data.common.developUrl|| false//新房分销平台
                    };
                    html = getDeveloperHTML(data);
                }
            }
            bindEvent();
        }
        function getMyFavorites(data){
            var countDom = J.g("login_r") && J.g("login_r").s(".my").eq(0);
            if (!countDom) {
                return;
            }
            var str='';
            if(!data){
                isgetFav = true;
                var url = baseUrl+'ajax/favorite/list_4_favorite';
                J.get({
                    url:url,
                    type:'jsonp',
                    data:{r:Math.random()},callback:' loginObj.getFavorite'});
                return;
            }

            var delUrl = baseUrl+'ajax/favorite/del_favorite';
            var content = J.g("login_r")&&J.g("login_r").s("ul").eq(0);
            if(!data.code&&data.val.length){
                var isLogin = J.getCookie('aQQ_ajkauthinfos');
                var loginStr = isLogin?'':'<li style="border: 1px solid #fc6;background-color: #fefded;padding: 0;text-indent: 10px;line-height: 34px;margin: 10px 0;">该收藏仅在本设备暂时保存，若需永久保存并同步请<a style="display: inline" _target="blank" href="'+loginUrl+'">登录</a>。</li>';
                var arr = data.val,html='<li class="t">最近加入的房子</li>'+loginStr;
                countDom.html(countDom.html().replace(/\d+/,data.num.num));
                for(var i=0,len=arr.length;i<len;i++){
                    if(arr[i].is_invalid){
                        str ='<li style="padding: 0;cursor: default">'+
                            '<span style="color: #999;padding: 0;line-height: 34px;">本房源已失效，您可以从列表中删除</span>'+
                            '<div class="li_r" style="top:0" ><a style="line-height: 34px;" onclick="return false;" href="javascript:void(0)" data-cids="'+arr[i].id+'">删除</a></div></li>';
                        html=html+str;
                        continue;
                    }
                    str = '<li><a href="'+arr[i].link+'" class="li_a"><img src="'+arr[i].image+'" alt=""/></a>'+
                        '<div class="li_c"><a href="'+arr[i].link+'">['+arr[i].category+']'+arr[i].title+'</a><div>'+arr[i].info+'</div></div>'+
                        '<div class="li_r"><em>'+arr[i].price+'</em><a onclick="return false;" href="javascript:void(0)" data-cids="'+arr[i].id+'">删除</a></div></li>';
                    html=html+str;
                }
                var count = J.g("login_r").s(".my").eq(0).html().match(/\d+/)[0];
                html = html + '<li class="nav_count">收藏夹里共有'+count+'个收藏</li><li style="padding-top: 0px!important;padding-bottom: 3px!important;"><a class="li_btn" href="'+ J.g('login_r').s("a").eq(0).attr("href")+'">查看全部收藏</a></li>';
                content.html(html);
                var lis =content.s("li");
                lis.each(function(k,v){
                    if(!k||k==lis.length-1 || k==lis.length-2){
                        return;
                    }
                    v.on('mouseenter',function(){
                        v.addClass("active");
                    });
                    v.on('mouseleave',function(){
                        v.removeClass("active");
                    });
                    v.on('click',function(){
                        J.site.trackEvent('navigation_favorite_everydata');
                        location.href= v.s("a").eq(0).attr("href");
                    });
                    v.s("a").each(function(k,v){
                        v.on('click',function(e){
                            if(e&& e.stopPropagation){ e.stopPropagation()}else{
                                window.event.cancelBubble = true;
                            }
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

    ;(function(){}.require([''], 'ui.login', true));

    J.ui.login = LoginPanel;
})(J, document);
