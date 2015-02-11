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
