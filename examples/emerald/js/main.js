window.addEventListener("load",function(){
    Game.init({
        spriteSheet: "images/VX-sprites.png",
        tileSize: 32,
        viewPortWidth: 12,
        viewPortHeight: 12,
        scaling: SCALING.CONTAIN,
        targetFps: 60,
        showFPS: true,
        showOnScreenControls: true,
        showScore: true,
        showHint: true,
        onScreenControls: ONSCREENCONTROLS._2WAY,
        closeButtonImage: "../../resources/close_button.png",
        actionButtonImage: "../../resources/action_button.png",
        defaultGameObject: "EMPTYSPACE",
        backgroundPattern: 28, // = spritindex - or the name of a color e.g. "Black"
        backgroundImage: "images//back.jpg",
        backgroundImageAlpha:0.5,
        start: Intro.init
    });

},false);



