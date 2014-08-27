var GameObjects = (function(){
    var game = {};
    game.state = {};

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

    game.explode = function(mapPosition,targetObject,animation){

        if (isArray(targetObject) && targetObject.length>8){
            game.explodeBig(mapPosition,targetObject);
            return;
        }

        if (typeof animation == "undefined") animation="";
        if (isArray(targetObject)) targetObject = targetObject[0];

        if (!mapPosition.gameObject.survivesExplosion){
            mapPosition.transformInto(game.EXPLOSION,animation,function(mapPosition){
                mapPosition.transformInto(targetObject,"Boom",function(mapPosition){
                    if (mapPosition.gameObject.onExplode){
                        mapPosition.gameObject.onExplode();
                    }
                });
            });
        }

    };

    game.explodeBig = function(mapPosition,targetObjects){

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

        if (!isDefined(targetObjects)) targetObjects = GameObjects.EMPTYSPACE;
        if (! isArray(targetObjects)){
            var baseObject = targetObjects;
            targetObjects = [];
            for (var i=0; i< directions.length;i++){ targetObjects.push(baseObject)};
        }

        for (var i=0; i< directions.length;i++){
            var obj = mapPosition.getObject(directions[i]);
            var targetObject = targetObjects[i];

            if (directions[i] != DIRECTION.NONE && obj.gameObject.explosionDelay && obj.gameObject.explosionDelay>0){
                obj.setNext("action",function(thisMapPosition){
                    thisMapPosition.transformInto(thisMapPosition.gameObject,"Smash",function(thisMapPosition) {
                        game.explodeBig(thisMapPosition, thisMapPosition.getExplodeIntoObjects(), "Smash");
                    });
                })
            }else{
                game.explode(obj,targetObject,"Smash");
            }


        }
    };

    game.getRandomGameObject = function(){
        var result = GameObjectIndex[Math.floor(random()*GameObjectIndex.length)];
        if (result.id == game.PLAYER.id) result = game.EMPTYSPACE;
        return result;
    };

    game.resetState = function(){
        game.state = {};
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
            survivesExplosion: true,
            spriteIndexes: [14,4,5,6,7]
        });

        game.GRASS = new GameObject({
            id: 15,
            code: "..",
            spriteIndex: 15,
            canBeCollected: true
        });

        game.EMERALD = new GameObject({
            id: 200,
            code: "$1",
            spriteIndex: 200,
            canBeCollected: true,
            canFall: true,
            isStableSurface: false,
            animationDisappear: animation.emeraldDisappear,
            animationPing: animation.emeraldPing,
            onCollected: function(by,me,direction){
                Game.addScore(1);
                me.animateIfPossible("Disappear");
            },
            eachStep : function(me){
                Maybe(function(){me.animateIfPossible("Ping");},0.1);
            }
        });

        game.DIAMOND = new GameObject({
            id: 77,
            code: "$3",
            spriteIndex: 77,
            canBeCollected: true,
            canFall: true,
            isStableSurface: false,
            canBeCrushedBy: function(object){
                return object.gameObject.code == GameObjects.BOULDER.code;
            },
            onCrushed: function(by,me){
                console.error("diamond is gone");
            }
        });

        game.BOULDER = new GameObject({
            id: 26,
            code: "rr",
            spriteIndex: 26,
            spriteIndexes: [24,25,26],
            canFall: true,
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
            animationRight:animation.playerWalkRight,
            animationLeft:animation.playerWalkLeft,
            animationUp:animation.playerWalkUp,
            animationDown:animation.playerWalkDown,
            animationPushRight:animation.playerPushRight,
            animationPushLeft:animation.playerPushLeft,
            canBeCrushedBy: function(object){
                return (
                    object.gameObject.code == GameObjects.BOULDER.code
                    || object.gameObject.code == GameObjects.EMERALD.code
                    || object.gameObject.code == GameObjects.DIAMOND.code
                    );
            },
            canBeCollectedBy : function(object){
                var objectId = object.id;
                return (objectId == game.ROBOT.id || objectId == game.YAM.id);
            },
            onCrushed: function(by,me){
                game.explodeBig(me,GameObjects.EMPTYSPACE);
                Game.isLost(true);
            },
            onCollected: function(by,me,direction){
                console.error("Player was taken by " + by.code,me);
                game.explodeBig(me,GameObjects.EMPTYSPACE);
                Game.isLost(true);
            },
            onLongPress: function(me){
                if (game.state.dynamiteCount && game.state.dynamiteCount>0){
                    game.state.dynamiteCount--;

                    me.addLayer(game.DYNAMITE_ACTIVE.spriteIndex,"bottom");
                    me.nextObjectId = game.DYNAMITE_ACTIVE.id;
                    me.actionDownCount = 0;
                    me.count = 0;
                }
            },
            eachStep: function(me){
                if (me.nextObjectId == game.DYNAMITE_ACTIVE.id){
                    if (me.bottomlayer == game.DYNAMITE_ACTIVE.id){
                        me.bottomlayer = game.DYNAMITE.id
                    }else{
                        me.bottomlayer = game.DYNAMITE_ACTIVE.id
                    }

                    me.count = (me.count || 0) + 1;
                    if (me.count > 5){
                        me.count = 0;
                        me.removeLayer("bottom");
                        game.explodeBig(me)
                    }

                }
            }
        });

        game.YAM = new GameObject({
            id: 163,
            code: "Yd",
            alias: "Yl",
            canMove: true,
            animationBite:animation.yamBite,
            canBeCrushedBy: function(object){
                return object.gameObject.code == GameObjects.BOULDER.code;
            },
            eachStep: function(object){
                if (object.wasMoving()){
                    object.moveIfPossible(object.sameDirection());
                }else{
                    Maybe(function(){
                        object.moveIfPossible(Game.getRandomDirection())
                    },0.8);
                }
                if (!object.isMoving() && !object.isAnimating()){
                    object.animate("Bite");
                }
            },
            explodeIntoObjects: function(){
                var result = [];
                for (var i = 0;i<9;i++){
                    result.push(game.getRandomGameObject());
                }
                result[4] = game.YAM;
                return result;
            },
            onCrushed: function(by,me){
                var explodeInto = me.getExplodeIntoObjects();
                game.explode(me,explodeInto,"Smash")
            }
        });

        game.SPIDER = new GameObject({
            id: 54,
            code: "Tl",
            alias: "Tu,Td,Tr",
            canMove: true,
            canBeCrushedBy: function(object){
                return object.gameObject.code == GameObjects.BOULDER.code;
            },
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
            explodeIntoObjects: function(){
                return GameObjects.EMPTYSPACE;
            },
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

                if (object.isNextTo(game.PLAYER)){
                    game.explodeBig(object,object.getExplodeIntoObjects());
                    return;
                }

                if (object.hasTurned){
                    object.setNext("hasTurned",false);
                    object.moveIfPossible(object.sameDirection());
                }

                if (object.wasMoving() && !object.isMoving()){
                    // turn left if possible
                    var preferedDirection = Game.getDirectionTurnedLeft(object.wasMovingToDirection);

                    if (object.canMove(preferedDirection)){
                        game.SPIDER.turn(object,preferedDirection);
                    }else{
                        // if cannot turn right, move forward
                        object.moveIfPossible(object.sameDirection());

                        if (!object.isMoving()){
                            // still not moving? try turn right
                            var unPreferedDirection = Game.getDirectionTurnedRight(object.wasMovingToDirection);

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
                    if (!object.isMoving()){
                        game.SPIDER.turn(object,Game.getRandomDirection());
                    }
                }
            },
            onCrushed: function(by,me){
                var explodeInto = me.getExplodeIntoObjects();
                game.explode(me,explodeInto,"Smash")
            }
        });

        game.BUG = new GameObject({
            id: 169,
            code: "Bu",
            alias: "Bl,Bd,Br",
            canMove: true,
            canBeCrushedBy: function(object){
                return object.gameObject.code == GameObjects.BOULDER.code;
            },
            animationRight:[179,180,181,180],
            animationLeft:[168,169,170,169],
            animationUp:[171,172,173,172],
            animationDown:[176,177,178,177],
            animationRotateUpToRight:[171,187,188,189],
            animationRotateUpToLeft:[171,186,185,184],
            animationRotateRightToUp:[179,189,188,187],
            animationRotateRightToDown:[179,192,193,194],
            animationRotateDownToLeft:[176,195,196,197],
            animationRotateDownToRight:[176,194,193,192],
            animationRotateLeftToUp:[168,184,185,186],
            animationRotateLeftToDown:[168,197,196,195],
            explodeIntoObjects: function(){
                return [
                    GameObjects.EMERALD,
                    GameObjects.EMERALD,
                    GameObjects.EMERALD,
                    GameObjects.EMERALD,
                    GameObjects.DIAMOND,
                    GameObjects.EMERALD,
                    GameObjects.EMERALD,
                    GameObjects.EMERALD,
                    GameObjects.EMERALD
                ]
            },
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
                if (object.isNextTo(game.PLAYER)){
                    game.explodeBig(object,object.getExplodeIntoObjects());
                    return;
                }

                if (object.hasTurned){
                    object.setNext("hasTurned",false);
                    object.moveIfPossible(object.sameDirection());
                }

                if (object.wasMoving() && !object.isMoving()){
                    // turn right if possible
                    var preferedDirection = Game.getDirectionTurnedRight(object.wasMovingToDirection);

                    if (object.canMove(preferedDirection)){
                        game.BUG.turn(object,preferedDirection);
                    }else{
                        // if cannot turn right, move forward
                        object.moveIfPossible(object.sameDirection());

                        if (!object.isMoving()){
                            // still not moving? try turn right
                            var unPreferedDirection = Game.getDirectionTurnedLeft(object.wasMovingToDirection);

                            if (object.canMove(unPreferedDirection)){
                                game.BUG.turn(object,unPreferedDirection);
                            }else{
                                // can't go right either, nothing left to do: turn around
                                game.BUG.turn(object,preferedDirection);
                            }
                        }
                    }
                }

                if (!object.isMoving() && !object.isTurning){
                    // start of game, Bug should always be moving or turning;
                    object.moveIfPossible(Game.getRandomDirection());
                    if (!object.isMoving()){
                        game.BUG.turn(object,Game.getRandomDirection());
                    }
                }
            },
            onCrushed: function(by,me){
                var explodeInto = me.getExplodeIntoObjects();
                game.explode(me,explodeInto,"Smash")
            }
        });

        game.ROBOT = new GameObject({
            id: 40,
            code: "Ro",
            canMove: true,
            moveProbability: 0.4,
            canBeCrushedBy: function(object){
                return object.gameObject.code == GameObjects.BOULDER.code;
            },
            onCrushed : function(by,me){
                game.explodeBig(me)
            },
            animationPulsate: [40,40,41,41,42,42,43,43,44,44,45,45,46,46,47,47],
            eachStep: function(me){
                if (!me.isAnimating()){
                    me.animate("Pulsate");
                }
                if (!me.isMoving() && !me.wasMoving()){
                    Maybe(function(){
                        var player = Map.getPlayerObject();
                        var x = player.left;
                        var y = player.top;
                        if (me.left < x) me.moveRightIfPossible();
                        if (me.left > x) me.moveLeftIfPossible();
                        if (me.top < y) me.moveDownIfPossible();
                        if (me.top > y) me.moveUpIfPossible();
                    },me.gameObject.moveProbability);
                }
            }
        });

        game.KEY = new GameObject({
            id: 88,
            code: "Kg",
            canBeCollected: true,
            animationRotate: [88,88,89,89,90,90,91,91,92,92,93,93,94,94,95,95,96,96,97,97,98,98,99,99,88,88,89,89,90,90,91,91,92,92,93,93,94,94,95,95,96,96,97,97,98,98,99,99],
            onCollected: function(by,me){
                game.state.hasKey = true;
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
                if (!object.isOpen && game.state.hasKey){
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
            canBeCrushedBy: function(object){
                return object.gameObject.code == GameObjects.BOULDER.code;
            },
            explosionDelay:1,
            animationSmash: [35,36,37,38],
            onFallen: function(object,on){
                game.explodeBig(object,game.EMERALD,"Smash");
            },
            onExplode: function(){
                console.error("exploded")
            },
            explodeIntoObjects: function(){
                return [
                    GameObjects.EMPTYSPACE,
                    GameObjects.EMPTYSPACE,
                    GameObjects.EMPTYSPACE,
                    GameObjects.EMPTYSPACE,
                    GameObjects.EMPTYSPACE,
                    GameObjects.EMPTYSPACE,
                    GameObjects.EMPTYSPACE,
                    GameObjects.EMPTYSPACE,
                    GameObjects.EMPTYSPACE
                ]
            }
        });

        game.DYNAMITE = new GameObject({
            id: 112,
            code: "dD",
            canBeCollected: true,
            onCollected: function(by,me){
                game.state.dynamiteCount = (game.state.dynamiteCount || 0) + 1;
                Game.addScore(1);
            }
        });

        game.DYNAMITE_ACTIVE = new GameObject({
            id: 113,
            code: "dA",
            animationTick: [113,112,113,112],
            eachStep: function(me){
                if (me.hasLayer("bottom")){
                    me.removeLayer("bottom");
                }
                me.animateIfPossible("Tick");
                me.count = (me.count || 0) + 1;
                if (me.count > 5){
                    me.count = 0;
                    game.explodeBig(me)
                }
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

        game.EXIT = new GameObject({
            id: 114,
            code: "XX",
            alias: "x",
            animationPulsate: [104,105,106,107,108,109,110,111],
            eachStep: function(object){
                if (Game.hasTargetScore()){
                    if (!object.isOpen) Game.setHint("Find the exit!");
                    object.isOpen = true;
                    if (!object.isAnimating()){
                        object.animate("Pulsate");
                    }
                }else{
                    object.isOpen = false;
                }
            },
            canBeCollected: function(object){
                return object.isOpen;
            },
            onCollected: function(by,me){
                Game.isWon(true);
            }
        });

        game.NUT = new GameObject({
            id: 164,
            code: "Nu",
            canFall: true,
            isStableSurface: false,
            canBePushed:{
                vertical: false,
                horizontal: true,
                friction: 0.5
            },
            onHit: function(by,direction,me){
                if (by.gameObject == game.BOULDER && direction == DIRECTION.DOWN){
                    me.transformInto(game.EMERALD);
                }
            }
        });

        game.QUICKSAND = new GameObject({
            id: 75,
            code: "Q."
        });

        game.CHAR_A = new GameObject({id: 128,code: "_A"});
        game.CHAR_B = new GameObject({id: 129,code: "_B"});
        game.CHAR_C = new GameObject({id: 130,code: "_C"});
        game.CHAR_D = new GameObject({id: 131,code: "_D"});
        game.CHAR_E = new GameObject({id: 132,code: "_E"});
        game.CHAR_F = new GameObject({id: 133,code: "_F"});
        game.CHAR_G = new GameObject({id: 134,code: "_G"});
        game.CHAR_H = new GameObject({id: 135,code: "_H"});
        game.CHAR_I = new GameObject({id: 136,code: "_I"});
        game.CHAR_J = new GameObject({id: 137,code: "_J"});
        game.CHAR_K = new GameObject({id: 138,code: "_K"});
        game.CHAR_L = new GameObject({id: 139,code: "_L"});
        game.CHAR_M = new GameObject({id: 140,code: "_M"});
        game.CHAR_N = new GameObject({id: 141,code: "_N"});
        game.CHAR_O = new GameObject({id: 142,code: "_O"});
        game.CHAR_P = new GameObject({id: 143,code: "_P"});
        game.CHAR_Q = new GameObject({id: 144,code: "_Q"});
        game.CHAR_R = new GameObject({id: 145,code: "_R"});
        game.CHAR_S = new GameObject({id: 146,code: "_S"});
        game.CHAR_T = new GameObject({id: 147,code: "_T"});
        game.CHAR_U = new GameObject({id: 148,code: "_U"});
        game.CHAR_V = new GameObject({id: 149,code: "_V"});
        game.CHAR_W = new GameObject({id: 150,code: "_W"});
        game.CHAR_X = new GameObject({id: 151,code: "_X"});
        game.CHAR_Y = new GameObject({id: 152,code: "_Y"});
        game.CHAR_Z = new GameObject({id: 153,code: "_Z"});
        game.CHAR_POINT = new GameObject({id: 154,code: "_."});
        game.CHAR_QUESTIONMARK = new GameObject({id: 155,code: "_?"});
        game.CHAR_EXCLAMATION = new GameObject({id: 156,code: "_!"});
    };
    return game;
}());
