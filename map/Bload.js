/*opts
 * Jock
 * * Base api
 */
(function(win){
    J.map = {};
    var BmapVersion = 2.0;
    J.map.Bload = function(callback){

        J.load('http://api.map.baidu.com/getscript?v='+BmapVersion+'&ak=63c4ca91e854d14a9cbdd8f7cf663071','js',callback);
    }
})(J);
