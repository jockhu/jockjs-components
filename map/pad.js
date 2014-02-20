;
/// require('map.Core');
(function(){
   function pad(opption){
       var defOpts ={
//           url:'http://sh.lunjiang.zu.dev.anjuke.com/newmap/search2',
               url:'http://sh.release.lunjiang.dev.anjuke.com/newmap/search2',

               id: "jmap_fill",
           lat: "31.230246775887",
           lng: "121.48246298372",
           mark: 0,
           zoom: 12,
           ezoom: 1,
           minz: 11,//最小缩放等级
           maxz: 18,//最大缩放等级
           onBeforeRequest:beforeRequest,
           onResult:onResult,
           onItemBuild:onItemBuild,
           target:document
       },opts,map,
           elm,
           CACHE= {},
           listContainer;
       function init(){
           opts = J.mix(defOpts,opption);
           var listId,//列表id
               containerId;//地图容器ｉｄ
           listId = 'p_filter_result',
               containerId=opts.id;
           buildContainer(containerId);
           buildList(listId);
           map =  J.map.core(opts);
           bindEvent();
       }
       init();
       function bindEvent(){
           J.on(window,'resize',function(){
               buildContainer();
               buildList();
           });
           /**
            * overlay click event
            */
           J.on(opts.target,map.eventType.overlay.click,function(event){
               var data = event.data;
               if(data.zoom == 12 || data.zoom == 11){
                   map.setCenter(data.lng,data.lat,14);
               }
           });
       }
       function beforeRequest(data){
           //points.swlat + "," + points.nelat + "," + points.swlng + "," + points.nelng;
           var ret =J.mix(data,{
               model:1,
               order:null,
               p:1,
               bounds:data.swlat + "," + data.nelat + "," + data.swlng + "," + data.nelng
           });
           if(ret.zoom == 14){
              ret.model = 2;
           }
           return ret;
       }
       function onResult(data){
           buildListItem(data&&data.props&&data.props.list);
           if(data.zoaom == 14){
              if(data.comms.alength>25){
                   data.comms.length= 25;
               }
               return data.comms;
           }
           return data.groups;
       }
       function onItemBuild(item){
           if(item.zoom == 14){
             //  item.htuml
               ituem.html='<div class=u"OverlayB"><b>'+item.propCount+'套｜</b>'+item.truncateName+'<span class="tip"></span></div>';
               return
           }
           item.x=-37.5;
           item.y=-37.5;
           item.html = '<div class="OverlayCom OverlayA"><b>'+item.areaName+'</b><br/><p>'+item.propCount+'</p></div>';
       }
       function buildListItem(data){
           if(!data||!data.length){
               return false;
           }
            var html = [],tmp='';
           J.each(data,function(k,t){
               tmp = '<li class="">' +
                   '<a href="'+t['prop_url']+'" class="pi_a_img" title="'+t['img_title']+'" alt="'+t['img_title']+'" target="_blank">'+
                   '<img height="100" width="133" id="prop_2_a"  alt="'+t['img_title']+'" src="'+t['img_url']+'">'+
                   '</a>'+
                   '<div class="pi_info">'+
                   '<a data-soj="'+t["soj"]+'" href="'+t["prop_url"]+'" target="_blank">'+t["title"]+'</a>'+
                   '<div class="pi_address"><span>'+t['community_name']+'</span></div>'+
                   '<div class="pi_basic"><span>'+t['room_num']+'室'+t['hall_num']+'厅'+"</span></div>"+
                   '<div class="pi_sub"><span class="pi_s_price">'+t['price']+'</span>元/月</div></li>';
               html.push(tmp);
           })
           J.g("p_list").html(html.join(''));
       }

       /**
        * js动态添加ｃｏｎｔａｉｎｅｒ
        */
       function buildContainer(id){
           if(!elm){
               elm =J.create('div',{
                   id:id
               }).appendTo(J.g("pad_view"));
           }
           elm.setStyle({
              width:'100%',
              height:'100%'

          });
          // buildProgress();

           return elm;
       }


      /* function buildProgress(){
           var progress =J.create('div',{
                   id:'progrss'
               }).appendTo(J.g("pad_view"));
           progress.setStyle({
               width:'100%',
               height:'100%',
               zIndex:'1'

           });
           var html ='<div class="pace pace-active"><div class="pace-progress" data-progress="50" data-progress-text="50%" style="width: 50%;"><div class="pace-progress-inner"></div></div><div class="pace-activity"></div></div>';
           progress.html(html);
       }*/

       /**
        * 计算列表高度
        */
       function buildList(id){
           var pageHeight,listHeight;
           pageHeight= J.page.viewHeight();
           listHeight = pageHeight - J.g("filter_condition").height()- J.g("p_header").height()- J.g('propBarLeft').height()- J.g("listPager").height();
           listContainer = !listContainer ? J.g(id) :listContainer;
           listContainer.setStyle({
               height:listHeight+'px'
           })
       }





   }
    pad();
})();