/**
 * Aifang Javascript Framework.
 * Copyright 2012 ANJUKE Inc. All rights reserved.
 *
 * @path: ui/appdownload.js
 * @author: zhiqingchen
 * @version: 1.0.0
 * @date: 2013/08/08
 *
 */

/// require('ui.ui');
(function (J) {

	var defaultOpts={
		container:'home_app_content',
		isIos: (/iphone|ipad/gi).test(navigator.appVersion),
		isChrome: (/CriOS/).test(navigator.userAgent),
		app_link: '',
		img: '',
		track_android: '',
		track_android_close:'',
		track_ios:'',
		track_ios_close:'',
		title:'',
		expires: 14*24*60*60*1000,
		link_android:'',
		link_ios:''
	};

	function Appdownload(options){
		var appOptions = {
			anjuke: {
				app_link: "openanjuke://",
				img: J.site.info.includePrefix + "/touch/img/down_anjuke.jpg",
				title: "安居客App",
				link_android: "http://android.anjuke.com/getapkx.php?app=Anjuke&pm=b190&b190.apk",
				link_ios: "https://itunes.apple.com/cn/app/ju-ke-er-shou-fang-fang-jia/id415606289?mt=8",
				track_android: 'track_home_android_download',
				track_android_close: 'track_home_android_close',
				track_ios: 'track_home_ios_download',
				track_ios_close: 'track_home_ios_close'
			},
			haozu: {
				app_link: "openhaozu://",
				img: J.site.info.includePrefix + "/touch/img/down_haozu.jpg",
				title: "安居客租房App",
				link_android: "http://android.anjuke.com/getapkx.php?app=Haozu&pm=b190&b190.apk",
				link_ios: "https://itunes.apple.com/cn/app/hao-zu-zu-fang/id467586884?mt=8",
				track_android: 'track_home_haozu_android_download',
				track_android_close: 'track_home_haozu_android_close',
				track_ios: 'track_home_haozug_ios_download',
				track_ios_close: 'track_home_haozu_ios_close'
			},
			xinfang: {
				app_link: "opennewhouse://",
				img: J.site.info.includePrefix + "/touch/img/down_xinfang.jpg",
				title: "安居客新房App",
				link_android: "http://android.anjuke.com/getapkx.php?app=Xinfang&pm=b190&b190.apk",
				link_ios: "https://itunes.apple.com/cn/app/an-ju-ke-xin-fang/id582908841?mt=8",
				track_android: 'track_home_xinfang_android_download',
				track_android_close: 'track_home_xinfang_android_close',
				track_ios: 'track_home_xinfang_ios_download',
				track_ios_close: 'track_home_xinfang_ios_close'
			}
		}
		var opts = J.mix(defaultOpts, appOptions[options] || {}, true),element,ls = localStorage['appclose'+options];
        if ( (ls && (new Date()).getTime() - parseInt(ls) < opts.expires) || (opts.isIos&&opts.isChrome)){
            return false;
        }
		element = creatContent().appendTo(opts.container);
		bindEvent();

		function creatContent(){
			var cs = "margin-top: 6px;float: left;width: 28px;height: 31px;-webkit-background-size: 28px 31px;-moz-background-size: 28px 31px;background-size: 28px 31px;background-image: url(data:image/jpg;base64,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);",
			ms = "float: left;margin: 10px 8px 0 4px;width:59px;",
			ts = "float: left;width: 130px;margin-top: 10px;",
			as = "float: right;margin: 24px 8px 0 0;border: #bbb solid 1px;color: #333;line-height: 30px;padding: 0 10px;text-align: center;font-weight: bold;border-radius: 3px;font-size: 15px;background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#fff), to(#dedede), color-stop(0.1,#fff));",
			ss = "font-size: 16px;line-height: 25px;",
			sps = "font-size: 13px;color: #5f5f5f;line-height: 30px;font-weight: bold;",
			h = "<div class='download_c' style='"+cs+"' ></div><img src='"+opts.img+"' style='"+ms+"'><div style='"+ts+"'><strong style='"+ss+"'>"+opts.title+"</strong><br/><span style='"+sps+"'>更快捷，更省流量</span><br/></div>",
			e = J.create('div',{
				'id':'app_download_'+options,
				'class':'app_download',
				'style':'height: 77px;background-color: #e5e6e7;background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#fff), to(#e5e6e7));border-bottom: #d9d9d9 solid 1px;'
			}).html(h).hide();
			if(opts.isIos){
				J.create('a',{
					'href':"javascript:void(0);",
					'style':as
				}).html('查看').on('click',function(){
                	T.trackEvent(opts.track_ios);
                	J.create('iframe', {
                	    'src': opts.app_link
                	}).setStyle({'width':"0px",'height':'0px'}).appendTo('body');
                	setTimeout(function() {
                	    location.href = opts.link_ios;
                	}, 400);
				}).appendTo(e);
			}else{
				J.create('span',{
					'style':as
				}).html('极速下载').on('click',function(){
                	T.trackEvent(opts.track_android);
                	setTimeout(function(){location.href=opts.link_android}, 500);
				}).appendTo(e);
			}
			return e;
		}

		function bindEvent() {
			element.s('.download_c').eq(0).on('click', function() {
				var t = opts.isIos ? opts.track_ios_close : opts.track_android_close;
				T.trackEvent(t);
				try{localStorage['appclose'+options] = (new Date()).getTime();}catch(e){};
				remove();
			});
		}

		function hide(){
			element.hide();
		}

		function show(){
			element.show();
		}

		function remove(){
			element.remove();
		}

		return{
			element:element,
			hide:hide,
			show:show,
			remove:remove
		}
	}
	J.ui.appdownload = Appdownload;
})(J);