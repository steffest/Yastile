var Map = (function(){
    var self = {};
    var layers = [];

    self.init = function(properties){

    };

    self.loadFromUrl = function(url,callback){
        layers = [];
        var layer;

        loadUrl(url,function(data){
            if (!data.layers){
                // single layer level
                data.id = "layer1";
                data.zIndex = 1;
                layer = self.addLayer(data);
            }else{
                for (var i = 1; i<=data.layers.length; i++){
                    var layerData = data.layers[i-1];
                    layerData.id = "layer" + i;
                    layerData.zIndex = i;
                    layer = self.addLayer(layerData);
                }
            }

            if (callback) callback(layer);
        })
    };

    self.addLayer = function(properties){

        var layerType = undefined;

        if (properties.type) layerType=properties.type;
        if (!layerType && properties.map) layerType=MAPLAYERTYPE.GRID;
        if (!layerType) layerType=MAPLAYERTYPE.FREE;
        properties.type = layerType;

        properties.speed = properties.speed || 1;

        var layer = new MapLayer(properties);
        layers.push(layer);

        return layer;

    };

    self.getLayer = function(id){
        for (var i=0; i<layers.length; i++){
            if (layers[i].id == id){
                return layers[i];
            }
        }
        return undefined;
    };

    self.onResize = function(settings){
        // delegate to layers
    };

    self.process = function(){
        for (var i=0; i<layers.length; i++){
            layers[i].process();
        }
    };

    self.render = function(){
        for (var i=0; i<layers.length; i++){
            layers[i].render();
        }
    };

    self.cleanUp = function(){
        for (var i=0; i<layers.length; i++){
            layers[i].cleanUp();
        }
    };

    self.sortLayers = function(){
        sortByKey(layers,"zIndex");
        console.log("sorted layers",layers);
    };

    return self;
}());
