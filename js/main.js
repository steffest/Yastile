window.addEventListener("load",function(){
    Game.init({
        spriteSheet: "resources/VX.png",
        tileSize: 32,
        viewPortWidth: 15,
        viewPortHeight: 15,
        scaleToFit: true,
        showFPS: true,
        showOnScreenControls: true,
        level:{
            width: 64,
            height: 32,
            map: "resources/levels/level1.json"
        }
    });

},false);



