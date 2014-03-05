/**
 * Created with JetBrains PhpStorm.
 * User: kathleen
 * Date: 14-3-5
 * Time: 下午6:39
 * To change this template use File | Settings | File Templates.
 */
var dataCenter = {
    url:'/newmap/search2',
    container: J.g("p_list"),
    data:{
        model:1,//除区域外都是模式１
        p:1,//页码
        commids:'',//上一页的小区
        commid:0,
        zoom:12,
        bounds:''
    },
    //获得rank排序的数据
    getRankData:function(){
        this.data.model =1;
        this.sendAjax(this.onResultRandData);
    },
    //获得单个小区的数据
    getCommData:function (commid){
        this.data.model =2;
        this.commid = commid;
        this.sendAjax(this.onResultCommData);

    },
    //获得下一页的数据
    getNextPageData:function (){
        this.data.model =2;
        this.data.p++;
        this.sendAjax();

    },
    //获得可视区域数据
    getZoneData:function(){
        this.data.model =2;
        this.data.commids = '';
        this.data.commid='';
        this.sendAjax(this.onResultZoneData);
    },

    sendAjax:function(fn){
        var me = this;
        J.get({
            url:me.url,
            data:me.data,
            onSuccess:function(data){
                //不是下一页的话要更新状态栏
                if(fn !== me.onResultNextPageData){
                    var commname = !!data.props.iscommid ?data.comms[0].commname:'地图内找到房源';
                    var countNum = data.propNum;
                    me.upDateStatusHtml(commname,countNum);
                }
                fn(data);
            }
        })
    },
    onResultRankData:function(data){
        this.container.html('');

    },
    onResultCommData:function(data){
        this.container.html('');

    },
    onResultNextPageData:function(data){
        var frag = document.createDocumentFragment();
        var start =  this.s("li").length;
        if(!!start){
            var sep = document.createElement("li");
            sep.className="sep";
            sep.innerHTML =  start+ "-"+(start+data.length)+"条";
            frag.appendChild(sep);
        }
        var _container = this.container.get();
        _container.appendChild(frag);
        _container.appendChild(this.onBuildItem(data));
    },
    onResultZoneData:function(data){
        this.container.html('');
    },
    onBuildItem:function(data){
        var frag = document.createDocumentFragment();
        J.each(data,function(k,t){
            var tmp = document.createElement("li");
            tmp.setAttribute("data-code",t[key]);
            var str = '<a href="'+t['prop_url']+'" class="pi_a_img" title="'+t['img_title']+'" alt="'+t['img_title']+'" target="_blank">'+
                '<img height="100" width="133" id="prop_2_a"  alt="'+t['img_title']+'" src="'+t['img_url']+'">'+
                '</a>'+
                '<div class="pi_info">'+
                '<a data-soj="'+t["soj"]+'" href="'+t["prop_url"]+'" target="_blank">'+t["title"]+'</a>'+
                '<div class="pi_address"><span>'+t['community_name']+'</span></div>'+
                '<div class="pi_basic"><span>'+t['room_num']+'室'+t['hall_num']+'厅'+"</span></div></div>"+
                '<div class="pi_sub"><span class="pi_s_price">'+t['price']+'</span>元/月</div>';
            tmp.innerHTML = str;
            frag.appendChild(tmp);
        });
        return frag;
    },
    init:function(){
        this.bindEvent();
    },
    bindEvent:function(){
        var me = this;
        J.g('p_list').on('click',function(e){
            var target = e.target;
            while(target.tagName.toLocaleLowerCase() !== 'li'){
                target = target.parentNode;
            }
            target = J.g(target);
            var overlays = map.getCurrentOverlays();
            var code  =target.attr('data-code');
            var zoom = map.getZoom();
            var key =code+'_'+zoom;
            me.preClickedItem&&me.preClickedItem.removeClass("on");
            target.addClass("on");
            toggleClassOver(overlays[key],me.preClickedOverlay);
            me.preClickedOverlay= overlays[key];
            me.preClickedItem = target;

        })
    },
    upDateStatusHtml:function(commname,countNum){
        this.commnameContainer&&(this.CommnameContainer = J.g("propBarLeft").s(".comname"));
        this.countNum&& (this.CommnameContainer = J.g("propBarLeft").s("b"));
        this.commname.html(commname);
        this.countNum&&this.countNum.html(countNum);
    }

}
