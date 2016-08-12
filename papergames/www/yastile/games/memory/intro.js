var Intro = (function(){
    var self = {};

    var state={};

    self.init = function(){
        if (Game.sectionName == "game"){
            Intro.start();
        }else{
            if ((typeof app != "undefined") && (app.reset)){
                app.reset();
            }else{
                window.location.reload();
            }
        }
    };

    self.start = function(){
        var closeButton = new UI.Button({
            id: "close",
            url: Game.getSettings().closeButtonImage,
            top: 10,
            right: canvas.width - 10,
            onClick: function(button){
                Intro.init();
            },
            onResize:  function(button){
                button.right = screenWidth - 10;
                button.left = button.right - button.width;
            }
        });
        UI.addElement(closeButton);

        var logoTop = 20;
        if (canvas.height>900) logoTop = 100;
        var logo = new UI.Button({
            id: "logo",
            url: "../../games/memory/img/m.png",
            top: logoTop,
            left: (canvas.width-768)/2 + 140,
            onClick: function(button){

            },
            onResize:  function(button){
                button.left = (canvas.width-768)/2 + 140;
            }
        });
        UI.addElement(logo);

        var row1 = 500;
        var row2 = 300;

        if (canvas.width>canvas.height){
            row1 = 400;
            row2 = 200;
        }


        addLevelButton(row1,100,12);
        addLevelButton(row1,300,16);
        addLevelButton(row1,500,24);

        addLevelButton(row2,200,30);
        addLevelButton(row2,400,36);

        Game.sectionName = "intro";
        Game.setGameSection(Intro.levelSelector);
    };

    self.setState = function(key,value){
        state[key] = value;
    };

    self.getState = function(key){
        return state[key];
    };

    self.levelSelector = function() {
        UI.clear("black");
        UI.renderBackground();
        UI.renderElements();
    };

    return self

}());

function addLevelButton(bottom,left,size){

    var spriteIndex = 20;
    if (size == 16) spriteIndex = 21;
    if (size == 24) spriteIndex = 22;
    if (size == 30) spriteIndex = 23;
    if (size == 36) spriteIndex = 24;

    console.error("sprites",sprites[1].canvas);
    var button = new UI.Button({
        id: "button" + size,
        sprite: sprites[spriteIndex],
        top: canvas.height - bottom,
        left: (canvas.width-768)/2 + left,
        onClick: function(button){
            startGame(size);
        },
        onResize:  function(button){
             button.top = canvas.height - bottom;
            //button.left = button.right - button.width;
        }
    });
    UI.addElement(button);
}

function startGame(max){
    UI.removeAllElements();
    Map.clear();
    var layer;
    layer = Map.addLayer({
        id : "main",
        type: MAPLAYERTYPE.FREE
    });

    max = max || 16;

    var border = 64;
    var tileWidth = 64;

    var cols = 6;
    if (max == 12){
        border = 130;
        cols = 4;
    }
    if (max == 16){
        border = 130;
        cols = 4;
    }
    if (max == 64) border = 0;

    var rows = Math.ceil(max/cols);
    var gridSizeX = (canvas.width-(border*2)-tileWidth)/(cols-1);
    var gridSizeY = (canvas.height-(border*2)-tileWidth)/(cols-1);
    var gridSize = Math.min(gridSizeX,gridSizeY);

    var borderX =(canvas.width - (gridSize*(cols-1)) - tileWidth)/2;
    var borderY =(canvas.height - (gridSize*(rows-1)) - tileWidth)/2;

    var tileValues = [];
    for (var c = 0;c<max;c++){
        tileValues.push(Math.floor(c/2)+1);
    }
    shuffle(tileValues);


    for (var i = 0;i<max;i++){
        var tile = new MapObject({
            left: borderX + ((i%cols)*gridSize),
            top: borderY + (Math.floor(i/cols)*gridSize),
            value: tileValues[i],
            gameObject: GameObjects.TILE
        });

        layer.addObject(tile,MAPOBJECTTYPE.FREE);
    }

    var starLeft = (canvas.width - (max*20))/2;
    for (var si = 0;si<max/2;si++){
        var star = new MapObject({
            left: starLeft + (si*40),
            top: 15,
            value: si+1,
            gameObject: GameObjects.STAR
        });

        layer.addObject(star,MAPOBJECTTYPE.FREE);
    }


    Game.turnCount = 0;
    Game.matched = 0;
    Game.topScore = max/2;
    //Game.setGameSection(Intro.levelSelector);
    Game.sectionName = "game";
    Game.start();
}


function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}


