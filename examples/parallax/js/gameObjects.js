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

                me.speed = me.speed || 0;
                if (me.isActive) me.speed -= 0.25;

                if (Input.isAction()){
                    me.isActive = true;
                    me.speed = 6;
                }
                me.setRotation(-Math.round(me.speed*3));
                me.top -= me.speed;


                me.detectCollistion(false,function(object){

                        Maybe(function(){
                            me.mapLayer.addObject(
                                new MapObject({
                                    left: me.left + randomBetween(-20,70),
                                    top: me.top + randomBetween(-20,30),
                                    gameObject: GameObjects.EXPLOSION
                                }));
                        },0.2);



                        Game.addScore(-1);
                    },
                    function(object){
                        return object.gameObject.id == 10;
                    });


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
