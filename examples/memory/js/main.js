window.addEventListener("DOMContentLoaded",function(){
    // sprites from http://eab.abime.net/showthread.php?t=18807&page=3

    Game.init({
        spriteSheet: "img/tiles.png",
        tileSize: 128,
        viewPortWidth: 6,
        viewPortHeight: 6,
        scaling: SCALING.CONTAIN,
        showFPS: false,
        showOnScreenControls: false,
        showScore: false,
        showHint: false,
        showDebug: false,
        resourcePath: "img/",
        closeButtonImage: "close_button.png",
        backgroundImage: "img/back.jpg",
        preload: ["img/flower.png","img/m.png"],
        backgroundScale: SCALING.CONTAIN,
        start: Intro.init
    });

},false);




