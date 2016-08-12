var simCityMap = (function() {
	var self = {};
	var thisCanvas = document.createElement("canvas");
	thisCanvas.width  = 100;
	thisCanvas.height = 100;
	var thisCtx = thisCanvas.getContext("2d");

	self.getCurrentFrame = function(){
		render();
		return thisCanvas;
	};

	var render = function(){
		thisCtx.drawImage(sprites[2].canvas,0,0);
	};

	return self;

}());




