var UI = (function(){
    var self = {};

    var isTouchDown;
    var objectDown;
    var UIEventElements;
    var screen = [];
    var scaleFactorW = 1;
    var scaleFactorH = 1;
    var touchData = {};

    self.init = function(){

        canvas.addEventListener("mousedown", handleDown,false);
        canvas.addEventListener("mousemove", handleMove,false);
        canvas.addEventListener("mouseup", handleUp,false);
        canvas.addEventListener("touchstart", handleDown,false);
        canvas.addEventListener("touchmove", handleMove,false);
        canvas.addEventListener("touchend", handleUp,false);

    };

    self.registerEventElement = function(element,l,t,r,b){
        UIEventElements.push({
            element: element,
            top: t,
            right: r,
            bottom: b,
            left: l
        });
    };

    self.getEventElement = function(x,y){
        var result;
        for (var i = 0, len = UIEventElements.length; i< len; i++){
            var elm = UIEventElements[i];
            if (x>=elm.left && x<=elm.right && y>= elm.top && y <= elm.bottom) result = elm;
        }
        return result;
    };

    self.clear = function(clearPattern){
        //ctx.fillStyle = backgroundPattern;
        clearPattern = clearPattern || "Black";
        ctx.fillStyle = clearPattern;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        UIEventElements = [];
    };

    self.removeAllElements = function(element){
        screen = [];
    };

    self.addElement = function(element){
        screen.push(element);
    };

    self.renderElements = function(){
        for (var i = 0, len = screen.length; i<len; i++){
            var UIElement = screen[i];
            UIElement.render();
        }
    };

    self.setScale = function(width,height){
        scaleFactorW = width;
        scaleFactorH = height;
    };


    function handleDown(event){
        isTouchDown = true;

        var _x, _y;
        if (event.touches && event.touches.length>0){
            _x = event.touches[0].clientX;
            _y = event.touches[0].clientY;
        }else{
            _x = event.pageX;
            _y = event.pageY;
        }

        var x = _x/scaleFactorW;
        var y = _y/scaleFactorH;

        objectDown = UI.getEventElement(x,y);
        touchData.x = x;
        touchData.y = y;
        touchData.startX = x;
        touchData.startY = y;
        touchData.object = objectDown;

        if (objectDown && objectDown.element && objectDown.element.onDown){
            objectDown.element.onDown(objectDown.element,x,y);
        }

    }

    function handleMove(event){
        var _x, _y;
        if (event.touches && event.touches.length>0){
            _x = event.touches[0].clientX;
            _y = event.touches[0].clientY;
        }else{
            _x = event.pageX;
            _y = event.pageY;
        }

        var x = _x/scaleFactorW;
        var y = _y/scaleFactorH;
        touchData.x = x;
        touchData.y = y;

        if (isTouchDown && objectDown){
            if (objectDown.element && objectDown.element.onDrag){
                objectDown.element.onDrag(touchData);
            }
        }

    }

    var handleUp = function(){

        if (objectDown && objectDown.element && objectDown.element.onClick){
            objectDown.element.onClick(touchData);
        }

        console.error("up");
        isTouchDown = false;
        objectDown = undefined;
        touchData = {};
        Input.isDown(false);
        Input.isUp(false);
        Input.isLeft(false);
        Input.isRight(false);
    };


    return self;
}());






