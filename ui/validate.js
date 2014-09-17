/**
 * Aifang Javascript Framework.
 * Copyright 2012 ANJUKE Inc. All rights reserved.
 *
 * 表单验证组件
 *
 * @path: ui/validate.js
 * @author: sushazhang, Jock
 * @version: 1.2
 * @date: 2013/03/11
 *
 */
/// require('ui.ui');
;
(function (J) {

    /**
     * 缺省的选项配置
     * @type {Object}
     */
    var classNames = {
        checked:'v_checked',
        info:'v_info',
        error:'v_error',
        success:'v_success',
        tooltip:'v_tooltip'
    };
    /**
     * 缺省的选项配置
     * @type {Object}
     */
    var defaultOpts = {
        auto: true, // 自动验证，如失去焦点自动验证
        formId: '',     // Form ID
        glbOk: '',      // 全局正确信息
        glbError: '',   // 全局错误信息
        onSuccess: '',  // 验证成功回调
        onError: '',    // 验证错误回调（非单个验证错误，如文本框失去焦点触发的验证错误不会回调）
        custom: '',     // 自定义验证
        event: '',      // 自定义事件
        autoSubmit: false,  // 自动提交，默认关闭
        forceShow: true, // 提示信息为空强制显示
        infoTagName: 'span', // 缺省如果提示信息元素不存在，那么创建的标签名称定义
        tpl: 'validate_def', // 皮肤模板
        classNames:classNames// 自定义 class 样式
    };

    //所有的正则表达式
    var RegExpMaps = {
        require: "^(.|\n)+?$", //非空
        intege: "^-?[0-9]+$", //整数
        intege1: "^([1-9]|[1-9][0-9]+)$", //正整数 不包括0
        intege2: "^(0|[1-9]+)$", //正整数 包含0
        decmal: "^-?(0|[1-9][0-9]*)(.[0-9]+)?$", //浮点数（包含0）
        decmal1: "^(0|[1-9][0-9]*)(.[0-9]+)?$", //正浮点数 （包含0）
        decmal2: "^(0|[1-9][0-9]*)(.[0-9]{1,2})?$", //正浮点数 （包含0 保留两位小数）
        email: "^([a-zA-Z0-9_\\.\-])+\@(([a-zA-Z0-9\-])+\\.)+([a-zA-Z0-9]{2,4})$", //邮件
        url: "^((http|https|ftp):\/\/)?[a-zA-Z0-9\-\\.]+\\.[A-Za-z]{2,3}(/.*)?$", //url
        chinese: "^[\u4E00-\u9FA5\uF900-\uFA2D]+$", //仅中文
        zipcode: "^[0-9]{6}$", //邮编
        qq: "^[1-9][0-9]{4,9}$", //QQ号码
        tel: "^[0-9]{3,4}-[0-9]{7,9}(-[0-9]{1,4})?$", //电话号码的函数,区号必填
        tel1: "^([0-9]{3,4}-)?[0-9]{7,9}(-[0-9]{1,4})?$", //电话号码的函数,区号非必填
        mobile: "^1(3|5|8|4)[0-9]{9}$", //手机
        username: "^\w+$", //用来用户注册。匹配由数字、26个英文字母或者下划线组成的字符串
        letter: "^[A-Za-z]+$"                    //字母
    };


    /**
     * Validate Function
     * @param options 扩展选项
     * @constructor
     */
    function Validate(options) {

        var GROUPS = {}, CACHE = [], opts, formElm, CUSTOM = {}, submiting = false, onErrorCallbacked = true, taskerReady = true;

        /**
         * Initialize
         */
        (function () {
            opts = J.mix(defaultOpts, options||{}, true);
            if(options && options.classNames){
                opts.classNames = J.mix(classNames, options.classNames, true);
            }
            formElm = J.g(opts.formId);
            formElm.addClass(opts.tpl);
            formElm.s("*").each(function (i, element) {
                addValidateElement(element.eq(0).get());
            });
            formElm.on('submit', function (e) {
                e.stop();
                if(!submiting){
                    setTimeout(function(){
                        validate();
                    },20)

                }
            });
        })();


        /**
         * =========================================
         * 单个元素验证，一个元素一个对象,
         * 一个元素可能有多个验证类型
         * 初始化时将所有要做的事情都准备好，便于后续操作
         * =========================================
         *
         * @param elm HTMLElement
         * @param validateString  验证规则自定义字符串，格式如：require$必填错误$$tel$请填写正确的手机号码
         * @param taskerTrigger 每次任务完成触发任务调度
         * @return {Object}
         * @constructor
         */
        function ValidateObject(elm, validateString, taskerTrigger) {
            var status = -1, placeholder = elm.attr('placeholder'),
                validateMessage = {ok: '', error: ''},
                validateCenter,                             // 验证中心;
                validateData = validateString.split(/\$\$|\|\|/),  // 验证规则数据;
                validateOr = /\|\|/.test(validateString),
                validateItems = [],                         // 当前验证对象的所有验证类型
                autoCreateTarget = false,
                infoTarget, groupId, information, customId, events = [], eventFuns = {};
            /**
             * Initialize
             */
            (function () {
                var tempMessage, vType, target, validateItem, require = false, infoMessage = '', autoValidate = '';

                // 单个元素上所有的验证条件组合成验证集合
                J.each(validateData, function (i, vString) {
                    tempMessage = vString.split('$');
                    vType = tempMessage[0] || '';
                    if (vType !== 'ok' && vType !== 'error' && vType !== 'target' && vType !== 'info' && vType !== 'event' && vType != 'auto') {
                        validateItems.push(validateItem = filterGroup(vString, elm));
                        if (vType === 'group') groupId = validateItem.groupId;
                        if (vType === 'custom' && (customId = elm.get().id)) CUSTOM[customId] = -1;
                    } else if (vType === 'target') {
                        target = J.g(tempMessage[1]); // 目标提示元素
                    } else if (vType === 'require') {
                        require = true;
                    } else if (vType === 'info') {
                        infoMessage = tempMessage[1] || '';
                    } else if (vType === 'event') {
                        var eventString = tempMessage[1], eventArr = eventString.split('|');
                        if(eventArr.length > 1){
                            if(eventArr[0] !== 'error' && eventArr[0] !== 'success' && eventArr[0] !== 'info'){
                                events.push({
                                    eventType:eventArr[0],
                                    eventId:eventArr[1]
                                });
                            }else{
                                eventFuns[eventArr[0]] = opts.event[eventArr[1]];
                            }
                        }
                    } else if (vType == 'auto'){
                        if(tempMessage[1]){
                            autoValidate = (tempMessage[1] == 'true') ? true : false;
                        }
                    } else {
                        validateMessage[tempMessage[0]] = tempMessage[1] || ''; // 提取当前公共的正确和错误信息
                    }
                });

                if (!groupId) {
                    infoTarget = (target && target.length) ? target : createInfoElement(opts.infoTagName, elm, infoMessage);
                } else {
                    var gropElm = J.g(groupId);
                    infoTarget = gropElm.length ? gropElm : createInfoElement(opts.infoTagName, elm, infoMessage, groupId);
                    GROUPS[groupId].ok = validateMessage.ok;
                    GROUPS[groupId].error = validateMessage.error;
                    GROUPS[groupId].require = require;
                    // 将事件映射到分组数据缓存
                    eventFuns && (GROUPS[groupId].eventFuns = eventFuns);
                }
                information = infoTarget && infoTarget.html();
                validateCenter = new ValidateCenter(elm, validateItems, validateFinish);
                elementBindEvent(autoValidate);

            })();


            /**
             * 创建元素
             * @param tagName 标签名称
             * @param elm
             * @param infoMessage 默认填充消息
             * @param id elmId
             * @returns {*}
             */
            function createInfoElement(tagName, elm, infoMessage, id) {
                autoCreateTarget = true;
                return J.create(tagName, {'class': opts.classNames.tooltip, id:id||''}).html(infoMessage).appendTo(elm.up());
            }

            /**
             * 单个表单验证完成
             * @param status 单个表单验证返回的状态
             * @param message 提示信息。
             *          注意：如果 message 是 null，则仅仅是改变状态，而非最终结果
             *          比如远程验证，解决用户点击提交按钮，同时会提前触发失去焦点产生的验证过程，避免2次相同的发送ajax验证
             */
            function validateFinish(status, message) {
                // 第一时间更新状态
                setStatus(status);

                if(message == null) return;

                // 如果有任何验证不通过，复位taskerReady状态
                if(status === -1) taskerReady = false;

                // 显示提示信息
                toggleInformation(status, filterMessage(status, message), (status == 0));

                // 回调触发任务，告知状态的变化
                taskerTrigger();

                var customEventNameArray = ['error', 'info', 'success'], index = status + 1;
                // 如果是分组，则取GROUPS上映射的事件
                if(groupId){
                    eventFuns = GROUPS[groupId].eventFuns;
                }
                // 回调单个自定义正确或错误事件
                eventFuns[customEventNameArray[index]] && eventFuns[customEventNameArray[index]](elm);
            }

            /**
             * 消息过滤
             * @param statusCode -1 | 0 | 1
             * @param message
             * @return {*}
             */
            function filterMessage(statusCode, message) {
                if (statusCode === 0) {
                    return message;
                }
                // 首先拿传入的message信息，如果空则拿单个验证错误信息，如果没有则拿单个元素全局的提示信息，如果没有则拿Group分组的提示信息，都没有则拿验证对象的全局提示信息
                return message || ((statusCode === -1) ? (validateMessage.error || (groupId && GROUPS[groupId].error) || opts.glbError) : (statusCode === 1) ? (validateMessage.ok || (groupId && GROUPS[groupId].ok) || opts.glbOk) : '');
            }

            /**
             * 显示或隐藏提示信息
             * @param status 状态码
             * @param message 消息内容
             * @param hide 是否隐藏
             */
            function toggleInformation(status, message, hide) {
                var classNames = opts.classNames, infoClassArray = [classNames.error, classNames.info, classNames.success];
                if (infoTarget) {
                    clearInfoClass(infoTarget);
                    if (!hide && ((status === 0 && !!message) || (status !== 0 && (!!message || opts.forceShow)))) {
                        infoTarget.show();
                        infoTarget.addClass(infoClassArray[status + 1]);
                        infoTarget.html(message);
                    } else {
                        infoTarget.hide();
                    }
                }

                function clearInfoClass(elm) {
                    J.each(infoClassArray, function (i, v) {
                        elm.removeClass(v);
                    });
                }
            }

            /**
             * 筛选和缓存分组对象
             * @param vString 验证种类字符串 格式如：require$请填写总楼层数
             * @param elm
             * @return {Object}
             */
            function filterGroup(vString, elm) {
                var vItem = buildValidateItem(vString), groupId = vItem.groupId;
                vItem.elm = elm;
                vItem.placeholder = placeholder;
                vItem.validateOr = validateOr;
                if (vItem.type === 'group' && groupId) {
                    GROUPS[groupId] || (GROUPS[groupId] = {items: [], source: null, status: -1});
                    vItem.condition && (GROUPS[groupId].condition = vItem.condition);
                    vItem.message && (GROUPS[groupId].message = vItem.message);
                    vItem.groupType && (GROUPS[groupId].groupType = vItem.groupType);
                    GROUPS[groupId].items.push(vItem);
                }
                return vItem;
            }

            /**
             * 子数据处理,组织验证对象
             * @param vString 验证种类字符串 格式如：require$请填写总楼层数
             * @return {Object}
             */
            function buildValidateItem(vString) {
                //初始化组织数据类型  不通类型的数据转换对象
                var vArray = vString.split("$"),
                    vType = vArray[0] ? vArray[0] : '',     // 验证类型
                    vMessage = vArray[1] ? vArray[1] : '', // 验证提示消息, 验证规则串，不同类型，字符串组合也不一样，格式如：group1|count|至少选2项|>=2 或者如：请输入5-1000以内的数字|5-1000
                    vConditions = vMessage.split("|"),
                    vCondition = '',
                    vHalfChars = true;

                var retValue = {
                    type: vType,
                    message: vMessage
                };

                if (vType == 'group') {                     // 分组验证字符串 格式如：group1|checked|至少选2项|>=2
                    var groupId = vConditions[0],           // 分组ID -- group1
                        groupType = vConditions[1] || '',   // 分组类型 -- checked
                        groupMessage = vConditions[2] || '',// 分组验证提示 -- 至少选2项
                        groupCondition = vConditions[3] || '';// 分组验证规则串 -- >=2
                    return J.mix(retValue, {
                        groupType: groupType,
                        groupId: groupId,
                        message: groupMessage,
                        condition: groupCondition
                    }, true);
                } else { // 范围验证字符串 格式如：请输入5-1000以内的数字|5-1000
                    if (vConditions.length > 0) {
                        vMessage = vConditions[0];
                        vCondition = vConditions[1];
                        if(vConditions[2]){
                            vHalfChars = (vConditions[2] == 'true') ? true : false;
                        }
                    }
                    return J.mix(retValue, {
                        message: vMessage,
                        condition: vCondition,
                        halfChars: vHalfChars
                    }, true);
                }
            }

            /**
             * 绑定事件
             * @param autoValidate 是否自动验证
             */
            function elementBindEvent(autoValidate) {
                var elmType = elm.attr('type'), tagName = elm.get().tagName, callback, timer = null;

                function customEventBind(elm, type, callback){
                    elm.on(type, function(){
                        callback(elm);
                    });
                }

                function doTrigger() {
                    // 清除checked属性
                    if (groupId && 'text' !== elmType && 'TEXTAREA' !== tagName && elmType !== 'checkbox' && elmType !== 'radio'){
                        var checkedClassName = opts.classNames.checked;
                        GROUPS[groupId] && J.each(GROUPS[groupId].items, function(i, v){
                            v.elm.attr('checked',null);
                            v.elm.removeClass(checkedClassName);
                        });
                        elm.attr('checked', true);
                        elm.addClass(checkedClassName);
                    }
                    // 如果是分组，或者状态等于 -1 的才触发验证
                    if (groupId || getStatus() === -1) {
                        taskerReady = false; // 任何非提交按钮触发的验证，都需要复位状态，意味着验证不够通过与否都不会触发提交动作
                        trigger();  // 触发验证
                    }
                }

                function doBind(key) {
                    elm.on(key, function(){
                        // 当个元素上设置是否自动验证要优先全局设置
                        // 如果自动验证，将事件加入队列，否则，设置最简单的隐藏
                        ( (autoValidate !== '') ? autoValidate : opts.auto ) ? doTrigger() : toggleInformation(0, '', true);
                    });
                }

                if ('text' === elmType || 'TEXTAREA' === tagName) {
                    elm.on('focus', function () {
                        // 如果获得焦点已经在验证的过程中，不对状态进行复位，失去焦点就不会做重复的验证
                        if(getStatus() !== -2) setStatus(-1);
                        toggleInformation(0, filterMessage(getStatus(), information), false);
                    });
                    doBind('blur');
                } else if(elmType != 'hidden'){
                    doBind('click');
                }

                events && J.each(events, function(index, ev){
                    if(opts.event && (callback = opts.event[ev.eventId])){
                        if(groupId && GROUPS[groupId]){
                            J.each(GROUPS[groupId].items, function(i, v){
                                customEventBind(v.elm, ev.eventType, callback);
                            });
                        }else{
                            customEventBind(elm, ev.eventType, callback);
                        }
                    }
                });
            }

            /**
             * 验证触发器
             */
            function trigger() {
                // -2 是验证中，如果不是在验证中，开始执行验证
                if(getStatus() !== -2){
                    setStatus(-2); // 标记为验证中
                    // 开始验证
                    validateCenter.doValidate();
                }
            }

            /**
             * 获取状态
             * @returns {number}
             */
            function getStatus() {
                return status;
            }

            /**
             * 设置状态
             * @param st 状态码
             */
            function setStatus(st) {
                if(customId) CUSTOM[customId] = st;
                status = st;
            }

            return {
                elm: elm,
                trigger: trigger,
                groupId: groupId,
                validateItems: validateItems,
                validateOr: validateOr,
                infoTarget: infoTarget,
                targetCreated: autoCreateTarget,
                setStatus: setStatus,
                getStatus: getStatus,
                placeholder: placeholder
            }

        }


        /**
         * =========================================
         * 验证中心，处理各种验证
         * =========================================
         *
         * @param elm 验证元素
         * @param validateItems 单个元素对应的验证集合
         * @param finishCallback 验证结束回调，传入 (statusCode, message)
         *        statusCode : -1 | 0 | 1
         *        -1 : 验证失败
         *        0  ：无操作，通常显示初始化提示信息
         *        1  ：验证通过
         * @return {Object}
         * @constructor
         */
        function ValidateCenter(elm, validateItems, finishCallback) {

            /**
             * 验证核心入口，单个输入框包含的所有验证类型
             */
            function doValidate() {
                var status = 0, groupId = null, elmVal = elm.val(), inCustom = false, iLen = validateItems.length - 1;
                J.each(validateItems, function (i, vItem) {
                    // 内容为空,不是必填的,且不是分组验证, 不是自定义，可跳过验证
                    if ( elmVal == '' && vItem.type != 'require' && vItem.type !== 'group' && vItem.type !== 'custom') {
                        return true;
                    }

                    switch (vItem.type) {
                        case 'group':
                            var GRP = GROUPS[groupId = vItem.groupId];
                            GROUPS[groupId].source = elm.get();
                            // 修复分组类型，解决了页面中需要每一个都必须写明分组类型的限制
                            vItem.groupType || (vItem.groupType = GRP.groupType);
                            GROUPS[groupId].status = status = groupAction(vItem);
                            if (status === -1) {
                                if (i !== iLen && vItem.validateOr) break;
                                finishCallback(status, GRP.message);
                                return false;
                            }
                            break;
                        case 'range':
                            status = rangeAction(vItem);
                            if (status === -1) {
                                if (i !== iLen && vItem.validateOr) break;
                                finishCallback(status, vItem.message);
                                return false;
                            }
                            break;
                        case 'length':
                            status = lenAction(vItem);
                            if (status === -1) {
                                if (i !== iLen && vItem.validateOr) break;
                                finishCallback(status, vItem.message);
                                return false;
                            }
                            break;
                        case 'custom':
                            inCustom = true;
                            finishCallback(-2, null); // 远程验证需提前设置状态为验证中
                            customAction(vItem, function(res){
                                (res.validateOr !== J.undef) && (vItem.validateOr = res.validateOr);
                                finishCallback(res.status, res.message || (res.status == -1 ? vItem.message : ''));
                            });
                            break;
                        default:
                            status = regAction(vItem);
                            if (status === -1) {
                                if (i !== iLen && vItem.validateOr) break;
                                finishCallback(status, vItem.message);
                                return false;
                            }
                            break;
                    }
                    if (status === 1 && vItem.validateOr) return false;
                });
                if (status !== -1 && !inCustom) {
                    finishCallback(status, '');
                }

            }

            /**
             * 用户自定义验证
             * @param vItem
             * @param validateCallback
             */
            function customAction(vItem, validateCallback) {
                var customFn, customId = vItem.elm.get().id;
                if(opts.custom && (customFn = opts.custom[customId])){
                    /**
                     * 执行用户定义的函数，传入参数，和回调函数
                     */
                    customFn( vItem.elm, function(res){ validateCallback(res)}, {
                        regAction: regAction,
                        rangeAction: rangeAction,
                        lenAction: lenAction
                    });
                }
            }


            /**
             * 验证规则解析
             * @param type 验证类型
             * @param o 对象|数量
             * @param condition 规则
             * @return
             *        -1 : 验证失败
             *        0  ：无操作，通常显示初始化提示信息
             *        1  ：验证通过
             */
            function conditionTranscoding(type, o, condition) {
                if (condition) {
                    var match;
                    if (type === 'checked' || type === 'range' || type === 'length') {
                        /**
                         * 1-3 [  "1-3"  ,   undefined  ,   undefined  ,   "1"  ,   "3"  ]
                         * >=1 [  ">=1"  ,   ">="  ,   undefined  ,   undefined  ,   "1"  ]
                         * <=3 [  "<=3"  ,   undefined  ,   "<="  ,   undefined  ,   "3"  ]
                         * 3   [  "3"  ,   undefined  ,   undefined  ,   undefined  ,   "3"  ]
                         */
                        if (match = condition.match(/^(?:(>=)|(<=)|(?:(\d+)-))*(\d+)$/)) {
                            if (match[3] && match[3] == o && o == 0){
                                return 0;
                            }else if (match[3] && match[4]) { // 1-3
                                return (o >= match[3] && o <= match[4]) ? 1 : -1;
                            } else if (match[1] && match[4]) { // >=1
                                return (o >= match[4]) ? 1 : -1;
                            } else if (match[2] && match[4]) { // <=3
                                return (o <= match[4]) ? 1 : -1;
                            } else if (match[4]) { // 3
                                return (o == match[4]) ? 1 : -1;
                            }
                            return -1;
                        }
                    } else if (type === 'equal_string' || type === 'equal_intege' || type === 'equal_date'  || type === 'equal_time') {
                        /**
                         * a=b [  "a>=b"  ,   "a"  ,   "="  ,   "b"  ]
                         * a>b
                         * a>=b
                         * a<b
                         * a<=b
                         */
                        if (match = condition.match(/^(\w+)(=|>|>=|<|<=)(\w+)$/)) {
                            var status = -1, a = match[1], f = match[2], b = match[3], A = o[a], B = o[b];
                            if (A == '' && B == '')
                                return 0;
                            else if (A == '' || B == '') {
                                return -1;
                            }

                            function getEqualValue(F, A, B) {
                                switch (F) {
                                    case '>':
                                        return (A > B) ? 1 : -1;
                                        break;
                                    case '>=':
                                        return (A >= B) ? 1 : -1;
                                        break;
                                    case '<':
                                        return (A < B) ? 1 : -1;
                                        break;
                                    case '<=':
                                        return (A <= B) ? 1 : -1;
                                        break;
                                    default:
                                        return 0;
                                }
                                return 0;
                            }

                            function equalDateTime(f, A, B){
                                A = Date.parse(A.replace(/-/g, '/'));
                                B = Date.parse(B.replace(/-/g, '/'));
                                if(!A || !B)
                                    return -1;
                                return getEqualValue(f, A, B);
                            }

                            if (type === 'equal_string' && f == '=') { // 字符串比较
                                return (A === B) ? 1 : -1;
                            } else if (type === 'equal_intege') {
                                if (!/^\d+(?:\.\d+)*$/.test(A) || !/^\d+(?:\.\d+)*$/.test(B)) {
                                    return -1
                                } else {
                                    return getEqualValue( f, parseInt(A), parseInt(B) );
                                }
                            } else if (type === 'equal_date') {
                                return equalDateTime(f, A, B);
                            } else if (type === 'equal_time') {
                                var Y = '2012-01-01 ';
                                A = Y + A;
                                B = Y + B;
                                return equalDateTime(f, A, B);
                            }


                            return status;
                        }
                    } else {
                        return -1;
                    }

                } else {
                    return -1
                }
            }

            /**
             * 分组元素验证
             * @param vItem 单个分组验证
             * @return {Boolean}
             */
            function groupAction(vItem) {
                var groupStatus = true, GRP = GROUPS[vItem.groupId];
                function equalDo(equalKey) {
                    var elemArr = {};
                    J.each(GRP.items, function (i, k) {
                        elemArr[k.elm.get().id] = k.elm.val();
                    });
                    return conditionTranscoding(equalKey, elemArr, GRP.condition);
                }

                function checkedDo() {
                    var count = 0, elm, el, elmType;
                    J.each(GRP.items, function (i, k) {
                        elm = k.elm, el = elm.get(), elmType = elm.attr('type');
                        (el.checked || ( (elmType !== 'checkbox' && elmType !== 'radio') && elm.attr('checked') ) ) && count++;

                    });
                    return conditionTranscoding('checked', count, GRP.condition);
                }

                function allDo() {
                    var status = 1;
                    J.each(GRP.items, function (i, k) {
                        if (regAction(k, k.groupType) === -1) return (status = -1);
                    });
                    return status;
                }


                switch (vItem.groupType) {
                    case 'equal_string':
                    case 'equal_intege':
                    case 'equal_date':
                    case 'equal_time':
                        groupStatus = equalDo(vItem.groupType);
                        break;
                    case 'checked':
                        groupStatus = checkedDo();
                        break;
                    default:
                        groupStatus = allDo();
                }
                return groupStatus;
            }

            /**
             * 正则验证动作
             * @param vItem
             * @param validateType 强制验证类型
             * @return {Number}
             */
            function regAction(vItem, validateType) {
                var reg = RegExpMaps[validateType || vItem.type], obj = new RegExp(reg), val = vItem.elm.val();
                // 去左右空格验证
                val && (val = val.replace(/(^[\s\t\xa0\u3000]+)|([\u3000\xa0\s\t]+$)/g,''));
                return (obj.test(val)) ? 1 : -1;
            }

            /**
             * 数值范围验证
             * @param vItem
             * @return {Number}
             */
            function rangeAction(vItem) {
                var o = vItem.elm.val();
                if (!/^\d+(\.\d+)?$/.test(o) || o == '') {
                    return -1;
                }
                return conditionTranscoding('range', parseInt(o), vItem.condition);
            }

            /**
             * 字符长度范围验证
             * @param vItem
             * @return {Number}
             */
            function lenAction(vItem) {
                var val = vItem.elm.val();
                // 去左右空格验证
                val && (val = val.replace(/(^[\s\t\xa0\u3000]+)|([\u3000\xa0\s\t]+$)/g,''));
                return conditionTranscoding('range', vItem.halfChars ? getHalfChars(val) : val.length, vItem.condition);
            }

            /**
             * 英文字符取半，中文字符取个
             * abcd中国，算3个长度
             * @param str 字符串
             * @returns {number}
             */
            function getHalfChars(str) {
                var cArr = str.match(/[^\x00-\xff]/g), len = (cArr && cArr.length) || 0;
                return Math.round((str.length - len) / 2) + len;
            }


            return {
                doValidate: doValidate
            }
        }

        /**
         * 获取所有验证是否都通过
         * @return {Boolean}
         */
        function getAllIsSuccess() {
            var finished = true, custom_finished = true;
            J.each(CACHE, function (i, vObj) {
                if (vObj.groupId) {
                    var GRP = GROUPS[vObj.groupId];
                    if (GRP.require && GRP.status === -1) {// 如果是必填项，且验证未通过的
                        return (finished = false);
                    } else if (vObj.elm.val() !== '' && GRP.status === -1) {// 如果不是必填项，内容为空，且验证未通过
                        return (finished = false);
                    } else {
                        return (finished = true);
                    }
                } else if(vObj.elm.get().disabled){
                    return (finished = true);
                } else if (vObj.getStatus() === -1 || vObj.getStatus() === -2) { // 验证未通过或者在验证过程中的
                    return (finished = false);
                }
            });
            // 检查所有自定义任务状态
            J.each(CUSTOM, function(i, v){
                if(v === -1 || v === -2){
                    return (custom_finished = false);
                }
            });
            return (finished && custom_finished);
        }

        /**
         * 对外公开的验证入口
         */
        function validate(targetElm) {
            submiting = true;
            onErrorCallbacked = false; //重置，标识 onErrorCallBack 未完成
            taskerReady = true;
            //J.log('validate', 'submiting:'+submiting, 'onErrorCallbacked:'+onErrorCallbacked)

            var isTriggering = false;
            targetElm = (targetElm && targetElm.get) ? targetElm.get() : targetElm;

            J.each(CACHE, function (i, vObj) {
                if(targetElm){
                    if(vObj.elm.get() === targetElm){
                        triggering(vObj);
                        return false;
                    }
                    return true;
                }
                triggering(vObj);
            });

            function triggering(vObj){
                if (vObj.groupId) { // group处理方式
                    var GRP = GROUPS[vObj.groupId];
                    // 分组验证未通过，且验证触发源为空，或者触发源等于最后一次操作的元素，才开始触发验证动作
                    if (GRP.status === -1 && (!GRP.source || GRP.source === vObj.elm.get())) {
                        vObj.trigger();
                        isTriggering = true;
                    }
                } else if (vObj.getStatus() === -1 && !vObj.elm.get().disabled ) { // 非group处理方式
                    vObj.trigger();
                    isTriggering = true;
                }
            }

            // 如果没有任何 Tringger 发生，把所有权交给任务触发器
            (!isTriggering && !targetElm) && taskerTrigger();
        }

        /**
         * 任务回调触发器
         */
        function taskerTrigger(){
            //J.log('taskerTrigger', 'submiting:'+submiting, 'taskerReady:'+taskerReady, 'onErrorCallbacked:'+onErrorCallbacked, 'getAllIsSuccess():'+getAllIsSuccess())

            // 如果是点击提交按钮触发的验证，并且tasker都是完成的，并且所有验证都是通过的，完成验证
            if (submiting && taskerReady && getAllIsSuccess()) {
                validateComplate(); // 完成验证
            }else if(submiting && !onErrorCallbacked){ // 如果 onError 未执行，执行以下过程
                onErrorCallbacked = true; // 更新状态，确保 onError 只执行一次，因为 taskerTrigger 会被调用多次
                submiting = false; // 重置提交状态
                opts.onError && opts.onError(formElm);
            }
        }

        /**
         * 完成验证，自动提交或执行回调
         */
        function validateComplate() {
            submiting = false;
            if (opts.autoSubmit) {
                formElm.get().submit();
            } else {
                opts.onSuccess && opts.onSuccess(formElm);
            }
        }

        /**
         * 重置验证对象
         * @param elements
         */
        function resetValidateElements(elements){
            var vobj, target;

            if(J.isString(elements)){
                reset(elements);
            }else{
                J.each(elements, function(i, v){
                    reset(v);
                });
            }
            function reset(element){
                if(vobj = findValidateByElm(element)){
                    vobj.setStatus(-1);
                    (target = vobj.infoTarget) && target.hide()
                }
            }
        }

        function findValidateByElm(element){
            element = J.g(element).get();
            var l = CACHE.length;
            while (l--) {
                if (element === CACHE[l].elm.get()) {
                    return CACHE[l];
                }
            }
            return null;
        }

        /**
         * 动态添加验证元素
         * @param element 验证元素，是J.dom实例
         */
        function addValidateItem(element, vitems) {
            var vobj, ditems = {
                condition: '',
                elm: element,
                halfChars: true,
                message: '',
                placeholder: '',
                type: ''
            };
            ditems = J.mix(ditems, vitems || {});
            if(vobj = findValidateByElm(element)){
                var I = vobj.validateItems, l = I.length;
                while (l--) {
                    if (ditems.type === I[l].type) {
                        I[l] = ditems;
                        return;
                    }
                }
                I.push(ditems);
                return;
            }
            addValidateElement(element,buildValidateString(ditems));

        }

        /**
         * 通过验证规则对象还原属性字符串 data-validate
         * @param vitem
         * @returns {string}
         */
        function buildValidateString(vitem){
            var targetStr = vitem.target ? '$$target$'+vitem.target : '';
            return vitem.type+"$"+vitem.message + targetStr;
        }


        /**
         * 动态移除验证元素
         * @param element
         */
        function removeValidateItem(element, vtype) {
            var vobj,target;
            if(vobj = findValidateByElm(element)){
                var I = vobj.validateItems, l = I.length;
                while (l--) {
                    if (vtype === I[l].type) {
                        I.splice(l, 1);
                    }
                }
                I.length === 0 && removeValidateElement(element);
                vobj.setStatus(-1);
                (target = vobj.infoTarget) && target.hide().html('');
            }
        }

        /**
         * 动态添加验证元素
         * @param element 验证元素
         * @param vString 验证字符串
         */
        function addValidateElement(element, vString) {
            element = J.g(element);
            var validateString;
            if ( (validateString = vString) || (validateString = element.attr('data-validate')) ) {
                CACHE.push(new ValidateObject(element, validateString, taskerTrigger));
            }
        }

        /**
         * 动态移除验证元素
         * @param element
         */
        function removeValidateElement(element) {
            element = J.g(element).get();
            var l = CACHE.length, v;
            while (l--) {
                v = CACHE[l];
                if (element === v.elm.get()) {
                    v.elm.un();
                    v.targetCreated && v.infoTarget.remove();
                    CACHE.splice(l, 1);
                }
            }
        }

        function getValidateTypes(){
            return {
                REQUIRE: 'require',
                INTEGE:'intege',
                INTEGE1:'intege1',
                INTEGE2:'intege2',
                DECMAL:'decmal',
                DECMAL1:'decmal1',
                DECMAL2:'decmal2',
                EMAIL:'email',
                URL:'url',
                CHINESE:'chinese',
                ZIPCODE:'zipcode',
                QQ:'qq',
                TEL:'tel',
                TEL1:'tel1',
                MOBILE:'mobile',
                USERNAME:'username',
                LETTER:'letter',
                OK:'ok',
                ERROR:'error',
                TARGET:'target',
                INFO:'info',
                EVENT:'event',
                AUTO:'auto',
                CUSTOM:'custom'
            }
        }

        return {
            VTYPES: getValidateTypes(),
            resetElements: resetValidateElements,
            addElement: addValidateElement,
            removeElement: removeValidateElement,
            addItem: addValidateItem,
            removeItem: removeValidateItem,
            validate: validate
        };

    }

    J.dom.fn.validate = function(options){
        var o = options || {};
        o.formId = this;
        return new Validate(o);
    };

    J.ui.validate = Validate;

})(J);