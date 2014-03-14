
;(function(context){
   function Search(option){
       var defOpts = {
           KWUrl:'http://shanghai.release.lunjiang.dev.anjuke.com/ajax/geomap/',
           map:null
           },
           opts,
           map,
           retSearchBar= J.g("statusSearch"),
           retStatusBar = J.g("propBarLeft");
       autocomplete= {
           onSelect:function (data) {
               ListCenter.getCommData(data.id, data.name);
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
       ;(function(){
           opts = J.mix(defOpts,option||{});
           map = opts.map;
           //J.mix(window.header,autocomplete);
           window.header.onSelect = autocomplete.onSelect;
           window.header.onSource = autocomplete.onSource;
           window.header.onItemBuild =autocomplete.onItemBuild;

           J.g("searchForm").get().onsubmit= function(){
               var str = J.g("p_search_input").val();
               J.map.search.callback=function(data){
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




       function onResultSingleComm(data){
           //map.getMap().setZoom(17);
           map.setCenter(data.comms[0].lng,data.comms[0].lat,17);

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
                       this.map.localSearch(data.kw,Search,function(data){
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
                       this.onResultBlock(data.region);
                       break;
                   //single block
                   case 4:
                       this.onResultArea();
                   //single area



               }
           },
           onResultArea:function(data){
               map.setCenter(data.lng,data.lat,data.zoom)
           },
           onResultBlock:function(data){
               map.setCenter(data.lng,data.lat,data.zoom)
           },
           onResultComm:function(){

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

       return {
           handler:handler
       }
   }
    context.search= Search;

})(J.map);


