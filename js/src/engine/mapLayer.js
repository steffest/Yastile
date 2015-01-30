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

    this.scrollPixelX = this.scrollPixelX || 0;
    this.scrollPixelY = this.scrollPixelY || 0;

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
    if (this.tileSize){
        this.scrollStep = this.tileSize/this.targetTicksPerSecond;
    }else{
        this.scrollStep = 1;
    }

    if (!isDefined(this.isVisible)) this.isVisible = true;

    console.log("new maplayer " , this.id, this.targetTicksPerSecond, this.scrollStep);

    if (this.type == MAPLAYERTYPE.IMAGE){
        var me = this;

        if (me.preloadedSrc){
            var img = Resources.images[me.preloadedSrc];
            me.sprite = new Sprite(img,"",0,0,img.width,img.height);
        }else if(me.src){
            console.error("Warning: image " + me.src + " is not preloaded");
            console.log("loading image for layer " + this.id + ": " + this.src);
            this.image = new Image();
            this.image.onload = function(){
                me.sprite = new Sprite(this,"",0,0,this.width,this.height);
            };
            this.image.src = me.src;
        }


    }

    if (properties.map){
        parse(properties);
    }

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
    return this.activeObjectCount>0 && this.isVisible;
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
            tileY: this.scrollTilesY,
            pixelX: this.scrollPixelX,
            pixelY: this.scrollPixelY
        }
    }
};

MapLayer.prototype.setScrollOffset = function(properties){
    this.scrollTilesX = properties.tileX || 0;
    this.scrollTilesY = properties.tileY || 0;
    this.scrollOffsetX = properties.x || 0;
    this.scrollOffsetY = properties.y || 0;
    this.scrollPixelX = properties.pixelX;
    this.scrollPixelY = properties.pixelY;
};

MapLayer.prototype.render = function(){
    this.step++;
    if (this.step >= this.targetTicksPerSecond) this.step = 0;

    if (!this.isVisible) return;

    if (this.sprite){
        if (this.tileSize){
            this.scrollPixelX = this.scrollTilesX*this.tileSize + (this.scrollOffsetX*this.step);
            this.scrollPixelX = this.scrollTilesY*this.tileSize + (this.scrollOffsetY*this.step);
        }else{
            var x = 0 - this.scrollPixelX;
            var y = 0 - this.scrollPixelY;
        }
        ctx.drawImage(this.sprite.canvas,x, y);
    }

    var scrollOffset = this.getScrollOffset();
    for (var i=0, len=this.objects.length;i<len;i++){
        var object = this.objects[i];
        if (object.isVisible(scrollOffset)) object.render(this.step,scrollOffset,0);
    }
};

MapLayer.prototype.cleanUp = function(){
    switch (this.type){
        case MAPLAYERTYPE.GRID:
            if (this.step >= (this.targetTicksPerSecond-1)){
                var viewPort = Game.getViewPort();
                // check to see if the map is about to scroll off screen
                if (this.autoScrollDirection && this.onEnd){
                    var ended = false;
                    switch (this.autoScrollDirection){
                        case DIRECTION.DOWN:
                            var canScrollOffscreen = this.height - viewPort.height - 2;
                            if (this.scrollTilesY < -canScrollOffscreen) ended = true;
                            break;
                        case DIRECTION.LEFT:
                            var canScrollOffscreen = this.width - viewPort.width - 2;
                            if (this.scrollTilesX > canScrollOffscreen) ended = true;
                            break;
                    }
                    if (ended) this.onEnd(this);

                }
                this.fullStep();

            }
            break;

        case MAPLAYERTYPE.IMAGE:
            if (this.step >= (this.targetTicksPerSecond-1)){
                this.fullStep();
            }
            break;

        case MAPLAYERTYPE.FREE:
            for (var i = 0, len = this.objects.length; i<len; i++){
                var object = this.objects[i];
                if (object) object.fullStep();
            }
            break;
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

    }else {
        var result = [];
        for (var i = 0, len = this.objects.length; i<len; i++){
            var object = this.objects[i];
            if (object.left < x
                && object.left + object.width > x
                && object.top < y
                && object.top + object.height > y
            ) result.push(object)
        }
        return result;
    }
};

MapLayer.prototype.getColorAtPixel = function(x,y){
    // warning ... very slow
    if (this.type == MAPLAYERTYPE.IMAGE && this.sprite){
        return this.sprite.getColorAtPixel(x,y);
        //return this.sprite.getImageData(x, y, 1, 1);
    }else{
        //todo: get object at coordinates and collect color
        return undefined;
    }
};

MapLayer.prototype.putColorAtPixel = function(color,x,y){
    if (this.type == MAPLAYERTYPE.IMAGE && this.sprite){
        this.sprite.putColorAtPixel(color,x,y);
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

MapLayer.prototype.show = function(){
    this.isVisible = true;
};

MapLayer.prototype.hide= function(){
    this.isVisible = false;
};



