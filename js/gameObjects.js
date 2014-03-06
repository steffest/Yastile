var GameObjects = (function(){
    var game = {};

    game.init = function(){

        game.EMPTYSPACE = new GameObject({
            id: 0
        });

        game.STONEWALL = new GameObject({
            id: 2,
            spriteIndex: 2,
            canMoveThrough: false
        });

        game.WALL = new GameObject({
            id: 14,
            spriteIndexes: [14,4,5,6,7],
            canMoveThrough: false
        });

        game.GRASS = new GameObject({
            id: 15,
            spriteIndex: 15
        });

        game.APPLE = new GameObject({
            id: 3,
            spriteIndex: 3
        });

        game.PLAYER = new GameObject({
            id: 9,
            canMove: true,
            spriteIndex: 9,
            animationRight:[11,12,13,12],
            animationLeft:[16,17,18,17],
            animationUp:[19,20,21,20],
            animationDown:[8,9,10,9]
        });

    };

    return game;
}());
