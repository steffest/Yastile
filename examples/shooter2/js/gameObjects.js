var GameObjects = (function(){
    var game = {};
    game.state = {};

    game.resetState = function(){
        game.state = {};
    };

    game.init = function(){

        game.EMPTYSPACE = new GameObject({
            id: 0,
            code: "  ",
            alias: " "
        });

        game.TILE1 = new GameObject({
            id: 2,
            code: "..",
            alias: ".",
            spriteIndex: "tile1"
        });

        game.TILE2 = new GameObject({
            id: 3,
            code: "t1",
            alias: "1",
            spriteIndex: "tile2"
        });

        game.WALL = new GameObject({
            id: 100,
            code: "WW",
            alias: "W",
            spriteIndex: "wall",
            isDeadly: true,
            eachStep : function(me){
                updateWall(me);
            }
        });


        game.PLAYER = new GameObject({
            id: 1,
            code: "P1",
            alias: "P",
            canMove: true,
            spriteIndex: "ship",
            eachStep : function(me){

                if (me.fireDelay) me.fireDelay--;

                if (Input.isDown())  me.top+=(me.speed/2);
                if (Input.isUp())    me.top-=me.speed;
                if (Input.isLeft())  me.left-=me.speed;
                if (Input.isRight()) me.left+=me.speed;
                if (Input.isAction()) {
                    if (!me.fireDelay){
                        me.mapLayer.addObject(
                            new MapObject({
                                left: me.left + 10,
                                top: me.top,
                                speed: 4,
                                gameObject: GameObjects.BULLET
                            }));
                        me.fireDelay = 5;
                    }

                }

                me.left = between(0,me.left,canvas.width-20);
                me.top = between(0,me.top,canvas.height-20);



                me.detectCollistion(true,function(object){
                        me.mapLayer.addObject(
                            new MapObject({
                                left: me.left + randomBetween(-25,25),
                                top: me.top + randomBetween(-25,25),
                                gameObject: GameObjects.EXPLOSION
                            }));
                        Game.addScore(-1);
                },
                function(object){
                    return object.gameObject.isDeadly
                }) ;

                World.populate(me.mapLayer);
            }
        });

        game.BULLET = new GameObject({
            id: 8,
            code: "!",
            canMove: true,
            spriteIndex: "bullet",
            eachStep : function(me){
                me.top -= me.speed;
                if (me.top < -10){
                    me.destroy();
                }else{
                    me.detectCollistion(false,function(object){
                            me.mapLayer.addObject(
                                new MapObject({
                                    left: object.left - 8,
                                    top: object.top - 8,
                                    gameObject: GameObjects.EXPLOSION
                                }));
                            object.destroy();
                            Game.addScore(1);
                    },
                    function(object){
                        return object.gameObject.isEnemy;
                    });
                }

            }
        });

        game.EXPLOSION = new GameObject({
            id: 7,
            code: "*",
            spriteIndex: "explosion",
            eachStep : function(me){
                me.countDown = me.countDown || 7;
                me.countDown--;
                if (me.countDown<1){
                    me.destroy();
                }
            }
        });

        game.ENEMY = new GameObject({
            id: 9,
            code: "B",
            canMove: true,
            spriteIndex: "enemy",
            isEnemy: true,
            animationRotate: [3,3,4,4,5,5,6,6],
            eachStep : function(me){
                //me.animateIfPossible(me.gameObject.animationRotate);
                me.top += me.speed;

                var p = me.mapLayer.getPlayerObject();
                var x = 0;

                if (p.top>me.top){
                    if (p.left<me.left) x = -0.5;
                    if (p.left>me.left) x = 0.5;
                    me.left += x;
                }

                if (me.top > canvas.height){
                    me.destroy();
                }
            }
        });

        game.ROCK = new GameObject({
            id: 50,
            code: "R",
            canMove: true,
            spriteIndex: "rock",
            isDeadly: true,
            eachStep : function(me){
                me.top += me.speed;
                me.left += me.drift;
                if (me.rotationSpeed){
                    me.rotate(me.rotationSpeed)
                }

                if ((me.top > canvas.height) || (me.left < -50) || (me.left > canvas.width)){
                    me.destroy();
                }

            }
        });


        function updateWall(me){
            me.top += me.speed;
            if (me.top >  Game.getCanvasSize().height){
                me.destroy();
            }
        }
    };
    return game;
}());
