var GameObjects = (function(){
    var game = {};

    game.init = function(){

        game.EMPTYSPACE = new GameObject({
            id: 0,
            code: "  "
        });

        game.STONEWALL = new GameObject({
            id: 2,
            code: "Ww",
            spriteIndex: 2,
            canBePickedUp: false
        });

        game.STEELWALL = new GameObject({
            id: 14,
            code: "Ws",
            spriteIndexes: [14,4,5,6,7],
            canBePickedUp: false
        });

        game.GRASS = new GameObject({
            id: 15,
            code: "..",
            spriteIndex: 15
        });

        game.EMERALD = new GameObject({
            id: 3,
            code: "$1",
            spriteIndex: 3
        });

        game.BOULDER = new GameObject({
            id: 26,
            code: "rr",
            spriteIndex: 26,
            canBePickedUp: false,
            canFall: true,
            onFallen: function(mapObject){
                //console.error("rock fell on "  + mapObject.gameObject.code);
            },
            canBePushed:{
                vertical: false,
                horizontal: true,
                friction: 0.5
            },
            isStableSurface: false
        });

        game.PLAYER = new GameObject({
            id: 9,
            code: "P1",
            canMove: true,
            spriteIndex: 9,
            animationRight:[11,12,13,12],
            animationLeft:[16,17,18,17],
            animationUp:[19,20,21,20],
            animationDown:[8,9,10,9],
            animationPushRight:[11,12,13,12],
            animationPushLeft:[16,17,18,17]
        });

    };

    return game;
}());
