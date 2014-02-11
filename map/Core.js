/**
 * Aifang Javascript Framework.
 * Copyright 2012 ANJUKE Inc. All rights reserved.
 *
 * 表单验证组件
 *
 * @path: map/core.js
 * @author: lunjiang
 * @version: 1.0
 * @date: 2014/02/08
 *
 */


/// require('map.map');


(function(J){


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
        email: "^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$", //邮件
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





})(J)

