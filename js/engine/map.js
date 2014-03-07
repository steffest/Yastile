var Map = (function(){
    var self = {};

    var scrollOffsetX = 0;
    var scrollOffsetY = 0;

    var scrollTilesX = 0;
    var scrollTilesY = 0;

    var scrollDirection = 0;

    var viewPortWidth = 10;
    var viewPortHeight = 10;

    var borderScrollOffset = 4; // defines what the distance of the player to the levelborder can be before the map scrolls

    var playerObject;

    self.init = function(properties){
        viewPortHeight = properties.viewPortHeight;
        viewPortWidth  = properties.viewPortWidth;
        borderScrollOffset = properties.borderScrollOffset;
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
        map = [];
        var playerPositionX = (Math.random()*(level.width-2))+1;
        var playerPositionY = (Math.random()*(level.height-2))+1;
        var playerPos = Math.floor(playerPositionY*level.width + playerPositionX);

        for (var i = 0, len = level.height*level.width; i<len; i++){
            var gameObject = GameObjects.GRASS;
            if (Math.random()<0.2){gameObject = GameObjects.STONEWALL;}
            if (Math.random()<0.2){gameObject = GameObjects.APPLE;}

            // borders
            var left = i % level.width;
            var top = Math.floor(i / level.width);
            if (left == 0 || left == level.width-1) gameObject = GameObjects.WALL;
            if (top == 0 || top == level.height-1) gameObject = GameObjects.WALL;

            if (i==playerPos){
                gameObject = GameObjects.PLAYER;

                scrollTilesX = Math.max(left-10,0);
                scrollTilesY = Math.max(top-10,0);
            }



            var object = new MapObject(gameObject,i);

            map.push(object);
        }
        return map;
    };

    self.parse = function(data){
        map = [];
        var index = 0;
        var charCount = 1;
        if (data.mapStructure && data.mapStructure.charCount) charCount = data.mapStructure.charCount;

        var levelHeight = data.map.length;

        for (var y=0; y<levelHeight; y++){
            var line = data.map[y];
            var levelWidth = line.length/charCount;

            for (var x=0;x<levelWidth;x++){
                index = y*(levelWidth) + x;
                var code = "";
                for (var c = 0; c<charCount; c++){
                    code = code + line[(x*charCount)+c];
                }
                var gameObject = GameObjects[code] || GameObjects.EMPTYSPACE;
                var object = new MapObject(gameObject,index);

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

    return self;
}());
