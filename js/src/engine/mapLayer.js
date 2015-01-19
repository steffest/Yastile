var MapLayer = function(properties){

    if (properties.parentLayer){
        // this layer is a sublayer
        // -> copy main properties of parent
        var parent = properties.parentLayer;

        properties.width = parent.width;
        properties.height = parent.height;
        properties.speed = parent.speed;

        parent.addSubLayer(this);
    }

    for (var key in properties){
        this[key] = properties[key];
    }
    this.objects = [];
    this.sublayers = [];

    this.activeObjectCount = 0;
    this.inactiveObjectCount = 0;

    this.playerObject = undefined;

    var self = this;

    this.levelWidth = properties.width;
    this.levelHeight = properties.height;

    this.scrollOffsetX = 0;
    this.scrollOffsetY = 0;

    this.scrollTilesX = 0;
    this.scrollTilesY = properties.startY || 0;

    this.scrollDirection = 0;

    this.viewPortWidth = 10;
    this.viewPortHeight = 10;



    this.borderScrollOffset = 5; // defines what the distance of the player to the levelborder can be before the map scrolls

    this.step = 0;
    if (this.speed){
        var delay = (1/this.speed);
        this.targetTicksPerSecond = Game.getTargetTicksPerSecond() * delay;
    }else{
        this.targetTicksPerSecond = Game.getTargetTicksPerSecond();
    }

    if (!this.tileSize) this.tileSize = Game.getTileSize();
    this.scrollStep = this.tileSize/this.targetTicksPerSecond;

    console.error("new maplayer " , this.id, this.targetTicksPerSecond, this.scrollStep);


    if (properties.map){
        parse(properties);
    }

/*
    self.onResize = function(settings){
        viewPortWidth = settings.viewPortWidth;
        viewPortHeight = settings.viewPortHeight;

        if (playerObject){
            // re-center player?
            scrollTilesX = Math.max(playerObject.left-10,0);
            scrollTilesY = Math.max(playerObject.top-10,0);
        }

    };





    */


    function parse(data){
        console.error("parsing maplayer " + self.id);

        var index = 0;
        var charCount = 1;

        if (data.mapStructure && data.mapStructure.charCount) charCount = data.mapStructure.charCount;
        Game.setTargetScore(data.minimumScore || 0);

        self.levelHeight = data.map.length;
        self.activeObjectCount = 0;
        self.inactiveObjectCount = 0;

        for (var y=0; y<self.levelHeight; y++){
            var line = data.map[y];
            self.levelWidth = line.length/charCount;

            for (var x=0;x<self.levelWidth;x++){
                index = y*(self.levelWidth) + x;
                var code = "";
                for (var c = 0; c<charCount; c++){
                    code = code + line[(x*charCount)+c];
                }
                var gameObject = GameObjects[code] || Game.getSettings().defaultGameObject;
                var object = new MapPosition(gameObject,index,self);

                if (gameObject.id == GameObjects.PLAYER.id){
                    // center player in view;
                    self.playerObject = object;
                    self.scrollTilesX = Math.max(x-10,0);
                    self.scrollTilesY = Math.max(y-10,0);
                }

                self.objects.push(object);

                if (gameObject.inActive){
                    self.inactiveObjectCount++;
                }else{
                    self.activeObjectCount++;
                }
            }
        }

        console.log("parsed level: " + self.activeObjectCount + " active objects, " + self.inactiveObjectCount + " inactive objects");
    }

};

MapLayer.prototype.isActive = function(){
    return this.activeObjectCount>0;
};

MapLayer.prototype.process = function(){

    var procesObjects = true;

    if (this.type == MAPLAYERTYPE.SPOT) procesObjects = false;
    if (!this.isActive()) procesObjects = false;

    if (this.type == MAPLAYERTYPE.GRID){
        if (this.step!=0) procesObjects = false;
    }

    if (procesObjects){
        if (this.playerObject) this.playerObject.process();
        for (var i = 0, len = this.objects.length; i<len; i++){
            var object = this.objects[i];
            if (object) object.process();
        }
    }

    this.initScroll();
};

MapLayer.prototype.addObject = function(mapObject,objectType){
     objectType = objectType || MAPOBJECTTYPE.GRID;
     mapObject.objectType = objectType;
     mapObject.mapLayer = this;
     this.objects.push(mapObject);
     if (!mapObject.inActive) this.activeObjectCount++;
};

MapLayer.prototype.removeObject = function(mapObject){
    var index = this.objects.indexOf(mapObject);
    if (index >= 0){
        this.objects.splice(index, 1);
        console.log("removed object")
    }
    /*
    // if we need < IE9 support
    for (var i=0, len=this.objects.length;i<len;i++){
        var object = this.objects[i];
        if (object == mapObject) {
            this.objects.splice(i,1);
            console.log("removed object")
        }
    }
    */
};

MapLayer.prototype.clear = function(){
    this.objects = [];
};

MapLayer.prototype.getScrollOffset = function(){
    if (this.parentLayer){
        return this.parentLayer.getScrollOffset();
    }else{
        return {
            x: this.scrollOffsetX,
            y: this.scrollOffsetY,
            tileX: this.scrollTilesX,
            tileY: this.scrollTilesY
        }
    }
};

MapLayer.prototype.setScrollOffset = function(properties){
    this.scrollTilesX = properties.tileX;
    this.scrollTilesY = properties.tileY;
    this.scrollOffsetX = properties.x || 0;
    this.scrollOffsetY = properties.y || 0;
};


MapLayer.prototype.render = function(){
    this.step++;
    if (this.step >= this.targetTicksPerSecond) this.step = 0;

    var scrollOffset = this.getScrollOffset();
    for (var i=0, len=this.objects.length;i<len;i++){
        var object = this.objects[i];
        if (object.isVisible(scrollOffset)) object.render(this.step,scrollOffset,0);
    }
};

MapLayer.prototype.cleanUp = function(){
    if (this.type == MAPLAYERTYPE.GRID){
        if (this.step >= (this.targetTicksPerSecond-1)){
            if (this.autoScrollDirection == DIRECTION.DOWN && this.scrollTilesY <= 0){
                if (this.onEnd){
                    this.onEnd(this);
                }
            }
            this.fullStep();
        }
    }
};

MapLayer.prototype.fullStep = function(){

    if (this.isActive()){
        for (var i = 0, len = this.objects.length; i<len; i++){
            var object = this.objects[i];
            object.fullStep(this.step);
        }
    }

    switch (this.scrollDirection){
        case DIRECTION.LEFT:
            this.scrollTilesX ++;
            break;
        case DIRECTION.RIGHT:
            this.scrollTilesX --;
            break;
        case DIRECTION.DOWN:
            this.scrollTilesY --;
            break;
        case DIRECTION.UP:
            this.scrollTilesY ++;
            break;
    }

    this.scrollDirection = DIRECTION.NONE;
    this.scrollOffsetX = 0;
    this.scrollOffsetY = 0;
};


MapLayer.prototype.setPlayerObject = function(mapObject){
    this.playerObject = mapObject;
};

MapLayer.prototype.getPlayerObject = function(mapObject){
    return this.playerObject;
};

MapLayer.prototype.getObjectAtPixels = function(x,y){
    if (this.type == MAPLAYERTYPE.GRID){
        var t = Game.getSettings().tileSize;
        var gridX = Math.floor(x/t);
        var gridY = Math.floor(y/t);

        return this.getObjectAtGrid(gridX,gridY);

    }else{
        //todo loop over objects
        return undefined;
    }

};

MapLayer.prototype.getObjectAtGrid = function(x,y){
    var index = (y * this.levelWidth) + x;
    return this.objects[index];
};

MapLayer.prototype.initScroll = function(){


    if (this.parentLayer) return;

    var self = this;

    // check if the player is close to a border of the viewport

    if (this.playerObject){
        if (((this.scrollTilesX + this.viewPortWidth) - this.playerObject.left < this.borderScrollOffset)
            && this.playerObject.moveDirection == DIRECTION.RIGHT)
            self.scroll(DIRECTION.LEFT);
        if ((this.playerObject.left - this.scrollTilesX < this.borderScrollOffset)
            && this.playerObject.moveDirection == DIRECTION.LEFT)
            self.scroll(DIRECTION.RIGHT);
        if (((this.scrollTilesY + this.viewPortHeight) - this.playerObject.top < this.borderScrollOffset)
            && this.playerObject.moveDirection == DIRECTION.DOWN)
            self.scroll(DIRECTION.UP);
        if ((this.playerObject.top - this.scrollTilesY < this.borderScrollOffset)
            && this.playerObject.moveDirection == DIRECTION.UP)
            self.scroll(DIRECTION.DOWN);
    }



    if (this.autoScrollDirection){
        self.scroll(this.autoScrollDirection);
    }

};

MapLayer.prototype.setAutoScroll = function(direction){
    this.autoScrollDirection = direction;
};

MapLayer.prototype.scroll = function(direction){
    var speed = this.scrollStep;

    this.scrollDirection = direction;
    this.scrollOffsetX = 0;
    this.scrollOffsetY = 0;

    switch (direction){
        case DIRECTION.LEFT:
            this.scrollOffsetX = -speed;
            break;
        case DIRECTION.RIGHT:
            this.scrollOffsetX = speed;
            break;
        case DIRECTION.DOWN:
            this.scrollOffsetY = speed;
            break;
        case DIRECTION.UP:
            this.scrollOffsetY = -speed;
            break;
    }
};

MapLayer.prototype.addSubLayer = function(layer){
    this.sublayers.push(layer);
};

MapLayer.prototype.removeSubLayer = function(layer){
    for (var i=0, len=this.sublayers.length;i<len;i++){
        if (this.sublayers[i].id == layer.id) this.sublayers.splice(i,1);
    }
};



