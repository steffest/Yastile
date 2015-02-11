window.addEventListener("DOMContentLoaded",function(){
    Game.init({
        spriteSheet: "bunny.png",
        tileSize: 32,
        targetFps: 60,
        viewPortWidth: 16,
        viewPortHeight: 16,
        scaling: SCALING.CONTAIN,
        showFPS: true,
        showScore: true,
        showHint: true,
        showStats: true,
        showOnScreenControls: false,
        resourcePath: "../../resources/",
        onScreenControls: ONSCREENCONTROLS._4WAY,
        actionButtonImage: "action_button.png",
        backgroundImage: "",
        start: init
    });
},false);


var layer;
var bunnyCount = 0;
var stats;
function init(){


    stats = new Stats();
    stats.setMode(0); // 0: fps, 1: ms

    // align top-left
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';

    document.body.appendChild( stats.domElement );



    layer = Map.addLayer({
        id : "main",
        type: MAPLAYERTYPE.FREE
    });
    addBunny();

    layer.eachStep = function(){
        if (Input.isAction() || UI.isTouchDown()){
            for (var i =0;i<10;i++){
                addBunny();
            }
        }
    };

    Game.start();
}

function addBunny(){
    var bunny = new MapObject({
        left: randomBetween(0,30),
        top: randomBetween(0,100),
        speed: 4,
        drift: randomBetween(3,5),
        hop: randomBetween(16,32),
        gameObject: GameObjects.BUNNY
    });

    layer.addObject(bunny,MAPOBJECTTYPE.FREE);
    bunnyCount++;
    Game.setHint(bunnyCount + " bunnies")

}


var GameObjects = (function(){
    var game = {};
    game.state = {};

    game.resetState = function(){
        game.state = {};
    };

    game.init = function(){

        game.BUNNY = new GameObject({
            id: 1,
            code: "b",
            eachStep: function(me){
                me.speed = me.speed || 0;
                me.speed += 1;

                me.top += me.speed;
                if (me.top>canvas.height-32) me.speed = -me.hop;

                me.left += me.drift;
                if ((me.left>canvas.width - 24) || (me.left<-10)) me.drift = -me.drift;
            }
        });

    };
    return game;
}());
