window.addEventListener("load",function(){



    stats = new Stats();
    stats.setMode(0); // 0: fps, 1: ms

    // align top-left
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';

    document.body.appendChild( stats.domElement );

    Game.init({
        tileSize: 32,
        viewPortWidth: 12,
        viewPortHeight: 12,
        scaling: SCALING.CONTAIN,
        targetFps: 60,
        showStats: true,
        start: Page.init
    });

},false);

