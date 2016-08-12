var GameObjects = (function(){
    var game = {};
    game.state = {};

    game.resetState = function(){
        game.state = {};
    };

    game.init = function(){

        game.EMPTYSPACE = new GameObject({
            id: 0,
            code: " ",
            spriteIndex: "",
            canBeCollected: true
        });

        game.PLAYER = new GameObject({
            id: 1,
            code: "P",
            canMove: true,
            spriteIndex: "plane",
            eachStep: function(me){
                var player = this;
                me.speed = me.speed || 0;
                if (me.isActive) me.speed -= 0.25;

                if (Input.isAction()){
                    me.isActive = true;
                    me.speed = 6;
                }
                me.setRotation(-Math.round(me.speed*3));
                me.top -= me.speed;

                if (me.top > screenHeight - 40){
                    me.speed = 2;
                    player.damage(me,10);
                }

                me.detectCollistion(false,function(object){
                        player.damage(me,1);
                    },
                    function(object){
                        return object.gameObject.id == 10;
                    });

            },
            damage: function(me,amount){
                var explosionChange = amount == 10 ? 1 : 0.2;
                Maybe(function(){
                    me.mapLayer.addObject(
                        new MapObject({
                            left: me.left + randomBetween(-20,70),
                            top: me.top + randomBetween(-20,30),
                            gameObject: GameObjects.EXPLOSION
                        }));
                },explosionChange);

                Game.addScore(-amount);
            }

        });

        game.BOX = new GameObject({
            id: 10,
            code: "B",
            canMove: true,
            spriteIndex: "box",
            eachStep: function(me){
                me.left -= 3;

                if (me.left < -64){
                    me.destroy();
                }

                if(me.isLast){
                    if (me.left<screenWidth+100){
                        me.isLast = false;
                        World.addBars(screenWidth+600);
                    }
                }

                if (me.isTop && me.left<screenWidth/2){
                    me.isTop = false;
                    Game.addScore(40);
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
                if (me.countDown==4){
                    me.setStaticFrame("explosion2");
                }
                if (me.countDown==2){
                    me.setStaticFrame("explosion3");
                }
                if (me.countDown<1){
                    me.destroy();
                }
            }
        });

        game.BUILDING = new GameObject({
            id: 20,
            code: "b",
            spriteIndex: "building1"
        });

        game.BUILDINGTOP = new GameObject({
            id: 20,
            code: "b",
            spriteIndex: "building2"
        });


    };
    return game;
}());
