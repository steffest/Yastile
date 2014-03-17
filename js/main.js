window.addEventListener("load",function(){
    Game.init({
        spriteSheet: "resources/VX.png",
        tileSize: 32,
        viewPortWidth: 15,
        viewPortHeight: 15,
        scaleToFit: true,
        showFPS: true,
        showOnScreenControls: true,
        onScreenControlsImage: "resources/controller.png",
        showScore: true,
        start: Intro.init
    });

},false);



