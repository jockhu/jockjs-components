/**
 * Aifang Javascript Framework.
 * Copyright 2012 ANJUKE Inc. All rights reserved.
 *
 * @path: ui/dialog.js
 * @author: hqyun
 * @version: 1.0.0
 * @date: 2012/12/04
 *
 */

/// require('ui.ui');

;
(function () {

    function Dialog() {
        function alert() {
            var panel = new J.ui.panel({
                title:'提示信息',
                content:'<span>确定要删除吗？</span>',
                ok:'确定',
                cancel:'取消',
                onOk:function () {
                    panel.close();
                    //console.log('已点击确认')
                },
                onCancel:function () {
                    panel.close();
                    //console.log('操作被取消')
                },
                onClose:function () {
                    //console.log('对话框被关闭')
                }
            });
        }

        function confirm() {
            var panel = new J.ui.panel({
                title:'提示信息',
                content:'<span>确定要删除吗？</span>',
                ok:'确定',
                cancel:'取消',
                onOk:function () {
                    panel.close();
                    //console.log('已点击确认')
                },
                onCancel:function () {
                    panel.close();
                    //console.log('操作被取消')
                },
                onClose:function () {
                    //console.log('对话框被关闭')
                }
            });
        }
    }

    J.ui.dialog = Dialog;

})();