/**
 * Aifang Javascript Framework.
 * Copyright 2012 ANJUKE Inc. All rights reserved.
 *
 * Form表单提交组件
 *
 * @path: ui/form.js
 * @author: Jock
 * @version: 1.0.0
 * @date: 2013/03/12
 *
 */

/// require('ui.ui');

;
(function (J) {

    /**
     * 缺省的选项配置
     * @type {Object}
     */
    var defaultOpts = {
        formId: '',  // Form表单ID
        data: {}     // 自定义数据 {key:'value'}
    };
    /**
     * Form Function
     * @param options 扩展选项
     * @constructor
     */
    function Form(options) {

        var formElm, data, group, opts, m = {
            getData: getFormElementsValue
        };

        // Initialize
        (function () {
            // 继承defaultOpts而不污染defaultOpts
            opts = J.mix(defaultOpts, options || {}, true);
            formElm = J.g(opts.formId);
            getFormElementsValue();
            buildAjaxMathed();
        })();

        /**
         * 构造 get & post 方法，调用ajax对应的方法，参数传递参照ajax get和post 参数说明
         */
        function buildAjaxMathed(){
            J.each(['get','post'],function(i, v){
                m[v] = function(url, options){
                    var newData = getFormElementsValue(),
                        ajaxData = J.mix(newData, options ? options.data || {} : url.data || {});
                    options ? options.data = ajaxData : url.data = ajaxData;
                    J[v].call(null, url, options);
                };
            });
        }

        /**
         * 获取所有表单元素值
         * @return {Object}
         */
        function getFormElementsValue() {
            data = {};
            group = {};
            var elm;

            formElm.s("*").each(function (i, element) {
                ((elm = element.eq(0).get()) && elm.type && !elm.disabled) && filterAvailableElement(element);
            });
            filterGroupObject();
            J.mix(data, group);
            return J.mix(data, opts.data || {});
        }

        /**
         * 对分组的对象做JSON处理
         */
        function filterGroupObject() {
            J.each(group, function (i, v) {
                if (J.isObject(v))
                    group[i] = toJSON(v);
            });
        }

        /**
         * JSON字符串处理
         * @param obj json对象
         * @return {String}
         */
        function toJSON(obj) {
            var objArr = [];
            J.each(obj, function (i, v) {
                objArr.push('"' + i + '":"' + v + '"');
            });
            return '{' + objArr.join(',') + '}';
        }

        /**
         * 只针对有效的表单做处理
         * @param element
         */
        function filterAvailableElement(element) {
            var elm = element.eq(0).get();
            switch (elm.type.toLowerCase()) {
                case 'checkbox':
                case 'radio':
                    if(!elm.checked) break;
                case 'hidden':
                case 'text':
                case 'select-one':
                case 'textarea':
                    buildElementValue(element);
            }
        }

        /**
         * 构建和获取表单元素的值或组织数据数组
         * @param element 有效的表单元素
         */
        function buildElementValue(element) {
            var elm = element.eq(0).get(), key = elm.name || elm.id, elmValue = element.val();
            var match = key.match(/^(\w+)\[(\d*)\]$/);
            if (!match) {
                data[key] = elmValue;
            } else {
                if (!((elm.type === 'checkbox' || elm.type === 'radio') && !elmValue)) {
                    if (match[2]) {
                        group[match[1]] || (group[match[1]] = {});
                        group[match[1]][match[2]] = elmValue;
                    } else {
                        group[match[1]] || (group[match[1]] = []);
                        group[match[1]].push(elmValue)
                    }
                }
            }
        }

        /**
         * 公开接口
         */
        return m;
    }

    /**
     * 扩展dom form方法，
     * @param data
     * @returns {Form}
     */
    J.dom.fn.form = function(data){
        var o = {
            formId: this,
            data:data||{}
        };
        return new Form(o);
    };

    J.ui.form = Form;

})(J);