// util

function extend(a, b){
    for(var key in b)
        if(b.hasOwnProperty(key))
            a[key] = b[key];
    return a;
}

function resetParametersToWindowSize(){
    var h = window.innerHeight;
    var w = getScreenWidth();

    screenH = h;
    screenW = w;

}

function el(id){
    return document.getElementById(id);
}


function hidePanel(id,animation){
    var elm = id;
    if (typeof elm == "string") elm = el(elm);
    if (elm){
        if (animation == "slide"){
            slideUp(elm);
        }else{
            apollo.addClass(elm,"hidden");
        }
    }
}

function showPanel(id,animation){
    var elm = id;
    if (typeof elm == "string") elm = el(elm);
    if (elm){
        if (animation == "slide"){
            slideDown(elm);
        }else{
            apollo.removeClass(elm,"hidden");
        }
    }

}

function closePanel(elm){
    if (elm){
        var panel = elm.parentNode;
        if (panel){
            hidePanel(panel,"slide");
            stopAllVideo();
            //if (panel.id && panel.id == "aboutartist_page"){
            //    showPanel("aboutartist","slide");
            //}
        }
    }
}

function togglePanel(id,animation,sender){
    var elm = id;
    if (typeof elm == "string") elm = el(elm);

    if (animation == "slide"){
        toggleSlide(elm);
    }else{
        if (apollo.hasClass(elm,"hidden")){
            showPanel(id);
        }else{
            hidePanel(id);
        }
    }

    if (sender){
        showClickState(sender);
    }

}

function findParentWithClass(elm,className){
    if (elm){
        var cur = elm;
        while(cur && !apollo.hasClass(cur,className)) {
            cur = cur.parentNode;
        }
        return cur;
    }else{
        return undefined;
    }

}

/**
 * Randomize array element order in-place.
 * Using Fisher-Yates shuffle algorithm.
 */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}



// Credits to @Yaffle
// https://gist.github.com/Yaffle/1145197
// function to get the MouseEvent coordinates for an element that has CSS3 Transforms

(function() {
    "use strict";

    function Point(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    function CSSMatrix(s) {
        var m = null;
        if (typeof s === "string") {
            var c = s.match(/matrix3?d?\(([^\)]+)\)/i)[1].split(',');
            if (c.length === 6) {
                c = [c[0], c[1], 0, 0, c[2], c[3], 0, 0, 0, 0, 1, 0, c[4], c[5], 0, 1];
            }
            m = [];
            var i = -1;
            while (++i < 4) {
                var j = -1;
                while (++j < 4) {
                    m[i * 4 + j] = parseFloat(c[j * 4 + i]);
                }
            }
        } else {
            m = s;
        }
        this.data = m;
    }

    CSSMatrix.prototype = {
        multiply: function(m) {
            var a = this.data;
            var b = m.data;
            var r = [];
            var i = -1;
            while (++i < 4) {
                var j = -1;
                while (++j < 4) {
                    var t = 0;
                    var k = -1;
                    while (++k < 4) {
                        t += a[i * 4 + k] * b[k * 4 + j];
                    }
                    r[i * 4 + j] = t;
                }
            }
            return new CSSMatrix(r);
        },
        translate: function(tx, ty, tz) {
            var z = new CSSMatrix([1, 0, 0, tx, 0, 1, 0, ty, 0, 0, 1, tz, 0, 0, 0, 1]);
            return this.multiply(z);
        },
        inverse: function() {
            var m = this.data;
            var a = m[0 * 4 + 0];
            var b = m[0 * 4 + 1];
            var c = m[0 * 4 + 2];
            var d = m[1 * 4 + 0];
            var e = m[1 * 4 + 1];
            var f = m[1 * 4 + 2];
            var g = m[2 * 4 + 0];
            var h = m[2 * 4 + 1];
            var k = m[2 * 4 + 2];
            var A = e * k - f * h;
            var B = f * g - d * k;
            var C = d * h - e * g;
            var D = c * h - b * k;
            var E = a * k - c * g;
            var F = b * g - a * h;
            var G = b * f - c * e;
            var H = c * d - a * f;
            var K = a * e - b * d;
            var det = a * A + b * B + c * C;
            var X = new CSSMatrix([A / det, D / det, G / det, 0,
                B / det, E / det, H / det, 0,
                C / det, F / det, K / det, 0,
                0, 0, 0, 1]);
            var Y = new CSSMatrix([1, 0, 0, -m[0 * 4 + 3],
                0, 1, 0, -m[1 * 4 + 3],
                0, 0, 1, -m[2 * 4 + 3],
                0, 0, 0, 1]);
            return X.multiply(Y);
        },
        transformPoint: function(p) {
            var m = this.data;
            return new Point(m[0 * 4 + 0] * p.x + m[0 * 4 + 1] * p.y + m[0 * 4 + 2] * p.z + m[0 * 4 + 3],
                m[1 * 4 + 0] * p.x + m[1 * 4 + 1] * p.y + m[1 * 4 + 2] * p.z + m[1 * 4 + 3],
                m[2 * 4 + 0] * p.x + m[2 * 4 + 1] * p.y + m[2 * 4 + 2] * p.z + m[2 * 4 + 3]);
        }
    };

    var isBuggy = false;
    var initialized = false;

    var buggy = function(doc) {
        if (initialized) {
            return isBuggy;
        }
        initialized = true;
        var div = doc.createElement('div');
        div.style.cssText = 'width:200px;height:200px;position:fixed;-moz-transform:scale(2);';
        doc.body.appendChild(div);
        var rect = div.getBoundingClientRect();
        isBuggy = !!(getComputedStyle(div, null).MozTransform && (rect.bottom - rect.top < 300));
        div.parentNode.removeChild(div);
        return isBuggy;
    };

    function getTransformationMatrix(element) {
        var identity = new CSSMatrix('matrix(1,0,0,1,0,0)');
        var transformationMatrix = identity;
        var x = element;
        var rect = null;
        var isBuggy = buggy(x.ownerDocument);

        while (x !== null && x !== x.ownerDocument.documentElement) {
            var computedStyle = window.getComputedStyle(x, null);
            var c = new CSSMatrix((computedStyle.OTransform || computedStyle.WebkitTransform || computedStyle.msTransform || computedStyle.MozTransform || 'none').replace(/^none$/, 'matrix(1,0,0,1,0,0)'));

            if (isBuggy) {
                // origin and t matrices are required only for Firefox (buggy getBoundingClientRect)
                rect = x.getBoundingClientRect();
                var parentRect = x.parentNode !== null && x.parentNode.getBoundingClientRect ? x.parentNode.getBoundingClientRect() : rect;
                var t = identity.translate(rect.left - parentRect.left, rect.top - parentRect.top, 0);

                var origin = computedStyle.OTransformOrigin || computedStyle.WebkitTransformOrigin || computedStyle.msTransformOrigin || computedStyle.MozTransformOrigin || '';
                // Firefox gives "50% 50%" when there is no transform
                origin = origin.indexOf('%') !== -1 ? '' : origin;
                origin = new CSSMatrix('matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,' + ((origin || '0 0') + ' 0').split(' ').slice(0, 3) + ',1)');

                // transformationMatrix = t * origin * c * origin^-1 * transformationMatrix
                //var inverseOrigin = translate(identity, -origin[0 * 4 + 3], -origin[1 * 4 + 3], -origin[2 * 4 + 3]);
                var inverseOrigin = origin.inverse();
                transformationMatrix = t.multiply(origin).multiply(c).multiply(inverseOrigin).multiply(transformationMatrix);
            } else {
                transformationMatrix = c.multiply(transformationMatrix);
            }

            x = x.parentNode;
        }

        if (!isBuggy) {
            var w = element.offsetWidth;
            var h = element.offsetHeight;
            var i = 4;
            var left = +Infinity;
            var top = +Infinity;
            while (--i >= 0) {
                var p = transformationMatrix.transformPoint(new Point(i === 0 || i === 1 ? 0 : w, i === 0 || i === 3 ? 0 : h, 0));
                if (p.x < left) {
                    left = p.x;
                }
                if (p.y < top) {
                    top = p.y;
                }
            }
            rect = element.getBoundingClientRect();
            transformationMatrix = identity.translate(window.pageXOffset + rect.left - left, window.pageYOffset + rect.top - top, 0).multiply(transformationMatrix);
        }

        return transformationMatrix;
    }

    window.convertPointFromPageToNode = function(element, pageX, pageY) {
        if(window.webkitConvertPointFromPageToNode) {
            // Use WebKit's native function (~ 10 times faster)
            return webkitConvertPointFromPageToNode(
                element,
                new WebKitPoint(pageX,pageY)
            );
        }else{
            // Use own functions (cross browser compatible, but slower)
            return getTransformationMatrix(element).inverse().transformPoint(
                new Point(pageX, pageY, 0)
            );
        }
    };

}());

function getTransformationFromCSS(elm){
    var style = window.getComputedStyle(elm, null);

    var matrix = style.getPropertyValue("-webkit-transform") ||
        style.getPropertyValue("-moz-transform") ||
        style.getPropertyValue("-ms-transform") ||
        style.getPropertyValue("-o-transform") ||
        style.getPropertyValue("transform") ||
        "FAIL";

    var values = matrix.split('(')[1].split(')')[0].split(',');
    var a = values[0];
    var b = values[1];
    var c = values[2];
    var d = values[3];

    var scale = Math.sqrt(a*a + b*b);
    var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));

    return {scale:scale,angle:angle}
}



// loadResources
(function () {
    var win = window,
        doc = document,
        proto = 'prototype',
        head = doc.getElementsByTagName('head')[0],
        body = doc.getElementsByTagName('body')[0],
        sniff = /*@cc_on!@*/1 + /(?:Gecko|AppleWebKit)\/(\S*)/.test(navigator.userAgent); // 0 - IE, 1 - O, 2 - GK/WK

    var createNode = function(tag, attrs) {
        var attr, node = doc.createElement(tag);
        for (attr in attrs) {
            if (attrs.hasOwnProperty(attr)) {
                node.setAttribute(attr, attrs[attr]);
            }
        }
        return node;
    };

    var load = function(type, urls, callback, scope) {
        if (this == win) {
            return new load(type, urls, callback, scope);
        }

        urls = (typeof urls == 'string' ? [urls] : urls);
        scope = (scope ? (scope == 'body' ? body : head) : (type == 'js' ? body : head));

        this.callback = callback || function() {};
        this.queue = [];

        var node, i, len, that = this;

        for (i = 0, len = urls.length; i < len; i++) {
            this.queue[i] = 1;
            if (type == 'css') {
                node = createNode('link', { type: 'text/css', rel: 'stylesheet', href: urls[i] + "?v=" + buildNumber});
            }
            else {
                node = createNode('script', { type: 'text/javascript', src: urls[i] + "?v=" + buildNumber });
            }
            scope.appendChild(node);

            if (sniff) {
                node.onload = function() {
                    that.__callback();
                }
            }
            else {
                node.onreadystatechange = function() {
                    if (/^loaded|complete$/.test(this.readyState)) {
                        this.onreadystatechange = null;
                        that.__callback();
                    }
                };
            }
        }

        return this;
    };
    load[proto].__callback = function() {
        if (this.queue.pop() && (this.queue == 0)) {
            this.callback();
        }
    };

    window.loadResource = {
        css: function(urls, scope) {
            return load('css', urls, undefined, scope);
        },
        js: function(urls, callback, scope) {
            return load('js', urls, callback, scope);
        },
        load: function(type, urls, callback, scope) {
            return load(type, urls, callback, scope);
        }
    };
})();


function loadJavascript(resourceArray,next){

    if (resourceArray.length > 0){
        var url = resourceArray[0];
        resourceArray.shift();
        var headID = document.getElementsByTagName("head")[0];
        window.loadResource.js(url,function(){
            loadJavascript(resourceArray,next);
        },headID)
    }else{
        next();
    }
}