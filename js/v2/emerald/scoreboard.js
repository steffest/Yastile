Yascal.scoreBoard = function (initialProperties) {
	var me = Y.element();
	initialProperties = Y.properties(initialProperties);

	me.left = initialProperties.left || 0;
	me.top = initialProperties.top || 0;
	me.width = initialProperties.width || 0;
	me.height = initialProperties.height || 0;

	me.setSize(me.width,me.height);

	var tiles = [];
	var spriteSheet;
	var score = 0;
	var time = 0;
	var timeLeft = 0;
	var startTime;
	var needed = 0;
	var neededLeft = 0;
	var text = "goodluck";

	var maxSize = Math.max(me.width,me.height);
	var spotlight = {
		width: maxSize * 2,
		height: maxSize * 2,
		top: 0,
		left: 0
	};

	var scoreRibbonHeight = 16;
	var scoreRibbonTop = 0;
	var controlButtonTop = me.height - 150;

	var context;
	if (Y.useWebGL){
		context = YascalGl.spriteBatch(Y.screen.ctx);
	}else{
		context = me.ctx;
	}

	var spriteMap = {
		"0" : {x:0,y:1,w:16,h:14},
		"1" : {x:16,y:1,w:16,h:14},
		"2" : {x:32,y:1,w:16,h:14},
		"3" : {x:48,y:1,w:16,h:14},
		"4" : {x:64,y:1,w:16,h:14},
		"5" : {x:80,y:1,w:16,h:14},
		"6" : {x:96,y:1,w:16,h:14},
		"7" : {x:112,y:1,w:16,h:14},
		"8" : {x:128,y:1,w:16,h:14},
		"9" : {x:144,y:1,w:16,h:14},
		"close" : {x:160,y:1,w:16,h:15},
		"time" : {x:0,y:18,w:32,h:14},
		"needed" : {x:32,y:18,w:32,h:14},
		"score" : {x:128,y:18,w:32,h:14},
		"keyBlue" : {x:64,y:17,w:8,h:14},
		"keyGreen" : {x:72,y:17,w:8,h:14},
		"keyRed" : {x:80,y:17,w:8,h:14},
		"keyYellow" : {x:88,y:17,w:8,h:14},
		"dyna1" : {x:96,y:17,w:8,h:14},
		"dyna2" : {x:104,y:17,w:8,h:14},
		"dyna3" : {x:112,y:17,w:8,h:14},
		"dyna4" : {x:120,y:17,w:8,h:14},
		"goodluck" : {x:160,y:18,w:64,h:14},
		"blackTrans" : {x:0,y:60,w:32,h:32},
		"spotlight" : {x:0,y:60,w:400,h:400},
		"dPad" : {x:0,y:460,w:128,h:128},
		"dPadLeft" : {x:135,y:460,w:128,h:128},
		"dPadUp" : {x:270,y:460,w:128,h:128},
		"dPadRight" : {x:405,y:460,w:128,h:128},
		"dPadDown" : {x:540,y:460,w:128,h:128},
		"actionButton" : {x:0,y:588,w:80,h:80},
		"actionButtonActive" : {x:79,y:588,w:80,h:80}
	};

	me.init = function(next){
		spriteSheet = Y.spriteSheet();
		spriteSheet.loadFromImage("img/game_ui.png",spriteMap,function(){
			console.log("sprites scoreboard loaded");
			if (next) next();
		});
	};


	me.render = function (internal) {

		if (!me.isVisible()) return;


		if (me.needsRendering){


			if (Y.useWebGL){
				context.begin();
				spriteSheet.sprites["blackTrans"].draw(context,0,scoreRibbonTop,me.width, scoreRibbonHeight);
			}else{
				me.clearCanvas();

				me.ctx.fillStyle = "rgba(0,0,0,0.6)";
				me.ctx.fillRect(0,scoreRibbonTop,me.width, scoreRibbonHeight);
			}

			if (Game.getSettings("overlay")){
				spriteSheet.sprites["spotlight"].draw(context,spotlight.left,spotlight.top,spotlight.width,spotlight.height);
			}


			var x = 0;
			spriteSheet.sprites["time"].draw(context,x,scoreRibbonTop+1);
			renderNumber(timeLeft,3,x+22);

			x = 80;
			spriteSheet.sprites["needed"].draw(context,x,scoreRibbonTop+1);
			renderNumber(neededLeft,3,x+34);

			var left = 170;
			var right = me.width - 120;
			renderText(text,left,right);

			var inventory = Game.getPlayer().gameObject.inventory || {};
			x = me.width - 92 - 20 - 20;
			if (inventory.keyBlue) {spriteSheet.sprites["keyBlue"].draw(context,x,scoreRibbonTop+2); x -= 8;}
			if (inventory.keyGreen) {spriteSheet.sprites["keyGreen"].draw(context,x,scoreRibbonTop+2); x -= 8;}
			if (inventory.keyRed) {spriteSheet.sprites["keyRed"].draw(context,x,scoreRibbonTop+2); x -= 8;}
			if (inventory.keyYellow) {spriteSheet.sprites["keyYellow"].draw(context,x,scoreRibbonTop+2); x -= 8;}

			var dynaCount = inventory.dynamiteCount;
			if (dynaCount){
				var dynaImage = "dyna1";
				if (dynaCount>1) dynaImage = "dyna2";
				if (dynaCount>2) dynaImage = "dyna3";
				if (dynaCount>3) dynaImage = "dyna4";
				spriteSheet.sprites[dynaImage].draw(context,x,scoreRibbonTop+2); x -= 8;
			}

			x = me.width - 112;
			spriteSheet.sprites["score"].draw(context,x,scoreRibbonTop+1);
			renderNumber(score,4,x+28);

			x = me.width - 17;
			spriteSheet.sprites["close"].draw(context,x,scoreRibbonTop+1);

			if (Game.getSettings("onscreencontrols")){
				var dPad = "dPad";
				if (Y.keyInput.isLeft()) dPad = "dPadLeft";
				if (Y.keyInput.isUp()) dPad = "dPadUp";
				if (Y.keyInput.isRight()) dPad = "dPadRight";
				if (Y.keyInput.isDown()) dPad = "dPadDown";

				var actionButton = "actionButton";
				if (Y.keyInput.isAction()) actionButton = "actionButtonActive";

				spriteSheet.sprites[dPad].draw(context,10,controlButtonTop);
				spriteSheet.sprites[actionButton].draw(context,me.width-90,controlButtonTop + 28);
			}


			if (Y.useWebGL){
				context.end();
			}else{

			}
		}

		if (!Y.useWebGL) {me.needsRendering = false;}

		if (internal){
			return me.canvas;
		}else{
			if (!Y.useWebGL) me.parentCtx.drawImage(me.canvas,me.left,me.top,me.width * me.scale,me.height * me.scale);
		}
	};

	function renderText(spriteName,left,right){
		var sprite = spriteSheet.sprites[spriteName];
		if (sprite){
			var width = right-left;
			var rest = width-sprite.width;
			if (rest>0){
				var center = left + Math.floor(rest/2);
				sprite.draw(context,center,scoreRibbonTop+1);
			}
		}
	}

	function renderNumber(nr,length,x){
			var s = "" + nr;
			while (s.length<length) s = "0" + s;
			s.split("").forEach(function(char){
				var sprite = spriteSheet.sprites[char];
				if (sprite) sprite.draw(context,x,scoreRibbonTop+1);
				x += 16;
			})
	}

	me.addScore = function(amount){
		score += amount;
		neededLeft-= score;
		if (neededLeft<0) neededLeft=0;
		me.refresh();
	};

	me.setTargetScore = function(amount){
		needed = amount;
		neededLeft = needed;
	};

	me.hasTargetScore = function(){
		return score>=needed;
	};

	me.setTime = function(amount){
		time = amount;
		timeLeft = time;
		startTime = performance.now();
	};

	me.setText = function(newText){
		text = newText;
	};

	me.update = function(x,y){



		// set spotlight;
		spotlight.left = x - spotlight.width/2 + 16;
		spotlight.top = y - spotlight.height/2 + 16;

		timeLeft = time - Math.floor((performance.now() - startTime) / 1000);


		me.refresh();
	};

	me.getInput = function(x,y){

		Y.keyInput.isLeft(false);
		Y.keyInput.isRight(false);
		Y.keyInput.isDown(false);
		Y.keyInput.isUp(false);


		if (y>controlButtonTop){
			if (x>10 && x<138){
				// Dpad
				var centerX = 10 + 64;
				var centerY = controlButtonTop+64;
				if (y<centerY - 32) {
					Y.keyInput.isUp(true);
				}else if (y>centerY + 32) {
					Y.keyInput.isDown(true);
				}else{
					if (x<=centerX) Y.keyInput.isLeft(true);
					if (x>centerX) Y.keyInput.isRight(true);
				}
			}

			if (x> me.width-90){
				// Action
				Y.keyInput.isAction(true);
			}
		}else{
			if (y<18 && x>me.width-18){
				Game.showLevelSelector();
			}
		}
	};


	return me;
};