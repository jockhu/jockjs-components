/*业务层调用*/
/*var tui=new J.ui.recommend({
    elem:'recMore',
    box:'recContent',
    type:'home',
    showbox:function(){
        T.lazyload();
    },
 onComplete:function(){
    //发送soj
 }
})*/
/**/

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
            inforEle:'',
            cityAlias:J.site.info.cityAlias,
            onComplete:null,
            onShow:null
        }, opts, pageIndex = 0,fetchEnd=false;

        (function () {
            opts = J.mix(defaultOptions, options || {}, true);
            getData();
        })();


        function bindEvent() {
             if(opts.type=='home' || opts.type=='view'){
                 J.g(opts.elem).on('click',function(){
                     opts.onComplete && opts.onComplete();
                     if(opts.type=='home'){
                         J.g(opts.elem).s('span').eq(0).addClass('loading').html('加载中');
                     }
                     if (pageIndex<9){
                         pageIndex++;
                     }else{
                         return;
                     }
                     getData();
                 });
             }
             if(opts.type=='list'){
                 window.onscroll=function(){
                     if (pageIndex<10) pageIndex++;
                     getData();
                 };
             }
        }

        function getData() {
            var url = bindUrl();
            J.get({
                url:url,
                timeout: 15000,
                header:{'X-TW-HAR': 'HTML'},
                onSuccess:function(data){
                    if(J.g(opts.box).getStyle('display')=='none'){
                        J.g(opts.box).setStyle({'display':'block'});
                    }
                    if(data!=''){
                        if(pageIndex==0){
                            showBox(data);
                            if(opts.total>opts.firstpage){
                                bindEvent();
                                J.g(opts.elem).show();
                            }else{
                                J.g(opts.elem).hide();
                            }
                        }else{
                            showMore(data);
                            showLoading();
                        }

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
            if (pageIndex > 0) {
                url += getUrlChar(url)+'page=' + pageIndex;
            }
            return url;
        }

        function getUrlChar(url){
            return url.indexOf('?') != -1 ? '&' : '?';
        }

        function showBox(data) {

            J.g(opts.cont).html(data);
            opts.onShow&&opts.onShow();
            showInfor();

        }

        function showInfor() {
          if(opts.type=='home'||opts.type=='view'){
              if(opts.total>opts.firstpage){
                  J.g(opts.elem).show();
              }else{
                  J.g(opts.elem).hide();
              }
              if(pageIndex==9){
                  J.g(opts.elem).hide();
              }
          }
        }

        function showMore(data) {
            if(opts.type=='home' || opts.type=='list'){
                var div= J.create('div');
                div.html(data).appendTo(opts.cont);
            }else if(opts.type=='view'){
                showBox(data);
            }
            opts.onShow&&opts.onShow();
            showInfor();
        }

        function showLoading() {
            if(opts.type=='home'){
                var recomm_more=J.g(opts.elem),recomm_text=recomm_more.s('span').eq(0),temp= J.g(opts.cont).s('.Ra'),x;
                temp.each(function(i,v){
                    var t= v.attr('href');
                    if(!t.match(/show=1/)){
                        v.attr('href',t+'&show=1');
                    }
                });

                if(opts.total%10 == 0 && opts.total > 10){
                    x = opts.total/10;
                }else if(opts.total%10 == 0 && opts.total <= 10) {
                    x = 0;
                }
                else{
                    x = parseInt(opts.total/10) + 1;
                }
                if(pageIndex <= x){
                    recomm_text.removeClass('loading').html('更多推荐');
                }else if(l > x){
                    recomm_more.hide();
                }
            }
            if(opts.type=='list'){
               if(J.g(opts.box).s('.Gb').eq(0).attr('count')<9){
                   J.g('list_lookmore').hide();
               }else{
                   fetchEnd=true;
                   J.g('list_lookmore').show();
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