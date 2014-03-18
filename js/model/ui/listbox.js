UI.Listbox = function(properties){
    var self = this;
    this.items = properties.items;
    this.onSelect = properties.onSelect;
    this.scrollOffetY = 0;
    this.scrollDeltaY = 0;
    this.scrollSpeed = 0;
    this.scrollElastic = 0;
    this.scrollHistory = [];
    this.scrollThreshold = 5;

    var onDrag = function(touchData){
        var delta = touchData.y - touchData.startY;
        self.scrollDeltaY = parseInt(delta);
    };

    var onUp = function(touchData){
        if (Math.abs(self.scrollDeltaY) < self.scrollThreshold){
            self.onSelect(touchData.object.element);
        }else{
            self.scrollElastic = 20;
            self.scrollSpeed = 0-(getInitialScrollSpeed()/10);

        }
        self.scrollOffetY += self.scrollDeltaY;
        self.scrollDeltaY = 0;
        self.scrollHistory = [];
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

    function sameSign(a,b){
        return (a?a<0?-1:1:0) == (b?b<0?-1:1:0)
    }


    for (var i= 0, len= this.items.length; i<len; i++){
        this.items[i].onUp = onUp;
        this.items[i].onDrag = onDrag;
    }

};

UI.Listbox.prototype.render = function(){
    this.scrollOffetY = this.scrollOffetY + (this.scrollElastic * this.scrollSpeed);
    var y = 30 + this.scrollOffetY + this.scrollDeltaY;
    var x = 100;

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
        y += 64;
        var frame = sprites[4];
        ctx.drawImage(frame,x, y);

        ctx.fillStyle = "White";
        ctx.font      = "normal 10pt Arial";
        ctx.fillText(item.name, x, y + 42);

        UI.registerEventElement(item,x,y,x+60,y+60);
    }
};