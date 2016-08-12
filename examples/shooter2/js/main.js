window.addEventListener("DOMContentLoaded",function(){
    // sprites from http://eab.abime.net/showthread.php?t=18807&page=3

    Game.init({
        spriteSheet: "images/xenon2_sprites1_trans.png",
        spriteMap: "js/spritemap.js",
        tileSize: 32,
        viewPortWidth: 12,
        viewPortHeight: 12,
        scaling: SCALING.CONTAIN,
        showFPS: true,
        showOnScreenControls: true,
        showScore: true,
        showHint: true,
        showDebug: false,
        onScreenControls: ONSCREENCONTROLS._4WAY,
        resourcePath: "../../resources/",
        closeButtonImage: "close_button.png",
        actionButtonImage: "action_button.png",
        backgroundPattern: "Black",
        start: World.generate
    });

},false);



