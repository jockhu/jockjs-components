Jock.extend(fn,(function(){
    /**
     * 导航搜索配置
     * @param {String} container 容器ID
     * @param {String} city 城市名称
     * @param {String|null} background 图片地址
     * @param {String|Point|LocalResultPoi} start 起点
     * @param {String|Point|LocalResultPoi} end 终点
     * @param {String|null} startTitle 起始标题
     * @param {String|null} endTitle 终点标题
     * @param {String|null} routeType 导航类别（交通导航|驾车路线）
     * @return {Object}
     */
    var RouteOptions = {
        container: '',
        city:'',
        background:'',
        start:'',
        end:'',
        startTitle:'',
        endTitle:'',
        routeType:'transit',
        isReSearch:false
    };
    var STATUS = 0;
    function fullRouteOptons(RouteOptions, routeType){
        Jock.extend(RouteOptions,RouteOptions||{});
        Jock.extend(RouteOptions,{routeType:routeType});
    }
    function E(tag){
        return document.createElement(tag);
    }
    /**
     * 本地搜索
     * @param {String} searchName 名称
     * @return {null}
     */
    function localSearch(RouteOptions) {
        var local = new BMap.LocalSearch(map,{
            onSearchComplete: function(results){
                RouteOptions.container.innerHTML = '';
                var s = [], l = results.getCurrentNumPois(), rs;
                if(l<=0){
                    RouteOptions.container.innerHTML = getErrTemplate(RouteOptions);
                    return false;
                }
                var div = E('div'),b = E('b'),li;
                div.style.cssText = 'clear:both; height:225px; overflow-x:hidden; overflow-y:auto; padding:8px 0 0 8px; line-height:26px;';
                b.style.cssText = 'font-size:13px; color:#666;';
                b.innerHTML = '请确认起点';
                div.appendChild(b);

                function _SearchRoute(sPoint, sTitle){
                    return function(){
                        RouteOptions.startTitle = sTitle;
                        RouteOptions.start = sPoint;
                        RouteOptions.isReSearch = true;
                        Route(RouteOptions);
                    }
                }

                for(var i=0;i<l;i++){
                    rs = results.getPoi(i);
                    li = E('li');
                    li.style.cssText = 'padding:0 0 0 14px; margin-bottom:10px; float:left; background:url('+RouteOptions.background+') 0 -305px no-repeat; width:195px; line-height:26px;';
                    rs.address = rs.address ? rs.address : '';
                    li.innerHTML = '<span style="display:block;line-height:17px; cursor: pointer;"><a href="javascript:void(0)">'+rs.title+'</a> '+rs.address+'</span>';
                    li.onclick = _SearchRoute(rs.point, rs.title);
                    div.appendChild(li);
                }
                RouteOptions.container.appendChild(div);
            }
        });
        local.search(RouteOptions.start);
    }
    /**
     * 获得路线换乘规划标题
     * @param {Object} plan 换乘计划
     * @return {Array}
     */
    function getLineTitles(plan){
        var n = plan.getNumLines(), title = [];
        for(var i=0;i<n;i++){
            var _title = plan.getLine(i).title.replace(/\(.*\)/,'');
            title.push(_title.match(/^\d+$/) ? _title + '路' : _title);
        }
        return title;
    }
    /**
     * 获得路线换乘 Description
     * @param {Object} RouteOptions 导航搜索配置
     * @param {Object} results 换乘计划
     * @param {Int} index 第几条计划路线
     * @return {String}
     */
    function getRouteDescription(RouteOptions, results, index, routeType){
        var plan     = results.getPlan(index),
            route         = plan.getRoute(0),
            _titles     = '',
            _startTitle = RouteOptions.startTitle || results.getStart().title,
            _endTitle     = RouteOptions.endTitle || results.getEnd().title,
            _desc         = []
        len            = 0;

        // 最外框
        var description = ['<div id="sec_result" style="clear:both; overflow-x:hidden; overflow-y:auto; padding:8px 0 5px 6px; height:220px; font-size:12px;">'];

        // 时间 / 路程
        description.push('<span style="margin:0 0 0 2px; display:block; color:#999; line-height:18px; font-size:12px;">');

        if(RouteOptions.routeType == 'driving'){
            description.push('<b style="color:#666; font-size:13px;">全程</b>');
        }else{
            _titles = getLineTitles(plan);
            for(var i=0;i<_titles.length;i++){
                _desc.push('<b style="color:#666; font-size:13px;">'+_titles[i]+'</b>');
            }
            description.push(_desc.join('<b style="font-size:13px;">→</b>'));
        }
        description.push('    <br/>约' + plan.getDuration() + ' / ' + plan.getDistance());
        description.push('</span>');

        // 起点
        description.push('<span style="display:block; padding:2px 0 0 25px; height:24px; background:url('+RouteOptions.background+') 0 -49px no-repeat; margin:10px 0 0; white-space:nowap; overflow:hidden;">');
        description.push('    <span style="display:block; float:left; background:url('+RouteOptions.background+') right 0 no-repeat; margin-left:2px; height:18px;">');
        description.push('        <strong style="display:block; margin:0 8px 0 0; padding:0 0 0 8px; line-height:19px; background:url('+RouteOptions.background+') 0 0 no-repeat; color:#fff;">'+_startTitle+'</strong>');
        description.push('    </span>');
        description.push('</span>');

        description.push('<ul style="width:207px; border-top:1px solid #ddd;">');


        if(RouteOptions.routeType == 'driving'){
            // 驾车
            len = route.getNumSteps();
            for(var i = 0; i < len; i++) {
                description.push(getLineTemplate(RouteOptions, 3, route.getStep(i).getDescription().replace(/<b>/gi,'<b style="color:#f60; font-weight: normal">'), (i + 1)));
            }
        }else{
            // 公交
            len = plan.getNumRoutes();
            for(var j=0;j<len;j++){
                var route = plan.getRoute(j);
                var line = plan.getLine(j);
                if(route.getDistance(false) > 0){
                    if(j == len-1){
                        description.push(getLineTemplate(RouteOptions, 2,'步行至<span style="color:#f60;">'+_endTitle+'</span>'));
                    }else{
                        description.push(getLineTemplate(RouteOptions, 2,'步行至<span style="color:#f60;">'+line.getGetOnStop().title+'站</span>'));
                    }
                }
                if(j < len-1){
                    description.push(getLineTemplate(RouteOptions, line.type,'乘坐<span style="color:#f60;">'+_titles[j] + '('+line.title.match(/-(.*[^)])[^\s]/)[1]+'方向)</span>在<span style="color:#f60;">'+line.getGetOffStop().title+'站</span>下车',RouteOptions.background));
                }
            }
        }

        description.push('</ul>');

        // 终点
        description.push('<span style="display:block; padding:2px 0 0 25px; height:24px; background:url('+RouteOptions.background+') 0 -80px no-repeat; margin:5px 0 0; clear:both;">');
        description.push('    <span style="display:block; float:left; background:url('+RouteOptions.background+') right 0 no-repeat; margin-left:2px; height:18px;">');
        description.push('        <strong style="display:block; margin:0 8px 0 0; padding:0 0 0 8px; line-height:19px; background:url('+RouteOptions.background+') 0 0 no-repeat; color:#fff;">'+_endTitle+'</strong>');
        description.push('    </span>');
        description.push('</span>');

        description.push('</div>');

        return description.join('');
    }
    /**
     * 获得路线换乘模板
     * @param {Int} type 交通路线类型
     * @param {String} desc 路线换成描述
     * @param {String} index 只在驾车路线下有效
     * @return {String}
     */
    function getLineTemplate(RouteOptions, type, desc, index){
        var _line_template = '', _x = 0;
        if(type == 0){ //公交
            _x = '-6px';
        }else if(type == 1){ // 地铁
            _x = '-68px';
        }else if(type == 2){ // 步行
            _x = '-38px';
        }
        _line_template = '<li style="padding:5px 0; _padding:4px 0 0; width:207px; line-height:20px; border-bottom:1px solid #ddd;">';
        if(type == 3){ // 驾车
            _line_template +='  <i style="float:left;width:25px;height:18px;text-align:center;font-style: normal">'+index+'.</i>';
        }else{
            _line_template +='  <i style="float:left; width:25px; height:18px; background:url('+RouteOptions.background+') '+ _x +' -23px no-repeat;"></i>';
        }
        _line_template +='  <span style="float:left; width:180px;">'+desc+'</span>';
        _line_template +='  <div style="clear:both; margin:0; padding:0; height:0; line-height:0;"></div>';
        _line_template +='</li>';
        return _line_template;
    }
    /**
     * 导航
     * @param {Object} RouteOptions 导航搜索配置
     * @return {Object}
     */
    function Route(RouteOptions){
        var route = null;
        if(RouteOptions.routeType == 'transit'){
            route = new BMap.TransitRoute(RouteOptions.city);
            route.setPageCapacity(1);
        }else{
            route = new BMap.DrivingRoute(RouteOptions.city);
        }
        //route.enableAutoViewport();
        route.setSearchCompleteCallback(function(results) {
            var status = route.getStatus(), index = 0;
            if(status == BMAP_STATUS_SUCCESS) {
                RouteOptions.container.innerHTML = getRouteDescription(RouteOptions, results, index); // 获取路线 Description
                DrawLine(RouteOptions, results, index);
            }else if(status == BMAP_STATUS_UNKNOWN_ROUTE){
                if(RouteOptions.isReSearch){
                    RouteOptions.container.innerHTML = getErrTemplate(RouteOptions);
                    return false;
                }
                localSearch(RouteOptions);
            }
        });
        route.enableAutoViewport();
        route.search(RouteOptions.start, RouteOptions.end);
        return route;
    }
    /**
     * 搜索无结果
     * @param {Object} RouteOptions 导航搜索配置
     * @return {Object}
     */
    function getErrTemplate(RouteOptions){
        return '<div style="clear:both; height:244px; overflow-x:hidden; overflow-y:auto; padding:8px 0 0 8px; line-height:26px;"><b style="font-size:13px; color:#666;">在 '+RouteOptions.city+' 未找到相关地点，您可更换关键词再尝试。</b></div>'
    }
    /**
     * 公交导航
     * @param {Object} RouteOptions 导航搜索配置
     * @return {Object}
     */
    function TransitRoute(RouteOptions){
        fullRouteOptons(RouteOptions, 'transit');
        return Route(RouteOptions);
    }

    /**
     * driving
     * @param {Object} RouteOptions 导航搜索配置
     * @return {Object}
     */
    function DrivingRoute(RouteOptions){
        fullRouteOptons(RouteOptions, 'driving');
        return Route(RouteOptions);
    }

    function DrawLine(RouteOptions, results, index){
        fn.removeOverlays('route');
        var Bounds     = [],
            plan         = results.getPlan(index);
        var MarkerOptions = {
            icon:RouteOptions.background,
            showInfo : false,
            size: {w: 21,h: 21},
            offset: {x: 0,y: 0},
            imgOffset: {x: 0,y:0}
        };
        function addPoints(points) {
            for(var i = 0; i < points.length; i++) {
                Bounds.push(points[i]);
            }
        }
        function addMarkerFun(point, title, options){
            Jock.extend(MarkerOptions, Jock.extend({latlng:point,title:title},options||{}));
            fn.addMarker(MarkerOptions, 'route');
        }

        if(RouteOptions.routeType == 'transit'){
            // 绘制公交线路
            for( i = 0; i < plan.getNumLines(); i++) {
                var line = plan.getLine(i);
                addPoints(line.getPath());
                // 公交
                if(line.type == BMAP_LINE_TYPE_BUS) {
                    // 上车
                    addMarkerFun(line.getGetOnStop().point, line.getGetOnStop().title, {size: {w: 21,h: 21}, offset : {x : 11,y : 21}, imgOffset: {x: 0,y:-196}} );
                    // 下车
                    addMarkerFun(line.getGetOffStop().point, line.getGetOffStop().title, {size: {w: 21,h: 21}, offset : {x : 11,y : 21}, imgOffset: {x: 0,y:-196}} );

                    // 地铁
                } else if(line.type == BMAP_LINE_TYPE_SUBWAY) {
                    // 上车
                    addMarkerFun(line.getGetOnStop().point, line.getGetOnStop().title, {size: {w: 21,h: 21}, offset : {x : 11,y : 21}, imgOffset: {x: 0,y:-227}} );
                    // 下车
                    addMarkerFun(line.getGetOffStop().point, line.getGetOffStop().title, {size: {w: 21,h: 21}, offset : {x : 11,y : 21}, imgOffset: {x: 0,y:-227}} );
                }
                fn.addPloyline(line.getPath(),'','route','line'+i);
            }
        }

        var PloylineOptions = {
            strokeOpacity : 0.75,
            strokeWeight : 4,
            enableMassClear : true
        }
        if(RouteOptions.routeType == 'transit'){
            PloylineOptions['strokeStyle'] = "dashed";
            PloylineOptions['strokeColor'] = "#30a208";
        }else{
            PloylineOptions['strokeStyle'] = "solid";
            PloylineOptions['strokeColor'] = "#f0f";
        }

        // 绘制驾车步行线路
        for(var i = 0; i < plan.getNumRoutes(); i++) {
            var route = plan.getRoute(i);
            addPoints(route.getPath());
            if(route.getDistance(false) > 0) {
                // 步行线路有可能为0
                fn.addPloyline(route.getPath(), PloylineOptions, 'route', 'route'+i);
            }
        }

        // 终点
        addMarkerFun(results.getEnd().point, results.getEnd().title, {size: {w: 40,h: 32}, offset : {x : 20,y : 16}, imgOffset: {x: 0,y:-154} });
        // 开始点
        addMarkerFun(results.getStart().point, RouteOptions.startTitle || results.getStart().title, {size: {w: 40,h: 32}, offset : {x : 15,y : 16}, imgOffset: {x: 0,y:-111} });

        map.setViewport(Bounds);

    }

    return {
        TransitRoute: TransitRoute,
        DrivingRoute: DrivingRoute
    }

})());
return fn;
};

