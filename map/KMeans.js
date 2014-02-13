/**
 * Created by kathleen on 14-2-12.
 */
/**
 * 使用示例
 * var str ='[{"lng":696,"lat":205,"id":361,"propCount":30},{"lng":673,"lat":204,"id":379,"propCount":21},{"lng":634,"lat":205,"id":378,"propCount":21},{"lng":633,"lat":204,"id":376,"propCount":26},{"lng":603,"lat":203,"id":375,"propCount":23},{"lng":717,"lat":198,"id":374,"propCount":21},{"lng":714,"lat":202,"id":373,"propCount":21},{"lng":683,"lat":194,"id":372,"propCount":21},{"lng":677,"lat":194,"id":362,"propCount":21},{"lng":0,"lat":245,"id":363,"propCount":12},{"lng":89,"lat":348,"id":364,"propCount":13},{"lng":89,"lat":375,"id":365,"propCount":17},{"lng":74,"lat":381,"id":366,"propCount":19}]';
 * var items = eval('(' + str + ')');
 * var k = new KMeans();
 * k.cluster(15,items,function(points){
 *     console.log(points);
 * });
 */
var KMeans = (function () {

    var ERR_K_IS_ZERO = 'k cannot be zero';

    if (typeof _ === 'function') {
        var sortBy = _.sortBy, reduce = _.reduce;
    } else {
        /* Thanks to madrobby and Karnash */
        var sortBy = function(a,b,c){c=a.slice();return c.sort(function(d,e){d=b(d),e=b(e);return(d<e?-1:d>e?1:0)})}, reduce = function(t,c) {var u; for (var i = (v=t[0],1); i < t.length;) v = c(v,t[i],i++,t); i<2 & u && u(); return v;};
    }

    /** Constructor */

    var kmeans = function () {
        this.iterations = 0;
        this.converged = false;
        this.maxIterations = -1;
        this.k = 0;
        this.minDistance = 0.0024315974;
        this.lastPoints = [];
    };

    kmeans.prototype.in_array = function(stringToSearch, arrayToSearch) {
        for (var s = 0; s < arrayToSearch.length; s++) {
            thisEntry = arrayToSearch[s].toString();
            if (thisEntry == stringToSearch) {
                return true;
            }
        }
        return false;
    };

    /** Resets k-means. */

    kmeans.prototype.reset = function () {
        this.iterations = 0;
        this.converged = false;
        this.points = [];
        this.centroids = [];
    };

    kmeans.prototype.boxReset = function () {
        this.pointBoxLatDistance = 0.0044337762462;
        this.pointBoxLngDistance = 0.0147902983720;
        this.initPoints = {lat:0,lng:0};
        this.boxNum = 5;
        this.converged = false;
        this.points = [];
        this.centroids = [];
    };

    /** 算出两个点之间的距离. */

    kmeans.prototype.distance =  function(a, b) {
        return Math.sqrt( Math.pow(a.lng - b.lng, 2) +  Math.pow(a.lat - b.lat, 2) );
    };

    /** Resets k-means and sets initial points*/

    kmeans.prototype.setPoints = function (points) {
        this.reset();
        this.points = points;
    };

    /** Guess the amount of centroids to be found by the rule of thumb */

    kmeans.prototype.guessK = function (num) {
        num = parseInt(num);
        this.k = ~~(Math.sqrt(this.points.length));
        this.k = num ? num:this.k;
        //this.k = 15;
    };

    /** Clusters the provided set of points. */

    /** Clusters the provided set of points. */

    kmeans.prototype.cluster = function (K,pointItem,lastPointItem,mparams,callback) {
        if (lastPointItem.length > 0) {
            var bounds = mparams.bounds;
            var zoom = mparams.zoom;
            this.minDistance = this.zoomDistance(zoom);
            //1.算出新增的小区点，[排除矩阵内部的小区点,小区与聚合点的距离 < this.minsize的小区点［过滤的小区直接加入到聚合点］,如果某个东南西北方向小区数为1，就不做此小区的计算]得到新点
            pointItem = this.matchPoint(pointItem, lastPointItem,bounds);
            if(pointItem.length < 2) {
                if (typeof callback === 'function') {callback(lastPointItem);return;}
            } else {K = 0;}
        }
        this.setPoints(pointItem);
        this.guessK(K);
        this.initCentroids();

        if (this.k === 0) {
            if (typeof callback === 'function') {
                callback(new Error(ERR_K_IS_ZERO));
            } else {
                throw new Error(ERR_K_IS_ZERO);
            }
            return;
        }

        /** Iterate until converged or the maximum amount of iterations is reached. */
        while (!this.converged || (this.maxIterations > 0 && this.iterations > this.maxIterations)) {
            this.iterate();
        }

        if (typeof callback === 'function') {
            if (lastPointItem.length > 0) {
                this.centroids = lastPointItem.concat(this.centroids);
            }
            callback(this.centroids);
        }
    };
    //矩阵聚合
    kmeans.prototype.boxCluster = function (pointItem,zoom,callback) {
        //1.初始设置
        this.boxReset();
        //2.分别算出lat,lng最大差，和起始点
        this.setBoxParams(pointItem,zoom);
        //3.落点
        this.boxInitCentroids(pointItem);
        if (typeof callback === 'function') callback(this.centroids);
    };

    kmeans.prototype.boxInitCentroids = function (pointItem) {
        var len = pointItem.length;
        //定义多维数组格子
        var DBox = this.createArray();
        //多维数组落点
        for (var i = 0;i < pointItem.length;i++) {
            var Dlat = parseInt((parseFloat(pointItem[i].lat)-this.initPoints.lat)/this.pointBoxLatDistance);
            if (Dlat == this.boxNum) {Dlat = this.boxNum-1;}
            var Dlng = parseInt((parseFloat(pointItem[i].lng)-this.initPoints.lng)/this.pointBoxLngDistance);
            if (Dlng == this.boxNum) {Dlng = this.boxNum-1;}
            DBox[Dlat][Dlng].push(this.itemToArray(pointItem[i]));
        }
        //取出有点的值
        var _DBox = new Array();
        var z = 0;
        for (var i = 0;i < this.boxNum;i++) {
            for (var j = 0;j < this.boxNum;j++) {
                if(DBox[i][j].length > 0) {
                    _DBox[z]=DBox[i][j];
                    z++;
                }
            }
        }
        DBox = null;
        //数据聚合[1.中心点,2.array转object]
        for (var i = 0; i < _DBox.length; i++) {
            var obj = this.buildCentroids(_DBox[i],i);
            this.centroids.push(obj);
        }
    }

    kmeans.prototype.buildCentroids = function(item,centid) {
        var obj = {centeroid:centid,lat:0,lng:0,ids:[],propCount:0,points:[]};
        var lat = 0;
        var lng = 0;
        for(var i = 0;i < item.length;i++) {
            obj.ids.push(item[i][0]);
            lat+=parseFloat(item[i][1]);
            lng+=parseFloat(item[i][2]);
            obj.propCount+=item[i][3];
            obj.points.push({lat:item[i][1],lng:item[i][2]});
        }
        obj.lat = Math.round(lat/item.length * 100000000000)/100000000000+"";
        obj.lng = Math.round(lng/item.length * 100000000000)/100000000000+"";
        return obj;
    }

    kmeans.prototype.createArray = function () {
        var arr = new Array();
        for (var i = 0;i < this.boxNum;i++) {
            arr[i] = new Array();
            for (var j = 0;j < this.boxNum;j++) {
                arr[i][j] = new Array();
            }
        }
        return arr;
    }

    kmeans.prototype.itemToArray = function (item) {
        var tmp = new Array();
        tmp.push(item.id);
        tmp.push(item.lat);
        tmp.push(item.lng);
        tmp.push(item.propCount);
        return tmp;
    }


    kmeans.prototype.setBoxParams = function (pointItem,zoom) {
        var len = pointItem.length;
        var latArr = [];
        var lngArr = [];
        for (var i = 0;i < pointItem.length;i++) {
            latArr.push(parseFloat(pointItem[i].lat));
            lngArr.push(parseFloat(pointItem[i].lng));
        }
        latArr.sort();
        lngArr.sort();
        var xlat = (this.getDistance(latArr[0],lngArr[0],latArr[len-1],lngArr[0]));
        var ylng = (this.getDistance(latArr[0],lngArr[0],latArr[0],lngArr[len-1]));
        mc = xlat*ylng;
        this.boxNum = this.zoomBoxNum(zoom, mc);
        this.pointBoxLatDistance = (latArr[len-1]-latArr[0])/this.boxNum;//lat距离
        this.pointBoxLngDistance = (lngArr[len-1]-lngArr[0])/this.boxNum;//lng距离
        this.initPoints.lat = latArr[0];
        this.initPoints.lng = lngArr[0];
    };

    //按地图放大级数设置新增小区和聚合点最近的聚合距离
    kmeans.prototype.zoomDistance = function (zoom) {
        var dis = 0;
        switch(zoom) {
            case 14:
                dis = 0.0119411;
                break;
            case 15:
                dis = 0.0055924;
                break;
            default:
                dis = 0.0024316;
                break;
        }
        return dis;
    };

    kmeans.prototype.zoomBoxNum = function (zoom,mc) {
        var boxnum = 6;
        //面积>value
        if(mc > 136000000) {
            switch(zoom) {
                case 11:
                    boxnum = 4;
                    break;
                case 12:
                    boxnum = 5;
                    break;
                default:
                    boxnum = 6;
                    break;
            }
        }else if(mc < 31000000) {
            switch(zoom) {
                case 11:
                    boxnum = 2;
                    break;
                case 12:
                    boxnum = 2;
                    break;
                default:
                    boxnum = 4;
                    break;
            }
        } else {
            switch(zoom) {
                case 11:
                    boxnum = 3;
                    break;
                case 12:
                    boxnum = 4;
                    break;
                default:
                    boxnum = 5;
                    break;
            }
        }
        return boxnum;
    };

    kmeans.prototype.matchPoint = function (pointItem, lastPointItem, bounds) {
        var len = lastPointItem.length;
        var _self = this;
        var dindex = [];
        var hids = [];
        var lastindex = [];
        for (var i = 0;i < this.lastPoints.length;i++) {
            lastindex.push(this.lastPoints[i].id);
        }
        for　(var i = 0;i<len;i++) {
            //_mp(lastPointItem[i].ids);
            for(var j = 0;j < pointItem.length;j++) {
                if(this.in_array(j,dindex)) {continue;}
                if (_self.in_array(pointItem[j].id,lastPointItem[i].ids)) {
                    dindex.push(j);
                    continue;
                }
                if(this.in_array(pointItem[j].id,lastindex)){
                    dindex.push(j);
                    continue;
                }
                //判断item的坐标是否在bounds里面
                if (this.inBounds(pointItem[j],bounds)) {
                    dindex.push(j);
                    continue;
                }

                //做距离判断
                var _d = this.distance(pointItem[j],lastPointItem[i]);
                if(_d < this.minDistance ) {
                    lastPointItem[i].ids.push(pointItem[j].id);
                    lastPointItem[i].points.push({lat:pointItem[j].lat,lng:pointItem[j].lng});
                    lastPointItem[i].propCount += pointItem[j].propCount;
                    dindex.push(j);
                    continue;
                }
            }
        }
        pointItem = this.arrayDindex(pointItem,dindex);
        //将lastpoints添加到pointItem
        pointItem.concat(this.lastPoints);
        this.lastPoints = [];//重置为空
        //做东南西北分组集合
        if (pointItem.length <= 2) {
            var position = {W:[],S:[],E:[],N:[]};
            for(var i = 0;i < pointItem.length;i++) {
                if (parseInt(pointItem[i].lat) < bounds.swlat) {
                    position.W.push(i);
                    continue;
                }
                if (parseInt(pointItem[i].lng) < bounds.swlng) {
                    position.S.push(i);
                    continue;
                }
                if (parseInt(pointItem[i].lat) > bounds.nelat) {
                    position.E.push(i);
                    continue;
                }
                if (parseInt(pointItem[i].lng) > bounds.nelng) {
                    position.N.push(i);
                    continue;
                }
            }
            dindex = [];
            if(position.W.length == 1) {dindex.push(position.W[0]);}
            if(position.S.length == 1) {dindex.concat(position.S[0]);}
            if(position.E.length == 1) {dindex.concat(position.E[0]);}
            if(position.N.length == 1) {dindex.concat(position.N[0]);}
            if (dindex.length > 0) {
                //将这批数据保留在kmeans里,供下次使用
                this.savePoints(pointItem, dindex);
                pointItem = this.arrayDindex(pointItem,dindex);
            }
        }

        return pointItem;
    };

    //保存小区点，供下次使用
    kmeans.prototype.savePoints = function(pointItem, index) {
        for (var i = 0;i<index.length;i++) {
            this.lastPoints.push(pointItem[index[i]]);
        }
    };

    //判断坐标是否在矩阵里
    kmeans.prototype.inBounds = function (point,bounds) {
        if (parseFloat(point.lat) < bounds.nelat && parseFloat(point.lat) > bounds.swlat
            && parseFloat(point.lng) < bounds.nelng && parseFloat(point.lng) > bounds.swlng) {
            return true;
        }
        return false;
    };

    kmeans.prototype.arrayDindex = function(pointItem,dindex) {
        _pointItem = pointItem;
        if(dindex.length > 0) {
            var _pointItem = [];
            for(var i = 0;i<pointItem.length;i++) {
                if(this.in_array(i,dindex) == false) {
                    _pointItem.push(pointItem[i]);
                }
            }
        }
        pointItem = null;
        return _pointItem;
    };

    kmeans.prototype.matchDistance = function(pointItem,lastPointItem) {
        var dindex = [];
        for(var i = 0;i < lastPointItem.length;i++) {
            for(var j = 0;j < pointItem.length;j++) {
                if(this.in_array(j,dindex)) {continue;}
                var _d = this.distance(pointItem[j],lastPointItem[i]);
                if(_d < this.minDistance ) {
                    lastPointItem[i].ids.push(pointItem[j].id);
                    lastPointItem[i].points.push({lat:pointItem[j].lat,lng:pointItem[j].lng});
                    lastPointItem[i].propCount += pointItem[j].propCount;
                    dindex.push(i);
                    continue;
                }
            }
        }
        return this.arrayDindex(pointItem,dindex);
    };

    /** Measure the distance to a point, specified by its index. */

    kmeans.prototype.measureDistance =   function (i) {
        var self = this;
        return function ( centroid ) {
            return self.distance(centroid, self.points[i]);
        };
    };

    /** Iterates over the provided points one time */

    kmeans.prototype.iterate = function () {
        var i;

        /** When the result doesn't change anymore, the final result has been found. */
        if (this.converged === true) {
            return;
        }

        this.converged = true;

        ++this.iterations;

        /** Prepares the array of the  */

        var sums = new Array(this.k);

        for (i = 0; i < this.k; ++i) {
            sums[i] = { lng : 0, lat : 0, items : 0, ids : [],propCount : 0, points : [] };
        }

        /** Find the closest centroid for each point */
        for (i = 0, l = this.points.length; i < l; ++i) {

            var distances = sortBy(this.centroids, this.measureDistance(i));
            var closestItem = distances[0];
            var centroid = closestItem.centroid;

            /**
             * When the point is not attached to a centroid or the point was
             * attached to some other centroid before, the result differs from the
             * previous iteration.
             */

            if (typeof this.points[i].centroid  !== 'number' || this.points[i].centroid !== centroid) {
                this.converged = false;
            }

            /** Attach the point to the centroid */

            this.points[i].centroid = centroid;

            /** Add the points' coordinates to the sum of its centroid */

            sums[centroid].lng += parseFloat(this.points[i].lng);
            sums[centroid].lat += parseFloat(this.points[i].lat);
            sums[centroid].propCount += this.points[i].propCount;
            sums[centroid].ids.push(this.points[i].id);
            sums[centroid].points.push({lng:this.points[i].lng,lat:this.points[i].lat});
            ++sums[centroid].items;
        }

        /** Re-calculate the center of the centroid. */

        for (i = 0; i < this.k; ++i) {
            if (sums[i].items > 0) {
                this.centroids[i].lng = Math.round(sums[i].lng / sums[i].items * 1000000)/1000000;
                this.centroids[i].lat = Math.round(sums[i].lat / sums[i].items * 1000000)/1000000;
            }
            this.centroids[i].propCount = sums[i].propCount;
            this.centroids[i].ids  = sums[i].ids;
            this.centroids[i].points = sums[i].points;
        }
    };

    kmeans.prototype.initCentroids = function () {
        var i, k,cmp1, cmp2;
        var addIterator = function (x,y) { return x+y; };
        /** K-Means++ initialization */
        /** determine the amount of tries */
        var D = [], ntries = 2 + Math.round(Math.log(this.k));
        /** 1. 选择第一个点为计算的起始点. */
        var l = this.points.length;
        var p0 = {
            lng : parseFloat(this.points[0].lng),
            lat : parseFloat(this.points[0].lat),
            centroid : 0,
            points : []
        };
        this.centroids = [ p0 ];
        /**
         * 2. For each data point x, compute D(x), the distance between x and
         * the nearest center that has already been chosen.
         */
        for (i = 0; i < l; ++i) {
            D[i] = Math.pow(this.distance(p0, this.points[i]), 2);
        }
        var Dsum = reduce(D, addIterator);
        // var Dsum = D.reduce(addIterator);
        /**
         * 3. Choose one new data point at random as a new center, using a
         * weighted probability distribution where a point x is chosen with
         * probability proportional to D(x)2.
         * (Repeated until k centers have been chosen.)
         */
        for (k = 1; k < this.k; ++k) {
            var bestDsum = -1, bestIdx = -1;
            for (i = 0; i < ntries; ++i) {
                var rndVal = (Math.random() * Dsum);
                for (var n = 0; n < l; ++n) {
                    if (rndVal <= D[n]) {
                        break;
                    } else {
                        rndVal -= D[n];
                    }
                }
                var tmpD = [];
                for (var m = 0; m < l; ++m) {
                    cmp1 = D[m];
                    cmp2 = Math.pow(this.distance(this.points[m],this.points[n]),2);
                    tmpD[m] = cmp1 > cmp2 ? cmp2 : cmp1;
                }
                var tmpDsum = reduce(tmpD, addIterator);
                // var tmpDsum = tmpD.reduce(addIterator);
                if (bestDsum < 0 || tmpDsum < bestDsum) {
                    bestDsum = tmpDsum, bestIdx = n;
                }
            }
            Dsum = bestDsum;
            var centroid = {
                lng : parseFloat(this.points[bestIdx].lng),
                lat : parseFloat(this.points[bestIdx].lat),
                centroid : k
            };
            this.centroids.push(centroid);
            for (i = 0; i < l; ++i) {
                cmp1 = D[i];
                cmp2 = Math.pow(this.distance(this.points[bestIdx],this.points[i]), 2);
                D[i] = cmp1 > cmp2 ? cmp2 : cmp1;
            }
        }
    };

    /**
     * 根据经纬度计算距离
     *
     * @param sLat 起点纬度
     * @param sLon 起点经度
     * @param eLat 终点纬度
     * @param eLon 终点经度
     * @param isKm 返回的距离单位
     * @return 距离
     */
    kmeans.prototype.getDistance = function(sLat,sLon,eLat,eLon,isKm) {
        distance = 0;
        if (sLat > 0 && sLon > 0 && eLat > 0 && eLon > 0) {
            if (isKm) {
                distance = Math.sqrt(Math.abs(sLat - eLat) * Math.abs(sLat - eLat) + Math.abs(sLon - eLon) * Math.abs(sLon - eLon)) * 100; //公里
            }
            else {
                distance = Math.sqrt(Math.abs(sLat - eLat) * Math.abs(sLat - eLat) + Math.abs(sLon - eLon) * Math.abs(sLon - eLon)) * 100000; //米
            }
        }
        return distance;
    };

    return kmeans;
})();

if (typeof module === 'object') {
    module.exports = KMeans;
}