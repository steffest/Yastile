UI.Listbox = function(properties){
    var self = this;

    this.items = properties.items || [];
    this.onSelect = properties.onSelect || function(){};
    this.onSwipe = properties.onSwipe || function(){};
    this.onResize = properties.onResize || function(){};
    this.onDown = properties.onDown || function(){};
    this.onUp = properties.onUp || function(){};
    this.scrollOffetY = properties.scrollY || 0 ;
    this.scrollOffetX = properties.scrollX || 0 ;
    this.scrollDeltaX = 0;
    this.scrollDeltaY = 0;
    this.prevScrollDeltaX = 0;
    this.prevScrollDeltaY = 0;
    this.scrollSpeedY = 0;
    this.scrollSpeedX = 0;
    this.scrollElastic = 0;
    this.scrollHistory = [];
    this.scrollThreshold = 5;
    this.scrollDirection = undefined;
    this.isVisible = true;

    this.itemHeight = properties.itemHeight || 64;
    this.itemWidth = properties.itemWidth || 64;

    this.top = properties.top;
    this.left = properties.left || 0;
    this.width = properties.width || 400;
    this.height = properties.height || 400;
    this.canScrollX = typeof (properties.scrollHorizontal == "boolean") ? properties.scrollHorizontal : false;
    this.canScrollY = typeof (properties.scrollVertical == "boolean") ? properties.scrollVertical : true;

    this.minScrollPositionY = 0;
    this.maxScrollPositionY = (this.items.length * this.itemHeight) - this.height;

    this.minScrollPositionX = 0;
    this.maxScrollPositionX = (this.items.length * this.itemWidth) - this.width;

    this.alignFunction = properties.alignFunction || function(targetPosition,direction){

            if (!direction){
                if (self.canScrollX){
                    return  Math.round(targetPosition / self.itemWidth) * self.itemWidth;
                }else{
                    return  Math.round(targetPosition / self.itemHeight) * self.itemHeight;
                }

            }
            if (direction == DIRECTION.UP){
                return  Math.ceil(targetPosition / self.itemHeight) * self.itemHeight;
            }
            if (direction == DIRECTION.DOWN){
                return  Math.floor(targetPosition / self.itemHeight) * self.itemHeight;
            }
            if (direction == DIRECTION.LEFT){
                return  Math.ceil(targetPosition / self.itemWidth) * self.itemWidth;
            }
            if (direction == DIRECTION.RIGHT){
                return  Math.floor(targetPosition / self.itemWidth) * self.itemWidth;
            }
            return targetPosition;
        };

    this.preserveState = properties.preserveState || function(){};
    this.renderItemFunction = properties.renderItem || function(){};
    this.preRender = properties.preRender || function(){};
    this.postRender = properties.postRender || function(){};
    this.needsDrawing = properties.needsDrawing || function(){return true};


    this.lastNavigateTime = 0;
    this.lastAnimateTime = 0;

    this.onDown = function(touchData){
        self.isDown = true;
        self.scrollElastic = 0;
        if(touchData.UIobject){
            self.onDown(touchData.UIobject.element);
        }
    };

    this.onDrag = function(touchData){


        if (self.canScrollY){
            var deltaY = touchData.y - touchData.startY;
            self.scrollDeltaY = parseInt(deltaY);
        }

        if (self.canScrollX){
            var deltaX = touchData.x - touchData.startX;
            self.scrollDeltaX = parseInt(deltaX);
        }

        self.currentElement = touchData.UIobject.element;
    };

    this.onUp = function(touchData){
        self.isDown = false;

        if (touchData.UIobject){
            self.currentElement = undefined;
            self.onUp(touchData.UIobject.element);

            if ((Math.abs(self.scrollDeltaY) < self.scrollThreshold) && (Math.abs(self.scrollDeltaX) < self.scrollThreshold)){
                self.onSelect(touchData.UIobject.element);
                //touchData.UIobject.element.onSelect();
            }else{
                self.onSwipe(touchData.UIobject.element);

                self.scrollElastic = 40;

                if (self.canScrollY){
                    var initialScrollSpeed = 0-(self.getInitialScrollSpeed()/10);

                    // calculate target position
                    var currentPosition = self.scrollOffetY + self.scrollDeltaY;

                    // som van reeks 1 .. max
                    var sum = ((1+self.scrollElastic)*self.scrollElastic)/2;
                    var targetPosition =  currentPosition + (sum * initialScrollSpeed);

                    var direction = self.scrollDeltaY>0 ? DIRECTION.DOWN : DIRECTION.UP;
                    targetPosition = limitScrollY(targetPosition,true,direction);
                    initialScrollSpeed = 0-(currentPosition-targetPosition)/sum;


                    self.preserveState("scrollY",targetPosition);
                    self.scrollSpeedY = initialScrollSpeed;
                }

                if (self.canScrollX){
                    var initialScrollSpeed = 0-(self.getInitialScrollSpeed()/20);


                    // calculate target position
                    var currentPosition = self.scrollOffetX + self.scrollDeltaX;

                    // som van reeks 1 .. 20
                    var sum = ((1+self.scrollElastic)*self.scrollElastic)/2;
                    var targetPosition =  currentPosition + (sum * initialScrollSpeed);

                    var direction = self.scrollDeltaX>0 ? DIRECTION.RIGHT : DIRECTION.LEFT;
                    targetPosition = limitScrollX(targetPosition,true,direction);
                    initialScrollSpeed = 0-(currentPosition-targetPosition)/sum;

                    self.preserveState("scrollX",targetPosition);
                    self.scrollSpeedX = initialScrollSpeed;
                }

            }

            self.scrollOffetY += self.scrollDeltaY;
            self.scrollOffetX += self.scrollDeltaX;
            self.scrollDeltaY = 0;
            self.scrollDeltaX = 0;
            //self.scrollHistory = [];
        }



    };

    this.onMouseWheel = function(deltaY,deltaX){
        var targetPosition;
        if (self.canScrollY){
            targetPosition = limitScrollY(self.scrollOffetY + deltaY/3);
            self.scrollOffetY = targetPosition;
            if (deltaY == 0){
                // end of elastic scrool on OSX
                self.alignToGrid(self.scrollDirection,40);
            }else{
                self.scrollDirection = deltaY<0 ? DIRECTION.DOWN : DIRECTION.UP;
            }
            this.lastNavigateTime = Date.now();

        }else if (self.canScrollX){
            targetPosition = limitScrollX(self.scrollOffetX + deltaX/3);
            self.scrollOffetX = targetPosition;
            if (deltaX == 0){
                self.alignToGrid(self.scrollDirection,40);
            }else{
                self.scrollDirection = deltaX<0 ? DIRECTION.LEFT : DIRECTION.RIGHT;
            }
            this.lastNavigateTime = Date.now();
        }

        if (!UI.isInertiaMouseWheel()){
            // set timeout to align after mousewheel has stopped;
            if (self.mouseWheelTimeOut) clearTimeout(self.mouseWheelTimeOut);
            self.mouseWheelTimeOut = setTimeout(function(){
                self.alignToGrid(self.scrollDirection,40);
            },300)
        }
    };

    this.getInitialScrollSpeed = function(){
        var speed = 0;
        var h = self.scrollHistory;

        if (h.length>0){
            var d = 0;
            var deltaSameDirection = [];
            var i;
            for (i = 0;i<h.length;i++){
                var _h = h[i];
                if (_h == 0 ){
                    deltaSameDirection.push(_h);
                }else{
                   if (d==0) d=_h;
                   if (sameSign(d,_h)){
                       deltaSameDirection.push(_h);
                   }else{
                       break;
                   }
                }
            }
            if (deltaSameDirection.length>0){
                var sum = 0;
                for (i = 0;i<deltaSameDirection.length;i++){
                    sum += deltaSameDirection[i];
                }
                speed = sum/deltaSameDirection.length;
            }
            return speed;
        }

    };

    function limitScrollY(targetPositionY,alignToGrid,direction){

        // check if target position is in boundary

        if (self.canScrollY){
            if (targetPositionY>self.minScrollPositionY){
                // targetPosition towards 0
                targetPositionY = self.minScrollPositionY;
            }

            if (targetPositionY< (0-self.maxScrollPositionY)){
                targetPositionY = 0-self.maxScrollPositionY;
            }
        }else{
            targetPositionY = self.minScrollPositionY;
        }

        if (alignToGrid){
            targetPositionY = self.alignFunction(targetPositionY,direction);
        }
        //initialScrollSpeed = 0-(currentPosition-targetPosition)/sum;
        //console.error(targetPosition,initialScrollSpeed);


        return targetPositionY;
    }



    function limitScrollX(targetPositionX,alignToGrid,direction){
        if (self.canScrollX){
            if (targetPositionX>self.minScrollPositionX){
                targetPositionX = self.minScrollPositionX;
            }

            if (targetPositionX< (0-self.maxScrollPositionX)){
                targetPositionX = 0-self.maxScrollPositionX;
            }
        }else{
            targetPositionX = self.minScrollPositionX;
        }

        if (alignToGrid){
            targetPositionX = self.alignFunction(targetPositionX,direction);
        }

        return targetPositionX;
    }

    this.limitScrollY = limitScrollY;
    this.limitScrollX = limitScrollX;

    function sameSign(a,b){
        return (a?a<0?-1:1:0) == (b?b<0?-1:1:0)
    }

    for (var i= 0, len= this.items.length; i<len; i++){
        this.items[i].onDown = this.onDown;
        this.items[i].onUp = this.onUp;
        this.items[i].onDrag = this.onDrag;
        this.items[i].onMouseWheel = this.onMouseWheel;
        this.items[i].parent = self;
    }
};


UI.Listbox.prototype.setItems = function(items){
    this.items = items;

    //this.maxScrollPositionY = (this.items.length * this.itemHeight) - this.height;
    //this.maxScrollPositionX = (this.items.length * this.itemWidth) - this.width;
    this.maxScrollPositionY = ((this.items.length-1)* this.itemHeight);
    this.maxScrollPositionX = ((this.items.length-1) * this.itemWidth);

    this.scrollOffetY = 0;
    this.scrollOffetX = 0;
    this.scrollDeltaX = 0;
    this.scrollDeltaY = 0;
    this.scrollSpeedY = 0;
    this.scrollSpeedX = 0;
    this.scrollElastic = 0;
    this.scrollHistory = [];

    for (var i= 0, len= this.items.length; i<len; i++){
        this.items[i].onDown = this.onDown;
        this.items[i].onUp = this.onUp;
        this.items[i].onDrag = this.onDrag;
        this.items[i].onMouseWheel = this.onMouseWheel;
        this.items[i].parent = this;
    }
};

UI.Listbox.prototype.getItems = function(){
    return this.items;
};

UI.Listbox.prototype.render = function(){

    if (!this.isVisible) return;

    this.scrollOffetY = this.scrollOffetY + (this.scrollElastic * this.scrollSpeedY);
    this.scrollOffetX = this.scrollOffetX + (this.scrollElastic * this.scrollSpeedX);
    this.itemY = this.top + this.scrollOffetY + this.scrollDeltaY;
    this.itemX = this.left + this.scrollOffetX + this.scrollDeltaX;

    if (this.scrollElastic > 0) this.scrollElastic -= 1;

    var d;
    if (this.canScrollY){
        this.prevScrollDeltaY = this.prevScrollDeltaY || 0;
        d = this.prevScrollDeltaY - this.scrollDeltaY;
        this.scrollHistory.unshift(d);
        if (this.scrollHistory.length > 10) this.scrollHistory.pop();
    }else if(this.canScrollX){
        this.prevScrollDeltaX = this.prevScrollDeltaX || 0;
        d = this.prevScrollDeltaX - this.scrollDeltaX;

        this.scrollHistory.unshift(d);
        if (this.scrollHistory.length > 10) this.scrollHistory.pop();
    }

    this.prevScrollDeltaY = this.scrollDeltaY;
    this.prevScrollDeltaX = this.scrollDeltaX;

    this.preRender();

    if (this.needsDrawing()){
        for (var i= 0, len= this.items.length; i<len; i++){
            //if (this.itemY>0){
            var newProps = this.renderItemFunction(this.items[i],this);
            this.itemY = newProps.y;
            this.itemX = newProps.x;
            if (newProps.break) break;
            //}
        }
    }

    this.postRender();
    UI.registerEventElement(this,this.left,this.top,this.left+this.width,this.top+this.height);
};

UI.Listbox.prototype.navigateUp = function(speed){
    speed = speed || 10;
    var targetPosition = this.scrollOffetY + speed;
    if (targetPosition>this.minScrollPositionY){
        targetPosition = this.minScrollPositionY;
    }
    this.scrollOffetY = targetPosition;
    this.lastNavigateTime = Date.now();
};

UI.Listbox.prototype.navigateDown = function(speed){
    speed = speed || 10;
    var targetPosition = this.scrollOffetY - speed;
    if (targetPosition< (0-this.maxScrollPositionY)){
        targetPosition = 0-this.maxScrollPositionY;
    }
    this.scrollOffetY = targetPosition;
    this.lastNavigateTime = Date.now();
};

UI.Listbox.prototype.navigateLeft = function(speed){
    speed = speed || 10;
    var targetPosition = this.scrollOffetX + speed;
    if (targetPosition>this.minScrollPositionX){
        targetPosition = this.minScrollPositionX;
    }
    this.scrollOffetX = targetPosition;
    this.lastNavigateTime = Date.now();
};

UI.Listbox.prototype.navigateRight = function(speed){
    speed = speed || 10;
    var targetPosition = this.scrollOffetX - speed;
    if (targetPosition< (0-this.maxScrollPositionX)){
        targetPosition = 0-this.maxScrollPositionX;
    }
    this.scrollOffetX = targetPosition;
    this.lastNavigateTime = Date.now();
};

UI.Listbox.prototype.moveTo = function(co,speed){
    speed = speed || 40;
    this.scrollElastic = speed;
    var sum = ((1+speed)*speed)/2;

    var currentPosition,targetPosition;
    if (this.canScrollX){
        currentPosition = this.scrollOffetX + this.scrollDeltaX;
        targetPosition = this.limitScrollX(co,true);
        this.scrollSpeedX = 0-(currentPosition-targetPosition)/sum;
    }else{
        currentPosition = this.scrollOffetY + this.scrollDeltaY;
        targetPosition = this.limitScrollY(co,true);
        this.scrollSpeedY = 0-(currentPosition-targetPosition)/sum;
    }
};

UI.Listbox.prototype.jumpTo = function(co){
    var targetPosition;
    if (this.canScrollX){
        this.scrollOffetX = this.limitScrollX(co,true);
    }else{
        this.scrollOffetY = this.limitScrollY(co,true);
    }
};

UI.Listbox.prototype.alignToGrid = function(direction,speed){
    speed = speed || 20;
    this.scrollElastic = speed;
    var sum = ((1+speed)*speed)/2;
    var currentPosition,targetPosition;

    if (this.canScrollX){
        currentPosition = this.scrollOffetX + this.scrollDeltaX;
        targetPosition = this.limitScrollX(currentPosition,true,direction);
        this.scrollSpeedX = 0-(currentPosition-targetPosition)/sum;
    }else{
        currentPosition = this.scrollOffetY + this.scrollDeltaY;
        targetPosition = this.limitScrollY(currentPosition,true,direction);
        this.scrollSpeedY = 0-(currentPosition-targetPosition)/sum;
    }

};

UI.Listbox.prototype.isNavigating = function(){
    return !!UI.isTouchDown() || this.scrollElastic > 0 || this.lastNavigateTime > Date.now()-50;
};

UI.Listbox.prototype.isAnimating = function(isAnimating){
    if (isAnimating){
        this.lastAnimateTime = Date.now();
        return true;
    }else{
        return this.lastAnimateTime > Date.now()-200;
    }
};
