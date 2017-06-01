var fancyGraphics = false;

Y.gameObjects = {};

function buildGameObjects(){
	Y.gameObjects.EMPTYSPACE = emeraldMineObject({
		id: 0,
		spriteIndex: SPRITE.empty,
		code: "  ",
		alias: " ",
		canBeCollected: true
	});

	Y.gameObjects.UNKNOWN = emeraldMineObject({
		id: 84,
		code: "**"
	});

// placeholder for tiles that are animating or in transition
	Y.gameObjects.BUSY = new emeraldMineObject({
		id: 999999,
		spriteIndex: SPRITE.empty,
		code: "^^"
	});


	Y.gameObjects.STONEWALL = emeraldMineObject({
		id: 2,
		spriteIndex: SPRITE.stoneWall,
		code: "Ww",
		alias: "W"
	});
	Y.gameObjects.STONEWALL_SLIPPERY = emeraldMineObject({
		id: 20001,
		code: "WS",
		spriteIndex: SPRITE.stoneWall
	});

	Y.gameObjects.STEELWALL = emeraldMineObject({
		id: 14,
		spriteIndex: SPRITE.steelWall,
		code: "Ws",
		survivesExplosion: true
	});

	Y.gameObjects.GRASS = emeraldMineObject({
		id: 15,
		code: "..",
		spriteIndex: SPRITE.grass,
		canBeCollected: true,
		animationDigRight: [244,216,217,218,219],
		animationDigDown: [245,220,221,222,223],
		animationDigLeft: [242,224,225,226,227],
		animationDigUp: [243,228,229,230,231],
		onCollect: function(by,tile,direction){
			var anim = this["animationDig" + Game.getDirectionName(direction)];
			if (anim) tile.animate(true,anim);
		},
		eachStep : function(tile){
			if (!fancyGraphics) return;
			// TODO: only do this for tiles in view?
			// TODO: performance?
			var frame = 15;
			var u = tile.getTileUp().gameObject.id != this.id ? 1 : 0;
			var d = tile.getTileDown().gameObject.id != this.id ? 2 : 0 ;
			var l = tile.getTileLeft().gameObject.id != this.id ? 4 : 0;
			var r = tile.getTileRight().gameObject.id != this.id ? 8 : 0;
			var index = u + d + l + r;
			var indexes = [15,232,235,240,233,236,237,244,234,239,238,242,241,245,243,246];

			var spriteIndex = indexes[index] || 15;
			if (spriteIndex != tile.spriteIndex){
				tile.spriteIndex = spriteIndex;
				tile.refresh();
			}
		}
	});

	Y.gameObjects.EMERALD = emeraldMineObject({
		id: 200,
		code: "$1",
		spriteIndex: SPRITE.emerald,
		canBeCollected: true,
		canFall: true,
		isStableSurface: false,
		onCollect: function(by,tile,direction){
			Game.getScoreBoard().addScore(1);
			tile.animate(true,ANIMATION.emeraldDisappear);
		},
		eachStep : function(tile){
			Maybe(function(){tile.animate(false,ANIMATION.emeraldPing.frames,1,false)},0.1);

			//Maybe(function(){tile.animateIfPossible("Ping");},0.1);
		}
	});

	Y.gameObjects.DIAMOND = emeraldMineObject({
		id: 77,
		code: "$3",
		spriteIndex: SPRITE.diamond,
		canBeCollected: true,
		canFall: true,
		isStableSurface: false,
		animationCrushed: [209,210,211,212,212],
		canBeCrushedBy: function(tile){
			return tile.is(Y.gameObjects.BOULDER);
		},
		onCrushed: function(by,tile){
			tile.animate(true,this.animationCrushed);
			by.moveDown(true);
			console.error("diamond is gone");
		}
	});

	Y.gameObjects.BOULDER = emeraldMineObject({
		id: 26,
		code: "rr",
		spriteIndex: SPRITE.boulder,
		canFall: true,
		canBePushed:{
			vertical: false,
			horizontal: true,
			friction: 0.5
		},
		isStableSurface: false
	});


	Y.gameObjects.BOULDER_STUCK = emeraldMineObject({
		id: 26001,
		code: "rr_stuck",
		spriteIndex: SPRITE.boulder
	});


	Y.gameObjects.YAM = new emeraldMineObject({
		id: 163,
		spriteIndex: SPRITE.yam,
		code: "Yl",
		alias: "Yd,Yu,Yr",
		canMove: true,
		animationBite:[163,162,161,160,160,161,162,163],
		animationCrushed:[165,165,166,167,0],
		canBeCrushedBy: function(tile){
			return tile.is(Y.gameObjects.BOULDER);
		},
		eachStep: function(tile){

			if (tile.wasMoving()){
				tile.moveToDirection(tile.movedDirection);
			}else{
				Maybe(function(){
					tile.moveToDirection(Game.getRandomDirection())
				},0.8);
			}

			if (!tile.isMoving() && !tile.isAnimating()){
				tile.animate(false,ANIMATION.yamBite);
			}
		},
		explodeIntoObjects: function(){
			var result = [];
			for (var i = 0;i<9;i++){
				result.push(Y.gameObjects.EMERALD);
			}
			//result[4] = game.YAM;
			return result;
		},
		onCrushed: function(by,tile){
			tile.animate(true,this.animationCrushed);
			by.moveDown(true);
			tile.nextStep(function(tile){
				Y.gameObjects.EXPLOSION.explode(tile,Y.gameObjects.YAM.explodeIntoObjects());
			});
			//var explodeInto = this.explodeIntoObjects();
			//game.explode(me,explodeInto,"Smash")
		}
	});

	Y.gameObjects.YAM_UP = emeraldMineObject({id:16301,code:"Yu",spriteIndex:SPRITE.yam,eachStep:function(tile){tile.movedDirection = DIRECTION.up;tile.gameObject = Y.gameObjects.YAM;}});
	Y.gameObjects.YAM_DOWN = emeraldMineObject({id:16302,code:"Yd",spriteIndex:SPRITE.yam,eachStep:function(tile){tile.movedDirection = DIRECTION.down;tile.gameObject = Y.gameObjects.YAM;}});
	Y.gameObjects.YAM_RIGHT = emeraldMineObject({id:16303,code:"Yr",spriteIndex:SPRITE.yam,eachStep:function(tile){tile.movedDirection = DIRECTION.right;tile.gameObject = Y.gameObjects.YAM;}});


	Y.gameObjects.PLAYER = emeraldMineObject({
		id: 9,
		code: "P1",
		alias: "P",
		canMove: true,
		spriteIndex: SPRITE.player,
		canMoveTo: function(tile,direction,speed){
			if (tile.wasMoving()) return false;
			if (speed && speed>1){
				return tile.is(Y.gameObjects.EMPTYSPACE) && !tile.receiving;
			}
			if (tile.gameObject.canBeCollected) return true;
			if (tile.gameObject.canBePushed){
				switch (direction){
					case DIRECTION.left:
						if (tile.gameObject.canBePushed && tile.gameObject.canBePushed.horizontal && !tile.wasMoving()){
							Maybe(tile.moveLeft,tile.gameObject.canBePushed.friction || 1);
							if (tile.isMoving()) return true;
						}
						break;
					case DIRECTION.right:
						if (tile.gameObject.canBePushed && tile.gameObject.canBePushed.horizontal && !tile.wasMoving()){
							Maybe(tile.moveRight,tile.gameObject.canBePushed.friction || 1);
							if (tile.isMoving()) return true;
						}
						break
				}

			}

		},
		collect: function(target,direction,checked){
			if (checked){
				if (target.gameObject.onCollect) target.gameObject.onCollect(Y.gameObjects.PLAYER,target,direction);
			}else{
				if (target.gameObject.canBeCollected && !target.isMoving() && !target.transforming){
					if (target.gameObject.onCollect) target.gameObject.onCollect(Y.gameObjects.PLAYER,target,direction);
					//target.nextStep(function(tile){
					//	tile.gameObject = Y.gameObjects.EMPTYSPACE;
					//})

					target.turnInto(Y.gameObjects.EMPTYSPACE);
				}
			}
		},
		canBeCrushedBy: function(tile){
			return tile.is(Y.gameObjects.BOULDER) || tile.is(Y.gameObjects.EMERALD);
		},
		onCrushed: function(by,tile){
			//tile.animate(true,this.animationCrushed);
			by.moveDown(true);
			console.error("player crushed");
			tile.nextStep(function(tile){
				Y.gameObjects.EXPLOSION.explode(tile);
			})
		},
		onLongPress: function(){

			var tile = Game.getPlayer();
			if (!tile.getBottomLayer()){

				var dynaCount = this.getInventory("dynamiteCount") || 0;
				if (!dynaCount) return;
				this.setInventory("dynamiteCount",dynaCount-1);

				Y.gameObjects.DYNAMITE.setActive(tile);
			}
		},
		setInventory: function(key,value){
			this.inventory = this.inventory || {};
			this.inventory[key] = value;
			Game.getScoreBoard().refresh();
		},
		getInventory: function(key){
			return this.inventory ? this.inventory[key] : undefined;
		}

	});


	Y.gameObjects.EXPLOSION = new emeraldMineObject({
		id: 80,
		code: "**",
		eachStep: function(tile){
			if (!tile.isAnimating()){
				tile.animate(true,ANIMATION.explosion,1);
			}
		},
		explode: function(tile,objects){
			objects = objects || [];
			var objectCount = 0;
			for (y=tile.top-1;y<=tile.top+1;y++){
				for (x=tile.left-1;x<=tile.left+1;x++){
					var target = tile.parent.getTile(x,y);
					if (!target.gameObject.survivesExplosion){
						target.explosionObject = objects[objectCount] || Y.gameObjects.EMPTYSPACE;

						if (x!=tile.left || y!=tile.top){
							if (target.gameObject.code == Y.gameObjects.BOMB.code){
								//target.explosionObject = Y.gameObjects.BOMB_EXPLODE;
								target.nextStep(function(tile){
									Y.gameObjects.EXPLOSION.explode(tile);
								});
							}
						}

						target.gameObject = Y.gameObjects.BUSY;
						target.spriteIndex = undefined;
						target.animate(true,ANIMATION.explosion);


						target.nextStep(function(tile){
							tile.gameObject = tile.explosionObject;
							tile.setTopLayer(undefined);
							tile.spriteIndex = undefined;
						});
					}
					objectCount++;
				}
			}
		}
	});

	Y.gameObjects.BOMB_EXPLODE = emeraldMineObject({
		id: 252001,
		code: "Bo!",
		eachStep: function(tile){
			tile.animate(true,ANIMATION.bombSmash,1);
			tile.nextStep(function(tile){
				Y.gameObjects.EXPLOSION.explode(tile);
			});
		}
	});

	Y.gameObjects.BOMB = emeraldMineObject({
		id: 252,
		spriteIndex: SPRITE.bomb,
		code: "Bo",
		canFall: true,
		isStableSurface: false,
		canBePushed:{
			vertical: false,
			horizontal: true,
			friction: 0
		},
		canBeCrushedBy: function(object){
			return object.gameObject.code == Y.gameObjects.BOULDER.code;
		},
		onCrushed: function(by,me){
			me.animate(true,ANIMATION.bombSmash,1);
			me.nextStep(function(tile){
				Y.gameObjects.EXPLOSION.explode(tile);
			});
		},
		explosionDelay:1,
		onFallen: function(tile,on){
			tile.animate(true,ANIMATION.bombSmash,1);

			tile.nextStep(function(tile){
				Y.gameObjects.EXPLOSION.explode(tile);
			});
		},
		onExplode: function(){
			console.error("exploded")
		}
	});

	Y.gameObjects.SPIDER = emeraldMineObject({
		id: 54,
		spriteIndex: SPRITE.spider,
		code: "Tl",
		alias: "Tu,Td,Tr",
		canMove: true,
		canBeCrushedBy: function(tile){
			return tile.is(Y.gameObjects.BOULDER);
		},
		animationRight:[56,57,58,59,56],
		animationLeft:[60,61,62,63,60],
		animationUp:[51,52,53,52,51],
		animationDown:[49,48,50,48,49],
		animationRotateUpToRight:[68,68,69,69],
		animationRotateUpToLeft:[67,67,66,66],
		animationRotateRightToUp:[69,69,68,68],
		animationRotateRightToDown:[70,70,71,71],
		animationRotateDownToLeft:[65,65,64,64],
		animationRotateDownToRight:[71,71,70,70],
		animationRotateLeftToUp:[66,66,67,67],
		animationRotateLeftToDown:[65,65,64,64],
		explodeIntoObjects: function(){
			return GameObjects.EMPTYSPACE;
		},
		turn: function(tile,direction){
			var anim = "animationRotate" +
				Game.getDirectionName(tile.movedDirection) +
				"To" +
				Game.getDirectionName(direction);

			var animation = this[anim];
			if (animation){
				tile.animate(true,animation,1);
			}else{
				console.warn("Animation " + anim + " is missing");
			}

			tile.setNextProperty("hasTurned",true);
			tile.setNextProperty("movedDirection",direction);
			tile.isTurning = true;
		},
		eachStep: function(tile){

			if (tile.isNextTo(Game.getPlayer().gameObject)){
				//game.explodeBig(object,object.getExplodeIntoObjects());
				console.error("player die");
				//return;
			}

			if (tile.hasTurned){
				tile.setNextProperty("hasTurned",false);
				tile.moveToDirection(tile.movedDirection);
				tile.moved = true;
			}


			if (tile.wasMoving() && !tile.isMoving()){
				// turn left if 	possible
				var preferedDirection = Game.getDirectionTurnedLeft(tile.movedDirection);
				if (tile.canMoveToDirection(preferedDirection)){
					this.turn(tile,preferedDirection);
				}else{
					// if cannot turn right, move forward
					tile.moveToDirection(tile.movedDirection);

					if (!tile.isMoving()){
						// still not moving? try turn right
						var unPreferedDirection = Game.getDirectionTurnedRight(tile.movedDirection);

						if (tile.canMoveToDirection(unPreferedDirection)){
							this.turn(tile,unPreferedDirection);
						}else{
							// can't go right either, nothing left to do: turn around
							this.turn(tile,preferedDirection);
						}
					}
				}
			}

			if (!tile.isMoving() && !tile.isTurning){
				// start of game, Spider should always be moving or turning;
				tile.moveToDirection(Game.getRandomDirection());
				if (!tile.isMoving()){
					this.turn(tile,Game.getRandomDirection());
				}
			}
		},
		onMoving: function(tile){
			var anim = this["animation" + Game.getDirectionName(tile.moveDirection)];
			if (anim) tile.animate(true,anim);
		},
		onCrushed: function(by,me){
			console.error("spider cruhed by " , by);
			//var explodeInto = me.getExplodeIntoObjects();
			//game.explode(me,explodeInto,"Smash")
		}
	});
	Y.gameObjects.SPIDER_UP = emeraldMineObject({id:5401,code:"Tu",spriteIndex:SPRITE.spider});
	Y.gameObjects.SPIDER_DOWN = emeraldMineObject({id:5402,code:"Td",spriteIndex:SPRITE.spider});
	Y.gameObjects.SPIDER_RIGHT = emeraldMineObject({id:5403,code:"Tr",spriteIndex:SPRITE.spider});

	Y.gameObjects.BUG = new emeraldMineObject({
		id: 169,
		spriteIndex: SPRITE.bug,
		code: "Bl",
		alias: "Bu,Bd,Br",
		canMove: true,
		canBeCrushedBy: function(tile){
			return tile.is(Y.gameObjects.BOULDER);
		},
		animationRight:[179,180,181,180],
		animationLeft:[168,169,170,169],
		animationUp:[171,172,173,172],
		animationDown:[176,177,178,177],
		animationRotateUpToRight:[171,187,188,189,179],
		animationRotateUpToLeft:[171,186,185,184,168],
		animationRotateRightToUp:[179,189,188,187,171],
		animationRotateRightToDown:[179,192,193,194,176],
		animationRotateDownToLeft:[176,195,196,197,168],
		animationRotateDownToRight:[176,194,193,192,179],
		animationRotateLeftToUp:[168,184,185,186,171],
		animationRotateLeftToDown:[168,197,196,195,176],
		explodeIntoObjects: function(){
			return [
				Y.gameObjects.EMERALD,
				Y.gameObjects.EMERALD,
				Y.gameObjects.EMERALD,
				Y.gameObjects.EMERALD,
				Y.gameObjects.DIAMOND,
				Y.gameObjects.EMERALD,
				Y.gameObjects.EMERALD,
				Y.gameObjects.EMERALD,
				Y.gameObjects.EMERALD
			]
		},
		turn: function(tile,direction){
			var anim = "animationRotate" +
				Game.getDirectionName(tile.movedDirection) +
				"To" +
				Game.getDirectionName(direction);

			var animation = this[anim];
			if (animation){
				tile.animate(true,animation,1);
			}else{
				console.warn("Animation " + anim + " is missing");
			}

			tile.setNextProperty("hasTurned",true);
			tile.setNextProperty("movedDirection",direction);
			tile.isTurning = true;
		},
		eachStep: function(tile){
			if (tile.isNextTo(Game.getPlayer().gameObject)){
				//game.explodeBig(object,object.getExplodeIntoObjects());
				console.error("player die");
				//return;
			}

			if (tile.hasTurned){
				tile.setNextProperty("hasTurned",false);
				tile.moveToDirection(tile.movedDirection);
				tile.moved = true;
			}

			if (tile.wasMoving() && !tile.isMoving()){
				// turn right if possible
				var preferedDirection = Game.getDirectionTurnedRight(tile.movedDirection);

				if (tile.canMoveToDirection(preferedDirection)){
					this.turn(tile,preferedDirection);
				}else{
					// if cannot turn right, move forward
					tile.moveToDirection(tile.movedDirection);

					if (!tile.isMoving()){
						// still not moving? try turn right
						var unPreferedDirection = Game.getDirectionTurnedLeft(tile.movedDirection);

						if (tile.canMoveToDirection(unPreferedDirection)){
							this.turn(tile,unPreferedDirection);
						}else{
							// can't go left either, nothing left to do: turn around
							this.turn(tile,preferedDirection);
						}
					}
				}
			}

			if (!tile.isMoving() && !tile.isTurning){
				// start of game, Bug should always be moving or turning;
				tile.moveToDirection(Game.getRandomDirection());
				if (!tile.isMoving()){
					this.turn(tile,Game.getRandomDirection());
				}
			}
		},
		onMoving: function(tile){
			var anim = this["animation" + Game.getDirectionName(tile.moveDirection)];
			if (anim) tile.animate(true,anim,1,true);
		},
		onCrushed: function(by,tile){
			var explodeInto = this.explodeIntoObjects;
			console.error("bug cruhed by " , by);
			//tile.animate(true,this.animationCrushed);
			by.moveDown(true);
			tile.nextStep(function(tile){
				Y.gameObjects.EXPLOSION.explode(tile, Y.gameObjects.BUG.explodeIntoObjects());
			});
		}
	});
	Y.gameObjects.BUG_UP = emeraldMineObject({id:16901,code:"Bu",spriteIndex:SPRITE.bug,eachStep:function(tile){tile.movedDirection = DIRECTION.up;tile.gameObject = Y.gameObjects.BUG;}});
	Y.gameObjects.BUG_DOWN = emeraldMineObject({id:16902,code:"Bd",spriteIndex:SPRITE.bug,eachStep:function(tile){tile.movedDirection = DIRECTION.down;tile.gameObject = Y.gameObjects.BUG;}});
	Y.gameObjects.BUG_RIGHT = emeraldMineObject({id:16903,code:"Br",spriteIndex:SPRITE.bug,eachStep:function(tile){tile.movedDirection = DIRECTION.right;tile.gameObject = Y.gameObjects.BUG;}});



	Y.gameObjects.NUT = new emeraldMineObject({
		id: 164,
		spriteIndex: SPRITE.nut,
		code: "Nu",
		canFall: true,
		isStableSurface: false,
		canBePushed:{
			vertical: false,
			horizontal: true,
			friction: 0.5
		},
		onHit: function(by,direction,me){
			if (by.is(Y.gameObjects.BOULDER) && direction == DIRECTION.down){
				me.turnInto(Y.gameObjects.EMERALD);
			}
		}
	});


	Y.gameObjects.EXIT = emeraldMineObject({
		id:114,
		spriteIndex: SPRITE.exit,
		code:"XX",
		eachStep: function(tile){
			if (Game.getScoreBoard().hasTargetScore()){
				tile.gameObject = Y.gameObjects.EXIT_OPEN;
				tile.animate(true,Y.gameObjects.EXIT_OPEN.animationSparkle,1,true);
			}
		}
	});
	Y.gameObjects.EXIT_OPEN = emeraldMineObject({
		id:104,
		spriteIndex: SPRITE.exitOpen,
		code:"X2",
		canBeCollected: true,
		animationSparkle: [104,105,106,107,108,109,110,111],
		onCollect : function(){
			console.error("done");
		},
		eachStep : function(tile){
			if (!tile.isAnimating()) tile.animate(true,Y.gameObjects.EXIT_OPEN.animationSparkle,1,true);
		}
	});

	Y.gameObjects.ROBOT = emeraldMineObject({
		id:248,
		spriteIndex: SPRITE.robot,
		code:"Ro",
		canMove: true,
		moveProbability: 0.4,
		canBeCrushedBy: function(object){
			return object.gameObject.code == Y.gameObjects.BOULDER.code;
		},
		onCrushed : function(by,me){
			Y.gameObjects.EXPLOSION.explode(me);
		},
		animationPulsate: [248],
		eachStep: function(me){
			if (!me.isAnimating()){
				//me.animate("Pulsate");
			}
			if (!me.isMoving() && !me.wasMoving()){
				Maybe(function(){
					var player = Game.getPlayer();
					var x = player.left;
					var y = player.top;
					if (me.left < x) me.moveRight();
					if (me.left > x) me.moveLeft();
					if (me.top < y) me.moveDown();
					if (me.top > y) me.moveUp();
				},me.gameObject.moveProbability);
			}
		}
	});
	Y.gameObjects.ROBOT_WHEEL = emeraldMineObject({id:256,code:"Rw",spriteIndex: SPRITE.robotWheel});

	Y.gameObjects.DOOR_BLUE = emeraldMineObject({id:264,spriteIndex: SPRITE.doorBlue,onTop: true,code:"Db",survivesExplosion: true,canPassThroughDouble:function(){return Game.getPlayer().gameObject.getInventory("keyBlue");}});
	Y.gameObjects.DOOR_GREEN = emeraldMineObject({id:265,spriteIndex: SPRITE.doorGreen,onTop: true,code:"Dg",survivesExplosion: true,canPassThroughDouble:function(){return Game.getPlayer().gameObject.getInventory("keyGreen");}});
	Y.gameObjects.DOOR_YELLOW = emeraldMineObject({id:266,spriteIndex: SPRITE.doorYellow,onTop: true,code:"Dy",survivesExplosion: true,canPassThroughDouble:function(){return Game.getPlayer().gameObject.getInventory("keyYellow");}});
	Y.gameObjects.DOOR_RED = emeraldMineObject({id:267,spriteIndex: SPRITE.doorRed,onTop: true, code:"Dr",survivesExplosion: true,canPassThroughDouble:function(){return Game.getPlayer().gameObject.getInventory("keyRed");}});

	Y.gameObjects.DOOR_GREY_BLUE = emeraldMineObject({id:280,spriteIndex: SPRITE.doorGreyBlue,onTop: true,code:"db",survivesExplosion: true,canPassThroughDouble:function(){return Game.getPlayer().gameObject.getInventory("keyBlue");}});
	Y.gameObjects.DOOR_GREY_GREEN = emeraldMineObject({id:281,spriteIndex: SPRITE.doorGreyGreen,onTop: true,code:"dg",survivesExplosion: true,canPassThroughDouble:function(){return Game.getPlayer().gameObject.getInventory("keyGreen");}});
	Y.gameObjects.DOOR_GREY_YELLOW = emeraldMineObject({id:282,spriteIndex: SPRITE.doorGreyYellow,onTop: true,code:"dy",survivesExplosion: true,canPassThroughDouble:function(){return Game.getPlayer().gameObject.getInventory("keyYellow");}});
	Y.gameObjects.DOOR_GREY_RED = emeraldMineObject({id:283,spriteIndex: SPRITE.doorGreyRed,onTop: true,code:"dr",survivesExplosion: true,canPassThroughDouble:function(){return Game.getPlayer().gameObject.getInventory("keyRed");}});

	Y.gameObjects.KEY_BLUE = emeraldMineObject({
		id:272,
		spriteIndex: SPRITE.keyBlue,
		code:"Kb",
		canBeCollected: true,
		isStableSurface: false,
		onCollect: function(by){
			Game.getPlayer().gameObject.setInventory("keyBlue",true);
		}
	});
	Y.gameObjects.KEY_GREEN = emeraldMineObject({
		id:273,
		spriteIndex: SPRITE.keyGreen,
		code:"Kg",
		canBeCollected: true,
		isStableSurface: false,
		onCollect: function(by){
			Game.getPlayer().gameObject.setInventory("keyGreen",true);
		}
	});
	Y.gameObjects.KEY_YELLOW = emeraldMineObject({
		id:274,
		spriteIndex: SPRITE.keyYellow,
		code:"Ky",
		canBeCollected: true,
		isStableSurface: false,
		onCollect: function(by){
			Game.getPlayer().gameObject.setInventory("keyYellow",true);
		}
	});
	Y.gameObjects.KEY_RED = emeraldMineObject({
		id:275,
		spriteIndex: SPRITE.keyRed,
		code:"Kr",
		canBeCollected: true,
		isStableSurface: false,
		onCollect: function(by){
			Game.getPlayer().gameObject.setInventory("keyRed",true);
		}
	});

	Y.gameObjects.QUICKSAND = emeraldMineObject({
		id:288,
		spriteIndex: SPRITE.quickSand,
		code:"Q.",
		onTop: true,
		eachStep: function(tile){
			var boulder = tile.getTileUp();
			if (boulder.is(Y.gameObjects.BOULDER)){
				boulder.gameObject = Y.gameObjects.BOULDER_STUCK;
				boulder.nextStep(function(){
					boulder.moveY = 1; // to trigger moving objects render

					var slow = 4;
					var stepOffset = tile.height / slow;

					boulder.parent.registerStepAction(0,1,function(state,progress){
						boulder.offsetTop = (progress * stepOffset);
					});

					boulder.nextStep(function(){
						boulder.parent.registerStepAction(0,1,function(state,progress){
							boulder.offsetTop = stepOffset + (progress * stepOffset);
						});

						boulder.nextStep(function() {
							boulder.parent.registerStepAction(0, 1, function (state, progress) {
								boulder.offsetTop = (stepOffset*2) + (progress * stepOffset);
							});

							boulder.nextStep(function() {
								boulder.parent.registerStepAction(0, 1, function (state, progress) {
									boulder.offsetTop = (stepOffset*3) + (progress * stepOffset);
								});

								boulder.nextStep(function(){
									boulder.gameObject = Y.gameObjects.EMPTYSPACE;
									boulder.moveY = 0;
									boulder.offsetTop = 0;
									boulder.refresh();
									tile.gameObject = Y.gameObjects.QUICKSAND_ROCK;
									tile.refresh();
								});
							});

						});

					});
				});

			}

		}

	});
	Y.gameObjects.QUICKSAND_ROCK = emeraldMineObject({
		id:28801,
		code:"Qr",
		spriteIndex: SPRITE.quickSandRock,
		onTop: true,
		eachStep: function(tile){
			var boulder = tile.getTileDown();
			if (boulder.is(Y.gameObjects.EMPTYSPACE)){

				// custom animation
				boulder.gameObject = Y.gameObjects.BOULDER_STUCK;
				boulder.refresh();
				boulder.moveY = 1; // to trigger moving objects render

				var slow = 4;
				var stepOffset = tile.height / slow;


				boulder.offsetTop = -tile.height;
				boulder.parent.registerStepAction(0,1,function(state,progress){
					boulder.offsetTop = -(stepOffset*4) + (progress * stepOffset);
				});

				boulder.nextStep(function(){
					boulder.parent.registerStepAction(0,1,function(state,progress){
						boulder.offsetTop = -(stepOffset*3) + (progress * stepOffset);
					});

					boulder.nextStep(function(){
						boulder.parent.registerStepAction(0,1,function(state,progress){
							boulder.offsetTop = -(stepOffset*2) + (progress * stepOffset);
						});

						boulder.nextStep(function(me){
							boulder.parent.registerStepAction(0,1,function(state,progress){
								boulder.offsetTop = -stepOffset + (progress * stepOffset);
							});

							boulder.nextStep(function(me){
								tile.gameObject = Y.gameObjects.QUICKSAND;
								me.gameObject = Y.gameObjects.BOULDER;
								boulder.moveY = 0;
								boulder.offsetTop = 0;
								me.refresh();
								tile.refresh();
							})
						})
					});
				});
			}
		}
	});
	Y.gameObjects.MAGICWALL = emeraldMineObject({
		id:289,
		code:"Wm",
		spriteIndex: SPRITE.magicWall
	});

	Y.gameObjects.DYNAMITE = emeraldMineObject({
		id:112,
		spriteIndex: SPRITE.dynamite,
		code:"dD",
		canBeCollected: true,
		onCollect: function(by){
			var p = Game.getPlayer().gameObject;
			var dynaCount = p.getInventory("dynamiteCount") || 0;
			p.setInventory("dynamiteCount",dynaCount+1);
		},
		setActive: function(tile){
			tile.setBottomLayer(113);
			tile.nextStep(function(){
				tile.setBottomLayer(112);
				tile.nextStep(function(){
					tile.setBottomLayer(113);
					tile.nextStep(function(){
						tile.setBottomLayer(112);
						tile.nextStep(function(){
							tile.setBottomLayer(0);
							Y.gameObjects.EXPLOSION.explode(tile,[]);
						})
					})
				})
			})
		}
	});


	Y.gameObjects.DYNAMITE_ACTIVE = emeraldMineObject({
		id:112,
		spriteIndex: SPRITE.dynamiteActive,
		code:"dA",
		eachStep:function(tile){
			tile.gameObject = Y.gameObjects.BUSY;
			Y.gameObjects.DYNAMITE.setActive(tile);
		}
	});


	Y.gameObjects.SPACE_FAKE = emeraldMineObject({id:286,code:" f"});

	Y.gameObjects.AMOEBA = emeraldMineObject({id:312,code:"a1"});


	Y.gameObjects.ACID = emeraldMineObject({
		id:294,
		spriteIndex: SPRITE.acid,
		code:"Aa",
		canBeCollected:true,
		onReceive: function(tile){
			tile.moveTarget.nextObject.gameObject = Y.gameObjects.ACID;
		}});
	Y.gameObjects.ACID2 = emeraldMineObject({id:29401,code:"Ai",spriteIndex:294,canBeCollected:true});
	Y.gameObjects.ACIDBOX_TOPLEFT = emeraldMineObject({id:293,code:"A1"});
	Y.gameObjects.ACIDBOX_BOTTOMLEFT = emeraldMineObject({id:301,code:"A2"});
	Y.gameObjects.ACIDBOX_BOTTOM = emeraldMineObject({id:302,code:"A3"});
	Y.gameObjects.ACIDBOX_BOTTOMRIGHT = emeraldMineObject({id:303,code:"A4"});
	Y.gameObjects.ACIDBOX_TOPRIGHT = emeraldMineObject({id:295,code:"A5"});

	Y.gameObjects.CHAR_0 = emeraldMineObject({id:118,code:"_0"});
	Y.gameObjects.CHAR_1 = emeraldMineObject({id:119,code:"_1"});
	Y.gameObjects.CHAR_2 = emeraldMineObject({id:120,code:"_2"});
	Y.gameObjects.CHAR_3 = emeraldMineObject({id:121,code:"_3"});
	Y.gameObjects.CHAR_4 = emeraldMineObject({id:122,code:"_4"});
	Y.gameObjects.CHAR_5 = emeraldMineObject({id:123,code:"_5"});
	Y.gameObjects.CHAR_6 = emeraldMineObject({id:124,code:"_6"});
	Y.gameObjects.CHAR_7 = emeraldMineObject({id:125,code:"_7"});
	Y.gameObjects.CHAR_8 = emeraldMineObject({id:126,code:"_8"});
	Y.gameObjects.CHAR_9 = emeraldMineObject({id:127,code:"_9"});
	Y.gameObjects.CHAR_A = emeraldMineObject({id:128,code:"_A"});
	Y.gameObjects.CHAR_B = emeraldMineObject({id:129,code:"_B"});
	Y.gameObjects.CHAR_C = emeraldMineObject({id:130,code:"_C"});
	Y.gameObjects.CHAR_D = emeraldMineObject({id:131,code:"_D"});
	Y.gameObjects.CHAR_E = emeraldMineObject({id:132,code:"_E"});
	Y.gameObjects.CHAR_F = emeraldMineObject({id:133,code:"_F"});
	Y.gameObjects.CHAR_G = emeraldMineObject({id:134,code:"_G"});
	Y.gameObjects.CHAR_H = emeraldMineObject({id:135,code:"_H"});
	Y.gameObjects.CHAR_I = emeraldMineObject({id:136,code:"_I"});
	Y.gameObjects.CHAR_J = emeraldMineObject({id:137,code:"_J"});
	Y.gameObjects.CHAR_K = emeraldMineObject({id:138,code:"_K"});
	Y.gameObjects.CHAR_L = emeraldMineObject({id:139,code:"_L"});
	Y.gameObjects.CHAR_M = emeraldMineObject({id:140,code:"_M"});
	Y.gameObjects.CHAR_N = emeraldMineObject({id:141,code:"_N"});
	Y.gameObjects.CHAR_O = emeraldMineObject({id:142,code:"_O"});
	Y.gameObjects.CHAR_P = emeraldMineObject({id:143,code:"_P"});
	Y.gameObjects.CHAR_Q = emeraldMineObject({id:144,code:"_Q"});
	Y.gameObjects.CHAR_R = emeraldMineObject({id:145,code:"_R"});
	Y.gameObjects.CHAR_S = emeraldMineObject({id:146,code:"_S"});
	Y.gameObjects.CHAR_T = emeraldMineObject({id:147,code:"_T"});
	Y.gameObjects.CHAR_U = emeraldMineObject({id:148,code:"_U"});
	Y.gameObjects.CHAR_V = emeraldMineObject({id:149,code:"_V"});
	Y.gameObjects.CHAR_W = emeraldMineObject({id:150,code:"_W"});
	Y.gameObjects.CHAR_X = emeraldMineObject({id:151,code:"_X"});
	Y.gameObjects.CHAR_Y = emeraldMineObject({id:152,code:"_Y"});
	Y.gameObjects.CHAR_Z = emeraldMineObject({id:153,code:"_Z"});
	Y.gameObjects.CHAR_ARROW_RIGHT = emeraldMineObject({id:158,code:"_>"});
	Y.gameObjects.CHAR_PERIOD = emeraldMineObject({id:154,code:"_."});
}

function buildGameObjectMap(){
	for (var key in Y.gameObjects){
		if (Y.gameObjects.hasOwnProperty(key)){
			var object = Y.gameObjects[key];
			Y.gameObjectForCode[object.code] = object;
		}
	}
}
