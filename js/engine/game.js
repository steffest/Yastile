var Game= (function(){
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
    var _targetScore = 0;
    var _isWon = false;

    var backgroundPattern;
    var backgroundImage;
    var gameController;

    var currentTickFunction = function(){};

    self.init = function(properties){

        settings = properties;

        randomSeed = new Date().getTime();
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

        properties.borderScrollOffset = 4;

        UI.init();
        GameObjects.init();
        Map.init(properties);


        loadResources(properties.spriteSheet,function(){

            backgroundPattern = ctx.createPattern(sprites[28], 'repeat');

            var img = new Image();
            img.onload = function() {

                backgroundImage = document.createElement("canvas");
                backgroundImage.width = 2048;
                backgroundImage.height = 1024;

                var context = backgroundImage.getContext("2d");
                context.globalAlpha = 0.5;

                context.drawImage(img, 0, 0);

                if (properties.start) {
                    properties.start();
                }else if (properties.level){
                    self.loadLevel(properties.level)
                }else{
                    console.error("nothing to do!");
                }
                main();
            };
            img.src = "resources/back.jpg";

        });
    };

    self.start = function(){
        UI.removeAllElements();
        if (settings.showOnScreenControls){
            gameController = new UI.GameController(settings.onScreenControlsImage);
            UI.addElement(gameController);
        }

        self.setGameSection(gameLoop)
    };

    self.loadLevel = function(levelData){
        console.error("loading level ",levelData)
        if (typeof levelData == "string"){
            Map.loadFromUrl(levelData,function(){
                self.start();
            })
        }else{

            if (levelData.map == "random") {
                map = Map.generateRandom(levelData);
                self.start();
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

        canvas.width  = targetWidth;
        canvas.height = targetHeight;

        if (gameController) gameController.setPosition();

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

        requestAnimFrame(main);
    }

    function tick(){
        // one Game Tick
        currentTickFunction();
    }

    function gameLoop(){
        step++;
        if (step>=targetTicksPerSecond) step = 0;

        if (step == 0){
            processGrid();
        }

        var scrollOffset = Map.getScrollOffset();
        render(step,scrollOffset);

        if (step == (targetTicksPerSecond-1)){
            fullStep(step);
        }
    }

    function processGrid(){
        //process Player first
        var playerObject = Map.getPlayerObject();
        if (playerObject) playerObject.process();

        var levelProperties = Map.getLevelProperties();


        for (var i = 0, len = levelProperties.height*levelProperties.width; i<len; i++){
            var object = map[i];
            object.process();
        }
        Map.initScroll();
    }

    function render(step,scrollOffset) {
        ctx.fillStyle = backgroundPattern;
        //ctx.fillStyle = "Black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // draw level background
        var x = 0-(scrollOffset.tileX * tileSize) + scrollOffset.x*step;
        var y = 0-(scrollOffset.tileY * tileSize) + scrollOffset.y*step;


        ctx.drawImage(backgroundImage,x, y);
        var levelProperties = Map.getLevelProperties();


        // draw Sprite Map
        for (var i = 0, len = levelProperties.height*levelProperties.width; i<len; i++){
            var object = map[i];
            if (object.isVisible(scrollOffset)) object.render(step,scrollOffset);
        }

        //always Draw Player on Top
        var playerObject = Map.getPlayerObject();
        if ( playerObject)  playerObject.render(step,scrollOffset);

        UI.renderElements();

    }

    function fullStep(step){
        var levelProperties = Map.getLevelProperties();
        for (var i = 0, len = levelProperties.height*levelProperties.width; i<len; i++){
            var object = map[i];
            object.fullStep(step);
        }
        Map.fullStep(step);
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
        ctx.fillRect(0,0,200,30);
        ctx.fillStyle = "White";
        ctx.font      = "normal 10pt Arial";
        ctx.fillText(Math.round(fps) + " frames/s , " + Math.round(tickps) + " ticks/s + (" + average + ")" , 10, 26);
    }

    function drawScore(){
        ctx.fillStyle = "Black";
        ctx.fillRect(0,30,200,30);
        ctx.fillStyle = "White";
        ctx.font      = "normal 10pt Arial";
        ctx.fillText("Score: " + _score , 10, 56);
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

    self.getLevel = function(){
        return level;
    };

    self.setLevel = function(data){
        level = data;
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

    self.hasTargetScore = function(){
        return _score>=_targetScore;
    };

    self.isWon = function(value){
        if (value){_isWon = value}
        if (_isWon) console.error("WON!");
        return _isWon;
    };

    self.setGameSection = function(gameStepFunction){
        currentTickFunction = gameStepFunction;
    };

    return self;
}());
