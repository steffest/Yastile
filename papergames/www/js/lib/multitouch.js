var touchData = {};
var TouchController = (function () {

    var touchEvents = {};

    touchEvents.updateDragSpeedInterval = false;

    var currentTouchData = undefined;
    var currentElement;

    document.addEventListener('touchstart',handleTouchStart);
    document.addEventListener('touchmove',handleTouchMove);
    document.addEventListener('touchend',handleTouchEnd);

    document.addEventListener('mousedown',function(ev){
        if (!touchEvents.handledTouch){
            touchEvents.isMouseDown = true;
            handleTouchStart(event,"mousedown");
        }
    });

    document.addEventListener('mousemove',function(ev){
        if (touchEvents.isMouseDown){
            handleTouchMove(event,"mousemove");
        }
    });

    document.addEventListener('mouseup',function(ev){
        if (touchEvents.isMouseDown){
            touchEvents.isMouseDown = false;
            handleTouchEnd(event,"mouseup");
        }
    });

    var init = function(){

    };


    function handleTouchStart(event,source){


        var elm = event.target || event.srcElement;
        var originalElm = elm;

        // bubble up until first element with touchEvents
        currentTouchData = undefined;
        var checkParent = true;
        do{
            if (elm.id) currentTouchData = touchData[elm.id];
            if (currentTouchData || !elm.parentNode) checkParent = false;
            if (checkParent) elm = elm.parentNode
        }while(checkParent);


        if (currentTouchData){

            var preventDefault = currentTouchData.preventDefault;

            if (elm && elm.className){
                var className = elm.className;

                // in IOS6 this is an SVGAnimatedString object ....
                if (className.baseVal) className = className.baseVal;

                if (className.indexOf("preventDefault")>=0) preventDefault = true;
                if (className.indexOf("dragitem")>=0) preventDefault = true;
                if (className.indexOf("dragItem")>=0) preventDefault = true;
            }

            if (preventDefault) event.preventDefault();

            touchEvents.isMultiTouch = false;

            touchEvents.srcElement = elm;
            currentTouchData.originalElm = originalElm;
            touchEvents.source = source;

            if (event.targetTouches){
                var touch = event.targetTouches[0];
                touchEvents.startX = touch.pageX;
                touchEvents.startY = touch.pageY;

                if (event.targetTouches.length > 1){
                    touchEvents.isMultiTouch = true;
                    touch = event.targetTouches[1];
                    touchEvents.startX2 = touch.pageX;
                    touchEvents.startY2 = touch.pageY;

                    touchEvents.startDistance = getDistance(touchEvents.startX,touchEvents.startY,touchEvents.startX2,touchEvents.startY2);
                    touchEvents.startAngle = getAngle(touchEvents.startX,touchEvents.startY,touchEvents.startX2,touchEvents.startY2);
                }

            }else{
                // no touchscreen
                if (event.pageX){
                    touchEvents.startX = event.pageX;
                    touchEvents.startY = event.pageY;
                }
            }

            touchEvents.currentX = touchEvents.startX;
            touchEvents.currentY = touchEvents.startY;
            touchEvents.lastDragX = touchEvents.startX;
            touchEvents.lastDragY = touchEvents.startY;

            touchEvents.startTime = new Date().getTime();
            touchEvents.isDown = true;

            if (currentTouchData.isElastic){
                touchEvents.srcElement.className = "";

                // keep track of time based last dragoffset to calculate swipe speed
                if (touchEvents.updateDragSpeedInterval === false){
                    touchEvents.updateDragSpeedInterval = setInterval(function(){
                        touchEvents.lastDragX = touchEvents.currentX;
                        touchEvents.lastDragY = touchEvents.currentY;
                    },200);
                }
            }

            currentTouchData.posX = currentTouchData.posX || 0;
            currentTouchData.posy = currentTouchData.posY || 0;
            currentTouchData.lastPosX = currentTouchData.lastPosX || 0;
            currentTouchData.lastPosY = currentTouchData.lastPosY || 0;
            currentTouchData.lastScale = currentTouchData.lastScale || 1;
            currentTouchData.lastRotation = currentTouchData.lastRotation || 0;

            currentTouchData.drag = currentTouchData.defaultDrag || currentTouchData.dragY || currentTouchData.dragX;

            if (currentTouchData.onTouchStart) currentTouchData.onTouchStart(touchEvents,event);

        }

    }

    function handleTouchMove(event,source){
        if (touchEvents.isDown){

            if (event.targetTouches){

                var touch = event.targetTouches[0];
                touchEvents.currentX = touch.pageX;
                touchEvents.currentY = touch.pageY;

                if (event.targetTouches.length>1){
                    touch = event.targetTouches[1];
                    touchEvents.currentX2 = touch.pageX;
                    touchEvents.currentY2 = touch.pageY;

                    touchEvents.currentDistance = getDistance(touchEvents.currentX,touchEvents.currentY,touchEvents.currentX2,touchEvents.currentY2);
                    touchEvents.currentAngle = getAngle(touchEvents.currentX,touchEvents.currentY,touchEvents.currentX2,touchEvents.currentY2);

                    //scale
                    touchEvents.currentScale = touchEvents.currentDistance / touchEvents.startDistance;

                    //rotation
                    touchEvents.currentRotation = touchEvents.currentAngle - touchEvents.startAngle;
                }


            }else{
                // no touchscreen
                if (event.pageX){
                    touchEvents.currentX = event.pageX;
                    touchEvents.currentY = event.pageY;
                }
            }

            touchEvents.deltaX = touchEvents.currentX - touchEvents.startX;
            touchEvents.deltaY = touchEvents.currentY - touchEvents.startY;


            if (touchEvents.srcElement && currentTouchData){

                if (currentTouchData.onDrag) currentTouchData.onDrag(touchEvents);

                if (currentTouchData.dragY) touchEvents.deltaX = 0;
                // only drag on Y axis


                currentTouchData.posX = touchEvents.deltaX + currentTouchData.lastPosX;
                currentTouchData.posY = touchEvents.deltaY + currentTouchData.lastPosY;

                currentTouchData.scale = currentTouchData.lastScale + (touchEvents.isMultiTouch ? (touchEvents.currentScale-1) : 0);
                currentTouchData.rotation = currentTouchData.lastRotation + (touchEvents.isMultiTouch ? (touchEvents.currentRotation) : 0);

                if (touchEvents.isMultiTouch || (currentTouchData.allowDrag && currentTouchData.allowDrag())){

                    setTransform(touchEvents.srcElement,currentTouchData.posX,currentTouchData.posY,currentTouchData.scale,currentTouchData.rotation);

                }


            }
        }
    }

    function handleTouchEnd(event,source){

        if (touchEvents.isDown){
            currentTouchData.lastPosX = currentTouchData.posX;
            currentTouchData.lastPosY = currentTouchData.posY;
            currentTouchData.lastScale = currentTouchData.scale;
            currentTouchData.lastRotation = currentTouchData.rotation;

            clearInterval(touchEvents.updateDragSpeedInterval);
            touchEvents.updateDragSpeedInterval = false;

            var swipeTime = new Date().getTime() - touchEvents.startTime;
            touchEvents.deltaX = touchEvents.currentX - touchEvents.startX;
            touchEvents.deltaY = touchEvents.currentY - touchEvents.startY;

            var tapped = false;

            if (Math.abs(touchEvents.deltaX)<minSwipeDistance && Math.abs(touchEvents.deltaY)<minSwipeDistance){
                if (swipeTime < maxTapDelay){
                    //tap
                    //TODO don't trigger if double tap is defined
                    tapped = true;
                }
            }else{
                if (currentTouchData.onSwiped) currentTouchData.onSwiped(touchEvents.deltaX,touchEvents.deltaY);
            }

            if (tapped && currentTouchData.onTap) currentTouchData.onTap(touchEvents);
            touchEvents.tapped = tapped;

            if (currentTouchData.onTouchEnd) currentTouchData.onTouchEnd(touchEvents);


            if (currentTouchData.onDrop) currentTouchData.onDrop(touchEvents);

            if (currentTouchData.isElastic){
                if (currentTouchData.onStartElasticScroll){
                    // set elastic Scroll boundaries
                    currentTouchData.onStartElasticScroll();
                }

                var lastDelta = touchEvents.lastDragY - touchEvents.currentY;
                if (swipeTime<200) lastDelta = 0-touchEvents.deltaY;
                var speed = Math.min(Math.abs(lastDelta/swipeTime)*2,1);

                var targetCoordinate = currentTouchData.posY - (speed * lastDelta * 2.5);

                var cssSpeedClass = "animate_easeout_slow";
                if (typeof currentTouchData.maxDragY == "number") {
                    if (targetCoordinate > currentTouchData.maxDragY) cssSpeedClass = "animate_easeout_fast";
                    targetCoordinate = Math.min(targetCoordinate,currentTouchData.maxDragY);
                }
                if (typeof currentTouchData.minDragY == "number") {
                    if (targetCoordinate < currentTouchData.minDragY) cssSpeedClass = "animate_easeout_fast";
                    targetCoordinate = Math.max(targetCoordinate,currentTouchData.minDragY);
                }
                currentTouchData.lastPosY = targetCoordinate;

                touchEvents.srcElement.className = cssSpeedClass;

                setTransform(touchEvents.srcElement,currentTouchData.posX,targetCoordinate,currentTouchData.scale,currentTouchData.rotation);

            }

        }

        touchEvents.isDown = false;
        touchEvents.isMouseDown = true;
        touchEvents.srcElement = undefined;

        if (typeof source == "undefined"){
            // event is from a touch, not from a (simulated) mouse click.
            touchEvents.handledTouch = true;
        }

    }


    var cancelTouch = function(){
        handleTouchEnd(undefined,touchEvents.source);
    };

    var startTouch = function(elm){
        var properties = touchData[elm.id];

        var pageOffset = getPageOffsetLeft();

        var event = {
            srcElement: elm,
            preventDefault : function(){},
            pageX : properties.lastPosX + pageOffset,
            pageY : properties.lastPosY
        };

        handleTouchStart(event);
    };


    // util

    // get distance between 2 points
    function getDistance(x1, y1, x2, y2) {
        var x = x2 - x1;
        var y = y2 - y1;
        return Math.sqrt((x * x) + (y * y));
    }


    // get angle between 2 points
    function getAngle(x1, y1, x2, y2) {
        var x = x2 - x1;
        var y = y2 - y1;
        return Math.atan2(y, x) * 180 / Math.PI;
    }

    var rotate = function(elm,angle){
        currentTouchData = undefined;
        currentElement = elm;
        if (elm.id) currentTouchData = touchData[elm.id];

        if (currentTouchData){
            currentTouchData.rotation = currentTouchData.lastRotation + angle;
            currentTouchData.lastRotation = currentTouchData.rotation;

            setTransform(elm,currentTouchData.posX || 0,currentTouchData.posY || 0,currentTouchData.scale || 0,currentTouchData.rotation,true);
        }
    };

    var scale = function(elm,percentage){
        currentTouchData = undefined;
        currentElement = elm;
        if (elm.id) currentTouchData = touchData[elm.id];

        if (currentTouchData){
            currentTouchData.scale = (currentTouchData.lastScale * percentage)/100;
            currentTouchData.lastScale = currentTouchData.scale;

            setTransform(elm,currentTouchData.posX || 0,currentTouchData.posY || 0,currentTouchData.scale,currentTouchData.rotation || 0,true);
        }
    };


    function setTransform(elm,x,y,scaling,rotation,override){
        if (currentTouchData){
            var transform = "";

            var doDrag = currentTouchData.drag || override;
            var doScale = currentTouchData.defaultScale || override;
            var doRotate = currentTouchData.defaultRotate || override;

            if (doDrag) transform += "translate3d("+x+"px,"+y+"px, 0) ";
            if (doScale) transform += "scale3d("+scaling+","+scaling+", 1) ";
            if (doRotate) transform += "rotate("+rotation+"deg) ";


            if (transform != ""){
                try{
                    elm.style.webkitTransform = transform;
                    elm.style.transform = transform;
                }catch(e){
                    //TODO: why error after cancelTouch?
                }
            }
        }

    }

    return {
        init: init,
        cancelTouch: cancelTouch,
        startTouch: startTouch,
        rotate: rotate,
        scale: scale
    }
}());