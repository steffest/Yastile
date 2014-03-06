var Input = (function() {

    var self = {};
    var _isdown,_isup,_isleft,_isright;

    var hasTouchController = false;
    var controllerImg;
    var controllerPosition = {
        top: 170,
        left: 10
    };
    var isTouchDown = false;

    var KEY={
        left: 37,
        up: 38,
        right: 39,
        down: 40
    };

    document.addEventListener("keydown",handleKeyDown, false);
    document.addEventListener("keyup",handleKeyUp, false);

    function handleKeyDown(event){
        var keyCode = event.keyCode;

        if (keyCode == KEY.down)_isdown = true;
        if (keyCode == KEY.left)_isleft = true;
        if (keyCode == KEY.right)_isright = true;
        if (keyCode == KEY.up) _isup = true;
    }

    function handleKeyUp(event){
        var keyCode = event.keyCode;

        if (keyCode == KEY.down)_isdown = false;
        if (keyCode == KEY.left)_isleft = false;
        if (keyCode == KEY.right)_isright = false;
        if (keyCode == KEY.up) _isup = false;

        if (keyCode == KEY.up){
            //gameSection = 1;
        }
    }

    self.addTouchController = function(){
        controllerImg = new Image();
        controllerImg.onload = function() {
            hasTouchController = true;
        };
        controllerImg.src = "resources/controller.png";

        self.setTouchControllerPosition();

        canvas.addEventListener("mousedown", handleTouchDown,false);
        canvas.addEventListener("mousemove", handleTouchMove,false);
        canvas.addEventListener("mouseup", handleTouchUp,false);
        canvas.addEventListener("touchstart", handleTouchDown,false);
        canvas.addEventListener("touchmove", handleTouchMove,false);
        canvas.addEventListener("touchend", handleTouchUp,false);
    };

    self.setTouchControllerPosition = function(){
        controllerPosition.top = canvas.height - 150;
        controllerPosition.left = 10;
    };

    var handleTouchDown = function(event){
        isTouchDown = true;

        var x, y;
        if (event.touches && event.touches.length>0){
            x = event.touches[0].clientX;
            y = event.touches[0].clientY;
        }else{
            x = event.pageX;
            y = event.pageY;
        }
        setTouchControllerInput(x,y);

        //console.error(x,y);
    };

    var handleTouchMove = function(event){
        if (isTouchDown){
            var x, y;
            if (event.touches && event.touches.length>0){
                x = event.touches[0].clientX;
                y = event.touches[0].clientY;
            }else{
                x = event.pageX;
                y = event.pageY;
            }
            setTouchControllerInput(x,y);
            //console.error(x,y);
        }
    };

    var handleTouchUp = function(){
        isTouchDown = false;
        _isleft = false;
        _isright = false;
        _isup = false;
        _isdown = false;
    };

    var setTouchControllerInput = function(x,y){
        var l = controllerPosition.left - 10;
        var r = l+130;
        var t = controllerPosition.top - 10;
        var b = t + 130;

        var midx = (l+r)/2
        var midy = (b+t)/2

        if (x>l && x<r && y>t && y<b){
            // touch is on controller;
            _isleft = false;
            _isright = false;
            _isup = false;
            _isdown = false;
            if (x<midx - 20) _isleft = true;
            if (x>midx + 20) _isright = true;
            if (y<midy - 20) _isup = true;
            if (y>midy + 20) _isdown = true;
        }
    };

    self.drawTouchController = function(){
        if (hasTouchController){
            ctx.drawImage(controllerImg,controllerPosition.left,controllerPosition.top);
        }
    };

    self.isDown = function(){
        return _isdown;
    };

    self.isUp = function(){
        return _isup;
    };

    self.isLeft = function(){
        return _isleft;
    };

    self.isRight = function(){
        return _isright;
    };

   return self;

}());
