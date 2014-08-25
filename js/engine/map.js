var Map = (function(){
    var self = {};

    var scrollOffsetX = 0;
    var scrollOffsetY = 0;

    var scrollTilesX = 0;
    var scrollTilesY = 0;

    var scrollDirection = 0;

    var viewPortWidth = 10;
    var viewPortHeight = 10;

    var levelWidth;
    var levelHeight;


    var borderScrollOffset; // defines what the distance of the player to the levelborder can be before the map scrolls

    var playerObject;

    self.init = function(properties){
        viewPortHeight = properties.viewPortHeight;
        viewPortWidth  = properties.viewPortWidth;
        borderScrollOffset = properties.borderScrollOffset;
    };

    self.onResize = function(settings){
        viewPortWidth = settings.viewPortWidth;
        viewPortHeight = settings.viewPortHeight;

        if (playerObject){
            // re-center player?
            scrollTilesX = Math.max(playerObject.left-10,0);
            scrollTilesY = Math.max(playerObject.top-10,0);
        }

    };

    self.getScrollOffset = function(){
        return {
            x: scrollOffsetX,
            y: scrollOffsetY,
            tileX: scrollTilesX,
            tileY: scrollTilesY
        }
    };

    self.setPlayerObject = function(mapObject){
        playerObject = mapObject;
    };

    self.getPlayerObject = function(mapObject){
        return playerObject;
    };

    self.initScroll = function(){
        // check is the player is close to a border of the viewport
        if (playerObject){
            if (((scrollTilesX + viewPortWidth) - playerObject.left < borderScrollOffset)
                && playerObject.moveDirection == DIRECTION.RIGHT)
                scroll(DIRECTION.LEFT);
            if ((playerObject.left - scrollTilesX < borderScrollOffset)
                && playerObject.moveDirection == DIRECTION.LEFT)
                scroll(DIRECTION.RIGHT);
            if (((scrollTilesY + viewPortHeight) - playerObject.top < borderScrollOffset)
                && playerObject.moveDirection == DIRECTION.DOWN)
                scroll(DIRECTION.UP);
            if ((playerObject.top - scrollTilesY < borderScrollOffset)
                && playerObject.moveDirection == DIRECTION.UP)
                scroll(DIRECTION.DOWN);
        }
    };

    var scroll = function(direction){
        scrollDirection = direction;
        scrollOffsetX = 0;
        scrollOffsetY = 0;

        switch (direction){
            case DIRECTION.LEFT:
                scrollOffsetX = -8;
                break;
            case DIRECTION.RIGHT:
                scrollOffsetX = 8;
                break;
            case DIRECTION.DOWN:
                scrollOffsetY = 8;
                break;
            case DIRECTION.UP:
                scrollOffsetY = -8;
                break;
        }
    };

    self.fullStep = function(){
        // reset scroll
        switch (scrollDirection){
            case DIRECTION.LEFT:
                scrollTilesX ++;
                break;
            case DIRECTION.RIGHT:
                scrollTilesX --;
                break;
            case DIRECTION.DOWN:
                scrollTilesY --;
                break;
            case DIRECTION.UP:
                scrollTilesY ++;
                break;
        }

        scrollDirection = DIRECTION.NONE;
        scrollOffsetX = 0;
        scrollOffsetY = 0;
    };

    // generate random level - handy for testing
    self.generateRandom = function(level){
        console.error("random map");
        map = [];
        levelWidth = level.width;
        levelHeight = level.height;

        var playerPositionX = (Math.random()*(levelWidth-2))+1;
        var playerPositionY = (Math.random()*(levelHeight-2))+1;
        var playerPos = Math.floor(playerPositionY*levelWidth + playerPositionX);

        for (var i = 0, len = levelHeight*levelWidth; i<len; i++){
            var gameObject = GameObjects.KEY;
            //if (Math.random()<0.2){gameObject = GameObjects.STONEWALL;}
            //if (Math.random()<0.2){gameObject = GameObjects.BOULDER;}

            // borders
            var left = i % levelWidth;
            var top = Math.floor(i / levelWidth);
            if (left == 0 || left == levelWidth-1) gameObject = GameObjects.STEELWALL;
            if (top == 0 || top == levelHeight-1) gameObject = GameObjects.STEELWALL;

            if (i==playerPos){
                gameObject = GameObjects.PLAYER;

                scrollTilesX = Math.max(left-10,0);
                scrollTilesY = Math.max(top-10,0);
            }



            var object = new MapPosition(gameObject,i);

            map.push(object);
        }
        return map;
    };

    self.parse = function(data){
        map = [];
        MapLayers = [];
        MapLayers.push(new MapLayer({
            type: MAPLAYERTYPE.SPOT
        }))

        var index = 0;
        var charCount = 1;
        if (data.mapStructure && data.mapStructure.charCount) charCount = data.mapStructure.charCount;
        Game.setTargetScore(data.minimumScore || 0);

        levelHeight = data.map.length;

        for (var y=0; y<levelHeight; y++){
            var line = data.map[y];
            levelWidth = line.length/charCount;

            for (var x=0;x<levelWidth;x++){
                index = y*(levelWidth) + x;
                var code = "";
                for (var c = 0; c<charCount; c++){
                    code = code + line[(x*charCount)+c];
                }
                var gameObject = GameObjects[code] || Game.getSettings().defaultGameObject;
                var object = new MapPosition(gameObject,index);

                if (gameObject.id == GameObjects.PLAYER.id){
                   // center player in view;
                    Map.setPlayerObject(object);
                    scrollTilesX = Math.max(x-10,0);
                    scrollTilesY = Math.max(y-10,0);
                }

                map.push(object);

            }
        }
        return map;
    };


    self.loadFromUrl = function(url,callback){
        loadUrl(url,function(data){
            Game.setLevel(data);
            map  = self.parse(data);
            if (callback) callback();
        })
    };

    self.getLevelProperties = function(){
        return {
            width: levelWidth,
            height: levelHeight
        }
    };



    return self;
}());
