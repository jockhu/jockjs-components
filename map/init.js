/**
 * Created by kathleen on 14-1-20.
 */
var TT = new TimerTrigger();
TT.startTimer(function(){
    Jock.map.loadMap('b',this,'jmap');
},function(){
    $('info_panel').update('<span class="sp_info">地图加载时间比平时要长，还在加载中...</span>');
},function(){
    $('info_panel').update('<span class="sp_info">地图加载超时，请刷新页面</span>');
});
