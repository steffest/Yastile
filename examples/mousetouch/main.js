window.addEventListener("DOMContentLoaded",function(){
    Game.init({
        spriteSheet: "flower.png",
        tileSize: 64,
        targetFps: 60,
        viewPortWidth: 10,
        viewPortHeight: 10,
        scaling: SCALING.CONTAIN,
        showFPS: true,
        showScore: true,
        showHint: true,
        showStats: false,
        showOnScreenControls: false,
        resourcePath: "../../resources/",
        onScreenControls: ONSCREENCONTROLS._4WAY,
        actionButtonImage: "action_button.png",
        backgroundImage: "grass.jpg",
        backgroundScale: SCALING.CONTAIN,
        start: init
    });
},false);

var layer;
function init(){

    layer = Map.addLayer({
        id : "main",
        type: MAPLAYERTYPE.FREE
    });

    for (var i = 0;i<100;i++){
        addFlower();
    }

    Game.start();
}

function addFlower(){
    var flower = new MapObject({
        left: randomBetween(0,canvas.width-30),
        top: randomBetween(0,canvas.height-30),
        gameObject: GameObjects.FLOWER
    });

    layer.addObject(flower,MAPOBJECTTYPE.FREE);
}


