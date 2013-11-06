(function (J) {
    function Recommend(options) {
        var defaultOptions = {
            channel:'',
            type:'',
            box:'',
            lazyLoad:'',
            firstpage:4,
            nextpage:10,
            total:'',
            elem:'',
            propId:'',
            inforEle:'',
            cityAlias:''
        }, opts, pageIndex = 0;

        (function () {
            opts = J.mix(defaultOptions, options || {}, true);
            getData();
            bindEvent();
        })();


        function bindEvent() {

            function replaceMore() {
                J.g(opts.elem).on('click',function(){
                    getData();
                    pageIndex++;
                })
            }
            replaceMore();

            function posMore() {
                window.onscroll=function(){
                    getData();
                    pageIndex++;
                }

            }
            posMore();

            function loadMore() {
                J.g(opts.elem).on('click',function(){
                    getData();
                    pageIndex++;
                })

            }
            loadMore();

        }


        function getData() {
            var url = bindUrl();
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
                        }else{
                            showMore(data);
                            showLoading();
                        }

                    }
                },
                onFailure:function(e){
                    J.logger.log(e);
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
            if(opts.total>100){
                opts.total==100;
            }

        }

        function showMore(data) {
            if(opts.type=='home' || opts.type=='list'){
                var div= J.create('div');
                div.html(data).appendTo(opts.box);
            }else if(opts.type=='view'){
                showBox(data);
            }


        }

        function showLoading() {
            if(opts.type=='home'){
                var temp= J.g(opts.box.s('.Gb'));
                temp.each(function(i,v){
                    var t= v.attr('href');
                    if(!t.match(/show=1/)) v.attr('href',t+'&show=1');
                })
            }
            if(opts.type!='view'){

            }

        }

        function onComplete() {

        }
    }


})(J)