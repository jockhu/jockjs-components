;
/// require('map.Core');
(function(){
   function pad(opption){
       var defOpts ={
           url:'http://sh.lunjiang.zu.dev.anjuke.com/newmap/search2',
       //   url:'http://sh.release.lunjiang.dev.anjuke.com/newmap/search2',
          // url:'http://test.lunjiang.dev.aifang.com/map/index.php',
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
           target:document,
           className:'',
           classHover:'hover',
           zoomEnd:zoomEnd,
           moveEnd:moveEnd,
           moveLengthChange:50//移动的距离小于自定义距离，不去取数据


           },opts,map,preClickedOverlay,preClickedItem,
           elm,
           CACHE= {},
           listContainer,
           currentPage= 1,
           comms_ids,//点击下一页把现在展展的列表小区带过去
           zoneCache;//区域缓存
       function init(){
           opts = J.mix(defOpts,opption);
           var listId,//列表id
               containerId;//地图容器ｉｄ
           listId = 'p_filter_result',
               containerId=opts.id;

           buildContainer(containerId);
           buildProgress();
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
                   map.getData();
                    return
               }
               map.getData({
                   commid:data.commid
               },true);


           });
           /**
            * 列表点击事件
            */
           J.g('p_list').on('click',function(e){
               var target = e.target;
               while(target.tagName.toLocaleLowerCase() !== 'li'){
                    target = target.parentNode;
               }
               listItemClick(J.g(target));
           })
           /**
            * 翻页事件
            */
           J.g("nextPage").on('click',function(){
               var data = {};
               //把上一　次点击的区域选中状态清掉
               preClickedOverlay&&preClickedOverlay.onMouseOut();

               data.p = ++currentPage;
               if(map.getZoom()>12){
                   data.commsids = comms_ids;
               }
               map.getData(data,true);

           });


       }
       function lockHandler(){
           var data = event.data;
           if(data.zoom == 12 || data.zoom == 11){
               map.setCenter(data.lng,data.lat,14);
           }
       }

       /**
        * 如果缩放等级为１１　或１２不去取数据
        * @param e
        * @return {Boolean}
        */
       function zoomEnd(e){
           currentPage = 1;
           var zoom = map.getZoom();
           if(zoom >12){
             return true;
           }
           map.addOverLays(zoneCache);

       }
       function moveEnd(e){
           currentPage = 1;//移动后翻页归为１，默认为第一页
           comms_ids = null;
            if(map.getZoom() >12 && e.moveLenth > opts.moveLengthChange){
                map.getData();
                return;
            }


       }

       function beforeRequest(data){
           //points.swlat + "," + points.nelat + "," + points.swlng + "," + points.nelng;
           var ret =J.mix(data,{
               model:1,
               order:null,
               bounds:data.swlat + "," + data.nelat + "," + data.swlng + "," + data.nelng
           });
           if(ret.zoom == 14){
              ret.model = 2;
           }
           return ret;
       }

       function listItemClick(elm){

            var overlays = map.getCurrentOverlays();
            var code  =elm.attr('data-code');
            var zoom = map.getZoom();
           var key =code+'_'+zoom;
           preClickedOverlay&&preClickedOverlay.onMouseOut();
           preClickedItem&&preClickedItem.removeClass("on");
           elm.addClass("on");
           overlays[key]&&overlays[key].onMouseOver();
           preClickedOverlay= overlays[key];
           preClickedItem = elm;

       }


       function onResult(data){
           if(Object.prototype.toString.call(data)== '[object Array]'){
               return data;
           }
           buildListItem(data&&data.props&&data.props.list);
           //修改翻页
           buildNextPage(data.curPage,data.propNum);
           if(data.zoom >12 ){
               comms_ids = data.props.commids;
               return  data.comms&&data.comms.length?data.comms : false;
           }
            if(!zoneCache){
                zoneCache = data.groups;
            }
            return zoneCache;
       }

       /**
        * reutrn the overlay html
        * @param item
        */
       function onItemBuild(item){
           if(item.zoom > 12){
             //  item.htuml
               item.x=-8;
               item.y=-45;
               item.key = item.commid+'_'+item.zoom;
               item.html='<div class="OverlayB"><b>'+item.propCount+'套｜</b>'+item.commname+'<span class="tip"></span></div>';
               item.onClick= function(){
               }
               return
           }
           if(!item.propCount){
               return false;
           }
           item.key = item.id+'_'+item.zoom;
           item.x=-37.5;
           item.y=-37.5;
           item.html =item.propCount ? '<div class="OverlayA"><div class="circle"></div><div class="txt"><b>'+item.areaName+'</b><br/><p>'+item.propCount+'</p></div></div>':false;
       }
       function buildListItem(data){
           if(!data){
               return false;
           }
            var html = [],tmp='',key = map.getZoom()>12? 'community_id':'area_id';
           J.each(data,function(k,t){
               tmp = '<li data-code="'+t[key]+'" class="">' +
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

//       function overLayClick(data){
//           map.getData({
//               commid:this.p.commid
//           });
//       }

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


       function buildProgress(){
           var progress =J.create('div',{
                   id:'progrss',
                   className:'map_tip_loading'
               }).appendTo(J.g("pad_view"));
           var html ='<i class="loading_pic"></i>房源加载中...';
           progress.html(html);
       }

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


       /**
        * 翻页ｈｔｍｌ
        * currentPage 当前页码
        * countNumber 总共房源套数
        */
       function buildNextPage(currentPage,countNumber){
           var args = Array.prototype.slice.call(arguments,0);
           var page = J.g("listPager").s(".sp_curr").eq(0);
           var str =page.html().replace(/\d+/g,function(){
               return args.shift();
           })
           var top = J.g('propBarLeft');
           top.html(top.html().replace(/\d+/g,function(){
               return countNumber;
           }));
           page.html(str);
       }







   }
    pad();
})();