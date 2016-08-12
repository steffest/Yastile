var World = (function(){
    var gridLayer;
    var self = {};

    self.generate = function(){

        var backlayer = Map.addLayer({
            id: "back",
            zIndex: 1,
            type: MAPLAYERTYPE.GRID,
            width: 30,
            height: 100,
            speed: 0.25,
            /*autoScrollDirection: DIRECTION.DOWN,*/
            /*onEnd : function(me){
                console.error("on end");
                me.setScrollOffset({tileX: 0, tileY: 80})
            },*/
            startY:  20
        });

        var layer = Map.addLayer({
            id : "main",
            zIndex : 2,
            type: MAPLAYERTYPE.FREE
        });

        var player = new MapObject({
            left: (canvas.width/2) - 10,
            top: canvas.height - 50,
            speed: 4,
            gameObject: GameObjects.PLAYER
        });
        layer.addObject(player,MAPOBJECTTYPE.FREE);
        layer.setPlayerObject(player);

        /*
        console.error(GameObjects.TILE1);
        for (var i=0;i<3000;i++){
            backlayer.addObject(new MapPosition(GameObjects.TILE1,i,backlayer));
        }

        console.error(backlayer);



        layer.addObject(
            new MapObject({
                left: 200,
                top: 200,
                speed: 4,
                gameObject: GameObjects.ENEMY
            }));

            */

        Game.start();
    };

    self.loadTest = function(){

        Map.loadFromUrl("levels/test.json",function(newLayer){

            gridLayer = newLayer;

            var layer = Map.addLayer({
                id : "main",
                zIndex : 2,
                type: MAPLAYERTYPE.FREE
            });

            var player = new MapObject({
                left: (canvas.width/2) - 10,
                top: 200,
                speed: 8,
                gameObject: GameObjects.PLAYER
            });
            layer.addObject(player,MAPOBJECTTYPE.FREE);
            layer.setPlayerObject(player);

            Game.start();
        });

    };

    self.getGridLayer = function(){
        return gridLayer;
    };

    return self

}());