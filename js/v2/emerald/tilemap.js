Yascal.tileMap = function (initialProperties) {
	var me = Y.element();
	initialProperties = Y.properties(initialProperties);

	var mapHeight = initialProperties.height || 32;
	var mapWidth = initialProperties.width || 64;
	var tileSize = initialProperties.tileSize || 32;
	me.left = initialProperties.left || 0;
	me.top = initialProperties.top || 0;
	me.spriteSheet = initialProperties.spriteSheet;

	var tiles = [];

	var activeElements = [];
	var activeElementMap = {};
	var animatingElements = [];
	var prevAnimationStep = 0;
	var time = 0;
	var step = 0;

	var steptime = 125;
	me.timeBased = false;

	// incase of not time based
	var ticksPerStep = 10;

	var animationsPerStep = 4;



	var viewPort = {
		left: 0,
		top: 0,
		width: 32,
		height: 16
	};



	var context;
	if (Y.useWebGL){
		context = YascalGl.spriteBatch(Y.screen.ctx);
	}else{
		context = me.ctx;
	}

	function generateTiles(){
		var index = 0;
		for (var y = 0; y < mapHeight; y++){
			for (var x = 0;x<mapWidth;x++){
				tiles.push(Y.tile({width:tileSize,height:tileSize, left: x, top: y, parent: me, index: index}));
				index++
			}
		}
	}

	me.reset = function(properties){
		tiles = [];
		activeElements = [];
		activeElementMap = {};
		animatingElements = [];

		if (properties){
			var p = Y.properties(properties);

			mapHeight = initialProperties.height || mapHeight;
			mapWidth = initialProperties.width || mapWidth;
			tileSize = initialProperties.tileSize || tileSize;
			me.spriteSheet = initialProperties.spriteSheet || me.spriteSheet;
		}

		generateTiles();

		me.setSize(viewPort.width * tileSize,viewPort.height * tileSize);
		me.scrollX = 0;
		me.scrollY = 0;
	};
	me.reset();


	me.setViewPort = function(width,height){
		viewPort.width = Math.min(width,mapWidth);
		viewPort.height = Math.min(height,mapHeight);

		viewPort.maxLeft = mapWidth-viewPort.width;
		viewPort.maxTop = mapHeight-viewPort.height+1;

		me.setSize(viewPort.width * tileSize,viewPort.height * tileSize);

		var left = me.width < me.parent.width ? Math.round((me.parent.width-me.width)/2) : 0;
		var top = me.height < me.parent.height ? Math.floor((me.parent.height-me.height)/2) : 0;
		me.setPosition(left,top);

	};

	me.panViewPort = function(x,y){
		viewPort.left = clamp(x - Math.floor(viewPort.width/2),0,mapWidth-viewPort.width);
		viewPort.top = clamp(y - Math.floor(viewPort.height/2),0,mapHeight-viewPort.height);
		me.refresh();
	};

	me.getViewPort = function(){
		return viewPort;
	};

	me.getMap = function(){
		return tiles;
	};

	me.update = function(deltaTime){
		if (me.timeBased){
			time += deltaTime;
			var progress = time/steptime;
		}else{
			time++;
			progress = time/ticksPerStep;
		}

		if (progress>1)progress=1;

		activeElements.forEach(function(action,index){
			action.updatefunction(action.initialState,progress);
			me.needsRendering = true;
		});

		//throttle animation steps
		var animationStep = Math.floor(progress * animationsPerStep);
		if (animationStep != prevAnimationStep){
			prevAnimationStep = animationStep;
			animatingElements.forEach(function(tile){
				tile.updateAnimation();
			});
		}


		if (progress==1){
			activeElements = [];
			me.step();
		}
	};

	me.step = function(){

		time = 0;
		step++;

		// process player first
		var player = Game.getPlayer();
		player.set(step);

		tiles.forEach(function(tile){
			tile.set(step);
		});

		// refetch player as it might be changed
		player = Game.getPlayer();
		var playerGameObject = player.gameObject;


		var input = false;
		var target;

		if (Y.keyInput.isRight()) input = "r";
		if (!input && Y.keyInput.isLeft()) input = "l";
		if (!input && Y.keyInput.isDown()) input = "d";
		if (!input && Y.keyInput.isUp()) input = "u";
		if (!input) input = ".";

		if(Y.keyInput.isAction()){
			input = input.toUpperCase();
			if (input == ".") input = "*";

			playerGameObject.actionDownCount = (playerGameObject.actionDownCount || 0) + 1;
			if (playerGameObject.actionDownCount>5 && playerGameObject.onLongPress){
				playerGameObject.onLongPress();
			}
		}else{
			playerGameObject.actionDownCount = 0;
		}

		input = Y.recorder.update(input);

		if (input == "r"){
			target = player.getTileRight();
			player.moveRight();
			if (!player.isMoving()){
				if (target.gameObject.canPassThroughDouble && target.gameObject.canPassThroughDouble()) {
					target = target.getTileRight();
					player.moveRight(false,2);
				}
			}
			if (player.isMoving()) {
				player.gameObject.collect(target,DIRECTION.right,true);
				player.animate(true,ANIMATION.playerWalkRight,0.6,true);
			}else{
				player.animate(true,ANIMATION.playerPushRight);
			}
		}
		if (input == "l"){
			target = player.getTileLeft();
			player.moveLeft();
			if (!player.isMoving()){
				if (target.gameObject.canPassThroughDouble && target.gameObject.canPassThroughDouble()) {
					target = target.getTileLeft();
					player.moveLeft(false,2);
				}
			}
			if (player.isMoving()) {
				player.gameObject.collect(target,DIRECTION.left,true);
				player.animate(true,ANIMATION.playerWalkLeft,0.8,true);
			}else{
				player.animate(true,ANIMATION.playerPushLeft);
			}
		}
		if (input == "u"){
			target = player.getTileUp();
			player.moveUp();
			if (!player.isMoving()){
				if (target.gameObject.canPassThroughDouble && target.gameObject.canPassThroughDouble()) {
					target = target.getTileUp();
					player.moveUp(false,2);
				}
			}
			if (player.isMoving()) {
				player.gameObject.collect(player.getTileUp(),DIRECTION.up,true);
				player.animate(true,ANIMATION.playerWalkUp);
			}else{
				player.animate(true,ANIMATION.playerPushUp);
			}
		}
		if (input == "d"){
			target = player.getTileDown();
			player.moveDown();
			if (!player.isMoving()){
				if (target.gameObject.canPassThroughDouble && target.gameObject.canPassThroughDouble()) {
					target = target.getTileDown();
					player.moveDown(false,2);
				}
			}
			if (player.isMoving()){
				player.gameObject.collect(target,DIRECTION.down,true);
				player.animate(true,ANIMATION.playerWalkDown);
			}else{
				player.animate(true,ANIMATION.playerPushDown);
			}
		}
		if (input == "R"){
			player.gameObject.collect(player.getTileRight(),DIRECTION.right);
		}
		if (input == "L"){
			player.gameObject.collect(player.getTileLeft(),DIRECTION.left);
		}
		if (input == "U"){
			player.gameObject.collect(player.getTileUp(),DIRECTION.up);
		}
		if (input == "D"){
			player.gameObject.collect(player.getTileDown(),DIRECTION.down);
		}

		tiles.forEach(function(tile){
			tile.process();
		})

	};

	me.getCurrentStep = function(){
		return step;
	};

	me.render = function (internal) {

		if (!me.isVisible()) return;

		if (me.needsRendering){
			if (Y.useWebGL){
				context.begin();
			}else{
				me.clearCanvas();
			}

			if (me.backgroundImage){
				if (Y.useWebGL){

				}else{
					var imgX = (-viewPort.left * tileSize) + me.scrollX;
					var imgY = (-viewPort.top * tileSize) + me.scrollY;
					var imgW = mapWidth * tileSize;
					var imgH = mapHeight * tileSize;
					context.drawImage(me.backgroundImage,imgX,imgY);
				}
			}

			var playerX = 0;
			var playerY = 0;
			animatingElements = [];
			var movingElements = [];

			// render in 2 batches
			// first the static tiles
			// then the moving ones (as they should be on top
			// may later another layer if we implement pipes etc.

			var innerScale = 1;
			var innerLeft = 0;
			var innerTop = 0;

			if (Y.useWebGL){
				// scale each sprite individually as we don't render to a buffer canvas but directly to the screen
				innerScale = me.scale;
				innerLeft = me.left;
				innerTop = me.top;
			}

			var topLayers = [];
			for (var tileY = -1; tileY < viewPort.height + 1; tileY++) {
				for (var tileX = -1; tileX < viewPort.width + 2; tileX++) {

					var tile = me.getTile(tileX + viewPort.left, tileY + viewPort.top);
					if (tile){
						// / only animate elements in view
						if (tile.isAnimating()) animatingElements.push(tile);

						var x = innerLeft + (tileX*tileSize + me.scrollX)*innerScale;
						var y = innerTop + (tileY*tileSize + me.scrollY)*innerScale;
						var w = tile.width * innerScale;
						var h = tile.height * innerScale;

						var background = tile.getBackground();
						if (background) me.spriteSheet.sprites[background].draw(context,x,y,w,h);

						var bottomLayer = tile.getBottomLayer();
						if (bottomLayer) me.spriteSheet.sprites[bottomLayer].draw(context,x,y,w,h);

						var topLayer = tile.getTopLayer();
						if (topLayer){
							topLayers.push({x:x,y:y,w:w,h:h,layer:topLayer});
						}else{
							if (tile.gameObject.onTop) topLayers.push({x:x,y:y,w:w,h:h,layer:tile.gameObject.spriteIndex});
						}



						if (tile.id != Game.getPlayer().id){
							if (tile.isMoving()){
								movingElements.push({x:x+tile.offsetLeft,y:y+tile.offsetTop,tile:tile});
							}else{
								if (Y.useWebGL){
									tile.render();
									if (tile.region)context.drawRegion(tile.region, x, y,w ,h);
								}else{
									context.drawImage(tile.render(),x,y);
								}
							}
						}else{
							playerX = x + tile.offsetLeft*innerScale;
							playerY = y + tile.offsetTop*innerScale;
						}

					}
				}
			}

			movingElements.forEach(function(elm){
				var tile = elm.tile;
				if (Y.useWebGL){
					tile.render();
					if (tile.region){
						x = me.left + (elm.x * me.scale);
						y = me.top + (elm.y * me.scale);
						var w = tile.width * me.scale;
						var h = tile.height * me.scale;
						context.drawRegion(tile.region, x, y,w ,h);
					}
				}else{
					context.drawImage(tile.render(),elm.x,elm.y);
				}
			});

			/*
			for (var tileY = -1; tileY < viewPort.height + 1; tileY++) {
				for (var tileX = -1; tileX < viewPort.width + 2; tileX++) {
					tile = me.getTile(tileX + viewPort.left, tileY + viewPort.top);


					if (tile) {

						x = tileX*tileSize + me.scrollX + tile.offsetLeft;
						y = tileY*tileSize + me.scrollY + tile.offsetTop;


						if (tile.id != Game.getPlayer().id){
							if (Y.useWebGL){
								tile.render();
								if (tile.region){
									x = me.left + (x * me.scale);
									y = me.top + (y * me.scale);
									var w = tile.width * me.scale;
									var h = tile.height * me.scale;
									batch.drawRegion(tile.region, x, y,w ,h);
								}
							}else{
								me.ctx.drawImage(tile.render(),x,y);
							}
						}else{
							playerX = x;
							playerY = y;
						}

					}

				}
			}

			*/

			// render player on top of middle tiles
			if (Y.useWebGL){
				var player = Game.getPlayer();
				player.render();
				if (player.region) {
					x = me.left + (playerX * me.scale);
					y = me.top + (playerY * me.scale);
					w = player.width * me.scale;
					h = player.height * me.scale;
					context.drawRegion(player.region,x, y, w, h);
				}

				context.end();
			}else{
				context.drawImage(Game.getPlayer().render(),playerX,playerY);
			}
			viewPort.playerX = playerX;
			viewPort.playerY = playerY;

			// render toplayers
			topLayers.forEach(function(elm){
				me.spriteSheet.sprites[elm.layer].draw(context,elm.x,elm.y,elm.w,elm.h);
			});

		}
		if (!Y.useWebGL) {me.needsRendering = false;}

		// TODO - why don't all animating elements register?

		if (internal){
			return me.canvas;
		}else{
			if (!Y.useWebGL) me.parentCtx.drawImage(me.canvas,me.left,me.top,me.width * me.scale,me.height * me.scale);
		}
	};

	me.getTile = function (x, y) {
		var index = (y * mapWidth) + x;
		return tiles[index];
	};

	me.getTileSize = function(){
		return tileSize;
	};


	me.registerStepAction = function(initialState,duration,updatefunction,easing){
		if (duration){
			var action = {
				id: generateUUID(),
				start: time,
				duration: duration,
				easing: easing,
				initialState: initialState,
				updatefunction: updatefunction
			};
			activeElements.push(action);
			activeElementMap[action.id] = action;

			return action.id;
		}
		return false;
	};

	me.scroll = function(x,y){
		me.registerStepAction(0,1,function(state,progress){
			me.scrollX = x*progress;
			me.scrollY = y*progress;

			if (progress == 1){
				if (x<0) viewPort.left++;
				if (x>0) viewPort.left--;
				if (y<0) viewPort.top++;
				if (y>0) viewPort.top--;
				me.scrollX = 0;
				me.scrollY = 0;
			}

			me.refresh();
		})
	};

	me.scrollLeft = function(){
		if (viewPort.left >= viewPort.maxLeft) return;
		me.scroll(-tileSize,0);
	};
	me.scrollRight = function(){
		if (viewPort.left==0) return;
		me.scroll(tileSize,0);
	};
	me.scrollUp = function(){
		if (viewPort.top >= viewPort.maxTop) return	;
		me.scroll(0,-tileSize);
	};
	me.scrollDown = function(){
		if (viewPort.top==0) return;
		me.scroll(0,tileSize);
	};

	me.centerTile = function(tile){
		var borderLeft = viewPort.left + viewPort.width/3;
		var bordeRight = viewPort.left + viewPort.width - viewPort.width/3;
		var borderTop = viewPort.top + viewPort.height/3;
		var borderBottom = viewPort.top + viewPort.height - viewPort.height/3;
		if (tile){
			if (tile.left > bordeRight) me.scrollLeft();
			if (tile.left < borderLeft) me.scrollRight();
			if (tile.top > borderBottom) me.scrollUp();
			if (tile.top < borderTop) me.scrollDown();
		}
	};

	return me;
};