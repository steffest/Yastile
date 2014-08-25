window.addEventListener("load",function(){
    var spriteinfo = document.getElementById("spriteinfo");
    var spritelist = document.getElementById("spritelist");
    var spriteselector = document.getElementById("spriteselector");

    var gridsize = 32;
    var cols = 256 / gridsize;

    var canvas = document.getElementById("canvas");
    canvas.width = 320;
    canvas.height = 320;

    var ctx = canvas.getContext('2d');

    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;

    var spriteImg = document.getElementById("spriteImage");

    spritelist.addEventListener("mousemove",function(e){
            var x = Math.floor(e.offsetX / gridsize);
            var y = Math.floor(e.offsetY / gridsize);

            var spriteIndex = (y * cols) + x;
            spriteinfo.innerHTML = "Sprite " + spriteIndex;

            spriteselector.style.left = (x*32) + "px";
            spriteselector.style.top = (y*32) + "px";
    });

    spritelist.addEventListener("click",function(e){
        var x = Math.floor(e.offsetX / gridsize);
        var y = Math.floor(e.offsetY / gridsize);

        ctx.fillStyle = "#000000";
        ctx.clearRect(0,0,320,320);
        ctx.drawImage(spriteImg,x*32,y*32,32,32,0,0,320,320);
    });




},false);