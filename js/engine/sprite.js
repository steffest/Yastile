/*
    Copies a rectangular piece of an image to a cached canvas
    Used to cut a spritesheet in individual sprites
 */
var Sprite = function(id,img){
    var tilesize = Game.getSettings().tileSize;
    var tilesInaRow = Math.floor(img.width/tilesize);

    var canvas = document.createElement("canvas");
    canvas.width = tilesize;
    canvas.height = tilesize;
    var ctx = canvas.getContext("2d");


    var x = id % tilesInaRow;
    var y = Math.floor(id / tilesInaRow);

    ctx.drawImage(img,x*tilesize,y*tilesize,tilesize,tilesize,0,0,tilesize,tilesize);

    return canvas;
};
