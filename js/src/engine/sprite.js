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
    var canvas = document.createElement("canvas");
    canvas.width  = this.width;
    canvas.height = this.height;
    var ctx = canvas.getContext("2d");
    ctx.translate(this.width/2, this.height/2);
    ctx.rotate(degree*Math.PI/180);
    ctx.translate(-this.width/2, -this.height/2);
    ctx.drawImage(this.canvas,0,0);

    this.rotated[degree] = canvas;

};

Sprite.prototype.flip = function(horizontal,vertical){
    var canvas = document.createElement("canvas");
    canvas.width  = this.width;
    canvas.height = this.height;
    var ctx = canvas.getContext("2d");
    ctx.translate(this.width,0);
    ctx.scale(-1, 1);
    ctx.drawImage(this.canvas,0,0);
    this.flipped = canvas;
};

Sprite.prototype.transform = function(rotation,scale,flipX,flipY){

    var key = "" + rotation + "_" + scale + "_" + flipX + "_" + flipY;

    var canvas = document.createElement("canvas");
    canvas.width  = this.width * scale;
    canvas.height = this.height * scale;
    var ctx = canvas.getContext("2d");

    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.rotate(rotation*Math.PI/180);
    ctx.translate(-canvas.width/2, -canvas.height/2);

    if (flipY){
        ctx.translate(this.width,0);
        ctx.scale(-1, 1);
        ctx.drawImage(this.canvas,0,0);
    }

    ctx.drawImage(this.canvas,0,0,canvas.width,canvas.height);

    this.transformed[key] = canvas;
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
    }
    if (callback) callback();
};
