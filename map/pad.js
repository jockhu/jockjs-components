;
/// require('map.Core');
(function(){
   function pad(opption){
       var defOpts ={
           url:'/newmap/search2',
       //   url:'http://sh.release.lunjiang.dev.anjuke.com/newmap/search2',
          // url:'http://test.lunjiang.dev.aifang.com/map/index.php',
           id: "jmap_fill",
           lat: "",
           lng: "",
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
           moveLengthChange:50,//移动的距离小于自定义距离，不去取数据
           scrollBottom:5//离底部多少像素后马上加载

           },opts,map,preClickedOverlay,preClickedItem,
           elm,
           preCommid,//用于单个小区点击
           CACHE= {},
           listContainer,
           currentPage= 1,
           comms_ids,wait =false,//点击下一页把现在展展的列表小区带过去
           zoneCache;//区域缓存
       function init(){
           opts = J.mix(defOpts,opption);
           var listId,//列表id
               containerId;//地图容器ｉｄ
           listId = 'p_filter_result',
               containerId=opts.id;
           progress = J.g("progrss");
           buildContainer(containerId);
           buildProgress();
           buildList(listId);
           map =  J.map.core(opts);
           bindEvent();
           menu();//菜单筛选
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
               J.g("p_list").html('');
               var data = event.data;
               if(data.zoom <13){
                 /*  J.each(map.getCurrentOverlays(),function(k,v){
                       v.remove();
                   })*/
                   map.setCenter(data.lng,data.lat,14);
                   map.getData();
                    return
               }
               //计录小区id,用来翻页
               resetParams();
               preCommid = data.commid;
               toggleClassOver(data.target,preClickedOverlay,true);
               map.getData({
                   commid:preCommid
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



       }
       /**
        * 翻页事件
        */
       function nextPage(e){
           var lis = document.getElementById("p_list");
           if(!wait&&(this.clientHeight+this.scrollTop+opts.scrollBottom >= this.scrollHeight)){
               wait =true;
               var data = {};
               //把上一　次点击的区域选中状态清掉
               data.p = ++currentPage;
               if(map.getZoom()>12){
                   data.commids = comms_ids;
                   //翻页把小区ｉｄ传过去
                   data.commid =preCommid;
               }
               map.getData(data,true);
           }

       }
       function sendSoj(customParam){
           customParam&&SentSoj("anjuke-pad", customParam); //第二个参数是anjax请求的
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
           resetParams();
           J.g("p_list").html('');
           toggleClassOver(null,preClickedOverlay);
           preClickedItem&&preClickedItem.removeClass("on");

           var zoom = map.getZoom();
           if(zoom >12){
               map.getData();
             return true;
           }
          map.onResult(zoneCache);

       }
       function moveEnd(e){
           resetParams();
            if(map.getZoom() >12 && e.moveLenth > opts.moveLengthChange){
                toggleClassOver(null,preClickedOverlay);
                J.g("p_list").html('');
                map.getData();
                return;
            }
       }

       /**
        * １.上一页所记录的comdms_ids
        * 2.所点击的小区
        * ３.当前翻页
        *
        * 地图移动后和缩放级别更改后，需要清空记录条件
        */
       function resetParams(){
           currentPage = 1;//移动后翻页归为１，默认为第一页
           comms_ids = null;//翻页的上一页记录清空
           preCommid = 0;//点击小区的小区id清空
       }

       function beforeRequest(data){
           //points.swlat + "," + points.nelat + "," + points.swlng + "," + points.nelng;
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

            var overlays = map.getCurrentOverlays();
            var code  =elm.attr('data-code');
            var zoom = map.getZoom();
           var key =code+'_'+zoom;

           preClickedItem&&preClickedItem.removeClass("on");
           elm.addClass("on");
           toggleClassOver(overlays[key],preClickedOverlay);

           preClickedOverlay= overlays[key];
           preClickedItem = elm;

       }

       /**
        *
        * @param current overlay
        * @param prev overlay
        */
       function toggleClassOver(current,prev){
           //J.g("p_list").html('');
           J.g("propBarLeft").s("b").eq(0).html('0');
           prev&&prev.get().first().removeClass("f60bg");
           prev&&prev.onMouseOut();
           current&&current.onMouseOver();
           current&&current.get().first().addClass("f60bg");
           preClickedOverlay = current;
       }


       function onResult(data){
           wait = false;
           sendSoj(data.sojData);
           if(Object.prototype.toString.call(data)== '[object Array]'){
               return data;
           }
           //如果请求回来无小区，并且不是第一页，则都不展示　
           if(data.comms&&!data.comms.length&&data.curPage==1){
               J.g("p_list").html('');
               buildNextPage(0,0,0,false);

           }else{
               buildListItem(data&&data.props&&data.props.list);
               //修改翻页
               buildNextPage(data.curPage,data.propNum,data.comms,!!data.props.iscommid);

           }
           if(data.zoom >12 ){
               comms_ids = data.props.commids;
               return  data.comms&&data.comms.length?data.comms : false;
           }
            if(!zoneCache){
                zoneCache =data;;
            }
            return zoneCache.groups;
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
           if(!data || !data.length){
               return false;
           }
            var html = [],str,tmp='',key = map.getZoom()>12? 'community_id':'area_id';
         //  var oFragment = document.createDocumentFragment();
   //         console.time("test");
           var frag = document.createDocumentFragment();
           var container = J.g("p_list");
           var start =  container.s("li").length;
           if(!!start){
               var sep = document.createElement("li");
               sep.className="sep";
               sep.innerHTML =  start+ "-"+(start+data.length)+"条";
               frag.appendChild(sep);
           }
           J.each(data,function(k,t){
              var tmp = document.createElement("li");
               tmp.setAttribute("data-code",t[key]);
               str = '<a href="'+t['prop_url']+'" class="pi_a_img" title="'+t['img_title']+'" alt="'+t['img_title']+'" target="_blank">'+
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
           container.get().appendChild(frag);


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


       function buildProgress(){
           var progress =J.create('div',{
                   id:'progress',
                   className:'map_tip_loading'
               }).appendTo(J.g("pad_view"));
           var html ='<i class="loading_pic"></i>房源加载中...';
           progress.html(html);
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
           /*J.g("progress").setStyle({
               J.g("filter_condition").width()+ J.g("filter_condition").height()
           })*/
           listContainer.on('scroll',nextPage);
       }


       /**
        * 翻页ｈｔｍｌ
        * currentPage 当前页码
        * countNumber 总共房源套数
        * comms 小区
        */
       function buildNextPage(currentPage,countNumber,comms,isComm){
           var args = Array.prototype.slice.call(arguments,0);
          /* var page = J.g("listPager").s(".sp_curr").eq(0),html;
           var str =page.html().replace(/\d+/g,function(){
               return args.shift();
           })
           page.html(str);*/
           var top = J.g('propBarLeft').s(".sort_sp").eq(0);
           //如果返回的小区套数等于０或者大于１，则显示：地图内找到房源，否则直接显示该小区名字
           top.html(top.html().replace(/\d+/g,function(){
               return countNumber;
           }));
           if(!comms || !comms.length){
                return;
           }
           if(!isComm){
               html='地图内找到房源&nbsp;'
           }else{
              html = comms[0].commname+'&nbsp;';
           }
           top.html(html+'<b>'+countNumber+'</b>套');
       }

       /**
        * 菜单操作事件
        */

       function menu(){
           var zoneSelected =
           J.on(document,'select:selectedChange',function(e){
               var target = e.data.target;
               target.html(target.html()+'　√');
           })


       }


   }
    var content = J.g("p_filter_result");
    var lat = content.attr("data-lat"),
        lng =content.attr("data-lng");
    pad({
        lat:lat,
        lng:lng
    });
})();