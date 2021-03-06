/**
 * Aifang Javascript Framework.
 * Copyright 2013 ANJUKE Inc. All rights reserved.
 *
 * @path: ui/recommend.js
 * @author: QingliPan
 * @version: 1.0.0
 * @date: 2013/11/15
 *
 */

/// require('ui.ui');
/// require('page');
(function (J) {
    function Recommend(options) {
        var defaultOptions = {
            channel:'',
            type:'',
            box:'',
            cont:'',
            requestUrl: "",  //手动传入url
            firstpage:4,
            nextpage:10,
            total:100,
            elem:'',
            propId:'',
            cityAlias:J.site.info.cityAlias,
            onComplete:null,
            onShow:null,//异步加载图片
            onexposure:null,//增加曝光亮
            noDataAction:null//无数据时操作
        }, opts, pageIndex = 1,fetchEnd=false, stopQuest = false, pause = false;

        (function () {
            opts = J.mix(defaultOptions, options || {}, true);
            getData();
            bindEvent();
        })();

        /**
         * 绑定事件
         */
        function bindEvent() {
            var elem= J.g(opts.elem);
             if(opts.type=='home' || opts.type=='view'){
                 elem.length&&elem.on('click',function(){
                     opts.onComplete && opts.onComplete();
                     if(opts.type=='home'){
                         elem.s('span').eq(0).addClass('loading').html('加载中');
                     }
                     pageAdd();
                 });
             }
             if(opts.type=='list'){
                 window.onscroll=function(){
                     var scroll_top = window.pageYOffset;
                     var screen_hei = window.innerHeight;
                     var page_hei = document.body.scrollHeight;
                     setTimeout(function(){
                         if((page_hei-(scroll_top+screen_hei)<100) && fetchEnd){
                            !pause && pageAdd();
                         }
                     },50)
                 };
             }
            /**
             * pageIndex++
             * @return {Boolean}
             */
            function pageAdd(){
                if (opts.type=='home' || opts.type=='list'){
                    if(opts.type=='list'){
                        showLoading();
                    }
                    if (pageIndex<10){
                        pageIndex++;
                    }else{
                        return false;
                    }
                }else{
                    pageIndex++;
                }
                !stopQuest && getData();
            }
        }

        /**
         * 获取数据
         */
        function getData() {
            pause = true;
            var url = bindUrl(),box=J.g(opts.box);
            J.get({
                url:url,
                timeout: 15000,
                header:{'X-TW-HAR': 'HTML'},
                onSuccess:function(data){
                    pause = false;
                    if(data.replace(/\s/ig,"")!==""){
                        if(pageIndex==1){
                           showBox(data, true);
                        }else{
                            showMore(data);
                            if (opts.type=='home'){
                                showLoading();
                            }
                        }
                        fetchEnd=true;
                        box.show();
                        if(opts.requestUrl !== ""){
                            len = box.s("a").length;
                            stopQuest = (pageIndex == 1 && len < 10) || len < (10 + (pageIndex-1)*20) ? true : false;
                        }
                    }else{
                        opts.noDataAction&&opts.noDataAction();
                        stopQuest = true;
                    }
                    if(stopQuest && J.site.info.pageName!="Anjuke_Prop_View"){
                        J.g(opts.elem).hide();
                    }
                },
                onFailure:function(e){
                    if(pageIndex==1){
                        J.logger.log(e);
                    }else{
                        if(opts.type=='home'){
                            var recomm_more= J.g(opts.elem).s('span').eq(0)
                            recomm_more.html('加载失败');
                            setTimeout(function(){
                                recomm_more.html('更多推荐');
                            },2000);
                        }
                    }

                }
            })

        }

        /**
         * 请求URL地址
         * @return {String}
         */
        function bindUrl() {
            var url = '/' + opts.cityAlias + '/' + opts.channel + '/recommend';
            if (opts.type == "list") {
                url += getUrlChar(url)+'from=listpage';
            } else if (opts.type == 'view') {
                url += '/' + opts.propId;
            }
            if (pageIndex > 1){
                if(opts.type == 'view'){
                    url += getUrlChar(url)+'change=' + pageIndex;
                }else{
                    url += getUrlChar(url)+'page=' + pageIndex;
                }
            }
            var rent_flow = document.getElementsByTagName( "head" )[0].getAttribute('data-flow');
            var flow = "";
            if (rent_flow=="new") {
                if (url.indexOf("?")!=-1) {
                    flow = "&flow=new";
                } else {
                    flow = "/?flow=new";
                }
                url += flow;
            }
            if(opts.requestUrl !== "") {
                url = opts.requestUrl + "&page=" + pageIndex;
            }
            return url;
        }

        /**
         * URL匹配
         * @param url
         * @return {String}
         */
        function getUrlChar(url){
            return url.indexOf('?') != -1 ? '&' : '?';
        }

        /**
         * 第一次数据请求成功，并渲染到容器里。
         * @param data
         * @param isExp -- by lyj
         */
        function showBox(data, isExp) {
            var div= J.create('div'),cont= J.g(opts.cont);
            if(opts.type=='list'){
                div.html(data).appendTo(opts.cont);
            }else{
                cont.html(data);
            }
            if (isExp) {
                opts.onexposure&&opts.onexposure(cont);
            }
            opts.total=J.g(opts.cont).s('a').eq(0).attr('count');
            opts.onShow&&opts.onShow();
            showInfor();

        }

        /**
         *第一次请求成功时的提示交互。
         */
        function showInfor() {
          if(opts.type=='home'||opts.type=='view'){
              var elem=J.g(opts.elem);
              if(opts.total>opts.firstpage){
                  elem&&elem.show();
              }else{
                  elem&&elem.hide();
              }
          }
          if(opts.type=='view'){//单页是否显示查看更多推荐
              var cont=J.g(opts.cont);
              if(opts.total>=5){
                  cont.next().show();
              }else{
                  cont.next().hide();
              }
          }
        }

        /**
         * 第N+1次数据请求成功，并渲染到容器里。
         * @param data
         */
        function showMore(data) {
            var cont= J.g(opts.cont);
            if(opts.type=='home'){
                var div =J.g(opts.cont),divHtml= div.html(),i;
                div.html(divHtml+data);
                i=pageIndex*10-16;
                opts.total=J.g(opts.cont).s('a').eq(i).attr('count');
            }
            else if(opts.type=='list'){
                var div= J.create('div'),i;
                div.html(data).appendTo(opts.cont);
                i=pageIndex*10-12;
                opts.total=J.g(opts.cont).s('a').eq(i).attr('count');
            }else if(opts.type=='view'){
                showBox(data, false);
            }
            opts.onShow&&opts.onShow();
            opts.onexposure&&opts.onexposure(cont);
        }

        /**
         * 第N+1次数据请求成功时的交互状态。
         */
        function showLoading() {
            var x;
            if(opts.total%10 == 0 && opts.total > 10){
                x = opts.total/10;
            }else if(opts.total%10 == 0 && opts.total <= 10) {
                x = 0;
            }
            else{
                x = parseInt(opts.total/10) + 1;
            }
            if(opts.type=='home'){
                var elem=J.g(opts.elem),elem_text=elem.s('span').eq(0);
                if(pageIndex < x){
                    elem_text.removeClass('loading').html('更多推荐<i class="icon-m">&#xe602;</i>');
                }else if(pageIndex >= x){
                    elem.hide();
                }
            }
            if(opts.type=='list'){
               var elem=J.g(opts.elem);
               if(pageIndex<x){
                   elem.show();
                   fetchEnd=true;
               }else if(pageIndex >= x){
                   fetchEnd=false;
                   elem.hide();
                   elem.prev().show();
               }
            }
            if(pageIndex==10){
                elem.hide();
            }
        }

        return {
            showBox: showBox,
            showMore: showMore
        };
    }

    J.ui.recommend =Recommend ;

})(J)