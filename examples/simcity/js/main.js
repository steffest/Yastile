window.addEventListener("load",function(){
	Game.init({
		spriteSheet: "images/simcity.jpg",
		tileSize: 32,
		viewPortWidth: 12,
		viewPortHeight: 12,
		scaling: SCALING.CONTAIN,
		targetFps: 60,
		backgroundPattern: "black",
		start: World.init
});

},false);
