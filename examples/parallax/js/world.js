var World = (function(){
    var self = {};
    var mainLayer;
    var backlayer;
    var backlayer2;

    self.generate = function(){

        var layerWidth = 21;

        backlayer = Map.addLayer({
            id: "back",
            zIndex: 1,
            type: MAPLAYERTYPE.GRID,
            width: layerWidth,
            height: 16,
            speed: 0.25,
            autoScrollDirection: DIRECTION.LEFT,
            onEnd : function(me){
                if (!me.ended){
                    backlayer2.ended = false;
                    backlayer2.setScrollOffset({tileX: -layerWidth, tileY:0});
                    backlayer2.show();
                    me.ended = true;
                }

            },
            startY:  0
        });

        backlayer2 = Map.addLayer({
            id: "back2",
            zIndex: 2,
            type: MAPLAYERTYPE.GRID,
            width:  layerWidth,
            height: 16,
            speed: 0.25,
            autoScrollDirection: DIRECTION.LEFT,
            isVisible: false,
            onEnd : function(me){
                if (!me.ended){
                    backlayer.ended = false;
                    backlayer.setScrollOffset({tileX: -layerWidth+1, tileY:0});
                    backlayer.show();
                    me.ended = true;
                }
            },
            startY:  0
        });

        mainLayer = Map.addLayer({
            id : "main",
            zIndex : 3,
            type: MAPLAYERTYPE.FREE
        });

        var player = new MapObject({
            left: (canvas.width/2) - 10,
            top: canvas.height - 100,
            speed: 0,
            isActive: false,
            gameObject: GameObjects.PLAYER
        });

        mainLayer.addObject(player,MAPOBJECTTYPE.FREE);
        mainLayer.setPlayerObject(player);

        generateSkyline();

        self.addBars(screenWidth+300);

        Game.start();
    };

    function generateSkyline(){
        var mid = backlayer.height/2 + 1;

        for (var x = 0; x< backlayer.width; x++){
            var height = randomBetween(mid,backlayer.height-1);
            var i, y, b;
            for (y = height; y< backlayer.height; y++){
                i = y*backlayer.width + x;
                b = y==height ? GameObjects.BUILDINGTOP : GameObjects.BUILDING;
                backlayer.addObject(new MapPosition(b,i,backlayer));
            }

            height = randomBetween(mid,backlayer.height-1);
            for (y = height; y< backlayer.height; y++){
                i = y*backlayer.width + x;
                b = y==height ? GameObjects.BUILDINGTOP : GameObjects.BUILDING;
                backlayer2.addObject(new MapPosition(b,i,backlayer));
            }
        }

    }

    self.addBars = function(startLeft){
        var max = canvas.height+64;
        var mid = max/2;
        var min = 100;

        for (var i = 0; i<10; i++){
            var left = startLeft + (i*350);
            var top = randomBetween(min,mid)-64;
            var bottom = top + 120 + 64 + randomBetween(0,50);

            while(top>-64){
                var isTop = top<10;
                var isLast = i==9 && isTop;
                mainLayer.addObject(
                    new MapObject({
                        left: left,
                        top: top,
                        isLast: isLast,
                        isTop: isTop,
                        gameObject: GameObjects.BOX
                    }));
                top -= 64;
            }

            while(bottom<max){
                mainLayer.addObject(
                    new MapObject({
                        left: left,
                        top: bottom,
                        gameObject: GameObjects.BOX
                    }));
                bottom += 64;
            }


        }
    };


    return self

}());