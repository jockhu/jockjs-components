
;(function(context){
   function Search(option){
       var defOpts = {
           KWUrl:'http://shanghai.release.lunjiang.dev.anjuke.com/ajax/geomap/',
           map:null
           },
           opts,
           map,
           me=this,
           singleComm,
           preClickedItem,//上次所点击的overlay
           retSearchBar= J.g("statusSearch"),
           retStatusBar = J.g("propBarLeft"),
           autocomplete = {
               onSelect:function (data) {
                   me.getSearchCommData(data.id,data.name,false);
                   return false;
               },
               onSource:function (params, response) {
                   var def = {
                       q:params.kw,
                       cid:params.c,
                       limit:10,
                       padmap:1
                   }

                   J.get({
                       timeout:20000,
                       type:'json',
                       url:'/ajax/newautocomplete/',
                       data:def,
                       onSuccess:function (data) {
                           response(data);
                       }
                   })
               },
               onItemBuild:function (item) {
                   var number = item.k + '<i>约' + item.num + '套</i>';
                   return {
                       l:number,
                       v:item.k
                   }
               }
           };
       (function () {
           opts = J.mix(defOpts, option || {});
           map = opts.map;
           //J.mix(window.header,autocomplete);
           window.header.onSelect = autocomplete.onSelect;
           window.header.onSource = autocomplete.onSource;
           window.header.onItemBuild = autocomplete.onItemBuild;

           J.g("searchForm").get().onsubmit = function () {
               J.g("searchPrompt").hide();
               var str = J.g("p_search_input").val();
               J.map.search.callback = function (data) {
                   KW.onSearch.call(KW,data);
               }
               J.get({
                   type:'jsonp',
                   url:opts.KWUrl,
                   data:{
                       kw:str
                   },
                   callback:'J.map.search.callback'
               })
               return false;
           }

           J.on(document.body,'click',function(){
               J.g("searchPrompt").hide();
           });

       })();

       /**
        * 搜索单小区处理逻辑
        * @param commid
        * @param commname
        * @param async
        */
       this.getSearchCommData = function(commid,commname,async){
           var _onResultCommData = ListCenter.onResultCommData;
           var _onResultZoneData = ListCenter.onResultZoneData;
           var _getCommData = ListCenter.getCommData;
           ListCenter.onResultCommData = function(data,commname){
               singleComm = data.comms[0];
               var singleData= data;
               ListCenter.onResultZoneData = function(data){
                   ListCenter.getCommData=function(){};
                   var comms = data.comms;
                   comms.unshift(singleComm);
                   singleData.comms = comms;
                   this.data.commids = data.props.commids;
                   me.container.html('');
                   J.g("p_filter_result").get().scrollTop=0;
                   this.updateListHtml(singleData.props.list,'community_id');
                   this.upDateStatusHtml(commname,singleData.propNum);

                   setTimeout(function(){
                       var cur = map.getCurrentOverlays();
                       cur[singleComm.commid+'_'+17].onClick();
                       ListCenter.getCommData=_getCommData;
                   },10)


                   ListCenter.onResultZoneData=_onResultZoneData;
                   ListCenter.onResultCommData=_onResultCommData;
                   return singleData.comms;
               }
               map.setCenter(singleComm.lng,singleComm.lat,17);//居中显示
           }
           ListCenter.getCommData(commid, commname,false);
       }

       this.getDataCommMulti = function(data){

       },


       //单小区处理结果
       this.onResultCommData=function(data,commname){
           this._onResultCommData = this.onResultCommData;

           var comm = data.comms[0];
           if(!comm) return;
           ListCenter.getZoneData = this._getzoneData;
           map.setCenter(comm.lng,comm.lat,17);

           var p = {
               lng:comm.lng,
               lat:comm.lat,
               className:'',
               x:-8,
               y:-45,
               html:'<div class="OverlayB"><b>'+comm.propCount+'套｜</b>'+comm.commname+'<span class="tip"></span></div>'
           }
           map.addOverlay(p,'zoneMarker');
       }

       function getViewPort(data){
           var points = [];
           J.each(data,function(k,v){
                points.push(new BMap.Point(v.lat, v.lng));
           })
            return map.getViewport(points);
       }


       var KW = {
           data:{
               lat:"",
               lng:"",
               zoom:""
           },
           map:null,
           onSearch:function(data){
               switch  (data.matchType){
                   case 0:
                       //搜地标
                       this.getDataCommMulti(data.kw);
                       break;
                   case 1:
                       var comm = data.comm[0];
                       me.getSearchCommData(comm.commId,comm.commName,false);
                       break;

                   case 2:
                       break;
                   //community multi
                   case 3:
                       //
                       this.onResultBlock(data.region);
                       break;
                   //single block
                   case 4:
                       this.onResultBlock(data.region);
                   //single area

               }
           },
           onResultArea:function(data){
               map.setCenter(data.lng,data.lat,data.zoom)
           },
           onResultBlock:function(data){
               console.log(data)
               data = data[0];
               map.setCenter(data.lng,data.lat,data.zoom)
               var p = {
                   lng:data.lng,
                   lat:data.lat,
                   className:'areaMarkerMain',
                   x:-18,
                   y:-46,
                   html:'<div><p>'+data.name+'</p><i class="areaMarker"></i></div>'
               }
               map.addOverlay(p,'zoneMarker');
           },
           //单小区处理逻辑
           onResultComm:function(commid,commname,async){
               this._getzoneData =this.getZoneData ;
               ListCenter.getZoneData = function(){};
               var params  = {
                   zoom:17,
                   model:2,
                   commid:commid,
                   commids:'',
                   p:1
               }
               var me = this;
               this.opts.onResult =this.onResultCommon(function (data) {
                   me.onResultCommData.call(me,data,commname);
               });
               this.getDataCommon(params,false);
           },


           onResultCommMulti:function(data){
               var handler,tmp;
               var viewPort = getViewPort(data.comms);
               if (viewPort.zoom > 12) {
                  handler = ListCenter.getZoneData;
                   ListCenter.getZoneData = function(){};
                   map.setViewport(getViewPort(data.comms));
                   ListCenter.getZoneData = handler;
               }else{
                   handler = ListCenter.getRankData;
                   ListCenter.getRankData = function(){};
                   map.setViewport(getViewPort(data.comms));
                   ListCenter.getRankData = handler;
               }
               me.container.html('');
               this.updateListHtml(data.comms,'commid');
               var _listItemClick = ListCenter.listItemClick;
               ListCenter.listItemClick= function(elm,e){
                   this.preClickedItem&&this.preClickedItem.removeClass("landHover");
                   elm.addClass("landHover");
                   this.preClickedItem = elm;
                   if(e.target.className=="view"){

                        ListCenter.getCommData(elm.attr("data-code"),elm.s('.t').eq(0).html());
                   }
               }
               return data.comms;

           },
           onResultLandMask:function(data){

           },
           onResultLandMaskMulti:function(){

           },
           onResultNo:function(){

           },
           updateStatusHtml:function(){

           },
           updateListHtml:function(data,key){
               var frag = document.createDocumentFragment();
               var uid = 65,strChar;
               J.each(data,function(k,t){
                   var tmp = document.createElement("li");
                   strChar = String.fromCharCode(uid++);
                   tmp.className="land";
                   tmp.setAttribute("data-code",t[key]);
                   var str = '<a onclick="return false;" href="'+t['prop_url']+'" class="tip" title="'+t['img_title']+'" alt="'+t['img_title']+'" target="_blank">'+strChar+'</a>'+
                       '<div class="t">'+t['commname']+'</div>'+
                       '<div class="addr">'+t['address']+'</div>' +
                       '<a class="view" href="###">查看附近房源</a>';
                   tmp.innerHTML = str;
                   tmp.setAttribute("data-id",t[key]);
                   frag.appendChild(tmp);
               });
               me.container.get().appendChild(frag);
           },
           onSearchItemBuild:function(item){
               console.log(item)
               item.x=-8;
               item.y=-45;
               item.key = item.commid+'_'+item.zoom;
               item.html='<div class="OverlayB"><b>'+item.propCount+'套｜</b>'+item.commname+'<span class="tip"></span></div>';
               item.onClick= function(){}
               console.log(item)
               return item;
           },
           //多少区查找
           getDataCommMulti:function(commName){
               var self = this;
              me.data= J.mix(me.data,{
                  kw:commName,
                  p:1,
                  model:2
              });
               me.opts.onResult =me.onResultCommon(function (data) {
                   if(!data.comms.length){
                       //搜多小区无结果时去搜地标
                       KW.searchBaiduLandMask(commName);
                       return false;
                   }
                   //搜多多少区后的操作
                   me.opts.onItemBuild = self.onSearchItemBuild;
                   return self.onResultCommMulti(data);
               });
               me.getDataCommon(me.data,true);

           },

           //多小区查找
           searchBaiduLandMask:function(kw){
               map.localSearch(data.kw,Search,function(data){
                   switch (data.length){
                       case 0:
                           KW.onResultNo();
                           break;
                       case 1:
                           KW.onResultLandMask(data);
                           break;
                       default :
                           KW.onResultLandMaskMulti(data);
                   }
               });
           }








       }
       return autocomplete;

   }
    Search.prototype = ListCenter;

    context.search= Search;

})(J.map);


