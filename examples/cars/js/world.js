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
            imgTileSize: 500
        });

        var layer = Map.addLayer({
            id : "main",
            zIndex : 2,
            type: MAPLAYERTYPE.FREE
        });

        var player = new MapObject({
            id: 1,
            _left: 570,
            _top: 400,
            left: 530,
            top: 700,
            rotation: 45,
            speed: 0,
            gameObject: GameObjects.CAR
        });


        var car = new MapObject({
            id: 2,
            _left: 670,
            _top: 400,
            left: 670,
            top: 720,
            rotation: 10,
            speed: 0,
            autoDrive: true,
            color: "red",
            gameObject: GameObjects.CAR
        });



        var car2 = new MapObject({
            id: 3,
            left: 600,
            top: 700,
            rotation: 30,
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
        console.error((canvasSize.width/2) - player.left)
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