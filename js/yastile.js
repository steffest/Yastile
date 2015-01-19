function loadUrl(url,callback){
    url = url + "?t=" + new Date().getTime();
    var http_request;
    try{
        http_request = new XMLHttpRequest();
    }catch (e){
        try{
            http_request = new ActiveXObject("Msxml2.XMLHTTP");
        }catch (e) {
            try{
                http_request = new ActiveXObject("Microsoft.XMLHTTP");
            }catch (e){
                callback({});
            }
        }
    }
    http_request.onreadystatechange  = function(){
        if (http_request.readyState == 4  )
        {
            var jsonObj = JSON.parse(http_request.responseText);
            callback(jsonObj);

        }
    };
    http_request.open("GET", url, true);
    http_request.send();
}

;var Game= (function(){
    var self = {};

    var lastTickTime = 0;
    var lastTime = 0;
    var targetFps = 35;
    var targetTicksPerSecond = 4;
    var tileSize;
    var fps;
    var averageFps = [];
    var tickps;
    var frameInterval = 1000/targetFps;
    var settings;
    var step = -1;
    var _score = 0;
    var _hint = "Good luck!";
    var _targetScore = 0;
    var _isWon = false;
    var _isLost = false;

    var backgroundPattern;
    var backgroundImage;
    var gameController;

    var scorePosition = {top: 0, left: 0};

    var currentTickFunction = function(){};

    self.init = function(properties){

        settings = properties;

        var randomSeed = new Date().getTime();
        settings.seed =  randomSeed;

        canvas = document.createElement("canvas");

        if(navigator.isCocoonJS) {
            //canvas.screencanvas = true;
            // buggy!
        } else {

        }
        ctx = canvas.getContext("2d");

        if (properties.scaling){
            settings.originalViewPortWidth = properties.viewPortWidth;
            settings.originalViewPortHeight = properties.viewPortHeight;
            scaleCanvas();
        }else{
            var targetWidth = properties.viewPortWidth * properties.tileSize;
            var targetHeight =  properties.viewPortHeight * properties.tileSize;
            canvas.width  = targetWidth;
            canvas.height = targetHeight;
        }


        document.body.appendChild(canvas);

        tileSize = properties.tileSize;

        properties.borderScrollOffset = 8;


        var preloadResources = [
            {id: "spritesheet", url: properties.spriteSheet}
        ];
        if (settings.backgroundImage) preloadResources.push({id: "backGroundImage", url: settings.backgroundImage});

        Preloader.init(preloadResources,function(){
            console.error("preloader done");

            buildSpriteSheet(Resources.images.spritesheet,function(){
                console.error("building spritesheet done");

                UI.init();
                if (typeof GameObjects != "undefined"){
                    GameObjects.init();
                    settings.defaultGameObject = GameObjects[settings.defaultGameObject];
                }


                Map.init(properties);


                if (settings.backgroundPattern && isNumeric(settings.backgroundPattern)){
                    backgroundPattern = ctx.createPattern(sprites[settings.backgroundPattern], 'repeat');
                }

                if (!backgroundPattern) backgroundPattern = "Black";

                if (settings.backgroundImage){
                        backgroundImage = document.createElement("canvas");
                        backgroundImage.width = 2048;
                        backgroundImage.height = 1024;

                        var context = backgroundImage.getContext("2d");
                        context.globalAlpha = settings.backgroundImageAlpha || 1;

                        context.drawImage(Resources.images.backGroundImage, 0, 0);
                        initDone();
                }else{
                    initDone();
                }
            })

        });

    };

    var initDone = function(){
        if (settings.start) {
            settings.start();
        }else if (settings.level){
            self.loadLevel(settings.level)
        }else{
            console.error("nothing to do!");
        }
        main();
    };

    self.start = function(){
        UI.removeAllElements();
        if (settings.showOnScreenControls){
            gameController = new UI.GameController(settings.onScreenControlsImage);
            UI.addElement(gameController);

            var actionButton = new UI.Button({
                id: "action",
                url: settings.actionButtonImage,
                bottom: canvas.height - 40,
                right: canvas.width - 20,
                width: 74,
                height: 74,
                states:[
                    [0,0,74,74],
                    [79,0,74,74]
                ],
                onDown: function(button){
                    Input.isAction(true);
                    this.setSate(1);
                },
                onUp: function(button){
                    Input.isAction(false);
                    this.setSate(0);
                },
                onResize:  function(button){
                    button.right = canvas.width - 20;
                    button.left = button.right - button.width;
                    button.bottom = canvas.height - 40;
                    button.top = button.bottom - button.height;
                }
            });
            UI.addElement(actionButton);

        }

        // add Closebutton - top left;
        var closeButton = new UI.Button({
            id: "close",
            url: settings.closeButtonImage,
            top: 10,
            right: canvas.width - 10,
            onClick: function(button){
                self.exit();
            },
            onResize:  function(button){
                button.right = canvas.width - 10;
                button.left = button.right - button.width;
            }
        });
        UI.addElement(closeButton);

        self.resetScore();
        self.isWon(false);
        self.isLost(false);
        self.setHint("Good luck!");

        self.setGameSection(gameLoop)
    };

    self.exit = function(){
        Intro.init();
    };

    self.loadLevel = function(levelData){
        console.error("loading level ",levelData)
        if (typeof levelData == "string"){
            Map.loadFromUrl(levelData,function(){
                self.start();
            })
        }else{
            if (levelData.map == "random") {
                //map = Map.generateRandom(levelData);
                //self.start();
            }
        }
    };

    function scaleCanvas(){
        var targetWidth = settings.originalViewPortWidth * settings.tileSize;
        var targetHeight = settings.originalViewPortHeight * settings.tileSize;
        var aspectRatio = window.innerHeight/window.innerWidth;

        switch (settings.scaling){
            case SCALING.FIT_WIDTH:
                targetHeight = aspectRatio*targetWidth;
                break;
            case SCALING.FIT_HEIGHT:
                aspectRatio = window.innerWidth/window.innerHeight;
                targetWidth = aspectRatio*targetHeight;
                break;
            case SCALING.CONTAIN:
                var fitHeight = Math.ceil((aspectRatio*targetWidth)/settings.tileSize);
                if (fitHeight < settings.originalViewPortHeight){
                    aspectRatio = window.innerWidth/window.innerHeight;
                    targetWidth = aspectRatio*targetHeight;
                }else{
                    targetHeight = aspectRatio*targetWidth;
                }
                break;
        }

        settings.viewPortWidth = Math.ceil(targetWidth/settings.tileSize);
        settings.viewPortHeight = Math.ceil(targetHeight/settings.tileSize);

        settings.canvasWidth = targetWidth;
        settings.canvasHeight = targetHeight;

        canvas.width  = targetWidth;
        canvas.height = targetHeight;

        if (gameController) gameController.setPosition();

        scorePosition.left = 0;
        scorePosition.top = 0;

        scorePosition.hintTop = 0;
        scorePosition.hintLeft = 150;

        if (settings.showFPS){
            scorePosition.left = 200;
            scorePosition.hintLeft = 350;

            if (targetWidth<400){
                scorePosition.left = 0;
                scorePosition.top = 24;

                scorePosition.hintLeft = 0;
                scorePosition.hintTop = 48;
            }
        }

        if(navigator.isCocoonJS) {
            // scaling is done by Cocoon internaly
            UI.setScale(1,1);
        } else {
            ctx.webkitImageSmoothingEnabled = ctx.imageSmoothingEnabled = ctx.mozImageSmoothingEnabled = ctx.oImageSmoothingEnabled = false;

            // note: this produces blurry results in Chrome
            canvas.style.width = window.innerWidth + 'px';
            canvas.style.height = window.innerHeight + 'px';

            var scaleFactorWidth = parseInt(canvas.style.width)/canvas.width;
            var scaleFactorHeight = parseInt(canvas.style.height)/canvas.height;
            UI.setScale(scaleFactorWidth,scaleFactorHeight);

        }

        Map.onResize(settings);
        UI.onResize(settings);

        window.addEventListener("resize", scaleCanvas, false);
    }


    function main(now) {
        var delta = now - lastTickTime;

        if (delta > frameInterval) {
            tick();
            tickps = 1000/(now-lastTickTime);
            //lastTickTime = now - (delta % frameInterval);
            lastTickTime = now;
        }

        fps = 1000/(now-lastTime);
        lastTime = now;

        if (settings.showScore) drawScore();
        if (settings.showFPS) drawFPS();
        if (settings.showHint) drawHint();

        requestAnimFrame(main);
    }

    function tick(){
        // one Game Tick
        currentTickFunction();
    }

    function gameLoop(){
        step++;
        if (step>=targetTicksPerSecond) step = 0;

        Map.process(step);
        render(step);
        Map.cleanUp();

    }




    function render(step,scrollOffset) {
        ctx.fillStyle = backgroundPattern;
        //ctx.fillStyle = "Black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (backgroundImage){
            ctx.drawImage(backgroundImage,0, 0);
        }

        Map.render(step);

        // draw level background
        //if (backgroundImage){
        //    var x = 0-(scrollOffset.tileX * tileSize) + scrollOffset.x*step;
        //    var y = 0-(scrollOffset.tileY * tileSize) + scrollOffset.y*step;
        //    ctx.drawImage(backgroundImage,x, y);
        //}

        /*
        var levelProperties = Map.getLevelProperties();


        // draw Sprite Map
        // first bottomlayer - if any
        for (var m = 0, maplen = MapLayers.length; m<maplen; m++){
            var mapLayer = MapLayers[m];
            if (mapLayer.type == MAPLAYERTYPE.SPOT) {
                mapLayer.render(step, scrollOffset);
            }
        }

        // then grid
        for (var i = 0, len = levelProperties.height*levelProperties.width; i<len; i++){
            var object = map[i];
            //console.error("render",object)
            if (object.isVisible(scrollOffset)) object.render(step,scrollOffset);
        }

        // then floating sprites
        for (var m = 0, maplen = MapLayers.length; m<maplen; m++){
            var mapLayer = MapLayers[m];
            if (mapLayer.type == MAPLAYERTYPE.FREE){
                mapLayer.render(step,scrollOffset);
            }

        }


        //always Draw Player on Top
        var playerObject = Map.getPlayerObject();
        if ( playerObject)  playerObject.render(step,scrollOffset);

        */

        UI.renderElements();

    }

    function drawFPS(){
        var average = 0;
        if (!isNaN(tickps)){
            averageFps.push(tickps);
            if (averageFps.length > 60) averageFps.shift();

            var sum = 0;
            for(var i = 0; i < averageFps.length; i ++){
                sum += averageFps[i];
            }
            average = Math.round(sum / averageFps.length);

        }
        ctx.fillStyle = "Black";
        ctx.fillRect(0,0,200,24);
        ctx.fillStyle = "White";
        ctx.font      = "normal 10pt Arial";
        ctx.fillText(Math.round(fps) + " frames/s , " + Math.round(tickps) + " ticks/s + (" + average + ")" , 10, 16);
    }

    function drawScore(){
        ctx.fillStyle = "Black";
        ctx.fillRect(scorePosition.left,scorePosition.top,200,24);
        ctx.fillStyle = "White";
        ctx.font      = "normal 10pt Arial";
        ctx.fillText("Score: " + _score , scorePosition.left + 10, scorePosition.top + 16);
        ctx.fillText("Needed: " + _targetScore , scorePosition.left + 80, scorePosition.top + 16);
    }

    function drawHint(){
        ctx.fillStyle = "Black";
        ctx.fillRect(scorePosition.hintLeft,scorePosition.hintTop,200,24);
        ctx.fillStyle = "White";
        ctx.font      = "normal 10pt Arial";
        ctx.fillText(_hint , scorePosition.hintLeft + 10, scorePosition.hintTop + 16);
    }

    self.getTileSize = function(){
        return tileSize;
    };

    self.getTargetTicksPerSecond = function(){
        return targetTicksPerSecond;
    };

    self.getViewPort = function(){
        return {width: settings.viewPortWidth, height: settings.viewPortHeight}
    };

    self.getCanvasSize = function(){
        return {width: settings.canvasWidth, height: settings.canvasHeight}
    };

    self.getSettings = function(){
        return settings;
    };

    self.getRandomDirection = function(){
        return DIRECTION.LEFT + Math.floor(random()*4);
    };

    self.getRandomHorizontalDirection = function(){
        if (random()<=0.5){
            return DIRECTION.LEFT;
        }else{
            return DIRECTION.RIGHT;
        }
    };

    self.getDirectionTurnedLeft = function(direction){
        var result = direction-1;
        if (result < DIRECTION.LEFT) result = DIRECTION.DOWN
        return result;
    };

    self.getDirectionTurnedRight = function(direction){
        var result = direction+1;
        if (result > DIRECTION.DOWN) result = DIRECTION.LEFT;
        return result;
    };

    self.getDirectionName = function(direction){
        // a bit stupid ... but keeping the DIRECTION enum as simple int makes sense
        switch (direction){
            case DIRECTION.LEFT: return  "Left"; break;
            case DIRECTION.RIGHT: return "Right"; break;
            case DIRECTION.UP: return "Up"; break;
            case DIRECTION.DOWN: return "Down"; break;
            default : return "none";
        }
    };

    self.setTargetScore = function(score){
        _targetScore = score;
    };

    self.addScore = function(points){
        _score += points;
    };

    self.resetScore = function(){
        _score = 0;
        console.error("resetscore");
        if (typeof GameObjects != "undefined") GameObjects.resetState();
    };

    self.setHint = function(s){
        _hint = s;
    };

    self.hasTargetScore = function(){
        return _score>=_targetScore;
    };

    self.isWon = function(value){
        if (value){_isWon = value}
        if (_isWon){
            console.error("WON!");
            _hint = "You made it!";
        }
        return _isWon;
    };

    self.isLost = function(value){
        if (value){_isLost = value}
        if (_isLost){
            console.error("FORGET IT!");
            _hint = "Forget it!";
        }
        return _isLost;
    };

    self.setGameSection = function(gameStepFunction){
        currentTickFunction = gameStepFunction;
    };

    return self;
}());
;var Input = (function() {

    var self = {};
    var _isdown,_isup,_isleft,_isright,_isaction;

    var KEY={
        left: 37,
        up: 38,
        right: 39,
        down: 40,
        space:32,
        ctrl:17
    };

    document.addEventListener("keydown",handleKeyDown, false);
    document.addEventListener("keyup",handleKeyUp, false);

    function handleKeyDown(event){
        var keyCode = event.keyCode;

        if (keyCode == KEY.down)_isdown = true;
        if (keyCode == KEY.left)_isleft = true;
        if (keyCode == KEY.right)_isright = true;
        if (keyCode == KEY.up) _isup = true;
        if (keyCode == KEY.space) _isaction = true;
        if (keyCode == KEY.ctrl) _isaction = true;
    }

    function handleKeyUp(event){
        var keyCode = event.keyCode;

        if (keyCode == KEY.down)_isdown = false;
        if (keyCode == KEY.left)_isleft = false;
        if (keyCode == KEY.right)_isright = false;
        if (keyCode == KEY.up) _isup = false;
        if (keyCode == KEY.space) _isaction = false;
        if (keyCode == KEY.ctrl) _isaction = false;

        if (keyCode == KEY.up){
            //gameSection = 1;
        }
    }

    self.isDown = function(value){
        if (typeof value != "undefined") _isdown = value;
        return _isdown;
    };

    self.isUp = function(value){
        if (typeof value != "undefined") _isup = value;
        return _isup;
    };

    self.isLeft = function(value){
        if (typeof value != "undefined") _isleft = value;
        return _isleft;
    };

    self.isRight = function(value){
        if (typeof value != "undefined") _isright = value;
        return _isright;
    };

    self.isAction = function(value){
        if (typeof value != "undefined") _isaction = value;
        return _isaction;
    };

   return self;

}());
;var Map = (function(){
    var self = {};
    var layers = [];

    self.init = function(properties){

    };

    self.loadFromUrl = function(url,callback){
        layers = [];

        loadUrl(url,function(data){
            if (!data.layers){
                // single layer level
                data.id = "layer1";
                data.zIndex = 1;
                self.addLayer(data);
            }else{
                for (var i = 1; i<=data.layers.length; i++){
                    var layerData = data.layers[i-1];
                    layerData.id = "layer" + i;
                    layerData.zIndex = i;
                    self.addLayer(layerData);
                }
            }

            if (callback) callback();
        })
    };

    self.addLayer = function(properties){

        var layerType = undefined;

        if (properties.type) layerType=properties.type;
        if (!layerType && properties.map) layerType=MAPLAYERTYPE.GRID;
        if (!layerType) layerType=MAPLAYERTYPE.FREE;
        properties.type = layerType;

        properties.speed = properties.speed || 1;

        var layer = new MapLayer(properties);
        layers.push(layer);

        return layer;

    };

    self.getLayer = function(id){
        for (var i=0; i<layers.length; i++){
            if (layers[i].id == id){
                return layers[i];
            }
        }
        return undefined;
    };

    self.onResize = function(settings){
        // delegate to layers
    };

    self.process = function(){
        for (var i=0; i<layers.length; i++){
            layers[i].process();
        }
    };

    self.render = function(){
        for (var i=0; i<layers.length; i++){
            layers[i].render();
        }
    };

    self.cleanUp = function(){
        for (var i=0; i<layers.length; i++){
            layers[i].cleanUp();
        }
    };

    self.sortLayers = function(){
        sortByKey(layers,"zIndex");
        console.log("sorted layers",layers);
    };

    return self;
}());
;var MapLayer = function(properties){

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
    this.scrollTilesX = properties.tileX
    this.scrollTilesY = properties.tileY;
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


MapLayer.prototype.initScroll = function(){

    if (this.parentLayer) return;

    var self = this;
    var scroll = function(direction){

        var speed = self.scrollStep;

        self.scrollDirection = direction;
        self.scrollOffsetX = 0;
        self.scrollOffsetY = 0;

        switch (direction){
            case DIRECTION.LEFT:
                self.scrollOffsetX = -speed;
                break;
            case DIRECTION.RIGHT:
                self.scrollOffsetX = speed;
                break;
            case DIRECTION.DOWN:
                self.scrollOffsetY = speed;
                break;
            case DIRECTION.UP:
                self.scrollOffsetY = -speed;
                break;
        }
    };

    // check if the player is close to a border of the viewport

    if (this.playerObject){
        if (((this.scrollTilesX + this.viewPortWidth) - this.playerObject.left < this.borderScrollOffset)
            && this.playerObject.moveDirection == DIRECTION.RIGHT)
            scroll(DIRECTION.LEFT);
        if ((this.playerObject.left - this.scrollTilesX < this.borderScrollOffset)
            && this.playerObject.moveDirection == DIRECTION.LEFT)
            scroll(DIRECTION.RIGHT);
        if (((this.scrollTilesY + this.viewPortHeight) - this.playerObject.top < this.borderScrollOffset)
            && this.playerObject.moveDirection == DIRECTION.DOWN)
            scroll(DIRECTION.UP);
        if ((this.playerObject.top - this.scrollTilesY < this.borderScrollOffset)
            && this.playerObject.moveDirection == DIRECTION.UP)
            scroll(DIRECTION.DOWN);
    }

    if (this.autoScrollDirection){
        scroll(this.autoScrollDirection);
    }

};


MapLayer.prototype.setAutoScroll = function(direction){
    this.autoScrollDirection = direction;
};

MapLayer.prototype.addSubLayer = function(layer){
    this.sublayers.push(layer);
};

MapLayer.prototype.removeSubLayer = function(layer){
    for (var i=0, len=this.sublayers.length;i<len;i++){
        if (this.sublayers[i].id == layer.id) this.sublayers.splice(i,1);
    }
};



;var MapObject = function(properties){
    for (var key in properties){
        this[key] = properties[key];
    }

    this.id = this.gameObject.id;
    this.staticFrame = this.gameObject.getStaticFrame();
    var sprite = sprites[this.staticFrame];
    this.height = sprite.height;
    this.width = sprite.width;
};

MapObject.prototype.isVisible = function(scrollOffset){
    return true;
};

MapObject.prototype.render = function(step,scrollOffset,layer){

    var x = this.left;
    var y = this.top;

    if (this.id>0){
        var frame;
        if (this.animation){
            this.animationStartFrame++;
            if (this.animationStartFrame >= this.animation.length) this.animationStartFrame = 0;
            frame = this.gameObject.getAnimationFrame(this.animation, this.animationStartFrame);
        }else{
            frame = sprites[this.staticFrame];
        }

        ctx.drawImage(frame,x, y);
    }

};

MapObject.prototype.process = function(){


    if (this.processed) return;

    var me = this;
    var obj = me.gameObject;
    if (obj.inActive) return; // inanimate object, don't bother;

    if (obj.isPlayer()){


    }else{

    }


    //if (!this.isMoving()){
    if (obj.eachStep) {
        obj.eachStep(this);
    }
    //}



    //this.processed = true;


};



MapObject.prototype.destroy = function(){
     this.mapLayer.removeObject(this);
};

MapObject.prototype.detectCollistion = function(){
    for (var i=0; i<this.mapLayer.objects.length; i++){
        var object = this.mapLayer.objects[i];

          if (
              object &&
              object.gameObject.isEnemy &&
              this.left < object.left + object.width &&
              this.left + this.width > object.left &&
              this.top < object.top + object.height &&
              this.height + this.top > object.top) {


              this.mapLayer.addObject(
                  new MapObject({
                      left: object.left - 8,
                      top: object.top - 8,
                      gameObject: GameObjects.EXPLOSION
                  }));
              object.destroy();
          }


    }
};


MapObject.prototype.animate = function(animation){

    if (typeof animation == "string" || typeof animation == "number"){
        this.animation = this.gameObject[animation];
        if (!this.animation) this.animation = this.gameObject["animation" + animation];
        if (!this.animation) this.animation = this.gameObject.animationFrames[animation];
        if (!this.animation) this.animation = this.gameObject.animationFrames["animation" + animation];
    }else{
        this.animation = animation
    }

    this.animationStartFrame = 0;
};

MapObject.prototype.animateIfPossible = function(animation){
    if (!this.isAnimating()) this.animate(animation)
};

MapObject.prototype.isAnimating = function(){
    return this.animation;
};

;var Resources = {
    images: {}
};

var Preloader = (function(){
    var self = {};

    var loadCount;
    var totalItems;

    var top,left,width,height;

    self.init = function(items,onDone){
        width = 200;
        height = 10;
        left = (canvas.width-width)/2;
        top = (canvas.height-height)/2;

        totalItems = items.length;
        console.error("pre loading " + totalItems + " items");
        if (totalItems == 0){
            onDone();
        }else{
            var onUpdate = function(){
                self.render();
                if (loadCount == totalItems){
                    if (onDone) onDone();
                }
            };
            self.render();
            self.load(items,onUpdate)
        }
    };

    self.load = function(items,onUpdate){
        loadCount=0;
        var url;
        for (var i=0; i<totalItems; i++) {
            var thisResource = items[i];
            if (thisResource.url){
                url = thisResource.url;
            }else{
                url = thisResource;
            }

            var img = new Image();
            img.onload = function() {
                loadCount++;
                if (this.id) Resources.images[this.id] = this;
                console.error("loaded url " + this.src + " with name " + this.id);
                if (onUpdate) onUpdate();
            };
            img.onerror = function(){
                console.error("Error loading url " + this.src);
            };
            img.id = thisResource.id;
            img.src = url;
        }
    };

    self.render = function(){
        UI.clear();
        ctx.strokeStyle="white";
        ctx.fillStyle = "white";
        ctx.rect(left,top,width,height);
        ctx.stroke();

        var barWidth = Math.floor(loadCount*width/totalItems);

        ctx.fillRect(left,top,barWidth,height);
    };

    return self;
}());




;/*
    Copies a rectangular piece of an image to a cached canvas
    Used to cut a spritesheet in individual sprites
 */
var Sprite = function(img,id,x,y,width,height){

    if (typeof width == "undefined"){
        // fixed tilesize
        var tilesize = x;

        var tilesInaRow = Math.floor(img.width/tilesize);

        x = (id % tilesInaRow) * tilesize;
        y = (Math.floor(id / tilesInaRow)) * tilesize;
        width = tilesize;
        height = tilesize;
    }

    var canvas = document.createElement("canvas");
    canvas.width  = width;
    canvas.height = height;
    var ctx = canvas.getContext("2d");

    ctx.drawImage(img,x,y,width,height,0,0,width,height);

    return canvas;
};


var buildSpriteSheet = function(img,callback){

    var map = Game.getSettings().spriteMap;

    if (map){
        for (var i = 0; i<spriteMap.length; i++){
            var co = spriteMap[i];
            var spriteImage = img;

            // todo build spritesheet from multiple source images
            if (co.src){
                spriteImage = userData[co.src];
            }

            var  s = new Sprite(spriteImage,co.name,co.l,co.r,co.w,co.h);
            sprites.push(s);
            spriteNames[co.name] = sprites.length-1;
        }

    }else{
        // spritesheet of fixed size images
        var t = Game.getSettings().tileSize;
        var maxSprites = Math.floor(img.width/t) * Math.floor(img.height/t);
        for (var i=0;i<maxSprites;i++){
            var s = new Sprite(img,i,Game.getSettings().tileSize);
            sprites.push(s);
        }
    }


    if (callback) callback();
};
;var UI = (function(){
    var self = {};

    var UIEventElements;
    var screen = [];
    var scaleFactorW = 1;
    var scaleFactorH = 1;
    var touchData = {};

    touchData.touches = [];

    self.init = function(){

        canvas.addEventListener("mousedown", handleDown,false);
        canvas.addEventListener("mousemove", handleMove,false);
        canvas.addEventListener("mouseup", handleUp,false);
        canvas.addEventListener("touchstart", handleDown,false);
        canvas.addEventListener("touchmove", handleMove,false);
        canvas.addEventListener("touchend", handleUp,false);
        canvas.addEventListener("mousewheel", handleMouseWheel,false);
        canvas.addEventListener("DOMMouseScroll", handleMouseWheel,false);

        if (window.navigator.msPointerEnabled){
            canvas.addEventListener("MSPointerDown", handleDown,false);
            canvas.addEventListener("MSPointerMove", handleMove,false);
            canvas.addEventListener("MSPointerEnd", handleUp,false);
        }

    };

    self.registerEventElement = function(element,l,t,r,b){
        UIEventElements.push({
            element: element,
            top: t,
            right: r,
            bottom: b,
            left: l
        });
    };

    self.getEventElement = function(x,y){

        var result;
        for (var i = 0, len = UIEventElements.length; i< len; i++){
            var elm = UIEventElements[i];
            if (x>=elm.left && x<=elm.right && y>= elm.top && y <= elm.bottom) result = elm;
        }
        return result;
    };

    self.clear = function(clearPattern){
        //ctx.fillStyle = backgroundPattern;
        clearPattern = clearPattern || "Black";
        ctx.fillStyle = clearPattern;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        UIEventElements = [];
    };

    self.removeAllElements = function(element){
        screen = [];
        UIEventElements = [];
    };

    self.addElement = function(element){
        screen.push(element);
    };

    self.renderElements = function(){
        for (var i = 0, len = screen.length; i<len; i++){
            var UIElement = screen[i];
            UIElement.render();
        }
    };

    self.setScale = function(width,height){
        scaleFactorW = width;
        scaleFactorH = height;
    };

    self.onResize = function(){
        for (var i = 0, len = screen.length; i<len; i++){
            var UIElement = screen[i];
            if (UIElement.onResize) UIElement.onResize(UIElement);
        }
    };

    var getTouchIndex = function (id) {
        for (var i=0; i < touchData.touches.length; i++) {
            if (touchData.touches[i].id === id) {
                return i;
            }
        }
        return -1;
    };


    function handleDown(event){

        event.preventDefault();

        if (event.touches && event.touches.length>0){
            var touches = event.changedTouches;
            for (var i=0; i < touches.length; i++) {
                var touch = touches[i];
                initTouch(touch.identifier,touch.pageX,touch.pageY);
            }
        }else{
            var touchIndex = getTouchIndex("notouch");
            if (touchIndex>=0) touchData.touches.splice(touchIndex, 1);
            initTouch("notouch",event.pageX,event.pageY);
        }

        function initTouch(id,x,y){
            touchData.isTouchDown = true;

            var _x = x/scaleFactorW;
            var _y = y/scaleFactorH;

            var thisTouch = {
                id: id,
                x: _x,
                y: _y,
                startX: _x,
                startY: _y,
                UIobject: UI.getEventElement(_x,_y)
            };

            touchData.touches.push(thisTouch);

            if (thisTouch.UIobject  && thisTouch.UIobject.element && thisTouch.UIobject.element.onDown){
                thisTouch.UIobject.element.onDown(thisTouch);
            }
        }
    }

    function handleMove(event){

        event.preventDefault();

        if (event.touches && event.touches.length>0){
            var touches = event.changedTouches;

            for (var i=0; i < touches.length; i++) {
                var touch = touches[i];
                updateTouch(getTouchIndex(touch.identifier),touch.pageX,touch.pageY);
            }
        }else{
            updateTouch(getTouchIndex("notouch"),event.pageX,event.pageY);
            touchData.currentMouseX = event.pageX;
            touchData.currentMouseY = event.pageY;
        }

        function updateTouch(touchIndex,x,y){
            if (touchIndex>=0){
                var thisTouch =touchData.touches[touchIndex];

                thisTouch.x = x/scaleFactorW;
                thisTouch.y = y/scaleFactorW;

                touchData.touches.splice(touchIndex, 1, thisTouch);

                if (touchData.isTouchDown && thisTouch.UIobject){
                    if (thisTouch.UIobject.element && thisTouch.UIobject.element.onDrag){
                        thisTouch.UIobject.element.onDrag(thisTouch);
                    }
                }
            }
        }
    }

    var handleUp = function(event){

        if (event && event.touches){
            var touches = event.changedTouches;

            for (var i=0; i < touches.length; i++) {
                var touch = touches[i];
                endTouch(getTouchIndex(touch.identifier));
            }

            if (event.touches.length == 0){
                resetInput();
            }
        }else{
            endTouch(getTouchIndex("notouch"));
            resetInput();
        }

        function endTouch(touchIndex){
            if (touchIndex>=0){
                var thisTouch =touchData.touches[touchIndex];
                if (thisTouch.UIobject && thisTouch.UIobject.element){
                    var elm = thisTouch.UIobject.element;
                    if (elm.onClick) elm.onClick(thisTouch);
                    if (elm.onUp) elm.onUp(thisTouch);
                }
                touchData.touches.splice(touchIndex, 1);
            }
        }

        function resetInput(){
            Input.isDown(false);
            Input.isUp(false);
            Input.isLeft(false);
            Input.isRight(false);
        }
    };

    var handleMouseWheel = function(event){

        if (touchData.currentMouseX){
            var delta = event.wheelDelta || -event.detail;

            var _x = touchData.currentMouseX/scaleFactorW;
            var _y = touchData.currentMouseY/scaleFactorH;
            var UIobject =  UI.getEventElement(_x,_y);


            if (UIobject && UIobject.element && UIobject.element.onMouseWheel){
                UIobject.element.onMouseWheel(delta);
            }
        }
    };


    return self;
}());






;var requestAnimFrame = (function(){
    return window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback, element){
            window.setTimeout(function(){
                callback(+new Date);
            }, 1000 / 60);
        };
})();

var cancelAnimFrame = (function () {
    return window.cancelAnimationFrame ||
        window.webkitCancelAnimationFrame ||
        window.mozCancelAnimationFrame ||
        window.oCancelAnimationFrame ||
        function (id) {
            window.clearTimeout(id);
        };
})();

window.performance = window.performance || {};
performance.now = (function() {
    return performance.now       ||
        performance.mozNow    ||
        performance.msNow     ||
        performance.oNow      ||
        performance.webkitNow ||
        function() {
            return new Date().getTime();
        };
})();

// predictable random generator
// we want to full game to be reproducable given the same seed
var randomSeed = 1;
function random() {
    var x = Math.sin(randomSeed++) * 10000;
    return x - Math.floor(x);
}


function Maybe(callback,probability){
    if (isNaN(probability)) probability = 1;
    if (random() <= probability) callback();
}

// caveat: when arrays are created in a different context (other frame or window) this won't work.
function typeOf(value) {
    var s = typeof value;
    if (s === 'object') {
        if (value) {
            if (value instanceof Array) {
                s = 'array';
            }
        } else {
            s = 'null';
        }
    }
    return s;
}

function isArray(a){
    return typeOf(a) == "array";
}

function isBoolean(o){
    return typeOf(o) == "boolean";
}

function isFunction(o){
    return typeOf(o) == "function";
}

function isDefined(o){
    return typeOf(o) != "undefined";
}

function isNumeric(o){
    return !isNaN(o);
}


function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}
;//global vars
var canvas;
var ctx;
var map = [];
var sprites = [];
var spriteNames = {};

var DIRECTION = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    LEFTUP:3738,
    RIGHTUP:3938,
    LEFTDOWN: 3740,
    RIGHTDOWN: 3940,
    NONE: 0
};

var DIRECTION_OPPOSITE = {
    37: DIRECTION.RIGHT,
    38: DIRECTION.DOWN,
    39: DIRECTION.LEFT,
    40: DIRECTION.UP
};

var ANIMATION = {
    PUSH_RIGHT : "PushRight",
    PUSH_LEFT : "PushLeft",
    PUSH_UP : "PushUp",
    PUSH_DOWN : "PushDown"
};

var SCALING = {
    NONE: 0,
    FIT_WIDTH: 1,
    FIT_HEIGHT: 2,
    CONTAIN: 3,
    STRETCH: 4
};

var MAPLAYERTYPE = {
    GRID: 1,
    SPOT: 2,
    FREE: 3
};

var MAPOBJECTTYPE = {
    GRID : 1,
    FIXED: 2,
    FREE: 3
};var GameObjectIndex = [];
var GameObject = function(properties){

    var hasFunction = false;
    for (var key in properties){
        this[key] = properties[key];
        if (typeof properties[key] == "function") hasFunction=true;
    }

    this.setDefault("canMove",false);
    this.setDefault("canBeCollected",false);
    this.setDefault("canFall",false);
    this.setDefault("isStableSurface",true);

    if (this.canFall){
        this.setDefault("onFallen",function(object,on){
            if (!on.isMoving() && on.gameObject.canBeCrushedBy && on.gameObject.canBeCrushedBy(object)){
                object.move(DIRECTION.DOWN);
                if (on.gameObject.onCrushed) on.gameObject.onCrushed(object,on);
            }
        });
    }

    this.spriteIndex = this.id;
    if (properties.spriteIndex) this.spriteIndex = properties.spriteIndex;
    this.spriteIndexes = properties.spriteIndexes;


    if (!isNumeric(this.spriteIndex)){

        var index = spriteNames[this.spriteIndex];
        if (index >= 0){
            this.spriteIndex = index;
            console.error("GameObject " + this.code + " set tot sprite " + index)
        }else{
            console.error("Warning: GameObject " + this.code + " doesn't seem to have a sprite!")
        }
    }

    // simple animation system;
    this.animationFrames = {};
    if (properties.animationRight) this.animationFrames[DIRECTION.RIGHT] = properties.animationRight;
    if (properties.animationLeft) this.animationFrames[DIRECTION.LEFT] = properties.animationLeft;
    if (properties.animationUp) this.animationFrames[DIRECTION.UP] = properties.animationUp;
    if (properties.animationDown) this.animationFrames[DIRECTION.DOWN] = properties.animationDown;

    this.isGameObject = true;
    this.inActive = !(this.canMove || this.canFall || hasFunction);

    GameObjects[this.id] = this;
    GameObjects[this.code] = this;
    GameObjectIndex.push(this);

    if (this.alias){
        if (typeof this.alias == "string"){
            GameObjects[this.alias] = this;
        }else{
            for (var i = 0; i< this.alias.length; i++){
                GameObjects[this.alias[i]] = this;
            }
        }
    }
};

GameObject.prototype.getAnimationFrame = function(animation,step){
    var frame = this.spriteIndex;
    if (animation){
        var index = Math.min(step,animation.length-1);
        frame = animation[index];
    }
    return sprites[frame];
};

GameObject.prototype.getStaticFrame = function(){
    var frame = this.spriteIndex;
    if (this.spriteIndexes && this.spriteIndexes.length>0){
            frame = this.spriteIndexes[Math.floor(Math.random() * this.spriteIndexes.length)];
    }
    return frame;
};


GameObject.prototype.isEmpty = function(){
    return (this.id == 0);
};

GameObject.prototype.isPlayer = function(){
    return (this.id == GameObjects.PLAYER.id);
};

GameObject.prototype.setDefault = function(property,value){
    if (typeof this[property] == "undefined") this[property]=value;
};








;var MapPosition = function(gameObject,index,mapLayer){
    this.gameObject = gameObject;
    this.id = gameObject.id;
    this.index = index;
    this.staticFrame = gameObject.getStaticFrame();
    this.mapLayer = mapLayer;

    this.left = index % mapLayer.levelWidth;
    this.top = Math.floor(index / mapLayer.levelWidth);

    // override this if you want certain tiles to move faster/slower
    this.tileSize = Game.getTileSize();
    this.tickOffset = this.tileSize/Game.getTargetTicksPerSecond();
};

MapPosition.prototype.isVisible = function(scrollOffset){

    return this.left >= scrollOffset.tileX-1
        && this.left < scrollOffset.tileX+Game.getViewPort().width+1
        && this.top >= scrollOffset.tileY-1
        && this.top < scrollOffset.tileY+Game.getViewPort().height+1;
};

MapPosition.prototype.render = function(step,scrollOffset,layer){



    var x = (this.left-scrollOffset.tileX) * this.tileSize;
    var y = (this.top-scrollOffset.tileY) * this.tileSize;

    if (!isDefined(layer)) layer = 1;

    x += scrollOffset.x*step;
    y += scrollOffset.y*step;

    var baseX = x;
    var baseY = y;

    if (this.moveDirection == DIRECTION.DOWN){
        y += step*this.tickOffset;
    }

    if (this.moveDirection == DIRECTION.UP){
        y -= step*this.tickOffset;
    }

    if (this.moveDirection == DIRECTION.LEFT){
        x -= step*this.tickOffset;
    }

    if (this.moveDirection == DIRECTION.RIGHT){
        x += step*this.tickOffset;
    }

    if (this.bottomlayer && this.mapLayer.id == "bottom"){
        frame = sprites[this.bottomlayer];
        ctx.drawImage(frame,baseX, baseY);
    }else{
        if (this.id>0){
            var frame;
            if (this.animation){
                frame = this.gameObject.getAnimationFrame(this.animation, step + this.animationStartFrame);
            }else{
                frame = sprites[this.staticFrame];
            }

            ctx.drawImage(frame,x, y);
        }

        if (this.toplayer){
            frame = sprites[this.toplayer];
            ctx.drawImage(frame,baseX, baseY);
        }
    }




};

MapPosition.prototype.process = function(){
    if (this.processed) return;

    var me = this;
    var obj = me.gameObject;
    var targetObject;
    if (obj.inActive) return; // inanimate object, don't bother;

    if (obj.isPlayer()){
        var d, u, l, r;

        if (Input.isAction()){
            this.actionDownCount = (this.actionDownCount || 0) + 1;
            if (this.actionDownCount>5 && this.gameObject.onLongPress){
                this.gameObject.onLongPress(this);
            }

            if (Input.isDown())  d = this.zapIfPossible(DIRECTION.DOWN);
            if (Input.isUp())    u = this.zapIfPossible(DIRECTION.UP);
            if (Input.isLeft())  l = this.zapIfPossible(DIRECTION.LEFT);
            if (Input.isRight()) r = this.zapIfPossible(DIRECTION.RIGHT);
        }else{
            this.actionDownCount = 0;
            if (Input.isDown())  d = this.moveIfPossible(DIRECTION.DOWN);
            if (Input.isUp())    u = this.moveIfPossible(DIRECTION.UP);
            if (Input.isLeft())  l = this.moveIfPossible(DIRECTION.LEFT);
            if (Input.isRight()) r = this.moveIfPossible(DIRECTION.RIGHT);
        }

        targetObject = d || u || l || r;

        if (targetObject){
                var direction = undefined;
                if (d) direction = DIRECTION.DOWN;
                if (u) direction = DIRECTION.UP;
                if (l) direction = DIRECTION.LEFT;
                if (r) direction = DIRECTION.RIGHT;

                if (targetObject.gameObject.onCollected){
                    targetObject.gameObject.onCollected(this,targetObject,direction);
                }

                if (Input.isAction()){
                    // object is zapped;
                    targetObject.transformInto(Game.getSettings().defaultGameObject);
                }
        }

        if (!this.isMoving()){
            if (Input.isRight()){
                targetObject = this.getObject(DIRECTION.RIGHT);
                if (targetObject.gameObject.canBePushed && targetObject.gameObject.canBePushed.horizontal){
                    this.animate(ANIMATION.PUSH_RIGHT);
                    if (targetObject.canMove(DIRECTION.RIGHT) && !(targetObject.gameObject.canFall && targetObject.canMove(DIRECTION.DOWN))) {
                        Maybe(function(){
                            targetObject.move(DIRECTION.RIGHT);
                            me.move(DIRECTION.RIGHT);
                        },1-targetObject.gameObject.canBePushed.friction);

                    }
                }
            }
            if (Input.isLeft()){
                targetObject = this.getObject(DIRECTION.LEFT);
                if (targetObject.gameObject.canBePushed && targetObject.gameObject.canBePushed.horizontal){
                    this.animate(ANIMATION.PUSH_LEFT);
                    if (targetObject.canMove(DIRECTION.LEFT) && !(targetObject.gameObject.canFall && targetObject.canMove(DIRECTION.DOWN))){
                        Maybe(function(){
                            targetObject.move(DIRECTION.LEFT);
                            me.move(DIRECTION.LEFT);
                        },1-targetObject.gameObject.canBePushed.friction);

                    }
                }
            }

            if (Input.isUp()){
                targetObject = this.getObject(DIRECTION.UP);
                if (targetObject.gameObject.canBePushed && targetObject.gameObject.canBePushed.vertical){
                    this.animate(ANIMATION.PUSH_UP);
                    if (targetObject.canMove(DIRECTION.UP)){
                        Maybe(function(){
                            targetObject.move(DIRECTION.UP);
                            me.move(DIRECTION.UP);
                        },1-targetObject.gameObject.canBePushed.friction);

                    }
                }
            }

            if (Input.isDown()){
                targetObject = this.getObject(DIRECTION.DOWN);
                if (targetObject.gameObject.canBePushed && targetObject.gameObject.canBePushed.vertical){
                    this.animate(ANIMATION.PUSH_DOWN);
                    if (targetObject.canMove(DIRECTION.DOWN)){
                        Maybe(function(){
                            targetObject.move(DIRECTION.DOWN);
                            me.move(DIRECTION.DOWN);
                        },1-targetObject.gameObject.canBePushed.friction);
                    }
                }
            }
        }

    }else{
        if (obj.canFall) this.moveIfPossible(DIRECTION.DOWN);
        if (!this.isMoving() && !this.wasMoving()){
            if (obj.canFall && !this.getObject(DIRECTION.DOWN).gameObject.isStableSurface){
                var canFallLeft = this.canMove(DIRECTION.LEFTDOWN);
                var canFallRight = this.canMove(DIRECTION.RIGHTDOWN);

                if (canFallLeft && canFallRight){
                    this.move(Game.getRandomHorizontalDirection());
                }

                if (!this.isMoving()){
                    if (canFallLeft) this.move(DIRECTION.LEFT);
                    if (canFallRight) this.move(DIRECTION.RIGHT);
                }
            }
        }
    }

    if (this.wasMoving() && !this.isMoving()){
        // object stopped moving
        if (this.wasMovingToDirection == DIRECTION.DOWN){
            // object has fallen onto something;
            targetObject = this.getObject(DIRECTION.DOWN);
            if (obj.onFallen) obj.onFallen(this,targetObject);
            if (targetObject.gameObject.onHit) targetObject.gameObject.onHit(this,DIRECTION.DOWN,targetObject);
        }
    }

    //if (!this.isMoving()){
        if (obj.eachStep) {
            obj.eachStep(this);
        }
    //}


    if (this.isMoving() && !obj.isPlayer()){
        targetObject = this.getObject(this.moveDirection);
        if (targetObject.gameObject.onCollected && !targetObject.isMoving()){
            targetObject.gameObject.onCollected(obj,targetObject,this.moveDirection)
        }
    }

    this.processed = true;


};

MapPosition.prototype.fullStep = function(step){
    if (this.next){
        for (var key in this.next){
            this[key] = this.next[key];
        }
        this.gameObject = GameObjects[this.id];
        this.staticFrame = this.gameObject.getStaticFrame();
        this.wasMovingToDirection = this.movingInToDirection;
        if (this.id == GameObjects.PLAYER.id) this.mapLayer.setPlayerObject(this);
        this.animation = false;
    }else{
        this.wasMovingToDirection = undefined;
    }

    if (this.animation){
        if (this.animation.length > this.animationStartFrame + step + 1){
            this.animationStartFrame = this.animationStartFrame + step + 1;
        }else{
            this.animation = false;
        }
    }

    this.reset();

    if (this.action){
        this.action(this);
        this.action = undefined;
    }
};

MapPosition.prototype.reset = function(){
    this.moveDirection = undefined;
    this.next = undefined;
    this.movingInToDirection = undefined;
    this.processed = false;
};

MapPosition.prototype.setNext= function(property,value){
    this.next = this.next || {};
    this.next[property] = value;
};

MapPosition.prototype.getObject = function(direction){
    var width = this.mapLayer.levelWidth;
    var map = this.mapLayer.objects;
    switch (direction){
        case DIRECTION.DOWN: return map[this.index + width]; break;
        case DIRECTION.UP: return map[this.index - width]; break;
        case DIRECTION.LEFT: return map[this.index -1]; break;
        case DIRECTION.RIGHT: return map[this.index +1]; break;
        case DIRECTION.LEFTDOWN: return map[this.index -1 + width]; break;
        case DIRECTION.RIGHTDOWN: return map[this.index +1 + width]; break;
        case DIRECTION.LEFTUP: return map[this.index -1 - width]; break;
        case DIRECTION.RIGHTUP: return map[this.index +1 - width]; break;
        case DIRECTION.NONE: return map[this.index]; break;
    }
};

MapPosition.prototype.canMove = function(direction){
    // object is already moving
    if (this.isMoving()) return false;

    var targetObject
    if (direction > 100){
        // combined direction
        if (direction == DIRECTION.LEFTDOWN){
            var l = this.getObject(DIRECTION.LEFT);
            var d = this.getObject(DIRECTION.LEFTDOWN);
            if (l.next || d.next) return false;
            if (this.gameObject.canMoveTo(l,DIRECTION.LEFT) && this.gameObject.canMoveTo(d,DIRECTION.DOWN)) return true;
        }
        if (direction == DIRECTION.RIGHTDOWN){
            var r = this.getObject(DIRECTION.RIGHT);
            var d = this.getObject(DIRECTION.RIGHTDOWN);
            if (r.next || d.next) return false;
            if (this.gameObject.canMoveTo(r,DIRECTION.RIGHT) && this.gameObject.canMoveTo(d,DIRECTION.DOWN)) return true;
        }
    }else{
        // targetobject is accepting a moving object
        targetObject = this.getObject(direction);
        if (targetObject){
            if (targetObject.next && targetObject.next.id) return false;

            if (this.gameObject.canMoveTo(targetObject,direction)){
                return true;
            }
        }else{
            console.error("could not get object in direction" + direction,this);
        }

    }

    return false;

};

MapPosition.prototype.canMoveLeft = function(){
    return this.canMove(DIRECTION.LEFT);
};

MapPosition.prototype.canMoveRight = function(){
    return this.canMove(DIRECTION.RIGHT);
};

MapPosition.prototype.canMoveUp = function(){
    return this.canMove(DIRECTION.UP);
};

MapPosition.prototype.canMoveDown = function(){
    return this.canMove(DIRECTION.DOWN);
};

MapPosition.prototype.isMoving = function(){
    return !!this.moveDirection;
};

MapPosition.prototype.wasMoving = function(){
    return !!this.wasMovingToDirection;
};

MapPosition.prototype.sameDirection = function(){
    return this.wasMovingToDirection;
};

MapPosition.prototype.move = function(direction){
    this.moveDirection = direction;
    var nextObjectId = this.nextObjectId || 0;
    this.setNext("id",nextObjectId);
    this.nextObjectId = undefined;
    this.animate(direction);
    if (this.onMove){
        this.onMove(this);
        this.onMove = undefined;
    }

    var targetObject = this.getObject(direction);
    targetObject.setNext("id",this.id);
    targetObject.setNext("_objectProperties",this._objectProperties);
    targetObject.movingInToDirection = direction;

    return targetObject;
};

MapPosition.prototype. moveIfPossible = function(direction){
    if (this.canMove(direction)) {
        return this.move(direction);
    }else{
        return false;
    }
};

MapPosition.prototype.moveLeftIfPossible = function(){
    this.moveIfPossible(DIRECTION.LEFT);
};
MapPosition.prototype.moveRightIfPossible = function(){
    this.moveIfPossible(DIRECTION.RIGHT);
};
MapPosition.prototype.moveUpIfPossible = function(){
    this.moveIfPossible(DIRECTION.UP);
};
MapPosition.prototype.moveDownIfPossible = function(){
    this.moveIfPossible(DIRECTION.DOWN);
};
MapPosition.prototype.animate = function(animation){

    if (typeof animation == "string" || typeof animation == "number"){
        this.animation = this.gameObject[animation];
        if (!this.animation) this.animation = this.gameObject["animation" + animation];
        if (!this.animation) this.animation = this.gameObject.animationFrames[animation];
        if (!this.animation) this.animation = this.gameObject.animationFrames["animation" + animation];
    }else{
        this.animation = animation
    }

    this.animationStartFrame = 0;
};

MapPosition.prototype.zapIfPossible = function(direction){

    var targetObject = false;
    if (this.canMove(direction)) {
        targetObject = this.getObject(direction);
    }
    return targetObject;
};

MapPosition.prototype.animateIfPossible = function(animation){
    if (!this.isAnimating()) this.animate(animation)
};

MapPosition.prototype.isAnimating = function(){
    return this.animation;
};

MapPosition.prototype.isNextTo = function(object){
    var l = this.getObject(DIRECTION.LEFT).gameObject.id;
    var r = this.getObject(DIRECTION.RIGHT).gameObject.id;
    var d = this.getObject(DIRECTION.DOWN).gameObject.id;
    var u = this.getObject(DIRECTION.UP).gameObject.id;

    var id = object.id;

    return ((l == id) || (u == id) || (r == id) || (d == id))
};


MapPosition.prototype.refresh = function(){
    this.setNext("id",this.id);
};

MapPosition.prototype.transformInto = function(gameObject,animation,onComplete){
    this.setNext("id",gameObject.id);
    if (animation) this.animate(animation);
    if (onComplete) this.setNext("action",onComplete)
};

MapPosition.prototype.addLayer = function(spriteIndex,position){
    if (position == "bottom"){
        this.bottomlayer = spriteIndex;
        var bottomLayer = Map.getLayer("bottom");
        if (!bottomLayer) {
            bottomLayer = Map.addLayer({
                id: "bottom",
                zIndex: 0,
                type: MAPLAYERTYPE.SPOT,
                parentLayer: this.mapLayer});
            Map.sortLayers();
        }

        var bottomThis = new MapPosition(this.gameObject,this.index,bottomLayer);
        bottomLayer.addObject(bottomThis,MAPOBJECTTYPE.GRID);
    }else{
       this.toplayer = spriteIndex;
    }
};

MapPosition.prototype.removeLayer = function(position){
    if (position == "bottom"){
        this.bottomlayer = undefined;
        var bottomLayer = Map.getLayer("bottom");
        if (bottomLayer) bottomLayer.removeObject(this);
    }else{
        this.toplayer = undefined;
    }
};

MapPosition.prototype.hasLayer = function(position){
    if (position == "bottom"){
        return this.bottomlayer != undefined;
    }else{
        return this.toplayer != undefined;
    }
};

MapPosition.prototype.objectProperties = function(){
    this._objectProperties = this._objectProperties || {};
    return this._objectProperties;
};

MapPosition.prototype.getExplodeIntoObjects = function(){
    var obj = Game.getSettings().defaultGameObject;
    if (this.gameObject.explodeIntoObjects) obj = this.gameObject.explodeIntoObjects();
    if (this.gameObject.explodeIntoObject) obj = this.gameObject.explodeIntoObject;
    return obj;
};



;UI.Button = function(properties){
    var self = this;

    for (var key in properties){
        this[key] = properties[key];
    }

    this.image = new Image();
    this.image.onload = function() {
        if (!isDefined(self.width)) self.width = this.width;
        if (!isDefined(self.height)) self.height = this.height;
        if (!self.states){
            // button with 1 state
            self.states = [[0,0,self.width,self.height]];
        }
        if (!isDefined(self.initialState)) self.initialState=0;
        self.state = self.states[self.initialState];
        self.imageLoaded = true;
        self.setPosition();
    };
    this.image.src = this.url;

};

UI.Button.prototype.setSate = function(index){
    this.state = this.states[index];
};

UI.Button.prototype.setPosition = function(){
    if (!isDefined(this.left)) this.left = this.right - this.width;
    if (!isDefined(this.right)) this.right = this.left + this.width;
    if (!isDefined(this.top)) this.top = this.bottom - this.height;
    if (!isDefined(this.bottom)) this.bottom = this.top + this.height;
};

UI.Button.prototype.render = function(){
    if (this.imageLoaded){
        ctx.drawImage(this.image,this.state[0],this.state[1],this.state[2],this.state[3],this.left,this.top,this.width,this.height);
        UI.registerEventElement(this,this.left,this.top,this.right,this.bottom);
    }
};;UI.GameController = function(image){
    var self = this;
    this.sprites = [];
    this.state = 0;

    this.image = new Image();
    this.image.onload = function() {
        self.tileSize = this.height;
        for (var i = 0; i<5; i++){
            var controllerSprite = new Sprite(this,i,self.tileSize);
            self.sprites.push(controllerSprite);
        }
        self.imageLoaded = true;
        self.setPosition();
    };
    this.image.src = image;

    this.onDown = function(touchData){
        processInput(touchData.x,touchData.y);
    };

    this.onDrag = function(touchData){
        processInput(touchData.x,touchData.y);
    };

    this.onUp = function(touchData){
        resetInput();
    };

    var resetInput = function(){
        self.state = DIRECTION.NONE;
        Input.isLeft(false);
        Input.isRight(false);
        Input.isUp(false);
        Input.isDown(false);
    };

    var processInput = function(x,y){
        resetInput();
        x = x-self.left;
        y = y-self.top;
        var margin = 16;
        var half = self.tileSize/2;

        if (x < half - margin) {Input.isLeft(true);    self.state = DIRECTION.LEFT;}
        if (x > half + margin) {Input.isRight(true);   self.state = DIRECTION.RIGHT;}
        if (y < half - margin) {Input.isUp(true);      self.state = DIRECTION.UP;}
        if (y > half + margin) {Input.isDown(true);    self.state = DIRECTION.DOWN;}
    }
};


UI.GameController.prototype.setPosition = function(){
    this.top = canvas.height - 150;
    this.left = 10;
    this.right = this.left + this.tileSize;
    this.bottom = this.top + this.tileSize;
};

UI.GameController.prototype.render = function(){
    if (this.imageLoaded){
        var spriteIndex = Math.max(this.state - DIRECTION.LEFT + 1,0);
        ctx.drawImage(this.sprites[spriteIndex],this.left,this.top);
        UI.registerEventElement(this,this.left,this.top,this.right,this.bottom);
    }
};;UI.Listbox = function(properties){
    var self = this;
    this.items = properties.items;
    this.onSelect = properties.onSelect;
    this.onResize = properties.onResize;
    this.scrollOffetY = properties.scrollY || 0 ;
    this.scrollDeltaY = 0;
    this.scrollSpeed = 0;
    this.scrollElastic = 0;
    this.scrollHistory = [];
    this.scrollThreshold = 5;

    this.itemHeight = properties.itemHeight || 64;

    this.top = properties.top;
    this.left = properties.left || 100;
    this.width = properties.width || 400;
    this.height = properties.height || 400;

    this.minScollPosition = 0;
    this.maxScrollPosition = (this.items.length * this.itemHeight) - this.height;

    this.preserveState = properties.preserveState || function(){};

    var onDrag = function(touchData){
        var delta = touchData.y - touchData.startY;
        self.scrollDeltaY = parseInt(delta);
    };

    var onUp = function(touchData){
        if (Math.abs(self.scrollDeltaY) < self.scrollThreshold){
            self.onSelect(touchData.UIobject.element);
        }else{
            self.scrollElastic = 20;
            var initialScrollSpeed = 0-(getInitialScrollSpeed()/10);

            // calculate target position
            var currentPosition = self.scrollOffetY + self.scrollDeltaY;

            // som van reeks 1 .. 20
            var sum = ((1+self.scrollElastic)*self.scrollElastic)/2;
            var targetPosition =  currentPosition + (sum * initialScrollSpeed);

            // check if target position is in boundary
            if (targetPosition>self.minScollPosition){
                // targetPosition towards 0
                initialScrollSpeed = self.minScollPosition-(currentPosition/sum);
                targetPosition = self.minScollPosition;
            }

            if (targetPosition< (0-self.maxScrollPosition)){
                initialScrollSpeed = ((0-currentPosition)-self.maxScrollPosition)/sum;
                targetPosition = 0-self.maxScrollPosition;
            }

            self.preserveState("scrollY",targetPosition);
            self.scrollSpeed = initialScrollSpeed;


        }

        self.scrollOffetY += self.scrollDeltaY;
        self.scrollDeltaY = 0;
        self.scrollHistory = [];
    };

    var onMouseWheel = function(delta){
        var targetPosition = limitScroll(self.scrollOffetY + delta/3);
        self.scrollOffetY = targetPosition;
    };

    var getInitialScrollSpeed = function(){
        var speed = 0;
        var h = self.scrollHistory;

        if (h.length>0){
            var d = 0;
            var deltaSameDirection = [];
            var i;
            for (i = 0;i<h.length;i++){
                var _h = h[i];
                if (_h == 0 ){
                    deltaSameDirection.push(_h);
                }else{
                   if (d==0) d=_h;
                   if (sameSign(d,_h)){
                       deltaSameDirection.push(_h);
                   }else{
                       break;
                   }
                }
            }
            if (deltaSameDirection.length>0){
                var sum = 0;
                for (i = 0;i<deltaSameDirection.length;i++){
                    sum += deltaSameDirection[i];
                }
                speed = sum/deltaSameDirection.length;
            }
            return speed;
        }

    };

    function limitScroll(targetPosition){

        // check if target position is in boundary
        if (targetPosition>self.minScollPosition){
            // targetPosition towards 0
            targetPosition = self.minScollPosition;
        }

        if (targetPosition< (0-self.maxScrollPosition)){
            targetPosition = 0-self.maxScrollPosition;
        }

        return targetPosition;
    }

    function sameSign(a,b){
        return (a?a<0?-1:1:0) == (b?b<0?-1:1:0)
    }


    for (var i= 0, len= this.items.length; i<len; i++){
        this.items[i].onUp = onUp;
        this.items[i].onDrag = onDrag;
        this.items[i].onMouseWheel = onMouseWheel;
    }

};

UI.Listbox.prototype.render = function(){

    this.scrollOffetY = this.scrollOffetY + (this.scrollElastic * this.scrollSpeed);
    var y = this.top + this.scrollOffetY + this.scrollDeltaY;
    var x = this.left;
    var itemHeight = this.itemHeight;
    var itemWidth = this.width;

    var lineTop = itemHeight-10;
    var lineHeight = 0.5;

    if (this.scrollElastic > 0) this.scrollElastic -= 1;

    this.prevScrollDeltaY = this.prevScrollDeltaY || 0;
    var d = this.prevScrollDeltaY - this.scrollDeltaY;

    this.scrollHistory.unshift(d);
    if (this.scrollHistory.length > 10) this.scrollHistory.pop();
    this.prevScrollDeltaY = this.scrollDeltaY;


    for (var i= 0, len= this.items.length; i<len; i++){
        renderItem(this.items[i]);
    }

    function renderItem(item){
        y += itemHeight;
        var frame = sprites[item.icon];

        ctx.fillStyle = "Black";
        ctx.clearRect(x,y+lineTop,itemWidth,lineHeight); // why is this white?

        ctx.drawImage(frame,x, y);

        ctx.fillStyle = "Grey";
        ctx.font      = "normal 10pt Arial";
        ctx.fillText(item.name, x + 40, y + 16);

        UI.registerEventElement(item,x,y,x+itemWidth,y+itemHeight);
    }
};