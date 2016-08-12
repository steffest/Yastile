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
            spriteIndex: "explosion",
            canBeCollected: true
        });

        game.WALL= new GameObject({
            id: 2,
            code: "W",
            spriteIndex: "wall"
        });

        game.PLAYER = new GameObject({
            id: 1,
            code: "P",
            canMove: true,
            spriteIndex: "ship",
            eachStep : function(me){

                // custom player movements

                var gridLayer = World.getGridLayer();
                if (!me.upSpeed) me.upSpeed=0;

                var tile;
                var tileLeft;
                var tileRight;

                if (me.upSpeed>0){
                    // is jumping
                    me.top-=me.upSpeed;
                    me.upSpeed -= 2;

                    tile = gridLayer.getObjectAtPixels(me.left+16,me.top+4);
                    if (tile && tile.gameObject.onCollected){
                        tile.gameObject.onCollected(me,tile);
                    }
                }else{
                    // is not jumping

                    var shouldFall = false;

                    tile = gridLayer.getObjectAtPixels(me.left+16,me.top+4);
                    if (tile){
                        if (gridLayer.getObjectAtPixels(me.left+16,me.top+16).isGameObject(GameObjects.WALL)) shouldFall = true;
                        var below = tile.getObject(DIRECTION.DOWN);
                        if (below && me.gameObject.canMoveTo(below)) shouldFall = true;
                    }

                    if (shouldFall ){
                        me.top-=me.upSpeed;
                        me.upSpeed--;
                        me.upSpeed = Math.max(me.upSpeed,me.speed * -3);

                        tile = gridLayer.getObjectAtPixels(me.left+16,me.top+4);
                        var below = tile.getObject(DIRECTION.DOWN);
                        if (below & below.isGameObject(GameObjects.WALL)){
                            // object will stop: align top to grid;
                            me.top = (Math.round(me.top/32) * 32) + 5;
                        }
                    }else{
                        if (Input.isUp() || Input.isAction()){
                            // jump
                            me.upSpeed = me.speed * 2;
                        }else{
                            me.upSpeed = 0;
                            me.top = (Math.round(me.top/32) * 32) + 5;
                        }
                    }
                }

                if (Input.isLeft()){
                    tile = gridLayer.getObjectAtPixels(me.left+28,me.top+4);
                    if (tile) tileLeft = tile.getObject(DIRECTION.LEFT);
                    if (me.gameObject.canMoveTo(tileLeft)){
                        me.left-=me.speed;
                        if (tileLeft.gameObject.onCollected){
                            tileLeft.gameObject.onCollected(me,tileLeft);
                        }
                    }
                }

                if (Input.isRight()){
                    tile = gridLayer.getObjectAtPixels(me.left+4,me.top+4);
                    if (tile) tileRight = tile.getObject(DIRECTION.RIGHT);
                    if (me.gameObject.canMoveTo(tileRight)){
                        me.left+=me.speed;
                        if (tileRight.gameObject.onCollected){
                            tileRight.gameObject.onCollected(me,tileRight);
                        }
                    }
                }


                if (gridLayer.step == 0){

                    var screenX = me.left - (gridLayer.scrollTilesX * 32);
                    var screenY = me.top - (gridLayer.scrollTilesY * 32);

                    var scrollDirection = DIRECTION.NONE;

                    if (screenX > 300){scrollDirection = DIRECTION.LEFT;}
                    if (screenX < 200){scrollDirection = DIRECTION.RIGHT;}

                    if (screenY < 100){scrollDirection = DIRECTION.DOWN;}
                    if (screenY > 200){scrollDirection = DIRECTION.UP;}


                    gridLayer.scroll(scrollDirection);
                }

                // sync scrolling between layers
                me.mapLayer.setScrollOffset(gridLayer.getScrollOffset());

            }
        });

        game.COIN = new GameObject({
            id: 4,
            code: "*",
            spriteIndex: "coin",
            canBeCollected: true,
            animationRotate: [2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9],
            eachStep : function(me){
                me.animateIfPossible(me.gameObject.animationRotate);
            },
            onCollected: function(by,me){
                if (!me.isCollected){
                    me.transformInto(GameObjects.EMPTYSPACE);
                    Game.addScore(1);
                }
                me.isCollected = true;

            }
        });

    };
    return game;
}());
