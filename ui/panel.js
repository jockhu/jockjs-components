/**
 * Aifang Javascript Framework.
 * Copyright 2012 ANJUKE Inc. All rights reserved.
 *
 * @path: ui/panel.js
 * @author: Jock
 * @version: 1.0.0
 * @date: 2012/12/05
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
    var defaultOpts = {
        autoClose: '',
        scroll:false,
        mask: true,
        modal: true,
        title: '',
        content: '',
        close: true,
        ok: '',
        cancel: '',
        width: 360,
        height: '',
        position: {}, // {top:'',left:'',right:'',bottom:''}
        drag: false,
        fixed: '',
        onClose: null,
        onOk: null,
        onCancel: null,
        custom:null,
        tpl: 'panel_def'
    }, main, boxModal, identityIndex = 0;

    /**
     * Panel Function
     * @param options 扩展选项
     * @constructor
     */
    function Panel(options) {
        var m, boxPanel, boxIfm, boxTitle, boxContent, boxClose, boxFooter, opts , tpl , page = J.page, timer, title, boxTopRadius = '0 0', boxBottomRadius = '0 0', okDisable = false, okBt, cancelBt, pageWidth = page.width(), pageHeight = page.height();

        main || (main = insertFirst('body', {style: 'padding:0;margin:0'}));


        /**
         * Initialize
         */
        (function() {
            opts = J.mix(defaultOpts, options || {}, true);
            opts.modal && (boxModal || (boxModal = createModal()), boxModal.show());
            opts.mask && boxModal.addClass('panel_modal_mask');
            tpl = opts.tpl;
            title = opts.title;
            boxPanel = J.create('div', {style: 'z-index:10001;position:absolute', 'class': tpl, 'id':(tpl + Math.random()).replace(/\./,'')+(++identityIndex)});
            boxIfm = J.create('iframe', {style: 'z-index:-1;position:absolute;', 'scrolling': 'no', 'frameborder': '0'});
            boxPanel.append(boxIfm);
            opts.mask && boxPanel.addClass(tpl + '_mask');
            title && (boxTitle = appendTo(boxPanel, 'title').html(title));
            opts.close && (boxClose = appendTo(boxPanel, 'close', 'a')).attr('href', 'javascript:;').on('click', close, null, true, true);
            boxContent = appendTo(boxPanel, 'box');
            title || (boxContent.setStyle('border-top:0'), boxTopRadius = '5px 5px');
            opts.ok ? createFooter() : (boxContent.setStyle('border-bottom:0'), boxBottomRadius = '5px 5px');
            boxContent.setStyle('border-radius:' + boxTopRadius + ' ' + boxBottomRadius);
            main.append(boxPanel);
            var s = {};
            J.each(['width','height'],function(i, v){
                opts[v] && (s[v] = opts[v] + 'px');
            });
            boxPanel.setStyle(s);

            if(opts.content){
                setContent(opts.content);
            }else{
                fixPosition();
            }
            opts.autoClose && setAutoClose(opts.autoClose);
            opts.custom && opts.custom(boxPanel)

        })();


        /**
         * 设置自动关闭
         * @param second 秒
         */
        function setAutoClose(second){
            timer = setTimeout(close, (parseInt(second) - 1) * 1000);
        }


        function createFooter() {
            boxFooter = appendTo(boxPanel, 'footer');
            var ok = opts.ok, cancel = opts.cancel;
            okBt = appendTo(boxFooter, 'button', 'a').attr('href', 'javascript:;').addClass(tpl + '_ok').html(ok);
            cancel && (cancelBt = appendTo(boxFooter, 'button', 'a')).attr('href', 'javascript:;').html(cancel);
            (opts.onOk && okBt) && okBt.on('click', function () {
                if (okDisable) {
                    return false;
                }
                opts.onOk(m)
            }, null, true, true);
            (opts.onCancel && cancelBt) && cancelBt.on('click', function () {
                opts.onCancel(m)
            }, null, true, true);
        }

        function removeFooter(){
            if(boxFooter){
                J.s('.' + opts.tpl + '_button').each(function(i, v){
                    v.un()
                });
                boxFooter.remove();
            }
        }

        function createModal() {
            return J.create('div').addClass('panel_modal').setStyle({
                backgroundColor: '#333',
                zIndex: 10000,
                width: page.width() + 'px',
                height: page.height() + 'px',
                position: 'absolute',
                left: '0',
                top: '0'
            }).insertFirstTo(main);
        }

        function fixPosition(width, height) {
            var viewHeight = page.viewHeight(), viewWidth = page.viewWidth(),
                scrollTop = !opts.fixed ? page.scrollTop() : 0, scrollLeft = !opts.fixed ? page.scrollLeft() : 0,
                position = opts.position || {},
                panelWidth = width || boxPanel.width(), panelHeight = (height || boxPanel.height() - 2), s = {
                    width: panelWidth + 'px'
                };

            J.each(position, function (i, v) {
                s[i] = v + 'px';
            });

            // 如果panel的高度超过一屏，设置panel内的content为滚动条，达到panel在一屏内显示的目的
            if (panelHeight > viewHeight) {
                if(opts.scroll){
                    boxContent.setStyle('height:' + (viewHeight - 140) + 'px;overflow-y:auto;');
                    panelHeight = boxPanel.height();
                }else{
                    s.top = '0';
                }
            }

            //s.height = panelHeight + 'px';  modify by hqyun 2013.03.28
            s.top || (s.top = ((viewHeight / 2) - (panelHeight / 2) + scrollTop + 'px'));
            s.left || (s.left = ((viewWidth / 2) - (panelWidth / 2) + scrollLeft + 'px'));
            s.right && (s.left = 'auto');
            s.bottom && (s.top = 'auto');
            boxPanel.setStyle(s);

            if (opts.fixed) {
                s = {};
                if (J.ua.ie == 6) {
                    var html = document.getElementsByTagName('html')[0],
                        boxPanelStyle = boxPanel.get().style,
                        dom = '(document.documentElement || document.body)',
                        oldTop = parseInt(boxPanelStyle.top || 0),
                        oldLeft = parseInt(boxPanelStyle.left || 0);
                    // 给IE6 fixed 提供一个"不抖动的环境"
                    // 只需要 html 与 body 标签其一使用背景静止定位即可让IE6下滚动条拖动元素也不会抖动
                    // 注意：IE6如果 body 已经设置了背景图像静止定位后还给 html 标签设置会让 body 设置的背景静止(fixed)失效
                    if (document.body.currentStyle.backgroundAttachment !== 'fixed') {
                        html.style.backgroundImage = 'url(about:blank)';
                        html.style.backgroundAttachment = 'fixed';
                    }
                    boxPanelStyle.setExpression('top', 'eval(' + dom + '.scrollTop + ' + oldTop + ') + "px"');
                    boxPanelStyle.setExpression('left', 'eval(' + dom + '.scrollLeft + ' + oldLeft + ') + "px"');
                } else {
                    s.position = 'fixed';
                }
                boxPanel.setStyle(s);
            }

            boxIfm.setStyle({
                width: boxPanel.width() + 'px',
                height: (boxPanel.height()-1) + 'px'
            });
        }

        function insertFirst(container, attrs) {
            return J.create('div', attrs || {}).insertFirstTo(container);
        }

        function appendTo(container, type, tagName) {
            return J.create(tagName || 'div', {'class': tpl + '_' + type}).appendTo(container);
        }

        // public

        function close() {
            timer && clearTimeout(timer);
            boxClose && boxClose.un('click');
            boxPanel.remove();
            (opts.modal && boxModal) && boxModal.removeClass('panel_modal_mask').hide();
            opts.onClose && opts.onClose();
        }

        function setContent(content, width, height) {
            boxContent.html(content);
            fixPosition(width, height);
        }

        function setTitle(content) {
            boxTitle.html(content)
        }

        function setOptions(newOpts) {
            opts = J.mix(opts, newOpts || {});
        }

        function setOkDisable(boolDisable){
            boolDisable ? okBt.addClass(tpl + '_ok_disable') : okBt.removeClass(tpl + '_ok_disable');
            okDisable = boolDisable;
        }

        m = {
            close: close,
            setTitle: setTitle,
            setContent: setContent,
            setAutoClose: setAutoClose,
            setOptions: setOptions,
            setOkDisable: setOkDisable,
            removeFooter:removeFooter
        }

        return m;

    }

    J.ui.panel = Panel;

})(J);