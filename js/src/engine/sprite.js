/*
    Copies a rectangular piece of an image to a cached canvas
    Used to cut a spritesheet in individual sprites
 */
var Sprite = function(img,id,x,y,width,height){

    if (typeof width == "undefined"){
        // fixed tilesize
        var tilesize = x;

        var tilesInaRow = Math.floor(img.width/tilesize);

        x = (id % tilesInaRow) * tilesize;
        y = (Math.floor(id / tilesInaRow)) * tilesize;
        width = tilesize;
        height = tilesize;
    }

    var canvas = document.createElement("canvas");
    canvas.width  = width;
    canvas.height = height;
    var ctx = canvas.getContext("2d");

    this.canvas = canvas;
    this.ctx = ctx;

    ctx.drawImage(img,x,y,width,height,0,0,width,height);

};

Sprite.prototype.getColorAtPixel = function(x,y){
    return this.ctx.getImageData(x, y, 1, 1).data;
};


var buildSpriteSheet = function(img,callback){

    var map = Game.getSettings().spriteMap;

    if (map){
        for (var i = 0; i<spriteMap.length; i++){
            var co = spriteMap[i];
            var spriteImage = img;

            // todo build spritesheet from multiple source images
            if (co.src){
                spriteImage = userData[co.src];
            }

            var  s = new Sprite(spriteImage,co.name,co.l,co.t,co.w,co.h);
            sprites.push(s);
            spriteNames[co.name] = sprites.length-1;
        }

    }else{
        // spritesheet of fixed size images
        var t = Game.getSettings().tileSize;
        var maxSprites = Math.floor(img.width/t) * Math.floor(img.height/t);
        for (var i=0;i<maxSprites;i++){
            var s = new Sprite(img,i,Game.getSettings().tileSize);
            sprites.push(s);
        }
    }


    if (callback) callback();
};
