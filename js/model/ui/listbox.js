UI.Listbox = function(properties){
    var self = this;
    this.items = properties.items;
    this.onSelect = properties.onSelect;
    this.scrollOffetY = 0;
    this.scrollDeltaY = 0;
    this.scrollThreshold = 10;

    var onDrag = function(touchData){
        var delta = touchData.y - touchData.startY;
        self.scrollDeltaY = parseInt(delta);
    };

    var onClick = function(touchData){
        if (Math.abs(self.scrollDeltaY) < self.scrollThreshold){
            self.onSelect(touchData.object.element);
        }
        self.scrollOffetY += self.scrollDeltaY;
        self.scrollDeltaY = 0;
    };

    for (var i= 0, len= this.items.length; i<len; i++){
        this.items[i].onClick = onClick;
        this.items[i].onDrag = onDrag;
    }

};

UI.Listbox.prototype.render = function(){
    var y = 30 + this.scrollOffetY + this.scrollDeltaY;
    var x = 100;
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

        UI.registerEventElement(item,x,y,x+40,y+40);
    }
};