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
            firstpage:4,
            nextpage:10,
            total:'',
            elem:'',
            propId:'',
            inforEle:'',
            cityAlias:'',
            onComplete:null
        }, opts, pageIndex = 0;

        (function () {
            opts = J.mix(defaultOptions, options || {}, true);
            getData();
            bindEvent();
        })();


        function bindEvent() {
             if(opts.type=='home' && opts.type=='view'){
                 J.g(opts.elem).on('click',function(){
                     pageIndex++;
                     getData();
                 });
             }
             if(opts.type='list'){
                 window.onscroll=function(){
                     pageIndex++;
                     getData();
                 };
             }
        }


        function getData() {
            var url = bindUrl(),recomm_more= J.g(opts.elem).s('span').eq(0);
            J.get({
                url:url,
                header:{'X-TW-HAR': 'HTML'},
                onSuccess:function(data){
                    if(J.g(opts.elem).getStyle('display')=='none'){
                        J.g(opts.elem).setStyle({'display':'block'});
                    }
                    if(data!=''){
                        if(pageIndex==0){
                            showBox(data);
                        }else if(opts.total>opts.firstpage){
                            showLoading();
                            showMore(data);
                        }

                    }
                },
                onFailure:function(e){
                    if(pageIndex==0){
                        J.logger.log(e);
                    }else{
                        if(opts.type=='home'){
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
            var url = '/' + cityAlias + '/' + opts.channel + '/recommend';
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
            J.g(opts.box).html(data);
            showInfor();

        }

        function showInfor() {
            if(opts.total>opts.firstpage){
                J.g(opts.elem).show();
            }else{
                J.g(opts.elem).hide();
            }
            if(opts.total=100){

            }

        }

        function showMore(data) {
            if(opts.type=='home' || opts.type=='list'){
                var div= J.create('div');
                div.html(data).appendTo(opts.box);
            }else if(opts.type=='view'){
                showBox(data);
            }
            showInfor();
        }

        function showLoading() {
            if(opts.type=='home'){
                var temp= J.g(opts.box.s('.Gb')),recomm_more= J.g(opts.elem),recomm_text=recomm_more.s('span').eq(0),fetchEnd=false;
                recommText(pageIndex,recomm_text,recomm_more);
                recomm_more.html('加载中').addClass('loading');
                temp.each(function(i,v){
                    var t= v.attr('href');
                    if(!t.match(/show=1/)) v.attr('href',t+'&show=1');
                });
                function recommText(l,j,k){
                    var x;
                    if(recomm_count%10 == 0 && recomm_count > 10){
                        x = recomm_count/10;
                    }else if(recomm_count%10 == 0 && recomm_count <= 10) {
                        x = 0;
                    }
                    else{
                        x = parseInt(recomm_count/10) + 1;
                    }
                    if(l <= x){
                        j.html('更多推荐');
                        j.removeClass('loading');
                    }else if(l > x){
                        k.hide();
                    }

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
            showMore: showMore,
            onComplete:onComplete
        };
    }

    J.ui.recommend =Recommend ;

})(J)