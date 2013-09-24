/**
 * Aifang Javascript Framework.
 * Copyright 2012 ANJUKE Inc. All rights reserved.
 *
 * @path: site/tracker.js
 * @author: Jock
 * @version: 1.0.0
 * @date: 2012/11/15
 *
 */

/// require('page.page');
/// require('logger.logger');


(function (J) {

    var W = J.W, D = J.D, Logger = J.logger, EventTracker, JPage = J.page;

    /**
     * AA log && SOJ
     * @param s site
     * @param p page
     * @param u user Cookie Name
     * @returns Tracker Object
     */
    Logger.Tracker = function (s, p, u) {
        var o = {}, getCookie = J.getCookie, m = {
            track:track
        };
        s && (o.site = s);
        p && (o.page = p);
        o.referrer = D.referrer || '';

        J.each('Site Page PageName Referrer Uid Method NGuid NCtid NLiu NSessid NUid Cst CustomParam SendType Screen Href'.split(' '), function (i, v) {
            var a = v.substring(0, 1).toLowerCase() + v.substring(1);
            m['set' + v] = function (v) {
                o[a] = v
            }
        });

        function buildParams() {
            var ret = {
                p:o.page,
                h:o.href || D.location.href,
                r:o.referrer || D.referrer || '',
                sc:o.screen || '{'
                    + '"w":"'+JPage.width()+'"'
                    + ',"h":"'+JPage.height()+'"'
                    + ',"r":"'+(W.devicePixelRatio >= 2 ? 1 : 0)+'"'
                + '}',
                site:o.site || '',
                guid:getCookie(o.nGuid || 'aQQ_ajkguid') || '',
                ctid:getCookie(o.nCtid || 'ctid') || '',
                luid:getCookie(o.nLiu || 'lui') || '',
                ssid:getCookie(o.nSessid || 'sessid') || '',
                uid:u || getCookie(o.nUid) || '0',
                t:+new Date()
            };
            o.method && (ret.m = o.method);
            (o.cst && /[0-9]{13}/.test(o.cst)) && (ret.lt = ret.t - parseInt(o.cst));
            o.pageName && (ret.pn = o.pageName);
            o.customParam && (ret.cp = o.customParam);
            return ret
        }

        function track(url) {
            var P = buildParams();
            try{
                J[o.sendType||'post']({url:url || Logger.sojUrl, type:'jsonp', data:P});
            }catch(e){
                Logger.log(e)
            }
        }

        return m;
    };

    /**
     * @param o.site site
     * @param o.page page
     * @param o.referrer referrer
     * @param o.options options
     */
    Logger.trackEvent = function(o){
        EventTracker = EventTracker || new Logger.Tracker();
        EventTracker.setSendType('get');
        EventTracker.setSite(o.site);
        o.page && EventTracker.setPage(o.page);
        o.href && EventTracker.setHref(o.href);
        o.page && EventTracker.setPageName(o.page);
        o.referrer && EventTracker.setReferrer(o.referrer);
        o.customparam ? EventTracker.setCustomParam(o.customparam) : EventTracker.setCustomParam("");
        EventTracker.track();
    }


})(J);