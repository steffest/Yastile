var GameProperties = {
        spriteSheet: "yastile/games/flappy/img/sprites.png",
        spriteMap: "js/spritemap.js",
        tileSize: 32,
        viewPortWidth: 20 ,
        viewPortHeight: 16,
        targetFps: 60,
        scaling: SCALING.STRETCH,
        showFPS: true,
        showOnScreenControls: true,
        showScore: true,
        showHint: true,
        onScreenControls: ONSCREENCONTROLS.NONE,
        resourcePath: "yastile/resources/img/",
        closeButtonImage: "close_button.png",
        actionButtonImage: "action_button.png",
        backgroundImage: "yastile/games/flappy/img/sky.jpg",
        start: World.generate
    };



var Intro = (function(){
    var self = {};
    self.init = function(){
        if ((typeof app != "undefined") && (app.reset)){
            app.reset();
        }else{
            window.location.reload();
        }
    };

    return self

}());


