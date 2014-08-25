var MapLayers = [];

var MapLayer = function(properties){
    for (var key in properties){
        this[key] = properties[key];
    }
    this.objects = [];
};

MapLayer.prototype.add = function(mapObject){
     this.objects.push(mapObject);
};

MapLayer.prototype.remove = function(mapObject){
    for (var i=0, len=this.objects.length;i<len;i++){
        var object = this.objects[i];
        if (object == mapObject) this.objects.splice(i,1);
    }
};


MapLayer.prototype.clear = function(){
    this.objects = [];
};

MapLayer.prototype.render = function(step,scrollOffset){
    for (var i=0, len=this.objects.length;i<len;i++){
        var object = this.objects[i];
        if (object.isVisible(scrollOffset)) object.render(step,scrollOffset,0);
    }
};


