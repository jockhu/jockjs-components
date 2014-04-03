
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
           moveLengthChange:20,//移动的距离小于自定义距离，不去取数据
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
           search = new J.map.search({
               map:map,
               progress:progress,
               callback:map.opts
           });
           ListCenter.search = search;
           J.on(document,'gesturechange',gestureChange());
           function gestureChange(){
               var timer;
               return function(){
                   timer&&clearTimeout(timer);
                   timer=setTimeout(function(){
                       var overlays  = map.getCurrentOverlays();
                       J.each(overlays,function(k,v){
                           //alert(v.get().height())
                           return false;
                       })
                   },500)
               }
           }

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
           J.on(opts.target,map.eventType.overlay.click,function(e){
               search.resetHandler();
               ListCenter.overlayClick(e);
           });

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
               J.g("sort_by_time_link").addClass("def");
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
           ListCenter.overlayInViewPort = false;
           mapChangePosition();
       }


       function moveEnd(e){
               (map.getZoom()>12)&&mapChangePosition();
       }

       function mapChangePosition(){
           moveEndTimer&&clearTimeout(moveEndTimer);
           moveEndTimer=setTimeout( function(){
               map.getZoom()>12?ListCenter.getZoneData():ListCenter.getRankData();
           },200);
       }

       /**
        * １.上一页所记录的comdms_ids
        * 2.所点击的小区
        * ３.当前翻页
        *
        * 地图移动后和缩放级别更改后，需要清空记录条件
        */


       function beforeRequest(data){
           //将单页隐藏掉,临时写法 by zhh
           J.g('pad_view_map') && J.g('pad_view_map').hide();
           J.g('pad_view_map_bg') && J.g('pad_view_map_bg').hide();
           J.g('close_prop_view') && J.g('close_prop_view').hide();

           progress.showMapLoading();
           !ListCenter.overlayInViewPort&&progress.showLoadingTip(J.g('p_select_loading'));
           var ret =J.mix(data,{
               model:1,
               order:null,
               bounds:data.swlat + "," + data.nelat + "," + data.swlng + "," + data.nelng
           });
           delete ret['swlat'];
           delete ret['nelat'];
           delete ret['swlng'];
           delete ret['neln'];

           if(ret.zoom > 12){
              ret.model = 2;
           }
           return ret;
       }

       /**
        *
        * @param current overlay
        * @param prev overlay
        */
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
               lock,
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
               mapTip.on('click',function(e){
                   if(e.target.className.indexOf("btn")>-1){
                       //这是走走搜索
                       search.reset();
                       return;
                   }
                   zoomOUt(e);
               });
               listTip.on('click',zoomOUt);
               ListCenter.init();
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
               if(lock)return;
                var html= '<i class="loading_pic"></i>房源加载中...';
               mapTip.removeClass("map_change_zoom");
               mapTip.html(html).show();
           }
           function showMapChangeZoom(){
               if(lock)return;
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
               if(lock)return;
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
               if(lock)return;
               var html ='<b>地图范围内没有符合您要求的房源。</b>'+
                           '<div>建议您：</div>'+
                           '<ul>'+
                               '<li>调整筛选条件；</li>'+
                               '<li>拖动地图更改位置。</li>'+
                           '</ul>'
               listTip.html(html).show();

           }
           function showListChangeZoom(){
               if(lock)return;
               var html='<b>地图范围内没有符合您要求的房源。</b>'+
                   '<p>可能是因为您的地图比例较过大</p>'+
                   '<div>'+
                       '<span>建议您：</span><a href="###" onclick="return false">缩放地图</a>'+
                   '</div>';
               listTip.html(html).show();
               hideLoadingTip(J.g(opts.loadingFilterTip));//隐藏列表更多房源正在加载中提示
           }

           function showSearchTip(){
               J.g("propBarLeft").hide();
               listTip.html('');
               var commName = J.g("p_search_input").val();
               J.g("p_list").html('');
               var html='<div class="search_blk">'+
                   '<div class="s">没有找到“'+commName+'”小区</div>'+
               '<div class="btn">清空条件重新重找</div>'+
               '<div style="color: #999">建议您 ：</div>'+
               '<ul style="color: #999">'+
               '<li>输入正确的小区或地标名</li>'+
               '<li>直接拖动地图到目标位置</li>'+
               '</ul>'+
               '</div>';
               listTip.html(html).show();
               hideLoadingTip(J.g(opts.loadingFilterTip));//隐藏列表更多房源正在加载中提示

               html =
                   '<div class="map_tip" id="map_tip"  unselectable="on" onselectstart="return false;">' +
                       '<div class="map_tip_no_props">' +
                       '<b>你搜索的“'+commName+'”没有找到</b>' +
                       '<br>建议您： ' +
                       '<a href="javascript:;" class="btn">清空条件重新查找</a>&nbsp;或拖动地图到目标位置   ' +
                       ' <i class="iDel">&nbsp;</i>' +
                       '</div>' +
                       '</div>';
               mapTip.addClass("map_change_zoom");
               mapTip.html(html).show();


           }


           function hide(){
               listTip.hide();
               mapTip.hide();
           }

           //显示“房源加载中”提示
           function showLoadingTip(obj){
               if(lock)return;
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
              var listLen = data.props.list?data.props.list.length:1;//如果没有ｌｉｓｔ，说明走的搜索
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
          function setLock(isLock){
              lock = !!isLock;
          }

           return {
               showMapLoading:showMapLoading,
               showMapChangeZoom:showMapChangeZoom,
               showLoadingTip:showLoadingTip,
               hideLoadingTip:hideLoadingTip,
               showSearchTip:showSearchTip,
               hide:hide,
               handler:handler,
               setLock:setLock
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
           listContainer.on('scroll',ListCenter.nextPageEvent);
       }

       /**
        * 菜单操作事件
        */


       function Menu(){
           var MenuData = {
               areaid:'',
               blockid:'',
               price:'',
               room:'',
               p:1
           }
           var categorys = J.s('.category');
           var zone = categorys.eq(0).first();
           var price = categorys.eq(1).first();
           var room = categorys.eq(2).first();


           var zoneTarget,priceTarget,roomTarget;

           var preTarget =null;

           J.on(document,'select:selectedChange',function(e){
               if(!zoneTarget){
                   zoneTarget= categorys.eq(0).s(".option_box_second").eq(0).first();
                   priceTarget = categorys.eq(1).s(".option_box").eq(0).first();
                   roomTarget = categorys.eq(2).s(".option_box").eq(0).first();
               }



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
               var pre;
               if(J.g(target).attr('blockid')!==null){
                   repaceHtml(target,zoneTarget);
                   zoneTarget = target;
                   return;
               }
               if(J.g(target).attr('price')!==null){
                   repaceHtml(target,priceTarget);
                   priceTarget = target;
                   return;
               }
               if(J.g(target).attr('room')!==null){
                   repaceHtml(target,roomTarget);
                   roomTarget = target;
                   return;
               }
               //repaceHtml(target,pre);

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

           function repaceHtml(target,prev){
               var html = target.html();
               html = html + (html.indexOf('　√')>-1 ?'':'　√')
               target.html(html);
               prev&&prev.html(prev.html().replace('　√',''));
           }







       }


   }

    pad();
})();
