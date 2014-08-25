var loadResources = function(resource,callback){
    var img = new Image();
    img.onload = function() {
        var t = Game.getSettings().tileSize;
        var maxSprites = Math.floor(img.width/t) * Math.floor(img.height/t);
        for (var i=0;i<maxSprites;i++){
            var s = new Sprite(i,img,Game.getSettings().tileSize);
            sprites.push(s);
        }
        if (callback) callback();
    };
    img.src = resource;
};

