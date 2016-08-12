var GameObjects;
var Intro;
var spriteMap;
var World;

var GameInfo = {
    shooter:{
        name: "shooter",
        js: [
            "yastile/games/shooter/gameObjects.js",
            "yastile/games/shooter/spritemap.js",
            "yastile/games/shooter/world.js",
            "yastile/games/shooter/intro.js",
            "yastile/games/shooter/main.js"
        ]
    },
    cars:{
        name: "cars",
        js: [
            "yastile/games/cars/gameObjects.js",
            "yastile/games/cars/spritemap.js",
            "yastile/games/cars/world.js",
            "yastile/games/cars/intro.js",
            "yastile/games/cars/cars.js",
            "yastile/games/cars/main.js"
        ]
    },
    memory:{
        name: "memory",
        js: [
            "yastile/games/memory/gameObjects.js",
            "yastile/games/memory/intro.js",
            "yastile/games/memory/easing.js",
            "yastile/games/memory/main.js"
        ]
    },
    flappy:{
        name: "flappy",
        js: [
            "yastile/games/flappy/gameObjects.js",
            "yastile/games/flappy/spritemap.js",
            "yastile/games/flappy/world.js",
            "yastile/games/flappy/main.js"
        ]
    }
};