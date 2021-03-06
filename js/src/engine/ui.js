var UI = (function(){
    var self = {};

    var UIEventElements;
    var gameEventElements = [];
    var screen = [];
    var scaleFactorW = 1;
    var scaleFactorH = 1;
    var touchData = {};

    var debug = false;

    touchData.touches = [];
    touchData.mouseWheels = [];

    var isTouched = false;

    self.init = function(){

        canvas.addEventListener("mousedown", handleDown,false);
        canvas.addEventListener("mousemove", handleMove,false);
        canvas.addEventListener("mouseup", handleUp,false);
        canvas.addEventListener("touchstart", handleDown,false);
        canvas.addEventListener("touchmove", handleMove,false);
        canvas.addEventListener("touchend", handleUp,false);
        canvas.addEventListener("mousewheel", handleMouseWheel,false);
        canvas.addEventListener("DOMMouseScroll", handleMouseWheel,false);

        if (window.navigator.msPointerEnabled){
            canvas.addEventListener("MSPointerDown", handleDown,false);
            canvas.addEventListener("MSPointerMove", handleMove,false);
            canvas.addEventListener("MSPointerEnd", handleUp,false);
        }

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

    // registers a Game Object to track for mouse/touch input
    self.registerGameObjectForTouch = function(object){
        gameEventElements.push(object);
    };

    self.getEventElement = function(x,y){
        var result;
        var i = 0;
        var max = UIEventElements.length;
        var elm;

        while (!result && i<max){
            elm = UIEventElements[i];
            if (x>=elm.left && x<=elm.right && y>= elm.top && y <= elm.bottom) result = elm;
            i++;
        }

        if (!result){
            i=gameEventElements.length-1;
            while (!result && i>=0){
                elm = gameEventElements[i];
                if (x>=elm.left && x<=(elm.left+elm.width) && y>= elm.top && y <= (elm.top+elm.height)) {
                    result = elm;
                    result.element = result.gameObject;
                }
                i--;
            }
        }
        return result;
    };

    self.clear = function(clearPattern){
        //ctx.fillStyle = backgroundPattern;

        if(clearPattern){
            clearPattern = clearPattern || "Black";
            ctx.fillStyle = clearPattern;
            ctx.fillRect(0, 0, screenWidth, screenHeight);
        }else{
            ctx.clearRect(0, 0, screenWidth, screenHeight);
        }


        UIEventElements = [];
    };

    self.removeAllElements = function(includeGameElements){
        screen = [];
        UIEventElements = [];

        if (includeGameElements) gameEventElements = [];
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

    self.renderBackground = function(){
        var backgroundImage = Game.getBackground();
        if (backgroundImage){
            ctx.drawImage(backgroundImage,0, 0);
        }
    };

    self.setScale = function(width,height){
        scaleFactorW = width;
        scaleFactorH = height;
    };

    self.onResize = function(){
        for (var i = 0, len = screen.length; i<len; i++){
            var UIElement = screen[i];
            if (UIElement.onResize) UIElement.onResize(UIElement);
        }
    };

    self.canvasToDocument = function(x,y){
        return {x: x * scaleFactorW, y: y * scaleFactorH};
    };

    self.documentToCanvas = function(x,y){
        return {x: x/scaleFactorW, y: y/scaleFactorH};
    };

    var getTouchIndex = function (id) {
        for (var i=0; i < touchData.touches.length; i++) {
            if (touchData.touches[i].id === id) {
                return i;
            }
        }
        return -1;
    };


    function handleDown(event){

        event.preventDefault();

        if (!isTouched){
            // first touch - init media on IOS
            //isTouched = Audio.activate();
        }

        if (event.touches && event.touches.length>0){
            var touches = event.changedTouches;
            for (var i=0; i < touches.length; i++) {
                var touch = touches[i];
                initTouch(touch.identifier,touch.pageX,touch.pageY);
            }
        }else{
            var touchIndex = getTouchIndex("notouch");
            if (touchIndex>=0) touchData.touches.splice(touchIndex, 1);
            initTouch("notouch",event.pageX,event.pageY);
        }

        function initTouch(id,x,y){
            touchData.isTouchDown = true;


            var _x = x/scaleFactorW;
            var _y = y/scaleFactorH;

            var thisTouch = {
                id: id,
                x: _x,
                y: _y,
                startX: _x,
                startY: _y,
                UIobject: UI.getEventElement(_x,_y)
            };

            if (debug){
                console.error("touch",x,y);
                console.error(thisTouch);
                console.error("on object",thisTouch.UIobject);
            }

            touchData.touches.push(thisTouch);

            if (thisTouch.UIobject  && thisTouch.UIobject.element && thisTouch.UIobject.element.onDown){
                thisTouch.UIobject.element.onDown(thisTouch,thisTouch.UIobject);
            }
        }
    }

    function handleMove(event){

        event.preventDefault();

        if (event.touches && event.touches.length>0){
            var touches = event.changedTouches;

            for (var i=0; i < touches.length; i++) {
                var touch = touches[i];
                updateTouch(getTouchIndex(touch.identifier),touch.pageX,touch.pageY);
            }
        }else{
            updateTouch(getTouchIndex("notouch"),event.pageX,event.pageY);
            touchData.currentMouseX = event.pageX;
            touchData.currentMouseY = event.pageY;
            touchData.mouseMoved = new Date().getTime();
        }

        function updateTouch(touchIndex,x,y){
            if (touchIndex>=0){
                var thisTouch =touchData.touches[touchIndex];

                thisTouch.x = x/scaleFactorW;
                thisTouch.y = y/scaleFactorW;

                touchData.touches.splice(touchIndex, 1, thisTouch);

                if (touchData.isTouchDown && thisTouch.UIobject){
                    if (thisTouch.UIobject.element && thisTouch.UIobject.element.onDrag){
                        thisTouch.UIobject.element.onDrag(thisTouch,thisTouch.UIobject);
                    }
                }
            }
        }

    }

    var handleUp = function(event){

        touchData.isTouchDown = false;

        if (event && event.touches){
            var touches = event.changedTouches;

            for (var i=0; i < touches.length; i++) {
                var touch = touches[i];
                endTouch(getTouchIndex(touch.identifier));
            }

            if (event.touches.length == 0){
                resetInput();
            }
        }else{
            endTouch(getTouchIndex("notouch"));
            resetInput();
        }

        function endTouch(touchIndex){
            if (touchIndex>=0){
                var thisTouch =touchData.touches[touchIndex];
                if (thisTouch.UIobject && thisTouch.UIobject.element){
                    var elm = thisTouch.UIobject.element;
                    if (elm.onClick) elm.onClick(thisTouch,thisTouch.UIobject);
                    if (elm.onUp) elm.onUp(thisTouch,thisTouch.UIobject);
                }
                touchData.touches.splice(touchIndex, 1);
            }
        }

        function resetInput(){
            Input.isDown(false);
            Input.isUp(false);
            Input.isLeft(false);
            Input.isRight(false);
        }
    };

    var handleMouseWheel = function(event){

        if (touchData.currentMouseX){

            var deltaY = event.wheelDeltaY || event.wheelDelta || -event.detail;
            var deltaX = event.wheelDeltaX || 0;

            touchData.mouseWheels.unshift(deltaY);
            if (touchData.mouseWheels.length > 10) touchData.mouseWheels.pop();

            var _x = touchData.currentMouseX/scaleFactorW;
            var _y = touchData.currentMouseY/scaleFactorH;
            var UIobject =  UI.getEventElement(_x,_y);

            if (UIobject && UIobject.element && UIobject.element.onMouseWheel){
                UIobject.element.onMouseWheel(deltaY,deltaX);
            }
        }
    };

    self.isTouchDown = function(){
        return touchData.isTouchDown;
    };

    self.hasMouseMoved = function(){
        return touchData.mouseMoved && touchData.mouseMoved > (new Date().getTime() - 500);
    };

    self.isInertiaMouseWheel = function(){
        // detects if a mousewheel events are comming from trackpad or mouse
        // TODO: test on more systems/mouses if this is always true
        if (touchData.mouseWheels.length > 1){
            for (var i = touchData.mouseWheels.length-2;i>=0;i--){
                if (Math.abs(touchData.mouseWheels[i]) != Math.abs(touchData.mouseWheels[i+1])){
                    return true;
                }
            }
        }
        return false;
    };

    self.getTouchData = function(){
        return touchData;
    };

    self.showDebug = function(){
        debug=true;
        Game.getSettings().showDebug = true;
    };

    self.hideDebug = function(){
        debug=true;
    };


    return self;
}());






