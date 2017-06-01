var Game = function(){
	var me = {};

	var player;
	var map;
	var scoreBoard;
	var levelSpritesheet;
	var levelSelector;
	var gameSettings;
	var tileSize = 32;

	var GAMESECTION = {
		intro: 1,
		levelSelect: 2,
		game: 3,
		settings: 4
	};
	var gameSection = GAMESECTION.levelSelect;

	me.start = function(){

		UIFrame.init(function(){
				gameSettings = Yascal.gameSettings({width:Y.canvas.width-20, height: Y.canvas.height-20});
				Y.screen.addChild(gameSettings);
				gameSettings.hide();
				gameSettings.loadSettings(function(){

					var screenSize = me.getSettings("screensize");
					if (screenSize == "auto") screenSize = window.innerHeight;
					screenSize = parseInt(screenSize);
					if (isNaN(screenSize)) screenSize = 320;
					if (screenSize != Y.screen.height){
						Main.setScreenSize(screenSize);
						gameSettings.setProperties({width:Y.canvas.width-20, height: Y.canvas.height-20})
					}

					levelSelector = Yascal.levelSelector({width:Y.canvas.width-20, height: Y.canvas.height-20});
					Y.screen.addChild(levelSelector);

					var spritesheetImage = "img/VX-sprites.png";
					var map = {tileWidth:32,tileHeight:32};

					var spriteset = getUrlParameter("spriteset");
					if (!spriteset) spriteset=me.getSettings("spriteset");
					console.error(spriteset);
					if (spriteset == 'original'){
						spritesheetImage = "img/ForgottenMine.png";
						map = EMV6_MAP();
					}

					if (map.tileWidth) tileSize = map.tileWidth;


					levelSpritesheet = Y.spriteSheet();
					levelSpritesheet.loadFromImage(spritesheetImage,map,function(){
						console.log("spritesheet loaded");

						buildGameObjects();
						Y.gameObjectForCode = {};
						buildGameObjectMap();

						var levelName = getUrlParameter("level");
						var editor = getUrlParameter("editor");

						if (editor == "true"){
							var level = JSON.parse(localStorage.getItem("BDCFFLevel") || "{}");
							me.setupLevel(level);
						}else{
							if (levelName){
								Y.level.loadFromUrl("levels/" + levelName + ".json",function(level){
									me.setupLevel(level);
								});
							}else{
								levelSelector.show();
							}
						}
					});
				});
			}
		);


	};

	me.loadLevel = function(filename){
		Y.level.loadFromUrl(filename,function(level){
			me.setupLevel(level);
		});
	};

	me.setupLevel = function(level){
		var mapWidth = level.width;
		var mapHeight = level.height;

		if (!map){
			map = Yascal.tileMap({width: mapWidth, height: mapHeight, tileSize: tileSize,spriteSheet:levelSpritesheet});

			map.onTouchDown = function(data){
				scoreBoard.getInput(data.x,data.y);
			};

			map.onDrag = function(data){
				scoreBoard.getInput(data.x,data.y);
			};

			map.onTouchUp = function(){
				Y.keyInput.isLeft(false);
				Y.keyInput.isRight(false);
				Y.keyInput.isDown(false);
				Y.keyInput.isUp(false);
				Y.keyInput.isAction(false);
				Y.screen.refresh();
			};

			Y.screen.addChild(map);
		}else{
			map.reset({width: mapWidth, height: mapHeight, tileSize: tileSize,spriteSheet:levelSpritesheet});
		}


		var mapInfo = Y.level.buildMap(map,level);
		player = mapInfo.player;
		map.setViewPort(Math.floor(Y.canvas.width/map.getTileSize()),Math.floor(Y.canvas.height/map.getTileSize()));
		map.panViewPort(player.left,player.top);

		if (!scoreBoard){
			scoreBoard = Y.scoreBoard({left:0,top: 0, height: Y.canvas.height, width :Y.canvas.width});

			scoreBoard.init(function(){
				Y.screen.addChild(scoreBoard);

				scoreBoard.onTouchDown = map.onTouchDown;
				scoreBoard.onDrag = map.onDrag;
				scoreBoard.onTouchUp = map.onTouchUp;

				scoreBoard.setTargetScore(level.diamondsNeeded || 0);
				scoreBoard.setTime(level.time || 999);

				EventBus.on(EVENT.tick,tick);

				me.ticker = Y.ticker();
				me.ticker.stats(true);
				me.hasStats = true;
				me.tileSize = map.getTileSize();
				me.defaultMoveSpeed = me.tileSize/me.ticksPerStep;
				me.ticker.start();


				var stats = Y.stats(me.ticker);
				Y.screen.addChild(stats);

				me.startGame();


			});
		}else{
			scoreBoard.setTargetScore(level.diamondsNeeded || 0);
			scoreBoard.setTime(level.time || 999);
			me.startGame();
		}

	};

	me.startGame = function(){
		player.inventory = {};
		gameSection = GAMESECTION.game;
		console.log("starting game");
		Y.recorder.start();

		map.show();
		scoreBoard.show();
		levelSelector.hide();
		gameSettings.hide();
	};

	me.stopGame = function(){
		Y.recorder.stop();
	};


	function tick(deltaTime){
		if (gameSection != GAMESECTION.game) return;
		map.update(deltaTime);

		var viewport = map.getViewPort();
		scoreBoard.update(viewport.playerX,viewport.playerY);

	}

	me.getPlayer = function(){
		return player;
	};

	me.setPlayer = function(tile){
		player = tile;
	};

	me.getRandomDirection = function(){
		return DIRECTION.left + Math.floor(random()*4);
	};

	me.getRandomHorizontalDirection = function(){
		if (random()<=0.5){
			return DIRECTION.LEFT;
		}else{
			return DIRECTION.RIGHT;
		}
	};
	me.getDirectionTurnedLeft = function(direction){
		var result = direction-1;
		if (result < DIRECTION.left) result = DIRECTION.down;
		return result;
	};

	me.getDirectionTurnedRight = function(direction){
		var result = direction+1;
		if (result > DIRECTION.down) result = DIRECTION.left;
		return result;
	};

	me.getDirectionName = function(direction){
		return DIRECTIONNAME[direction] || "none";
	};

	me.getScoreBoard = function(){
		return scoreBoard;
	};

	me.showLevelSelector = function(){
		console.error("showLevelSelector");
		me.stopGame();
		gameSection = GAMESECTION.levelSelect;
		if (map) map.hide();
		if (scoreBoard) scoreBoard.hide();
		levelSelector.show(true);
		gameSettings.hide();
	};

	me.showSettings = function(){
		me.stopGame();
		gameSection = GAMESECTION.settings;
		if (map) map.hide();
		if (scoreBoard) scoreBoard.hide();
		levelSelector.hide();
		gameSettings.show(true);
	};

	me.getSettings = function(key){
		return gameSettings.getSettings(key);
	};

	return me;
}();