var requestAnimFrame = (function(){
    return window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback, element){
            window.setTimeout(function(){
                callback(+new Date);
            }, 1000 / 60);
        };
})();

var cancelAnimFrame = (function () {
    return window.cancelAnimationFrame ||
        window.webkitCancelAnimationFrame ||
        window.mozCancelAnimationFrame ||
        window.oCancelAnimationFrame ||
        function (id) {
            window.clearTimeout(id);
        };
})();

window.performance = window.performance || {};
performance.now = (function() {
    return performance.now       ||
        performance.mozNow    ||
        performance.msNow     ||
        performance.oNow      ||
        performance.webkitNow ||
        function() {
            return new Date().getTime();
        };
})();

// predictable random generator
// we want to full game to be reproducable given the same seed
var randomSeed = 1;
function random() {
    var x = Math.sin(randomSeed++) * 10000;
    return x - Math.floor(x);
}


function Maybe(callback,probability){
    if (isNaN(probability)) probability = 1;
    if (random() <= probability) callback();
}

// caveat: when arrays are created in a different context (other frame or window) this won't work.
function typeOf(value) {
    var s = typeof value;
    if (s === 'object') {
        if (value) {
            if (value instanceof Array) {
                s = 'array';
            }
        } else {
            s = 'null';
        }
    }
    return s;
}

function isArray(a){
    return typeOf(a) == "array";
}

function isBoolean(o){
    return typeOf(o) == "boolean";
}

function isFunction(o){
    return typeOf(o) == "function";
}

function isDefined(o){
    return typeOf(o) != "undefined";
}

function isNumeric(o){
    return !isNaN(o);
}


function between(min,value,max){
    return value > max ? max : value < min ? min : value;
}

function randomBetween(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
}

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

function getPixelFromImageData(imageData,x,y){
    var index = ((Math.floor(y) * imageData.width) + Math.floor(x))*4;
    var data = imageData.data;
    return [data[index],data[index+1],data[index+2]];
}
