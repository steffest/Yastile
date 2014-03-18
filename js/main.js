window.addEventListener("load",function(){
    Game.init({
        spriteSheet: "resources/VX.png",
        tileSize: 32,
        viewPortWidth: 12,
        viewPortHeight: 12,
        scaling: SCALING.CONTAIN,
        showFPS: true,
        showOnScreenControls: true,
        onScreenControlsImage: "resources/controller.png",
        showScore: true,
        start: Intro.init
    });

},false);



