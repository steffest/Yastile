//global vars
var canvas;
var ctx;
var map = [];
var sprites = [];

var DIRECTION = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    LEFTDOWN: 3740,
    RIGHTDOWN: 3940,
    NONE: 0
};

var DIRECTION_OPPOSITE = {
    LEFT: DIRECTION.RIGHT,
    UP: DIRECTION.DOWN,
    RIGHT: DIRECTION.LEFT,
    DOWN: DIRECTION.UP
};

var ANIMATION = {
    PUSH_RIGHT : "PushRight",
    PUSH_LEFT : "PushLeft",
    PUSH_UP : "PushUp",
    PUSH_DOWN : "PushDown"
};