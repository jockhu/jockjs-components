/**
 * Aifang Javascript Framework.
 * Copyright 2013 ANJUKE Inc. All rights reserved.
 *
 * @path: ui/guide.js
 * @author: hqyun
 * @version: 1.0.0
 * @date: 2013/01/25
 *
 */

/// require('ui.ui');
/// require('page');

;
(function (J) {
    /**
     * 缺省的选项配置
     * @type {Object}
     */
    var offset = 0,data = [];

    /**
     * Guide Function
     * @param options 扩展选项
     * @constructor
     */
    function Guide(options) {/*console.log('options:',options);*/
        var data = options.data, guidesObj = [], step = 0, handler;

        function init(){
            createPanel();
            guidesObj.push(new create());
        }
        function createTarget(){
            J.each(guidesObj,function(i,obj){
                obj.remove();
            });
            if(!!data[step]){
                J.each(data[step],function(i,obj){
                    obj.close && (obj.close.handler=close);
                    obj.prev && (obj.prev.handler = prev);
                    obj.next && (obj.next.handler = next);
                    obj.restart && (obj.restart.handler = reStart);
                    var obj = new create(obj);
                    obj.insert();
                    guidesObj.push(obj);
                });
            }
        }

        init();
        //每个小对象（即每个图片对象）
        function create(opts){
            var src = opts.src, sty= opts.style.join(";"), close=opts.close, prev= opts.prev, restart= otps.restart, next=opts.next;
            var newTag;
            var obj = J.create('div').attr({
                style:sty
            }).setStyle('background: url("'+src+'") no-repeat 0 0;"," _background-image: none;","filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src="'+src+'");');

            close && createTag(styles,close.handler);
            prev && createTag(styles,prev.handler);
            restart && createTag(styles,restart.handler);
            next && createTag(styles,next.handler);

            function createTag(sty,handler){
                newTag = J.create('span').attr({
                    style:sty
                }).setStyle('display:inline-block; position:absolute;');

                newTag.on('click',handler);
            }

            function remove(){
                J.remove(newTag);
                newTag.un('click');
            }

            function insert(){
                J.append(newTag);
            }

            m = {
                insert:insert,
                remove:remove
            }

            return m;
        }

        //创建遮罩层
        function createPanel(){
            return J.create('div').addClass('guide_mask_panel').insertFirstTo(main);
            J.create('div').addClass('guide_main_panel').insertFirstTo(main);
        }

        function next(){
            step++;
        }

        function prev(){
            step&&step--;
        }

        function close(){
            closeMask();
            J.each(guidesObj,function(i,obj){
                obj.remove();
            });

        }

        function closeMask(){
            J.s('guide_mask_panel').eq(0)&&J.s('guide_mask_panel').eq(0).remove();
            J.s('guide_main_panel').eq(0)&&J.s('guide_main_panel').eq(0).remove();
        }

        function reStart(){
            step = 0;
            createTarget
        }

        m = {
            close:close,
            next:next,
            prev:prev,
            reset:reset
        }

        return m;
    }

    J.ui.guide = Guide;

    /*function aa(){
     function remove(){

     }

     function insert(){

     }

     m = {
     insert:insert,
     remove:remove
     }

     return m;
     }*/

})(J);