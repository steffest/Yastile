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
    var frameInterval = Math.floor(1000/targetFps);
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
    var debugInfo = [];

    var currentTickFunction = function(){};

    self.init = function(properties){

        settings = properties;

        var randomSeed = new Date().getTime();
        settings.seed =  randomSeed;

        if (properties.targetFps){
            targetFps = properties.targetFps;
            frameInterval = Math.floor(1000/targetFps);
            if (targetFps >= 60) frameInterval = 0;
        }

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
            var targetWidth = properties.viewPortWidth;
            var targetHeight =  properties.viewPortHeight;
            if (properties.tileSize){
                targetWidth = targetWidth * properties.tileSize;
                targetHeight =  targetHeight * properties.tileSize;
            }
            canvas.width  = targetWidth;
            canvas.height = targetHeight;

            scorePosition.hintTop = 0;
            scorePosition.hintLeft = 200;
        }


        document.body.appendChild(canvas);

        tileSize = properties.tileSize;
        properties.borderScrollOffset = 8;

        var preloadResources = [
            {id: "spritesheet", url: properties.spriteSheet}
        ];
        if (settings.backgroundImage) preloadResources.push({id: "backGroundImage", url: settings.backgroundImage});

        if (settings.preload) preloadResources = preloadResources.concat(settings.preload);

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
                    backgroundPattern = ctx.createPattern(sprites[settings.backgroundPattern].canvas, 'repeat');
                }

                if (!backgroundPattern) backgroundPattern = "Black";

                if (settings.backgroundImage){
                        backgroundImage = document.createElement("canvas");
                        backgroundImage.width = canvas.width;
                        backgroundImage.height = canvas.height;

                        var context = backgroundImage.getContext("2d");
                        context.globalAlpha = settings.backgroundImageAlpha || 1;

                        var w = Resources.images.backGroundImage.width;
                        var h = Resources.images.backGroundImage.height;

                        if (settings.backgroundScale){
                            w = backgroundImage.width;
                            h = backgroundImage.height;
                        }

                        context.drawImage(Resources.images.backGroundImage, 0, 0,w,h);
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
        UI.removeAllElements(false);
        if (settings.showOnScreenControls){
            gameController = new UI.GameController(settings.onScreenControls);
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

        var targetWidth = settings.originalViewPortWidth;
        var targetHeight = settings.originalViewPortHeight;
        if (settings.tileSize){
            targetWidth = targetWidth * settings.tileSize;
            targetHeight = targetHeight * settings.tileSize;
        }
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
                var fitHeight = Math.ceil(aspectRatio*targetWidth);
                if (settings.tileSize) fitHeight = Math.ceil((aspectRatio*targetWidth)/settings.tileSize);
                if (fitHeight < settings.originalViewPortHeight){
                    aspectRatio = window.innerWidth/window.innerHeight;
                    targetWidth = aspectRatio*targetHeight;
                }else{
                    targetHeight = aspectRatio*targetWidth;
                }
                break;
        }

        if (settings.tileSize){
            // align to grid
            settings.viewPortWidth = Math.ceil(targetWidth/settings.tileSize);
            settings.viewPortHeight = Math.ceil(targetHeight/settings.tileSize);
        }

        settings.canvasWidth = targetWidth;
        settings.canvasHeight = targetHeight;

        canvas.width  = targetWidth;
        canvas.height = targetHeight;

        if (gameController) gameController.setPosition();

        scorePosition.left = 0;
        scorePosition.top = 0;

        scorePosition.hintTop = 0;
        scorePosition.hintLeft = 0;

        if (settings.showScore) scorePosition.hintLeft = 150;

        if (settings.showFPS){
            scorePosition.left = 200;
            scorePosition.hintLeft += 200;

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
        if (settings.showStats) stats.begin();
        var delta = now - lastTickTime;

        if (delta >= frameInterval) {
            tick();
            tickps = 1000/(now-lastTickTime);
            lastTickTime = now;
        }

        fps = 1000/(now-lastTime);
        lastTime = now;

        if (settings.showScore) drawScore();
        if (settings.showFPS) drawFPS();
        if (settings.showHint) drawHint();
        if (settings.showStats) stats.end();

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

        UI.renderElements();

        if (settings.showDebug) drawDebug();

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
        if (_targetScore) ctx.fillText("Needed: " + _targetScore , scorePosition.left + 80, scorePosition.top + 16);
    }

    function drawHint(){
        ctx.fillStyle = "Black";
        ctx.fillRect(scorePosition.hintLeft,scorePosition.hintTop,300,24);
        ctx.fillStyle = "White";
        ctx.font      = "normal 10pt Arial";
        ctx.fillText(_hint , scorePosition.hintLeft + 10, scorePosition.hintTop + 16);
    }


    self.addDebugRect = function(color,x,y,width,height,persistent){
        if (!settings.showDebug) return;
        self.addDebugInfo(DEBUGINFOTYPE.RECT,[color,x,y,width,height],persistent);
    };

    self.addDebugInfo = function(type,data,persistent){
        if (!settings.showDebug) return;
        debugInfo.push({
            type: type,
            data: data,
            persistent: persistent
        })
    };

    function drawDebug(){
        var persistentDebugInfo = [];
        for (var i= 0,l=debugInfo.length;i<l;i++){
            var info = debugInfo[i];
            if (info && info.type == DEBUGINFOTYPE.RECT){
                ctx.beginPath();
                ctx.lineWidth="1";
                ctx.strokeStyle=info.data[0];
                ctx.rect(info.data[1],info.data[2],info.data[3],info.data[4]);
                ctx.closePath();
                ctx.stroke();
            }
            if (info.persistent) persistentDebugInfo.push(info);
        }
        debugInfo = persistentDebugInfo;
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
        if (typeof GameObjects != "undefined" && GameObjects.resetState) GameObjects.resetState();
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
        var layer;

        loadUrl(url,function(data){
            if (!data.layers){
                // single layer level
                data.id = "layer1";
                data.zIndex = 1;
                layer = self.addLayer(data);
            }else{
                for (var i = 1; i<=data.layers.length; i++){
                    var layerData = data.layers[i-1];
                    layerData.id = "layer" + i;
                    layerData.zIndex = i;
                    layer = self.addLayer(layerData);
                }
            }

            if (callback) callback(layer);
        })
    };

    self.addLayer = function(properties){

        var layerType = undefined;

        if (properties.type) layerType=properties.type;
        if (!layerType && properties.map) layerType=MAPLAYERTYPE.GRID;
        if (!layerType && properties.src) layerType=MAPLAYERTYPE.IMAGE;
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

            me.imgTiles = [];


            // cut large image in pieces

            me.imgTileSize = me.imgTileSize || 100;
            me.imgTileWidth = Math.floor(img.width/me.imgTileSize);
            me.imgTileHeight = Math.floor(img.height/me.imgTileSize);

            var maxSprites = me.imgTileWidth * me.imgTileHeight;
            for (var i=0;i<maxSprites;i++){
                var s = new Sprite(img,i,me.imgTileSize);
                me.imgTiles.push(s);
            }

            console.error("image layer is cut into " + maxSprites + " tiles");

            //me.sprite = new Sprite(img,"",0,0,img.width,img.height);
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
        if (this.eachStep) this.eachStep();
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

    /*if (this.sprite){
        if (this.tileSize){
            this.scrollPixelX = this.scrollTilesX*this.tileSize + (this.scrollOffsetX*this.step);
            this.scrollPixelX = this.scrollTilesY*this.tileSize + (this.scrollOffsetY*this.step);
        }else{
            var x = 0 - this.scrollPixelX;
            var y = 0 - this.scrollPixelY;
        }

        var w = canvas.width;
        var h = canvas.height;
        ctx.drawImage(this.sprite.canvas,this.scrollPixelX, this.scrollPixelY,w,h,0,0,w,h);
        //ctx.drawImage(this.sprite.canvas,x, y);
    }*/


    if (this.imgTiles){


        if (this.tileSize){
            this.scrollPixelX = this.scrollTilesX*this.tileSize + (this.scrollOffsetX*this.step);
            this.scrollPixelX = this.scrollTilesY*this.tileSize + (this.scrollOffsetY*this.step);
        }else{
            var x = 0 - this.scrollPixelX;
            var y = 0 - this.scrollPixelY;
        }


        for (var i = 0, len = this.imgTiles.length; i<len;i++){
            var tile = this.imgTiles[i];

            var iY = Math.floor(i/this.imgTileWidth);
            var iX = i % this.imgTileWidth;


            var tileX = iX * this.imgTileSize + x;
            var tileY = iY * this.imgTileSize + y;

            var tileX2 = tileX + this.imgTileSize;
            var tileY2 = tileY + this.imgTileSize;

            // only draw visible tiles
            if (tileX2 > 0
                && tileX<canvas.width
                && tileY2 > 0
                && tileY < canvas.height){
                ctx.drawImage(tile.canvas,tileX, tileY);
            }

        }
    }

    var scrollOffset = this.getScrollOffset();
    for (var i=0, len=this.objects.length;i<len;i++){
        var object = this.objects[i];
        if (object.isVisible(scrollOffset)) object.render(this.step,scrollOffset,0);
    }
};

MapLayer.prototype.cleanUp = function(){
    if (!this.isVisible) return;
    switch (this.type){
        case MAPLAYERTYPE.GRID:
            if (this.step >= (this.targetTicksPerSecond-1)){
                var viewPort = Game.getViewPort();
                // check to see if the map is about to scroll off screen
                if (this.autoScrollDirection && this.onEnd){
                    var ended = false;
                    switch (this.autoScrollDirection){
                        case DIRECTION.DOWN:
                            var canScrollOffscreen = 2;
                            if (this.scrollTilesY < canScrollOffscreen) ended = true;
                            console.error(this.scrollTilesY);
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



;var MapObject = function(properties){
    for (var key in properties){
        this[key] = properties[key];
    }

    this.id = properties.id || this.gameObject.id;
    this.staticFrame = this.gameObject.getStaticFrame();
    var sprite = sprites[this.staticFrame];
    this.height = sprite.canvas.height;
    this.width = sprite.canvas.width;
    this.rotation = this.rotation || 0;
    this.scaleIndex = this.scaleIndex || 1;
    this.flipX = this.flipX ? 1 : 0;
    this.flipY = this.flipY ? 1 : 0;
    this.rotationRadiants = 0;

    if (this.rotation>0){
        var r = this.rotation;
        this.rotation = 0;
        this.rotate(r);
    }
    if (this.gameObject.onCreate){
        this.gameObject.onCreate(this);
    }
};

MapObject.prototype.setStaticFrame = function(spriteIndex){
    this.staticFrame = spriteIndex;
    if (!isNumeric(this.staticFrame)){
        var index = spriteNames[this.staticFrame];
        if (index >= 0){
            this.staticFrame = index;
        }else{
            console.error("Warning: MapObject " + this.id + " doesn't seem to have a sprite!")
        }
    }
    var sprite = sprites[this.staticFrame];
    this.height = sprite.canvas.height;
    this.width = sprite.canvas.width;
};

MapObject.prototype.getCurrentFrame = function(){
    var frame;
    if (this.animation){
        this.animationStartFrame++;
        if (this.animationStartFrame >= this.animation.length) this.animationStartFrame = 0;
        frame = this.gameObject.getAnimationFrame(this.animation, this.animationStartFrame).canvas;
    }else{
        frame = sprites[this.staticFrame].canvas;
    }

    if (this.isTransformed()) {
        frame = sprites[this.staticFrame].transformed[this.getTransformation()];
        if (!frame){
            //console.error('Warning: transformation ' + this.rotation + " is not prerendered for sprite ",sprites[this.staticFrame]);
            frame = sprites[this.staticFrame].canvas;
        }
    }

    return frame;
};

MapObject.prototype.isVisible = function(scrollOffset){
    return true;
};

MapObject.prototype.render = function(step,scrollOffset,layer){

    var offsetX = scrollOffset.pixelX;
    var offsetY = scrollOffset.pixelY;

    if (this.mapLayer.tileSize){
        offsetX = (scrollOffset.tileX * this.mapLayer.tileSize) - (scrollOffset.x * step);
        offsetY = (scrollOffset.tileY * this.mapLayer.tileSize) - (scrollOffset.y * step);
    }

    var x = this.left - offsetX;
    var y = this.top - offsetY;

    if (this.id>0){
        var frame = this.getCurrentFrame();
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


    this.processed = true;

};

MapObject.prototype.fullStep = function(){
    this.processed = false;
    this.collisionChecked = false;
};

MapObject.prototype.destroy = function(){
     this.mapLayer.removeObject(this);
};

MapObject.prototype.detectCollistion = function(onPixelLevel,onCollision,preFilter){
    var originId = this.id;
    var me = this;
    for (var i= 0, len=me.mapLayer.objects.length; i<len; i++){
        var other = me.mapLayer.objects[i];

          var checkObject = true;
          if (preFilter) checkObject = preFilter(other);
          if (
              checkObject &&
              other &&
              other.id != this.id &&
              me.left < other.left + other.width &&
              me.left + this.width > other.left &&
              me.top < other.top + other.height &&
              me.height + me.top > other.top) {
                var isCollision = true;

                Game.addDebugRect("red",me.left-me.mapLayer.scrollPixelX,me.top-me.mapLayer.scrollPixelY,me.width,me.height,false);
                Game.addDebugRect("blue", other.left-me.mapLayer.scrollPixelX,other.top-me.mapLayer.scrollPixelY, other.width,other.height,false);

                if (onPixelLevel){
                    isCollision = false;

                    // first find the intersecting rectangle
                    var x = Math.max(me.left,other.left);
                    var x2 = Math.min(me.left+me.width,other.left+other.width);
                    var w = x2-x;

                    var y = Math.max(me.top,other.top);
                    var y2 = Math.min(me.top+me.height,other.top+other.height);
                    var h = y2-y;

                    Game.addDebugRect("yellow",x-me.mapLayer.scrollPixelX,y-me.mapLayer.scrollPixelY,w,h,false);

                    if (w>0 && h>0){
                        var thisData = me.getCurrentFrame().getContext("2d").getImageData(x-me.left,y-me.top,w,h).data;
                        var otherData = other.getCurrentFrame().getContext("2d").getImageData(x-other.left,y-other.top,w,h).data;

                        // check for pixels that are not transparent in both imageDatas
                        // TODO: optimise this to work e.g. from the borders to the middle, or use hitpoints
                        var scanIndex = 0;
                        while (!isCollision && scanIndex < (w*h)*4){
                            // only check alpha level
                            var alphaTreshold = 100;
                            var thisPixel = thisData[scanIndex + 3];
                            var otherPixel = otherData[scanIndex + 3];
                            if (thisPixel>alphaTreshold && otherPixel>alphaTreshold) isCollision = true;
                            scanIndex +=4;
                        }
                    }

                }
                if (isCollision) onCollision(other)
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

MapObject.prototype.rotate = function(degree){
    this.rotation = Math.round(((this.rotation || 0) + degree) % 360);
    if (this.rotation<0) this.rotation += 360;
    this.rotationRadiants = this.rotation * Math.PI/180;

    this.generateTransformedSprite();
};

MapObject.prototype.flip = function(horizontal,vertical){
    this.flipX = vertical ? 1 : 0;
    this.flipY = horizontal ? 1 : 0;

    this.generateTransformedSprite();
};

MapObject.prototype.scale = function(scaleIndex){
    this.scaleIndex = scaleIndex;
    this.generateTransformedSprite();
};

MapObject.prototype.generateTransformedSprite = function(){
    var key = this.getTransformation();

    var sprite = sprites[this.staticFrame];
    if (!sprite.transformed[key]){
        sprite.transform(this.rotation,this.scaleIndex,this.flipX,this.flipY);
    }
};

MapObject.prototype.isTransformed = function(){
    return (this.rotation != 0 || this.scaleIndex != 1 || this.flipX || this.flipY);
};

MapObject.prototype.getTransformation = function(){
    return "" + this.rotation + "_" + this.scaleIndex + "_" + this.flipX + "_" + this.flipY;
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

        console.error("preloaditem",items);
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

    this.canvas = canvas;
    this.ctx = ctx;
    this.rotated = {};
    this.transformed = {};
    this.width = width;
    this.height = height;

    ctx.drawImage(img,x,y,width,height,0,0,width,height);

};

Sprite.prototype.getColorAtPixel = function(x,y){
    // warning ... very slow
    return this.ctx.getImageData(x, y, 1, 1).data;
};

Sprite.prototype.putColorAtPixel = function(color,x,y){
    var c = ctx.createImageData(1,1);
    if (c){
        var d  = c.data;
        d[0] = 255;
        d[1] = 255;
        d[3] = 255;
        d[4] = 255;
        this.ctx.putImageData(c, x, y);
    }
};

Sprite.prototype.rotate = function(degree){

    degree = Math.round(degree);
    var canvas = document.createElement("canvas");
    canvas.width  = this.width;
    canvas.height = this.height;
    var ctx = canvas.getContext("2d");
    ctx.translate(this.width/2, this.height/2);
    ctx.rotate(degree*Math.PI/180);
    ctx.translate(-this.width/2, -this.height/2);
    ctx.drawImage(this.canvas,0,0);

    this.rotated[degree] = canvas;

};

Sprite.prototype.flip = function(horizontal,vertical){
    var canvas = document.createElement("canvas");
    canvas.width  = this.width;
    canvas.height = this.height;
    var ctx = canvas.getContext("2d");
    ctx.translate(this.width,0);
    ctx.scale(-1, 1);
    ctx.drawImage(this.canvas,0,0);
    this.flipped = canvas;
};

Sprite.prototype.transform = function(rotation,scale,flipX,flipY){

    var key = "" + rotation + "_" + scale + "_" + flipX + "_" + flipY;

    var canvas = document.createElement("canvas");
    canvas.width  = this.width * scale;
    canvas.height = this.height * scale;
    var ctx = canvas.getContext("2d");

    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.rotate(rotation*Math.PI/180);
    ctx.translate(-canvas.width/2, -canvas.height/2);

    if (flipY){
        ctx.translate(this.width,0);
        ctx.scale(-1, 1);
        ctx.drawImage(this.canvas,0,0);
    }

    ctx.drawImage(this.canvas,0,0,canvas.width,canvas.height);

    this.transformed[key] = canvas;
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
            if (co.canvas){
                spriteImage = co.canvas;
                co.l = 0;
                co.t = 0;
            }

            var  s = new Sprite(spriteImage,co.name,co.l,co.t,co.w,co.h);
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
    var gameEventElements = [];
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

    // registers a Game Object to track for mouse/touch input
    self.registerGameObjectForTouch = function(object){
        gameEventElements.push(object);
    };

    self.getEventElement = function(x,y){

        var result;
        var i = 0;
        var max = UIEventElements.length;
        var elm;

        while (!result && i<max){
            elm = UIEventElements[i];
            if (x>=elm.left && x<=elm.right && y>= elm.top && y <= elm.bottom) result = elm;
            i++;
        }

        if (!result){
            i=gameEventElements.length-1;
            while (!result && i>=0){
                elm = gameEventElements[i];
                if (x>=elm.left && x<=(elm.left+elm.width) && y>= elm.top && y <= (elm.top+elm.height)) {
                    result = elm;
                    result.element = result.gameObject;
                }
                i--;
            }
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

    self.removeAllElements = function(includeGameElements){
        screen = [];
        UIEventElements = [];

        if (includeGameElements) gameEventElements = [];
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
                thisTouch.UIobject.element.onDown(thisTouch,thisTouch.UIobject);
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
                        thisTouch.UIobject.element.onDrag(thisTouch,thisTouch.UIobject);
                    }
                }
            }
        }
    }

    var handleUp = function(event){

        touchData.isTouchDown = false;

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
                    if (elm.onClick) elm.onClick(thisTouch,thisTouch.UIobject);
                    if (elm.onUp) elm.onUp(thisTouch,thisTouch.UIobject);
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

    self.isTouchDown = function(){
        return touchData.isTouchDown;
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


function between(min,value,max){
    return value > max ? max : value < min ? min : value;
}

function randomBetween(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
}

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

function getPixelFromImageData(imageData,x,y){
    var index = ((Math.floor(y) * imageData.width) + Math.floor(x))*4;
    var data = imageData.data;
    return [data[index],data[index+1],data[index+2]];
}
;var V = function(x, y) {
    this.x = x;
    this.y = y;
};

V.prototype.add = function(v) {
    return new V(v.x + this.x, v.y + this.y);
};

V.prototype.subtract = function(v) {
    return new V(this.x - v.x, this.y - v.y);
};

V.prototype.scale = function(s) {
    return new V(this.x * s, this.y * s);
};

V.prototype.dot = function(v) {
    return (this.x * v.x + this.y * v.y);
};

/* Normally the vector cross product function returns a vector. But since we know that all our vectors will only be 2D (x and y only), any cross product we calculate will only have a z-component. Since we don't have a 3D vector class, let's just return the z-component as a scalar. We know that the x and y components will be zero. This is absolutely not the case for 3D. */
V.prototype.cross = function(v) {
    return (this.x * v.y - this.y * v.x);
};

V.prototype.rotate = function(angle, vector) {
    if (typeof vector == "undefined") vector = new V(0,0);
    var x = this.x - vector.x;
    var y = this.y - vector.y;

    var x_prime = vector.x + ((x * Math.cos(angle)) - (y * Math.sin(angle)));
    var y_prime = vector.y + ((x * Math.sin(angle)) + (y * Math.cos(angle)));

    return new V(x_prime, y_prime);
};

V.prototype.copy = function(){
    return new V(this.x, this.y);
};;//global vars
var canvas;
var ctx;
var map = [];
var sprites = [];
var spritesRotated = {};
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
    FREE: 3,
    IMAGE: 4
};

var MAPOBJECTTYPE = {
    GRID : 1,
    FIXED: 2,
    FREE: 3
}


var DEBUGINFOTYPE  = {
    RECT: 1,
    TEXT: 2
}

var ONSCREENCONTROLS = {
    _4WAY: {
        image: "controller_4way.png",
        input: 4
    },
    _2WAY: {
        image: "controller_2way.png",
        input: 2
    }
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
    return (GameObjects.PLAYER && this.id == GameObjects.PLAYER.id);
};

GameObject.prototype.setDefault = function(property,value){
    if (typeof this[property] == "undefined") this[property]=value;
};


GameObject.prototype.canMoveTo = function(targetObject,direction){
    if (!targetObject) return false;
    var targetGameObject = targetObject.gameObject;
    if (targetGameObject.isEmpty()) return true;

    if (this.isPlayer()){
        if (targetGameObject.canBeCollected){
            if (isBoolean(targetGameObject.canBeCollected)) return true;
            if (isFunction(targetGameObject.canBeCollected)){
                // don't return false as maybe future conditions might be true;
                if(targetGameObject.canBeCollected(targetObject)) return true;
            }
        }
    }

    if (targetGameObject.isPlayer()){
        if (targetObject.moveDirection){
            var opposite = DIRECTION_OPPOSITE[targetObject.moveDirection];
            if (direction != opposite) return true;
        }

        if (targetGameObject.canBeCollectedBy(this,targetObject)){
            return true;
        }
    }

    return false;


};







;// TODO rename to gridObject

var MapPosition = function(gameObject,index,mapLayer){
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
        frame = sprites[this.bottomlayer].canvas;
        ctx.drawImage(frame,baseX, baseY);
    }else{
        if (this.id>0){
            var frame;
            if (this.animation){
                frame = this.gameObject.getAnimationFrame(this.animation, step + this.animationStartFrame).canvas;
            }else{
                frame = sprites[this.staticFrame].canvas;
            }

            ctx.drawImage(frame,x, y);
        }

        if (this.toplayer){
            frame = sprites[this.toplayer].canvas;
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

MapPosition.prototype.isGameObject = function(object){
    return this.gameObject.id == object.id;
};

MapPosition.prototype.refresh = function(){
    this.setNext("id",this.id);
};

MapPosition.prototype.transformInto = function(gameObject,animation,onComplete){
    this.setNext("id",gameObject.id);
    if (animation) this.animate(animation);
    if (onComplete) this.setNext("action",onComplete)
};

MapPosition.prototype.setGameObject = function(gameObject){
    this.gameObject = gameObject;
    this.id = gameObject.id;
    this.staticFrame = gameObject.getStaticFrame();
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
    this.image.src = Game.getSettings().resourcePath + this.url;

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
};;UI.GameController = function(settings){
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
    this.image.src = Game.getSettings().resourcePath + settings.image;

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

        if (settings.input == 4){
            Input.isUp(false);
            Input.isDown(false);
        }
    };

    var processInput = function(x,y){
        resetInput();
        x = x-self.left;
        y = y-self.top;
        var margin = 16;
        var half = self.tileSize/2;

        if (x < half - margin) {Input.isLeft(true);    self.state = DIRECTION.LEFT;}
        if (x > half + margin) {Input.isRight(true);   self.state = DIRECTION.RIGHT;}

        if (settings.input == 4){
            if (y < half - margin) {Input.isUp(true);      self.state = DIRECTION.UP;}
            if (y > half + margin) {Input.isDown(true);    self.state = DIRECTION.DOWN;}
        }
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
        ctx.drawImage(this.sprites[spriteIndex].canvas,this.left,this.top);
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
        var frame = sprites[item.icon].canvas;

        ctx.fillStyle = "Black";
        ctx.clearRect(x,y+lineTop,itemWidth,lineHeight); // why is this white?

        ctx.drawImage(frame,x, y);

        ctx.fillStyle = "Grey";
        ctx.font      = "normal 10pt Arial";
        ctx.fillText(item.name, x + 40, y + 16);

        UI.registerEventElement(item,x,y,x+itemWidth,y+itemHeight);
    }
};