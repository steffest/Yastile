var GameObjects = (function(){
    var game = {};

    game.checkLightBulb = function(object){
        if (object.isLightSocket){
            object.animateIfPossible("On");
            if (!object.objectProperties().isActivated){
                object.objectProperties().isActivated = true;
                Game.addScore(1);
                if (Game.hasTargetScore()) Game.isWon(true);
            }
        }else{
            if (object.objectProperties().isActivated){
                object.objectProperties().isActivated = false;
                Game.addScore(-1);
            }
        }
    };

    game.explode = function(mapPosition,targetObject){
        mapPosition.transformInto(game.EXPLOSION,"Smash",function(mapPosition){
            mapPosition.transformInto(targetObject,"Boom");
        });
    };

    game.explodeBig = function(mapPosition,targetObject){

        var directions = [
            DIRECTION.LEFTUP,
            DIRECTION.UP,
            DIRECTION.RIGHTUP,
            DIRECTION.LEFT,
            DIRECTION.NONE,
            DIRECTION.RIGHT,
            DIRECTION.LEFTDOWN,
            DIRECTION.DOWN,
            DIRECTION.RIGHTDOWN
        ];

        for (var i=0; i< directions.length;i++){
            var thisObject = mapPosition.getObject(directions[i]);
            thisObject.transformInto(game.EXPLOSION,"",function(mapPosition) {
                mapPosition.transformInto(targetObject, "Boom");
            })
        }
    };

    game.init = function(){

        game.EMPTYSPACE = new GameObject({
            id: 0,
            code: "  ",
            alias: " ",
            canBeCollected: true
        });

        game.STONEWALL = new GameObject({
            id: 2,
            code: "Ww",
            alias: "W",
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
            spriteIndexes: [24,25,26],
            canFall: true,
            onFallen: function(object,on){
                console.error("rock fell on "  + on.gameObject.code);
                if (!on.isMoving() && on.gameObject.canBeCrushed){
                    object.move(DIRECTION.DOWN);
                    if (on.gameObject.explodeBig){
                        game.explodeBig(on,game.EMERALD)
                    }else{
                        game.explode(on,game.EMERALD)
                    }
                }
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
            alias: "P",
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
            canBeCrushed: true,
            explodeBig: true,
            eachStep: function(object){
                if (object.wasMoving()){
                    object.moveIfPossible(object.sameDirection());
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
                var anim = "Rotate" + 
                    Game.getDirectionName(object.wasMovingToDirection) +
                    "To" +
                    Game.getDirectionName(direction);
                object.setNext("movingInToDirection",direction);
                object.setNext("hasTurned",true);
                object.animate(anim);
                object.isTurning = true;
            },
            eachStep: function(object){
                if (object.hasTurned){
                    object.setNext("hasTurned",false);
                    object.moveIfPossible(object.sameDirection());
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
            id: 88,
            code: "Kg",
            canBeCollected: true,
            animationRotate: [88,88,89,89,90,90,91,91,92,92,93,93,94,94,95,95,96,96,97,97,98,98,99,99,88,88,89,89,90,90,91,91,92,92,93,93,94,94,95,95,96,96,97,97,98,98,99,99],
            onCollect: function(object){
                game.DOOR.shouldOpen = true;
            },
            eachStep: function(object){
                if (!object.isAnimating()){
                    object.animate("Rotate");
                }
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

        game.EXPLOSION = new GameObject({
            id: 80,
            code: "**",
            animationBoom : [80,81,82,83,84,85,86,87],
            eachStep: function(object){
                if (!object.isAnimating()){
                    object.transformInto(game.EMPTYSPACE,"Boom");
                }
            }
        });

        game.BOMB = new GameObject({
            id: 34,
            code: "Bo",
            canFall: true,
            canBePushed:{
                vertical: false,
                horizontal: true,
                friction: 0
            },
            animationSmash: [35,36,37,38],
            onFallen: function(object,on){
                game.explode(object,game.EMERALD);
            }
        });

        game.LIGHTBULB = new GameObject({
            id: 100,
            code: "Lb",
            alias: "o",
            canBePushed:{
                vertical: true,
                horizontal: true,
                friction: 0
            },
            animationOn: [101,101,102,102,103,103,101,101,102,102,103,103],
            eachStep: function(object){
                game.checkLightBulb(object);
            }
        });

        game.AIRBUBBLE = new GameObject({
            id: 76,
            code: "La",
            alias: "a",
            canBePushed:{
                vertical: true,
                horizontal: true,
                friction: 0
            },
            animationOn: [101,101,102,102,103,103,101,101,102,102,103,103],
            eachStep: function(object){
                if (object.wasMoving()){
                    object.moveIfPossible(object.sameDirection());
                }
                game.checkLightBulb(object);
            }
        });

        game.LIGHTSOCKET = new GameObject({
            id: 75,
            code: "Ls",
            alias: ":",
            eachStep: function(object){
                if (!object.isAnimating()){
                    object.transformInto(game.EMPTYSPACE);
                    object.addLayer(this.id,"bottom");
                    object.isLightSocket = true;
                }
            }
        });
    };
    return game;
}());
