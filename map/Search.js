
;(function(context){
   function Search(option){
       if(!(this instanceof Search)){
           new Search(option);
       }
       var defOpts = {
           KWUrl:'http://shanghai.release.lunjiang.dev.com/ajax/geomap/'
           },opts;
       (function(){
           opts = J.mix(defOpts,option|{});
           window.header.onSelect = onSelect;
           window.header.onSource = onSource;
           window.header.onItemBuild = onItemBuild;


       })();

       /**
        * autocomplete选中后项后进行的操作
        * @param data
        * @return {Boolean}
        */
       function onSelect(data){
            console.log(data)
           J.g("loadDrop").get().click();
            return false;
       }
       function onSource(params,response){
           var def = {
               q:params.kw,
               cid:params.c,
               limit:10,
               padmap:1
           }

           J.get({
              type:'json',
              url:'/ajax/newautocomplete/',
              data:def,
              onSuccess:function(data){
                  response(data);
              }
           })
       }
       function onItemBuild(item){
           var number =  item.k + '<i>约' + item.num + '套</i>' ;
           return {
               l:number,
               v:item.k
           }
       }


       function onResultKW(data){
           console.log(data)
       }





   }
    context.search= Search;

})(J.map);
/*

var Search = {
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

    }








}
*/
