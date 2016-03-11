//global vars
var canvas;
var ctx;
var map = [];
var sprites = {};
var spriteNames = {};

var DIRECTION = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    LEFTUP:3738,
    RIGHTUP:3938,
    LEFTDOWN: 3740,
    RIGHTDOWN: 3940,
    NONE: 0
};

var DIRECTION_OPPOSITE = {
    37: DIRECTION.RIGHT,
    38: DIRECTION.DOWN,
    39: DIRECTION.LEFT,
    40: DIRECTION.UP
};

var ANIMATION = {
    PUSH_RIGHT : "PushRight",
    PUSH_LEFT : "PushLeft",
    PUSH_UP : "PushUp",
    PUSH_DOWN : "PushDown"
};

var SCALING = {
    NONE: 0,
    FIT_WIDTH: 1,
    FIT_HEIGHT: 2,
    CONTAIN: 3,
    STRETCH: 4
};

var MAPLAYERTYPE = {
    GRID: 1,
    SPOT: 2,
    FREE: 3,
    IMAGE: 4
};

var MAPOBJECTTYPE = {
    GRID : 1,
    FIXED: 2,
    FREE: 3
};


var DEBUGINFOTYPE  = {
    RECT: 1,
    TEXT: 2
};

var ONSCREENCONTROLS = {
    _4WAY: {
        image: "controller_4way.png",
        input: 4
    },
    _2WAY: {
        image: "controller_2way.png",
        input: 2
    }
}