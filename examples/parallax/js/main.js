window.addEventListener("DOMContentLoaded",function(){
    // sprites from http://eab.abime.net/showthread.php?t=18807&page=3

    Game.init({
        spriteSheet: "images/sprites.png",
        spriteMap: "js/spritemap.js",
        tileSize: 32,
        viewPortWidth: 20 ,
        viewPortHeight: 16,
        targetFps: 60,
        scaling: SCALING.STRETCH,
        showFPS: true,
        showOnScreenControls: true,
        showScore: true,
        showHint: true,
        onScreenControls: ONSCREENCONTROLS._4WAY,
        closeButtonImage: "../../resources/close_button.png",
        actionButtonImage: "../../resources/action_button.png",
        backgroundImage: "images/sky.jpg",
        start: World.generate
    });

},false);



