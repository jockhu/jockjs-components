
/// require('map.Core');
/// require('map.list');
/// require('map.Search');

;(function(){
   function pad(){
       var opts ={
           url:'/newmap/search2',
       //   url:'http://sh.release.lunjiang.dev.anjuke.com/newmap/search2',
          // url:'http://test.lunjiang.dev.aifang.com/map/index.php',
           id: "jmap_fill",
           lat:J.g("p_filter_result").attr("data-lat"),
           lng:J.g("p_filter_result").attr("data-lng"),
           mark: 0,
           zoom: 12,
           ezoom: 1,
           minz: 11,//最小缩放等级
           maxz: 18,//最大缩放等级
           onBeforeRequest:beforeRequest,
           onResult:null,
           onItemBuild:null,
           target:document,
           className:'',
           classHover:'hover',
           zoomEnd:zoomEnd,
           moveEnd:moveEnd,
           moveLengthChange:50,//移动的距离小于自定义距离，不去取数据
           scrollBottom:5//离底部多少像素后马上加载

           },
           map,
           preClickedOverlay,
           preClickedItem,
           moveEndTimer,
           elm,
           zoomPrev,
           preCommid,//用于单个小区点击
           CACHE= {},
           listContainer,
           currentPage= 1,
           D,
           data={
               model:1,//除区域外都是模式１
               p:1,//页码
               commids:'',//上一页的小区
               commid:0,
               zoom:12,
               bounds:''
           },
           comms_ids,wait =false,//点击下一页把现在展展的列表小区带过去
           zoneCache,//区域缓存
           progress,
           search,
           nextPageTimer;
       function init(){
           var listId,//列表id
               containerId;//地图容器ｉｄ
           listId = 'p_filter_result',
               containerId=opts.id,
           buildContainer(containerId);
           progress = new Progress();
           buildList(listId);
           map =  J.map.core(opts);
           bindEvent();
           new Menu();//菜单筛选
           J.mix(ListCenter,{
               map:map,
               progress:progress,
               opts:map.opts,
               container:J.g("p_list"),
               CommnameContainer:J.g("propBarLeft").s(".comname").eq(0),
               countNum: J.g("propBarLeft").s("b").eq(0)
           })
           ListCenter.getRankData();
           search = new J.map.search();
           window.afterSelect= search.afterSelect;
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
               if(data.zoom <13){
                   map.setCenter(data.lng,data.lat,14);
                    return
               }
               toggleClassOver(data.target,preClickedOverlay);
               ListCenter.getCommData(data.commid,data.commname);
               //计录小区id,用来翻页
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
           //价格排序
           J.g("sort_by_price_link").on('click',function(){
               var target =J.g(this);
               target.get().className="";
               switch (ListCenter.data.px){
                   case 0:
                       target.addClass("up");
                       ListCenter.data.px = 1;
                       J.g("sort_by_time_link").removeClass("def");
                       break;
                   case 1:
                       target.addClass("down");
                       ListCenter.data.px = 2;
                       J.g("sort_by_time_link").removeClass("def");
                       break;
                   case 2:
                       target.get().className="";
                       ListCenter.data.px = 0;
                       J.g("sort_by_time_link").addClass("def");
                       break;
               }

               ListCenter.getSortData();
           });

           //最新排序
           J.g("sort_by_time_link").on('click',function(){
                ListCenter.data.px = 0;
               J.g("sort_by_price_link").get().className='';
               ListCenter.data.px = 0;
               ListCenter.getSortData();
           });


       }





       /**
        * 如果缩放等级为１１　或１２不去取数据
        * @param e
        * @return {Boolean}
        */
       function zoomEnd(e){
           ListCenter.data.commids='';
           ListCenter.data.commid = '';
           var zoom = map.getZoom();
           if(zoom >12){
               ListCenter.getZoneData();
               return true;
           }
           ListCenter.getRankData();
       }

       function moveEnd(e){
           console.log(e);
           if(map.getZoom()>12&& e.moveLenth>opts.moveLengthChange){
               moveEndTimer&&clearTimeout(moveEndTimer);
               moveEndTimer=setTimeout( function(){
                   ListCenter.getZoneData.call(ListCenter);
               },700);
           }
       }

       /**
        * １.上一页所记录的comdms_ids
        * 2.所点击的小区
        * ３.当前翻页
        *
        * 地图移动后和缩放级别更改后，需要清空记录条件
        */


       function beforeRequest(data){
           progress.showMapLoading();
           progress.showLoadingTip(J.g('p_select_loading'));
           var ret =J.mix(data,{
               model:1,
               order:null,
               bounds:data.swlat + "," + data.nelat + "," + data.swlng + "," + data.nelng
           });
           if(ret.zoom > 12){
              ret.model = 2;
           }
           return ret;
       }

       function listItemClick(elm){
           var url = '/xiaoqu/jingjiren/'+elm.get().community_id+'/?fromother='+elm.attr("data-id")+'&from=pad_zf_map'+'&fromtype='+elm.attr("data-fromtype");
           window.open(url);
           //J.g(elm).s("a").eq(0).get().click();
            var overlays = map.getCurrentOverlays();
            var code  =elm.attr('data-code');
            var zoom = map.getZoom();
           var key =code+'_'+zoom;

           preClickedItem&&preClickedItem.removeClass("on");
           elm.addClass("on");
           toggleClassOver(overlays[key],preClickedOverlay,true);

           preClickedOverlay= overlays[key];
           preClickedItem = elm;

       }

       /**
        *
        * @param current overlay
        * @param prev overlay
        */
       function toggleClassOver(current,prev,isskip){
           //J.g("p_list").html('');
           prev&&prev.get().first().removeClass("f60bg");
           prev&&prev.onMouseOut();
           current&&current.onMouseOver();
           current&&current.get().first().addClass("f60bg");
           preClickedOverlay = current;
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
           return elm;
       }

       /**
        *
        *
        * @param id
        * @constructor
        */
       function Progress(opption){
           var defOpts = {
               map:null,
               mapTipId:"progress",
               mapTipContainer:'pad_view',
               listTipId:'fresh_list',
               listTipContainer:'listTipContainer',
               loadingSelectTip:'p_select_loading',
               loadingFilterTip:'p_filter_loading'
               },
               mapTip,
               listTip,
               opts;
           opts = J.mix(defOpts,opption || {});
           (function(){
               mapTip = J.g(opts.mapTipId);
               !mapTip&&(mapTip=createContext({id:opts.mapTipId,container:opts.mapTipContainer}));
               listTip = J.g('fresh_list');
               !listTip&&(listTip=createContext({id:opts.mapTipId,container:opts.listTipContainer}));
               bindEvent();
           })();

           function bindEvent(){
               mapTip.on('click',zoomOUt);
               listTip.on('click',zoomOUt);
           }


           function zoomOUt(e){
               //缩小视图
               var target = e.target;
               //关闭事件
               if(target.nodeName.toUpperCase() == 'I'){
                   mapTip.hide();
               }
               if(target.nodeName.toUpperCase() == 'A'){
                   map.zoomOut();
               }
           }

           function createContext(opts){
               return J.create('div', {
                   id:opts.id,
                   className:'map_tip_loading'
               }).setStyle(
                   {
                       display:'none'
                   }
               ).appendTo(J.g('pad_view'));
           }


           function showMapLoading(){
                var html= '<i class="loading_pic"></i>房源加载中...';
               mapTip.removeClass("map_change_zoom");
               mapTip.html(html).show();
           }
           function showMapChangeZoom(){
               var html=
                   '<div class="map_tip" id="map_tip"  unselectable="on" onselectstart="return false;">' +
                       '<div class="map_tip_no_props">' +
                        '<b>您目前的地图范围内没有房源</b>' +
                        '<br>可能是因为您的地图比例尺过大&nbsp;&nbsp;建议您： ' +
                        '<a href="javascript:;" class="zoom_link">缩放地图</a>   ' +
                       ' <i class="iDel">&nbsp;</i>' +
                       '</div>' +
                   '</div>';
               mapTip.addClass("map_change_zoom");
               mapTip.html(html).show();
               setTimeout(function(){
                   mapTip.hide();
                   hideLoadingTip(J.g(opts.loadingSelectTip));//隐藏好房马上来提示
               },3000)
           }
           function showMapChangePosition(){
               mapTip.hide();
               hideLoadingTip(J.g(opts.loadingSelectTip));//隐藏好房马上来提示
               hideLoadingTip(J.g(opts.loadingFilterTip));//隐藏列表更多房源正在加载中提示
               return;
               var html=
                   '<div class="map_tip" id="map_tip"  unselectable="on" onselectstart="return false;">' +
                       '<div class="map_tip_no_props">' +
                       '<b>您目前的地图范围内没有房源</b>' +
                       '<br>可能是因为您的地图比例尺过大&nbsp;&nbsp;建议您： ' +
                       '<a href="javascript:;" class="zoom_link">缩放地图</a>   ' +
                       ' <i class="iDel">&nbsp;</i>' +
                       '</div>' +
                       '</div>';
               mapTip.addClass("map_change_zoom");
               mapTip.html(html).show();
           }

           function showListChangePosition(){
                var html ='<b>地图范围内没有符合您要求的房源。</b>'+
                           '<div>建议您：</div>'+
                           '<ul>'+
                               '<li>调整筛选条件；</li>'+
                               '<li>拖动地图更改位置。</li>'+
                           '</ul>'
               listTip.html(html).show();
               hideLoadingTip(J.g(opts.loadingFilterTip));//隐藏列表更多房源正在加载中提示
           }
           function showListChangeZoom(){
                var html='<b>地图范围内没有符合您要求的房源。</b>'+
                   '<p>可能是因为您的地图比例较过大</p>'+
                   '<div>'+
                       '<span>建议您：</span><a href="###" onclick="return false">缩放地图</a>'+
                   '</div>';
               listTip.html(html).show();
               hideLoadingTip(J.g(opts.loadingFilterTip));//隐藏列表更多房源正在加载中提示
           }
           //显示“房源加载中”提示
           function showLoadingTip(obj){
               obj && obj.show();
           }
           //隐藏“房源加载中”提示
           function hideLoadingTip(obj){
               obj && obj.hide();
           }
           /**
            * 具体显示什么由progress确定
            */
           function handler(data){
              var listLen = data.props.list.length;
              var commLen = (data.groups||data.comms).length;
              var zoom = map.getZoom();
              //地图小区数量为０
              if(data.curPage==1&&!commLen){
                  zoom>14?showMapChangeZoom():showMapChangePosition();
              }else{
                  mapTip.hide();
                  hideLoadingTip(J.g(opts.loadingSelectTip));//隐藏好房马上来提示
                  hideLoadingTip(J.g(opts.loadingFilterTip));//隐藏列表更多房源正在加载中提示
              }
               //列表数据为空
              if(data.curPage==1&&!listLen){
                  zoom>14?showListChangeZoom():showListChangePosition()
              }else{
                  listTip.hide();
                  hideLoadingTip(J.g(opts.loadingSelectTip));//隐藏好房马上来提示
              }

           }
           function hideMap(){

           }
           function hideList(){

           }
           return {
               showMapLoading:showMapLoading,
               showMapChangeZoom:showMapChangeZoom,
               showLoadingTip:showLoadingTip,
               hideLoadingTip:hideLoadingTip,
               handler:handler
           }




       }
       /**
        * 计算列表高度
        */
       function buildList(id,nexpage){
           var pageHeight,listHeight;
           if(!nexpage){
               J.g("listPager").setStyle({
                   display:'none'
               })
           }
           pageHeight= J.page.viewHeight();
           listHeight = pageHeight - J.g("filter_condition").height()- J.g("p_header").height()- J.g('propBarLeft').height();
           listContainer = !listContainer ? J.g(id) :listContainer;
           listContainer.setStyle({
               height:listHeight+'px'
           })
           listContainer.on('scroll',function(){
               progress.showLoadingTip(J.g('p_filter_loading')); //显示loading提示
               var lis = document.getElementById("p_list");
               if(this.clientHeight+this.scrollTop >= this.scrollHeight){
                   //把上一　次点击的区域选中状态清掉
                   nextPageTimer&&clearTimeout(nextPageTimer);
                   nextPageTimer = setTimeout(function(){
                       ListCenter.getNextPageData();
                   },500);
                   setTimeout(function(){
                       progress.hideLoadingTip(J.g('p_filter_loading'));
                   },0);
               }

           });
       }

       /**
        * 菜单操作事件
        */


       function Menu(){
           var MenuData = {
               areaid:'',
               blockid:'',
               price:'',
               room:''
           }
           var categorys = J.s('.category');
           var zone = categorys.eq(0).first();
           var price = categorys.eq(1).first();
           var room = categorys.eq(2).first();

           var preTarget =null;

           J.on(document,'select:selectedChange',function(e){
               var target = e.data.target;
               var areaid = target.attr("areaid");
               var blockid= target.attr("blockid");
               var price = target.attr("price");
               var room = target.attr('room');

               var name = target.html().replace('　√','');
               var p = {
                   lng:target.attr("mapx"),
                   lat:target.attr("mapy"),
                   className:'areaMarkerMain',
                   x:-18,
                   y:-46,
                   html:'<div><p>'+target.attr("typename")+'</p><i class="areaMarker"></i></div>'
               }
               if(areaid === '' && blockid==='' ){
                    MenuData.areaid = areaid;
                   ListCenter.data = J.mix(ListCenter.data,MenuData);
                   map.setCenter(opts.lng,opts.lat,12);
                   setZone(target.attr("typename"));

               }
               if(areaid !=='' && blockid !== null){
                   MenuData.blockid = blockid;
                   setZone(target.attr("typename"));
                   //是板块
                   if(blockid !== ''){
                       ListCenter.data = J.mix(ListCenter.data,MenuData);
                       map.setCenter(p.lng, p.lat,16);
                       map.addOverlay(p,'zoneMarker');

                   }
                   else
                   {
                       ListCenter.data = J.mix(ListCenter.data,MenuData);
                       map.setCenter(p.lng, p.lat,14);
                       map.addOverlay(p,'zoneMarker');
                   }

               }
               if(price !== null){
                   MenuData.price = price;
                   ListCenter.data = J.mix(ListCenter.data,MenuData);
                   setPrice(name);
                   ListCenter.getFilterData(MenuData);


               }
               if(room !== null){
                   MenuData.room = room;
                   ListCenter.data = J.mix(ListCenter.data,MenuData);
                   setRoom(name);
                   ListCenter.getFilterData(MenuData);

               }
               repaceHtml(target);
              // ListCenter.getFilterData(MenuData);

           })

           function getData(){
               return MenuData;
           }

           function setZone(data){
               zone.html(data||'区域不限');
           }
           function setPrice(data){
                price.html(data);
           }
           function setRoom(data){
                room.html(data);
           }

           function repaceHtml(target){
               var html = target.html();
               html = html + (html.indexOf('　√')>-1 ?'':'　√')
               target.html(html);
               preTarget&&preTarget.html(preTarget.html().replace('　√',''));
               preTarget= target;
           }



       }


   }

    pad();
})();