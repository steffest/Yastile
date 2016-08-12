var GameProperties = {
        spriteSheet: "yastile/games/shooter/img/shooter.png",
        spriteMap: "js/spritemap.js",
        tileSize: 32,
        viewPortWidth: 14,
        viewPortHeight: 14,
        scaling: SCALING.CONTAIN,
        showFPS: false,
        showOnScreenControls: true,
        showScore: true,
        showHint: true,
        showDebug: false,
        onScreenControls: ONSCREENCONTROLS._4WAY,
        resourcePath: "yastile/resources/img/",
        closeButtonImage: "close_button.png",
        actionButtonImage: "action_button.png",
        backgroundImage: "images/background.jpg",
        start: function(){World.generate()}
};