var GameProperties = {
    targetFps: 35,
    spriteSheet: "yastile/games/cars/img/cars_track.png",
    spriteMap: "js/spritemap.js",
    viewPortWidth: 600,
    viewPortHeight: 600,
    scaling: SCALING.CONTAIN,
    showFPS: false,
    showOnScreenControls: true,
    showScore: false,
    showHint: true,
    showDebug: true,
    onScreenControls: ONSCREENCONTROLS._2WAY,
    resourcePath: "yastile/resources/img/",
    closeButtonImage: "close_button.png",
    actionButtonImage: "action_button.png",
    backgroundPattern: "Black",
    preload: [
        {id: "track" , url: "yastile/games/cars/img/track1.jpg", modify:true},
        {id: "tracksmall" , url: "yastile/games/cars/img/track1_small.png", modify:true}
    ],
    start: World.generate
};