var World = (function(){
    var self = {};
    var terrain;
    var trackMap;
    var trackImageData;

    self.generate = function(){
        trackMap = new Sprite(Resources.images["tracksmall"],undefined,0,0,360,255);
        trackImageData = trackMap.ctx.getImageData(0,0,trackMap.canvas.width,trackMap.canvas.height);

        terrain = Map.addLayer({
            id : "back",
            zIndex : 1,
            type: MAPLAYERTYPE.IMAGE,
            preloadedSrc: "track",
            imgTileSize: 200
        });

        var layer = Map.addLayer({
            id : "main",
            zIndex : 2,
            type: MAPLAYERTYPE.FREE
        });

        var player = new MapObject({
            id: 1,
            left: 1900,
            top: 1600,
            rotation: 270,
            speed: 0,
            gameObject: GameObjects.CAR
        });


        var car = new MapObject({
            id: 2,
            _left: 670,
            _top: 400,
            left: 1730,
            top: 1600,
            rotation: 220,
            speed: 0,
            autoDrive: true,
            color: "red",
            gameObject: GameObjects.CAR
        });



        var car2 = new MapObject({
            id: 3,
            left: 1720,
            top: 1540,
            rotation: 180,
            speed: 0,
            autoDrive: true,
            color: "blue",
            gameObject: GameObjects.CAR
        });


        layer.addObject(player,MAPOBJECTTYPE.FREE);
        layer.setPlayerObject(player);

        layer.addObject(car,MAPOBJECTTYPE.FREE);
        layer.addObject(car2,MAPOBJECTTYPE.FREE);

        // center player on screen
        var canvasSize = Game.getCanvasSize();
        console.error((canvasSize.width/2) - player.left);
        terrain.setScrollOffset({
            pixelX: 0 - ((canvasSize.width/2) - player.left),
            pixelY: 0 - ((canvasSize.height/2) - player.top)
        });

        Game.start();
    };

    self.getTerrain = function(){
        return terrain;
    };

    self.getTrackMap = function(){
        return trackMap;
    };

    self.getTrackImageData = function(){
        return trackImageData;
    };

    return self

}());