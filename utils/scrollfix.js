/**
 * Aifang Javascript Framework.
 * Copyright 2012 ANJUKE Inc. All rights reserved.
 *
 * @path: utils/scrollfix.js
 * @author: Jock
 * @version: 1.0.0
 * @date: 2014/04/09
 *
 */

/// require('utils.utils');
(function(J) {
    "use strict";

    var tm = 'touchmove', ts = 'touchstart';

    function fnTouchMove(e){
        var bounce;
        if((bounce = e.target.parentNode.getAttribute('bounce') || e.target.getAttribute('bounce')) && bounce === 'false')
            e.preventDefault();
    }

    (J.D||J.W)[J.aL](tm,fnTouchMove,false);

    function getFirstDom(element) {
        for (var node = element['firstChild']; node; node = node['nextSibling']) {
            if (node.nodeType == 1) {
                return node;
            }
        }
        return element;
    }


    function Scrollfix(elm) {
        if(!elm) return;
        var sts;

        elm[J.aL](ts, function(e){
            if(elm.scrollHeight <= elm.offsetHeight){
                getFirstDom(elm).style.height = (elm.offsetHeight+2)+"px";
            }
            e.stopPropagation();
            sts = elm.scrollTop;
            if(elm.scrollTop == 0)
                elm.scrollTop = 1;
            else if(sts + elm.offsetHeight >= elm.scrollHeight)
                elm.scrollTop = elm.scrollHeight - elm.offsetHeight - 1;
        }, false);
        elm[J.aL](tm, function(e){
            e.stopPropagation();
        }, false);
    };

    J.utils.scrollfix = Scrollfix;

    J.dom && (J.dom.fn.scrollfix = function(){
        return new Scrollfix(this.get())
    });

})(J);