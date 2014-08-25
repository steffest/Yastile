var Input = (function() {

    var self = {};
    var _isdown,_isup,_isleft,_isright,_isaction;

    var KEY={
        left: 37,
        up: 38,
        right: 39,
        down: 40,
        space:32,
        ctrl:17
    };

    document.addEventListener("keydown",handleKeyDown, false);
    document.addEventListener("keyup",handleKeyUp, false);

    function handleKeyDown(event){
        var keyCode = event.keyCode;

        if (keyCode == KEY.down)_isdown = true;
        if (keyCode == KEY.left)_isleft = true;
        if (keyCode == KEY.right)_isright = true;
        if (keyCode == KEY.up) _isup = true;
        if (keyCode == KEY.space) _isaction = true;
        if (keyCode == KEY.ctrl) _isaction = true;
    }

    function handleKeyUp(event){
        var keyCode = event.keyCode;

        if (keyCode == KEY.down)_isdown = false;
        if (keyCode == KEY.left)_isleft = false;
        if (keyCode == KEY.right)_isright = false;
        if (keyCode == KEY.up) _isup = false;
        if (keyCode == KEY.space) _isaction = false;
        if (keyCode == KEY.ctrl) _isaction = false;

        if (keyCode == KEY.up){
            //gameSection = 1;
        }
    }

    self.isDown = function(value){
        if (typeof value != "undefined") _isdown = value;
        return _isdown;
    };

    self.isUp = function(value){
        if (typeof value != "undefined") _isup = value;
        return _isup;
    };

    self.isLeft = function(value){
        if (typeof value != "undefined") _isleft = value;
        return _isleft;
    };

    self.isRight = function(value){
        if (typeof value != "undefined") _isright = value;
        return _isright;
    };

    self.isAction = function(value){
        if (typeof value != "undefined") _isaction = value;
        return _isaction;
    };

   return self;

}());
