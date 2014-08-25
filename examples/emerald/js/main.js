window.addEventListener("load",function(){
    Game.init({
        spriteSheet: "examples/emerald/images/VX-sprites.png",
        tileSize: 32,
        viewPortWidth: 12,
        viewPortHeight: 12,
        scaling: SCALING.CONTAIN,
        showFPS: true,
        showOnScreenControls: true,
        showScore: true,
        showHint: true,
        onScreenControlsImage: "resources/controller_4way.png",
        defaultGameObject: "EMPTYSPACE",
        backgroundPattern: 28, // = spritindex - or the name of a color e.g. "Black"
        backgroundImage: "examples/emerald/images//back.jpg",
        backgroundImageAlpha:0.5,
        start: Intro.init
    });

},false);



