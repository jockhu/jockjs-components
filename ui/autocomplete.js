/**
 * Aifang Javascript Framework.
 * Copyright 2012 ANJUKE Inc. All rights reserved.
 *
 * @path: ui/autocomplete.js
 * @author: Jock
 * @version: 1.0.0
 * @date: 2012/10/11
 *
 */

/// require('ui.ui');
/// require('string.trim');

/**
 * @namespace J.ui.autocomplete
 *
 * @require dom.dom, event.on, event.un
 *
 *
 */
(function (J, D) {

    /**
     * 缺省的选项配置
     * @type {Object}
     */
    var defaultOpts = {
        url:'/',
        dataKey:'',
        filterHtml: true,
        autoSubmit: true,
        forceClear:false,
        defer: 100,
        width: 0,
        params: {},
        source: null,
        offset:{
            x:0,
            y:-1
        },
        offsetTarget:null, //偏移量目标元数，可以是回调函数 | ID
        boxTarget:null, //搜索结果在目标元数内呈现，可以是回调函数 | ID
        query: '',
        placeholder:'',
        toggleClass:'',
        cache:true,
        onForceClear:null,
        onItemClick:null,
        onResult:null,
        onChange:null,
        onSelect:null,
        onFoucs:null,
        onKeyPress:null,
        onBlur:null,
        onKeyUp:null,
        dataMap:null, // {id:'k', name:'v}
        itemBuild:null,
        tpl:'autocomplete_def'
    };

    /**
     * Auto Complete Function
     * @param el 需要绑定的输入框
     * @param options 扩展选项
     * @constructor
     */
    function Autocomplete(el, options) {
        var disabled = false, el = J.g(el), targetEl, equaled = -1, selectedIndex = -1, currentValue = el.val().trim(), CACHED = [], DATA = [], opts, aId, isShow = false, divs,
            mainContainer, container, valueChangeTimer = null, ignoreValueChange = false, intervalTimer = null, st,isFocusSupport=false,sendedStr='';

        (function(){
            el.attr('autocomplete', 'off');
            opts = J.mix(defaultOpts, options || {}, true);
            aId = 'Autocomplete_' + getId();
            targetEl = opts.offsetTarget ? J.isFunction(opts.offsetTarget) ? opts.offsetTarget() : J.g(opts.offsetTarget) : el;
            opts.width || (opts.width = targetEl.width()-2);
            opts.query = (opts.query || el.attr('name') || 'q');
            if(currentValue === '' && opts.placeholder){
                el.val(opts.placeholder);
                opts.toggleClass && el.removeClass(opts.toggleClass);
            }
            buildMain();
            bindEvent();
        })();

        function setPlaceholder(value){
            opts.placeholder = value
        }

        function getId(){
            return Math.floor(Math.random() * 0x1000000).toString(16);
        }

        function buildMain(){
            var boxTarget;
            mainContainer = J.create('div', {style:'position:absolute;z-index:10100'}).html('<div class="'+opts.tpl+'" id="' + aId + '" style="display:none; width:'+opts.width+'px"></div>');
            if(opts.boxTarget){
                if(J.isFunction(opts.boxTarget) && (boxTarget = opts.boxTarget())){
                    boxTarget.append(mainContainer);
                }else{
                    (boxTarget = J.g(opts.boxTarget)) ? boxTarget.append(mainContainer) : bodyInsert();
                }
            }else{
                bodyInsert()
            }

            function bodyInsert(){
                J.g('body').first().insertBefore(mainContainer)
            }
            container = J.g(aId);
        }

        function fixPosition() {
			var offset = targetEl.offset();
			mainContainer.setStyle({ top: (offset.y + el.height() + opts.offset.y) + 'px', left: (offset.x + opts.offset.x) + 'px' });
		}

        function bindEvent(){
            J.on(el, J.ua.opera ? 'keypress' : 'keydown', KeyPress);
            J.on(el, 'keyup', keyup);
            J.on(el, 'blur', blur);
            J.on(el, 'focus', focus);
            J.on(window, 'resize', fixPosition);

        }

        function KeyPress(e){
            if (disabled) { return; }
            (opts.onKeyPress) && opts.onKeyPress(el);
			switch (e.keyCode) {
				case 27: //KEY_ESC:
					el.val(currentValue.trim());
					hide();
					break;
				case 9: //KEY_TAB:
				case 13: //KEY_RETURN:
					if (selectedIndex === -1) {
						hide();
						return;
					}
					select(null, selectedIndex);
					break;
				case 38: //KEY_UP:
					moveUp();
					break;
				case 40: //KEY_DOWN:
					moveDown();
					break;
				default:
					return;
			}
			e.preventDefault();
        }

        function keyup(e){
            if (disabled) return;
            (opts.onKeyUp) && opts.onKeyUp(el);
			switch (e.keyCode) {
				case 38: //KEY_UP:
				case 40: //KEY_DOWN:
                case 13: //KEY_RETURN:
                case 27: //KEY_ESC:
					return;
			}
            if(ignoreValueChange) return;
            if(el.val().trim()=='') hide();
			clearTimeout(valueChangeTimer);
			!isFocusSupport && (valueChangeTimer = setTimeout(valueChange, opts.defer));
        }

        function blur(e){
            clearTimeout(valueChangeTimer);
            clearInterval(intervalTimer);
            (opts.onBlur) && opts.onBlur(e);
            J.on(D,'click',function(){
                isFocusSupport = false;
                if(opts.forceClear){
                    if(equaled == -1) {
                        el.val('');
                        opts.onForceClear && opts.onForceClear(el);
                    }
                    else onSelect(equaled);
                }
                hide();
                J.un(D, 'click', arguments.callee);
            });
            if(opts.placeholder && el.val().trim() === ''){
                opts.toggleClass && el.removeClass(opts.toggleClass);
                el.val(opts.placeholder);
            }
        }
        //mark onchange
        function focus(){
            isFocusSupport = true;
            if (disabled) { return; }
            (opts.onFocus) && opts.onFocus(el);
            if (opts.placeholder == el.val().trim()){
                el.val('');
                opts.toggleClass && el.addClass(opts.toggleClass);
                // return;
            }
            isFocusSupport && (intervalTimer = setInterval(function(){
                if(currentValue != (el.val().trim()) && !ignoreValueChange){;valueChange();}
            },30));
        }

        function valueChange(){
            if (disabled || ignoreValueChange) {
				ignoreValueChange = false;
				return;
			}
            if(!(currentValue = el.val().trim())) return;
            selectedIndex = -1;
            onChange(selectedIndex);
			getData();
        }

        function getCacheKey(){
            return encodeURIComponent(currentValue.trim());
        }

        function getData(){
            if(st) return;
            st = true;
            sendedStr= opts.params[opts.query] = currentValue.trim();
            if(opts.source){
                if(J.isFunction(opts.source)) opts.source(opts.params, suggest);
                else suggest(opts.source);
                return;
            }

            var a;
            if(opts.cache && (a = CACHED[getCacheKey()])) return suggest(a,'c');


            J.get({
                url:opts.url,
                type:'json',
                data:opts.params,
                onSuccess:suggest
            });
        }

        function buildData(a){
            var dataArr = [];
            if(J.isString(a)) return dataArr;
            J.each(a, function(i, v){
                dataArr.push(buildItem(i,v));
            });
            return dataArr;
        }

        function buildItem(k, v){
            var ret = {};
            if(J.isString(v)){
                return { k:k,v:v,l:v};
            }else{
                ret = opts.dataMap ? opts.dataMap(v) : v;
                ret.v || (ret.v = getFirstValue(v));
                ret.k || (ret.k = ret.v);
                ret.l || (ret.l = ret.v);
            }
            return ret;
        }

        function suggest(a, cached){
            var div, t, val, elVal = el.val();
            st = false;
            equaled = -1;

            if(cached){
                DATA = a
            }else{
                // 兼容 jQuery autocomplete 数据格式
                a = opts.dataKey && a[opts.dataKey] || a.data || a;
                DATA = buildData(a);
            }

            (opts.onResult) && opts.onResult(el, DATA);

            if (!DATA || DATA.length === 0) {
				hide();
				return;
			}

            cached || (CACHED[getCacheKey()] = DATA);

            container.empty();

            J.each(DATA, function(i, v){
                cached || (opts.itemBuild && J.mix( v, opts.itemBuild(v) || {} ) );
                t = opts.filterHtml ? getValue(v.v) : v.v;
                if(t == elVal) equaled = i;
                v.l && (div = J.create('div', {"class": selectedIndex === i ? 'ui_item ui_sel':'ui_item', title:t}).html(v.l).appendTo(container)).on('mouseover', activate, i).on('click', function(e, i){
                    if(opts.onItemClick && opts.onItemClick(i, v, div) == false){
                        return
                    }
                    select(e, i);
                }, i, true, true);

            });
            show();
            divs = container.s('div');
        }

        function getFirstValue(values){
            var firstValue;
            J.each(values, function(i, v){
                firstValue = v;
                return false;
            });
            return firstValue;
        }


        function activate(e, selIndex){
            divs.each(function(i, div){
                div.removeClass('ui_sel')
            });
            divs.eq(selectedIndex = selIndex).addClass('ui_sel');
        }

        function select(e, selIndex){
            e && e.stop();
            equaled = selIndex;
            var form, item;
            ignoreValueChange = true;
            if(!J.isUndefined(selIndex)){
                item = DATA[selIndex];
                J.mix( item, onSelect(selIndex) || {} );
                el.val( currentValue = ( opts.filterHtml ? getValue(item.v) : item.v) );
            }
            hide();
            if(opts.autoSubmit && (form = el.up('form'))){
                if (opts.placeholder == el.val().trim()){
                    el.val('');
                }
                form && form.get().submit();
            }
        }

        function getValue(v){
            return v ? v.trim().replace(/<\/?[^>]*>/g,'') : '';
        }

        function moveUp(){
            if (selectedIndex <= 0){
                divs.eq(selectedIndex).removeClass("ui_sel");
                selectedIndex = divs.length;
                el.val(sendedStr);
                return;
            };
            var div;
            ignoreValueChange = true;
            el.val( currentValue = getValue((div = divs.eq(--selectedIndex).addClass('ui_sel')).html()) );
            div.next()&&div.next().removeClass('ui_sel')||divs.eq(0).removeClass("ui_sel");
            onChange(selectedIndex);
        }

        function moveDown(){
            if (!isShow || selectedIndex === divs.length-1){
                divs.eq(selectedIndex).removeClass("ui_sel");
                selectedIndex = -1;
                el.val(sendedStr);
                return;
            }
            if (!isShow || selectedIndex === divs.length){
                selectedIndex = -1;
            }
            var div;
            ignoreValueChange = true;
            el.val( currentValue = getValue((div = divs.eq(++selectedIndex).addClass('ui_sel')).html()) );
            selectedIndex > 0 && div.prev()&&div.prev().removeClass('ui_sel')||divs.eq(divs.length-1).removeClass("ui_sel");
            onChange(selectedIndex);
        }

        function onChange(selIndex){
            (opts.onChange && selIndex != -1) && opts.onChange(DATA[selIndex]);
        }

        function onSelect(selIndex){
            return (opts.onSelect && selIndex != -1) && opts.onSelect(DATA[selIndex]);
        }

        function show(){
            selectedIndex = -1;
			isShow || (container.show(),isShow = true);
            fixPosition();
        }

        function hide(){
            selectedIndex = -1;
            ignoreValueChange = false;
			isShow && (container.empty().hide(),isShow = false);
        }

        function enable(){
            disabled = false;
        }

        function disable(){
            disabled = true;
        }

        function setParams(params, rewrite){
            opts.params = (!rewrite) ? J.mix(opts.params, params, true) : params;
        }

        return {
            setParams:setParams,
            setPlaceholder:setPlaceholder,
            enable:enable,
            disable:disable,
            hide:hide,
            show:show
        };
	}


    J.dom.fn.autocomplete = function(options){
        return new Autocomplete(this.get(), options)
    };

    J.ui.autocomplete = Autocomplete;


})(J, document);