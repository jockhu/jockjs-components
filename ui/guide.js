/**
 * Aifang Javascript Framework.
 * Copyright 2012 ANJUKE Inc. All rights reserved.
 *
 * @path: ui/guide.js
 * @author: Hqyun
 * @version: 1.0.0
 * @date: 2013/02/06
 *
 */

/// require('ui.ui');
/// require('page');

;
(function (J) {

    // 在此作用域下定义的对象或变量，会在多个对象实例内被共享使用

    /**
     * 缺省的选项配置
     * @type {Object}
     */
    var defaultOpts = {
        data:[],
        startIndex:0,
        onComplete:null,
        offsetTarget:'body'
    }, glbMain;

    /**
     * 缺省的选项配置
     * @type {Object}
     */
    var defaultStepOpts = {
        src:'',
        style:'',
        close:null,
        next:null,
        prev:null,
        reStart:null
    };

    /**
     * Guide Function
     * @param options 扩展选项
     * @constructor
     */
    function Guide(options) {

        var guideBox, guideMask, GUIDES = [], opts, stepIndex = 0, stepCurrentIndex = 0, stepLength, guideBoxOffset,boxIfm;

        // Initialize
        (function(){
            // 继承defaultOpts而不污染defaultOpts
            opts = J.mix(defaultOpts, options || {}, true);
            stepLength = opts.data.length;
            guideBoxOffset = J.g(opts.offsetTarget).offset();
            (glbMain || (glbMain = J.create('div', {style:'padding:0;margin:0;'}).insertFirstTo('body')))
                // 创建遮罩层
                .append( guideMask = J.create('div', {style: getCssText(true)}).setStyle({width:J.page.width()+'px',height:J.page.height()+'px'}) )
                // 创建应到此引导层盒子
                .append( guideBox = J.create('div', {style: getCssText(false)}).setStyle({top:guideBoxOffset.y+'px',left:guideBoxOffset.x+'px'}) );

            boxIfm = J.create('iframe', {style: 'z-index:-1;position:absolute; top:0; left:0; filter:Alpha(opacity=0.5);', 'scrolling': 'no', 'frameborder': '0'}).insertFirstTo(guideBox);
            boxIfm.setStyle({
                width: 950 + 'px',
                height: (guideMask.height()-1) + 'px'
            });

            // 呈现第一步
            showGuideSteps(stepIndex = opts.startIndex);
        })();

        /**
         * 获得css样式
         * @param isMask 是否是遮罩样式
         * @return {String}
         */
        function getCssText(isMask){
            var m = ''
                + 'filter: Alpha(Opacity=50);'
                + 'opacity:0.5;'
                + 'background: #000;';
            var s = ''
                + 'position: absolute;'
                + 'z-index: 10001;'
                + 'left: 0;'
                + 'top: 0;';
            return isMask ? m + s : s;
        }

        /**
         * 显示Guide流程，
         * 初始化，上一步，下一步，从头开始，可以直接调用这个方法
         */
        function showGuideSteps(stepIndex){
            hideGuideSteps();
            stepCurrentIndex = getFixedStepIndex(stepIndex);
            stepsActionFactory('show', GUIDES[stepCurrentIndex] || (GUIDES[stepCurrentIndex] = getGuideCurrentSteps()))
        }

        /**
         * 隐藏Guide流程，
         */
        function hideGuideSteps(){
            stepsActionFactory('hide')
        }

        /**
         * Step 工厂方法
         * @param method 方法名称
         * @param steps 单个流程的所有 step
         */
        function stepsActionFactory(method, steps){
            (steps || GUIDES[stepCurrentIndex]) && J.each(steps || GUIDES[stepCurrentIndex], function(i, v){
                v[method]();
            });
        }

        /**
         * 获得修正后索引
         * @param stepIndex
         * @return {Number}
         */
        function getFixedStepIndex(stepIndex){
            return stepIndex < 0 ? 0 : stepIndex > stepLength ? stepLength : stepIndex;
        }

        /**
         * 获取Guide数据
         * @return {Object}
         */
        function getGuideStepData(){
            return opts.data[stepCurrentIndex];
        }

        /**
         * 处理每一个Guide数据，转换成真是的Step对象
         * @return {Object}
         */
        function getGuideCurrentSteps(){
            var steps = [];
            J.each(getGuideStepData(), function(i, v){
                steps.push( new Step(v) );
            });
            return steps;
        }

        /**
         * 下一步
         */
        function next(){
            showGuideSteps(++stepIndex);
        }

        /**
         * 上一步
         */
        function prev(){
            showGuideSteps(--stepIndex);
        }

        /**
         * 从第一个重新开始
         */
        function reStart(){
            showGuideSteps(0);
        }

        /**
         * 关闭Guide
         */
        function close(){
            J.each(GUIDES, function(i, v){
                stepsActionFactory('remove', v);
            });
            guideMask.remove();
            guideBox.remove();
            opts.onComplete && opts.onComplete();
        }

        /**
         * 设置整体偏移量
         * @param offset
         */
        function setOffset(offset){
            opts.offset = offset;
        }

        /**
         * 设置回调函数
         * @param callback
         */
        function setOnComplete(callback){
            opts.onComplete = callback
        }

        /**
         * Step Function
         * @param options 扩展选项
         * @constructor
         */
        function Step(options){

            var BUTTONS = [], stepOpts, stepContainer, actions = {
                // 事件映射
                close:close,
                next:next,
                prev:prev,
                reStart:reStart
            };

            // Initialize
            (function(){
                stepOpts = J.mix(defaultStepOpts, options || {}, true);
                createStepContainer();
            })();

            /**
             * 构建Step容器
             */
            function createStepContainer(){
                var styleCss = 'position:absolute;z-index:10002;';
                var filterCss = 'width:'+stepOpts.style.width+';height:'+stepOpts.style.height+';background:url("'+ stepOpts.src +'") no-repeat 0 0;_background-image:none;filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src="'+ stepOpts.src +'")'
                stepContainer = J.create('div').setStyle(styleCss).setStyle(stepOpts.style).append( J.create('div').setStyle(filterCss) );
                J.each(actions,function(i, v){
                    stepOpts[i] && createStepButton(stepOpts[i], v)
                });
                guideBox.append( stepContainer );
            }

            /**
             * 构建Step行为按钮
             * @param buttonData
             * @param callback
             */
            function createStepButton(buttonData, callback){
                BUTTONS.push( J.create('div').setStyle('position:absolute;cursor:pointer;z-index:10003;').setStyle(buttonData).appendTo(stepContainer).on('click', callback) );
            }

            /**
             * 析构Step上所有事件
             */
            function unBindEvents(){
                J.each(BUTTONS, function(i, v){
                    v.un();
                })
            }

            /**
             * 显示Step
             */
            function show(){
                stepContainer.show();
            }

            /**
             * 隐藏Step
             */
            function hide(){
                stepContainer.hide();
            }

            /**
             * 从Guide容器删除当前Step
             */
            function remove(){
                unBindEvents();
                stepContainer.remove();
            }

            return {
                show:show,
                hide:hide,
                remove:remove
            };
        }

        /**
         * 公开接口
         */
        return {
            close:close,
            next:next,
            reStart:reStart,
            prev:prev,
            setOffset:setOffset,
            setOnComplete:setOnComplete
        };
    }

    J.ui.guide = Guide;

})(J);