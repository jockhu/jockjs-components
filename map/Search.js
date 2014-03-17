
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
               autocomplete.onSelect();
               return false;
               //return false;
               J.g("searchPrompt").hide();
               var str = J.g("p_search_input").val();
               J.map.search.callback = function (data) {
                   KW.onSearch(data);
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

       }


       //单小区处理结果
       this.onResultCommData=function(data,commname){
           this._onResultCommData = this.onResultCommData;

           var comm = data.comms[0];
           console.log(comm)
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


       function handler(data){
           if(data.props.iscommid ==1){
               onResultSingleComm(data);
           }
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
                       map.localSearch(data.kw,Search,function(data){
                           switch (data.length){
                               case 0:
                                   this.onResultNo();
                                   break;
                               case 1:
                                   this.onResultLandMask(data);
                                   break;
                               default :
                                   this.onResultLandMaskMulti(data);
                           }
                       });
                       break;
                   case 1:
                   //single com
                   case 2:
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
           onResultCommMulti:function(){
               var html =' <li class="land"><a href="###" class="tip">A</a><div class="t">杨高新城</div><div class="addr">杨浦区杨树浦路830号</div></li>'

           },
           onResultLandMask:function(data){

           },
           onResultLandMaskMulti:function(){

           },
           onResultNo:function(){

           },
           updateStatusHtml:function(){

           },
           //多少区查找
           searchCommMulti:function(commName){
                var url ='http://sh.lunjiang.zu.dev.anjuke.com/newmap/search2';
               J.get({
                   url:url,
                   data:{
                     model:2,
                     kw:commName
                   },
                   onSuccess:function(data){

                   }
               });
           },
           //多小区查找
           searchBaiduLandMask:function(kw){
               /*var url ='searchBaiduLandMask'
               J.get()*/
           }








       }
       return autocomplete;

   }
    Search.prototype = ListCenter;

    context.search= Search;

})(J.map);


