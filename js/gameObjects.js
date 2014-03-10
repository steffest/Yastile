var GameObjects = (function(){
    var game = {};

    game.init = function(){

        game.EMPTYSPACE = new GameObject({
            id: 0,
            code: "  ",
            canBeCollected: true
        });

        game.STONEWALL = new GameObject({
            id: 2,
            code: "Ww",
            spriteIndex: 2
        });

        game.STEELWALL = new GameObject({
            id: 14,
            code: "Ws",
            spriteIndexes: [14,4,5,6,7]
        });

        game.GRASS = new GameObject({
            id: 15,
            code: "..",
            spriteIndex: 15,
            canBeCollected: true
        });

        game.EMERALD = new GameObject({
            id: 3,
            code: "$1",
            spriteIndex: 3,
            canBeCollected: true
        });

        game.BOULDER = new GameObject({
            id: 26,
            code: "rr",
            spriteIndex: 26,
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

        game.YAM = new GameObject({
            id: 23,
            code: "Yd",
            canMove: true,
            eachStep: function(object){
                if (object.wasMoving()){
                    object.moveIfPossible(object.sameDirection())
                }else{
                    object.moveIfPossible(Game.getRandomDirection());
                }
            }
        });

        game.SPIDER = new GameObject({
            id: 54,
            code: "Bu",
            canMove: true,
            animationRight:[56,57,58,59],
            animationLeft:[60,61,62,63],
            animationUp:[51,52,53,52],
            animationDown:[49,48,50,48],
            animationRotateUpToRight:[68,69,70,71],
            animationRotateUpToLeft:[68,69,70,71],
            animationRotateRightToUp:[68,69,70,71],
            animationRotateRightToDown:[68,69,70,71],
            animationRotateDownToLeft:[68,69,70,71],
            animationRotateDownToRight:[68,69,70,71],
            animationRotateLeftToUp:[68,69,70,71],
            animationRotateLeftToDown:[68,69,70,71],
            turn: function(object,direction){
                var anim = "Rotate"
                    + Game.getDirectionName(object.wasMovingToDirection)
                    + "To"
                    + Game.getDirectionName(direction);
                object.setNext("movingInToDirection",direction);
                object.setNext("hasTurned",true);
                object.animate(anim);
                object.isTurning = true;
            },
            eachStep: function(object){
                if (object.hasTurned){
                    object.setNext("hasTurned",false);
                    object.moveIfPossible(object.sameDirection())
                }

                if (object.wasMoving() && !object.isMoving()){
                    // turn right if possible
                    var preferedDirection = Game.getDirectionTurnedRight(object.wasMovingToDirection);

                    if (object.canMove(preferedDirection)){
                        game.SPIDER.turn(object,preferedDirection);
                    }else{
                        // if cannot turn right, move forward
                        object.moveIfPossible(object.sameDirection());

                        if (!object.isMoving()){
                            // still not moving? try turn right
                            var unPreferedDirection = Game.getDirectionTurnedLeft(object.wasMovingToDirection);

                            if (object.canMove(unPreferedDirection)){
                                game.SPIDER.turn(object,unPreferedDirection);
                            }else{
                                // can't go right either, nothing left to do: turn around
                                game.SPIDER.turn(object,preferedDirection);
                            }
                        }
                    }
                }

                if (!object.isMoving() && !object.isTurning){
                    // start of game, Spider should always be moving or turning;
                    object.moveIfPossible(Game.getRandomDirection());
                }
            }
        });


        game.BLOB = new GameObject({
            id: 40,
            code: "Ro",
            canMove: true,
            animationPulsate: [40,40,41,41,42,42,43,43,44,44,45,45,46,46,47,47],
            eachStep: function(object){
                if (!object.isAnimating()){
                    object.animate("Pulsate");
                }
            }
        });

        game.KEY = new GameObject({
            id: 74,
            code: "Kg",
            canBeCollected: true,
            onCollect: function(object){
                game.DOOR.shouldOpen = true;
            }
        });

        game.DOOR = new GameObject({
            id: 72,
            code: "Dg",
            eachStep: function(object){
                if (!object.isOpen && this.shouldOpen){
                    //this.spriteIndex = 73;
                    //object.isOpen = true;
                    //object.refresh();
                    object.transformInto(game.EMPTYSPACE);
                    object.addLayer(this.id + 1);
                }
            }
        });


    };

    return game;
}());
