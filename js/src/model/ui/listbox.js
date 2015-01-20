UI.Listbox = function(properties){
    var self = this;
    this.items = properties.items;
    this.onSelect = properties.onSelect;
    this.onResize = properties.onResize;
    this.scrollOffetY = properties.scrollY || 0 ;
    this.scrollDeltaY = 0;
    this.scrollSpeed = 0;
    this.scrollElastic = 0;
    this.scrollHistory = [];
    this.scrollThreshold = 5;

    this.itemHeight = properties.itemHeight || 64;

    this.top = properties.top;
    this.left = properties.left || 100;
    this.width = properties.width || 400;
    this.height = properties.height || 400;

    this.minScollPosition = 0;
    this.maxScrollPosition = (this.items.length * this.itemHeight) - this.height;

    this.preserveState = properties.preserveState || function(){};

    var onDrag = function(touchData){
        var delta = touchData.y - touchData.startY;
        self.scrollDeltaY = parseInt(delta);
    };

    var onUp = function(touchData){
        if (Math.abs(self.scrollDeltaY) < self.scrollThreshold){
            self.onSelect(touchData.UIobject.element);
        }else{
            self.scrollElastic = 20;
            var initialScrollSpeed = 0-(getInitialScrollSpeed()/10);

            // calculate target position
            var currentPosition = self.scrollOffetY + self.scrollDeltaY;

            // som van reeks 1 .. 20
            var sum = ((1+self.scrollElastic)*self.scrollElastic)/2;
            var targetPosition =  currentPosition + (sum * initialScrollSpeed);

            // check if target position is in boundary
            if (targetPosition>self.minScollPosition){
                // targetPosition towards 0
                initialScrollSpeed = self.minScollPosition-(currentPosition/sum);
                targetPosition = self.minScollPosition;
            }

            if (targetPosition< (0-self.maxScrollPosition)){
                initialScrollSpeed = ((0-currentPosition)-self.maxScrollPosition)/sum;
                targetPosition = 0-self.maxScrollPosition;
            }

            self.preserveState("scrollY",targetPosition);
            self.scrollSpeed = initialScrollSpeed;


        }

        self.scrollOffetY += self.scrollDeltaY;
        self.scrollDeltaY = 0;
        self.scrollHistory = [];
    };

    var onMouseWheel = function(delta){
        var targetPosition = limitScroll(self.scrollOffetY + delta/3);
        self.scrollOffetY = targetPosition;
    };

    var getInitialScrollSpeed = function(){
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

    function limitScroll(targetPosition){

        // check if target position is in boundary
        if (targetPosition>self.minScollPosition){
            // targetPosition towards 0
            targetPosition = self.minScollPosition;
        }

        if (targetPosition< (0-self.maxScrollPosition)){
            targetPosition = 0-self.maxScrollPosition;
        }

        return targetPosition;
    }

    function sameSign(a,b){
        return (a?a<0?-1:1:0) == (b?b<0?-1:1:0)
    }


    for (var i= 0, len= this.items.length; i<len; i++){
        this.items[i].onUp = onUp;
        this.items[i].onDrag = onDrag;
        this.items[i].onMouseWheel = onMouseWheel;
    }

};

UI.Listbox.prototype.render = function(){

    this.scrollOffetY = this.scrollOffetY + (this.scrollElastic * this.scrollSpeed);
    var y = this.top + this.scrollOffetY + this.scrollDeltaY;
    var x = this.left;
    var itemHeight = this.itemHeight;
    var itemWidth = this.width;

    var lineTop = itemHeight-10;
    var lineHeight = 0.5;

    if (this.scrollElastic > 0) this.scrollElastic -= 1;

    this.prevScrollDeltaY = this.prevScrollDeltaY || 0;
    var d = this.prevScrollDeltaY - this.scrollDeltaY;

    this.scrollHistory.unshift(d);
    if (this.scrollHistory.length > 10) this.scrollHistory.pop();
    this.prevScrollDeltaY = this.scrollDeltaY;


    for (var i= 0, len= this.items.length; i<len; i++){
        renderItem(this.items[i]);
    }

    function renderItem(item){
        y += itemHeight;
        var frame = sprites[item.icon].canvas;

        ctx.fillStyle = "Black";
        ctx.clearRect(x,y+lineTop,itemWidth,lineHeight); // why is this white?

        ctx.drawImage(frame,x, y);

        ctx.fillStyle = "Grey";
        ctx.font      = "normal 10pt Arial";
        ctx.fillText(item.name, x + 40, y + 16);

        UI.registerEventElement(item,x,y,x+itemWidth,y+itemHeight);
    }
};