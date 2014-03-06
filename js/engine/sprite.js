var Sprite = function(id,img){
    var canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    var ctx = canvas.getContext("2d");

    // sprite map is 8 tiles wide
    var x = id % 8;
    var y = Math.floor(id / 8);

    ctx.drawImage(img,x*32,y*32,32,32,0,0,32,32);

    return canvas;
};
