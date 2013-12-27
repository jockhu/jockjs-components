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
            firstpage:4,
            nextpage:10,
            total:100,
            elem:'',
            propId:'',
            cityAlias:J.site.info.cityAlias,
            onComplete:null,
            onShow:null,
            onexposure:null
        }, opts, pageIndex = 0,fetchEnd=false;

        (function () {
            opts = J.mix(defaultOptions, options || {}, true);
            getData();
            bindEvent();
        })();


        function bindEvent() {
            var elem= J.g(opts.elem);
             if(opts.type=='home' || opts.type=='view'){
                 elem&&elem.on('click',function(){
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
                     opts.onComplete && opts.onComplete();
                     setTimeout(function(){
                         if((page_hei-(scroll_top+screen_hei)<100) && fetchEnd){
                             pageAdd();
                         }
                     },50)
                 };
             }
            function pageAdd(){
                if (opts.type=='home' || opts.type=='list'){
                    if(opts.type=='list'){
                        showLoading();
                    }
                    if (pageIndex<9){
                        pageIndex++;
                    }else{
                        return false;
                    }
                }else{
                    pageIndex++;
                }
                getData();
            }
        }

        function getData() {
            var url = bindUrl(),box=J.g(opts.box);
            J.get({
                url:url,
                timeout: 15000,
                header:{'X-TW-HAR': 'HTML'},
                onSuccess:function(data){
                    if(data!=''){
                        box&&box.show();
                        if(pageIndex==0){
                           showBox(data);
                        }else{
                            showMore(data);
                            if (opts.type=='home' || opts.type=='view'){
                                showLoading();
                            }
                        }
                        fetchEnd=true;
                    }
                },
                onFailure:function(e){
                    if(pageIndex==0){
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

        function bindUrl() {
            var url = '/' + opts.cityAlias + '/' + opts.channel + '/recommend';
            if (opts.type == "list") {
                url += getUrlChar(url)+'from=listpage';
            } else if (opts.type == 'view') {
                url += '/' + opts.propId;
            }
            if (pageIndex > 0){
                if(opts.type == 'view'){
                    url += getUrlChar(url)+'change=' + pageIndex;
                }else{
                    url += getUrlChar(url)+'page=' + pageIndex;
                }
            }
            return url;
        }

        function getUrlChar(url){
            return url.indexOf('?') != -1 ? '&' : '?';
        }

        function showBox(data) {
            if(opts.type=='list'){
                var div= J.create('div'),cont= J.g(opts.cont);;
                div.html(data).appendTo(opts.cont);
                opts.onexposure&&opts.onexposure(cont);
            }else{
                J.g(opts.cont).html(data);
            }
            opts.total=J.g(opts.cont).s('a').eq(0).attr('count');
            opts.onShow&&opts.onShow();//异步加载图片
            showInfor();

        }

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

        function showMore(data) {
            var cont= J.g(opts.cont);
            if(opts.type=='home'){
                var div =J.g(opts.cont),divHtml= div.html();
                div.html(divHtml+data);
            }
            else if(opts.type=='list'){
                var div= J.create('div');
                div.html(data).appendTo(opts.cont);
            }else if(opts.type=='view'){
                showBox(data);
            }
            opts.onShow&&opts.onShow();
            opts.onexposure&&opts.onexposure(cont);
        }

        function showLoading() {
            if(opts.type=='home'){
                var elem=J.g(opts.elem),elem_text=elem.s('span').eq(0),x;
                if(opts.total%10 == 0 && opts.total > 10){
                    x = opts.total/10;
                }else if(opts.total%10 == 0 && opts.total <= 10) {
                    x = 0;
                }
                else{
                    x = parseInt(opts.total/10) + 1;
                }
                if(pageIndex <= x){
                    elem_text.removeClass('loading').html('更多推荐');
                }else if(l > x){
                    elem.hide();
                }
                if(pageIndex==9){
                    elem.hide();
                }
            }
            if(opts.type=='list'){
               var elem=J.g(opts.elem);
               if(pageIndex<9){
                   elem.show();
                   fetchEnd=false
               }else{
                   fetchEnd=true;
                   elem.hide();
                   elem.prev().show();
               }
            }
        }

        return {
            showBox: showBox,
            showMore: showMore
        };
    }

    J.ui.recommend =Recommend ;

})(J)