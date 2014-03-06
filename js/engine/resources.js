var loadResources = function(resource,callback){
    var img = new Image();
    img.onload = function() {
        for (var i=0;i<30;i++){
            var s = new Sprite(i,img);
            sprites.push(s);
        }
        if (callback) callback();
    };
    img.src = resource;
};

