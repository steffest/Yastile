var World = (function(){
    var self = {};

    self.generate = function(){

        var layerHeight = 40;

        var backlayer = Map.addLayer({
            id: "back",
            zIndex: 1,
            type: MAPLAYERTYPE.GRID,
            width: 30,
            height: layerHeight,
            speed: 0.25,
            autoScrollDirection: DIRECTION.DOWN,
            onEnd : function(me){
                if (!me.ended){
                    console.error("on end");
                    //me.setScrollOffset({tileX: 0, tileY: 80})
                    generateBackground(layer2);
                    layer2.ended = false;
                    layer2.setScrollOffset({tileX:0, tileY: layerHeight + 1});
                    layer2.show();
                    me.ended = true;
                }

            },
            startY:  4
        });


        var layer2 = Map.addLayer({
            id: "back2",
            zIndex: 2,
            type: MAPLAYERTYPE.GRID,
            width: 30,
            height: layerHeight,
            speed: 0.25,
            autoScrollDirection: DIRECTION.DOWN,
            isVisible: false,
            onEnd : function(me){
                if (!me.ended){
                    //console.error("on end layer2");
                    generateBackground(backlayer);
                    backlayer.ended = false;
                    backlayer.setScrollOffset({tileX:0, tileY: layerHeight});
                    backlayer.show();
                    me.ended = true;
                }
            },
            startY:  0
        });


        for (var i= 0, len = (backlayer.height * backlayer.width);i < len;i++){
            backlayer.addObject(new MapPosition(GameObjects.TILE1,i,backlayer));
            layer2.addObject(new MapPosition(GameObjects.TILE2,i,layer2));
        }
        generateBackground(backlayer);


        var mainLayer = Map.addLayer({
            id : "main",
            zIndex : 2,
            type: MAPLAYERTYPE.FREE
        });

        var player = new MapObject({
            left: (canvas.width/2) - 10,
            top: canvas.height - 50,
            speed: 8,
            gameObject: GameObjects.PLAYER
        });

        mainLayer.addObject(player,MAPOBJECTTYPE.FREE);
        mainLayer.setPlayerObject(player);



        mainLayer.addObject(
            new MapObject({
                left: 200,
                top: 200,
                speed: 4,
                gameObject: GameObjects.ENEMY
            }));

        Game.start();
    };


    function generateBackground(layer){
        var tiles=[
            GameObjects.TILE1,
            GameObjects.TILE2
        ];
        var max = tiles.length-1;

        for (var i= 0, len = (layer.height * layer.width);i < len;i++){
            var index = randomBetween(0,max);
            var tile = tiles[index];
            layer.objects[i].setGameObject(tile);
        }
    }

    self.populate = function(layer){
        // add enemy
        Maybe(function(){
            layer.addObject(
                new MapObject({
                    left: randomBetween(0,canvas.width),
                    top: 0,
                    speed: randomBetween(1,3),
                    gameObject: GameObjects.ENEMY
                }));
        },0.05);

        // add rocks
        Maybe(function(){
            layer.addObject(
                new MapObject({
                    left: randomBetween(0,canvas.width),
                    top: -40,
                    speed: randomBetween(1,3),
                    drift: randomBetween(-3,3),
                    rotationSpeed: randomBetween(-5,5),
                    gameObject: GameObjects.ROCK
                }));
        },0.02);

        // add walls
        Maybe(function(){
            var offsetX = randomBetween(0,100);
            var wall = new MapObject({
                left: 0 - offsetX,
                top: -200,
                speed: 3,
                gameObject: GameObjects.WALL
            });

            if (Math.random() < 0.5){
                wall.flip(true,false);
                wall.left = canvas.width - wall.width + offsetX;
            }

            layer.addObject(wall);
        },0.03);
    };

    return self

}());