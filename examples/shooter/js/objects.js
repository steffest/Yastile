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
                        me.fireDelay = 10;
                    }

                }

                Maybe(function(){
                    me.mapLayer.addObject(
                        new MapObject({
                            left: Math.floor(Math.random() * canvas.width),
                            top: 0,
                            speed: 1 + Math.floor(Math.random()*3),
                            gameObject: GameObjects.ENEMY
                        }));
                },0.05);
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
                    me.detectCollistion();
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
                me.animateIfPossible(me.gameObject.animationRotate);
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

    };
    return game;
}());
