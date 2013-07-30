/**
 * Aifang Javascript Framework.
 * Copyright 2012 ANJUKE Inc. All rights reserved.
 *
 * @path: utils/retina.js
 * @author: Jock
 * @version: 1.0.0
 * @date: 2012/11/15
 *
 */

/// require('utils.utils');

;(function(U){

    var isRetina = J.W.devicePixelRatio >= 2;

    function replace(src){
        return (J.isString(src) ? srcBuild : srcReplace)(src);
    }

    function srcBuild(src){
        var m;
        if(isRetina && (m = src.match(/^(.+(ajkimg\.com).+[^@2x])(\.\w+)$/))){
            return m[1]+'@2x'+m[3];
        }
        return src;
    }

    function srcReplace(v){
        (isRetina && v.attr('width')) && v.attr('src',srcBuild(v.attr('src')));
    };

    U.retina = {
        init:function(debug){
            isRetina = debug||isRetina;
            isRetina && J.s('img').each(function(i,v){
                srcReplace(v)
            });
        },
        replace:replace
    };

})(J.utils);