UI.Listbox = function(properties){
    this.items = properties.items;
    this.onSelect = properties.onSelect;

    for (var i= 0, len= this.items.length; i<len; i++){
        this.items[i].onClick = this.onSelect;
    }
};

UI.Listbox.prototype.render = function(){
    var y = 30;
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