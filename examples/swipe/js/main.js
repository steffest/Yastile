window.addEventListener("load",function(){
    Game.init({
        tileSize: 32,
        viewPortWidth: 12,
        viewPortHeight: 12,
        scaling: SCALING.CONTAIN,
        targetFps: 60,
        start: List.init
    });

},false);

