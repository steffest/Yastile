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

    var spriteCanvas = document.createElement("canvas");
    spriteCanvas.width  = width;
    spriteCanvas.height = height;
    var ctx = spriteCanvas.getContext("2d");

    this.canvas = spriteCanvas;
    this.ctx = ctx;
    this.rotated = {};
    this.transformed = {};
    this.width = width;
    this.height = height;

    ctx.drawImage(img,x,y,width,height,0,0,width,height);

};

Sprite.prototype.getColorAtPixel = function(x,y){
    // warning ... very slow
    return this.ctx.getImageData(x, y, 1, 1).data;
};

Sprite.prototype.putColorAtPixel = function(color,x,y){
    var c = ctx.createImageData(1,1);
    if (c){
        var d  = c.data;
        d[0] = 255;
        d[1] = 255;
        d[3] = 255;
        d[4] = 255;
        this.ctx.putImageData(c, x, y);
    }
};

Sprite.prototype.rotate = function(degree){

    degree = Math.round(degree);
    var spriteCanvas = document.createElement("canvas");
    spriteCanvas.width  = this.width;
    spriteCanvas.height = this.height;
    var ctx = spriteCanvas.getContext("2d");
    ctx.translate(this.width/2, this.height/2);
    ctx.rotate(degree*Math.PI/180);
    ctx.translate(-this.width/2, -this.height/2);
    ctx.drawImage(this.canvas,0,0);

    this.rotated[degree] = spriteCanvas;

};

Sprite.prototype.flip = function(horizontal,vertical){
    var spriteCanvas = document.createElement("canvas");
    spriteCanvas.width  = this.width;
    spriteCanvas.height = this.height;
    var ctx = spriteCanvas.getContext("2d");
    ctx.translate(this.width,0);
    ctx.scale(-1, 1);
    ctx.drawImage(this.canvas,0,0);
    this.flipped = spriteCanvas;
};

Sprite.prototype.transform = function(rotation,scale,flipX,flipY){

    var key = "" + rotation + "_" + scale + "_" + flipX + "_" + flipY;

    var spriteCanvas = document.createElement("canvas");
    spriteCanvas.width  = this.width * scale;
    spriteCanvas.height = this.height * scale;
    var ctx = spriteCanvas.getContext("2d");

    ctx.translate(spriteCanvas.width/2, spriteCanvas.height/2);
    ctx.rotate(rotation*Math.PI/180);
    ctx.translate(-spriteCanvas.width/2, -spriteCanvas.height/2);

    if (flipY){
        ctx.translate(this.width,0);
        ctx.scale(-1, 1);
        ctx.drawImage(this.canvas,0,0);
    }

    ctx.drawImage(this.canvas,0,0,spriteCanvas.width,spriteCanvas.height);

    this.transformed[key] = spriteCanvas;
};


var buildSpriteSheet = function(img,callback){

    if (img){
        var map = Game.getSettings().spriteMap;

        if (map){
            for (var i = 0; i<spriteMap.length; i++){
                var co = spriteMap[i];
                var spriteImage = img;

                // todo build spritesheet from multiple source images
                if (co.src){
                    spriteImage = userData[co.src];
                }
                if (co.canvas){
                    spriteImage = co.canvas;
                    co.l = 0;
                    co.t = 0;
                }

                var  s = new Sprite(spriteImage,co.name,co.l,co.t,co.w,co.h);
                sprites[co.name] = s;
            }

        }else{
            // spritesheet of fixed size images
            var t = Game.getSettings().tileSize;
            var maxSprites = Math.floor(img.width/t) * Math.floor(img.height/t);
            for (var i=0;i<maxSprites;i++){
                var s = new Sprite(img,i,Game.getSettings().tileSize);
                sprites[i] = s;
            }
        }
    }
    if (callback) callback();
};
