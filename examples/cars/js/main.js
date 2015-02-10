window.addEventListener("DOMContentLoaded",function(){
    Game.init({
        targetFps: 35,
        spriteSheet: "images/cars_small_warre_maurice.png",
        spriteMap: "js/spritemap.js",
        viewPortWidth: 500,
        viewPortHeight: 500,
        scaling: SCALING.CONTAIN,
        showFPS: true,
        showOnScreenControls: true,
        showScore: true,
        showDebug: true,
        onScreenControls: ONSCREENCONTROLS._2WAY,
        closeButtonImage: "../../resources/close_button.png",
        actionButtonImage: "../../resources/action_button.png",
        backgroundPattern: "Black",
        preload: [
            {id: "track" , url: "images/track_warremaurice.png"},
            {id: "tracksmall" , url: "images/track_warremaurice_tiny.png"}
        ],
        start: World.generate
    });

},false);



