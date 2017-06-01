var emeraldMineObject = function(properties){
	var me = {};
	me.type = "EMERALDOBJECT";

	function setDefault(property,value){
		if (typeof me[property] == "undefined") me[property]=value;
	}

	var hasFunction = false;
	for (var key in properties){
		me[key] = properties[key];
		if (typeof properties[key] == "function") hasFunction=true;
	}

	if (!me.spriteIndex && me.spriteIndexes) me.spriteIndex = me.spriteIndexes[0];
	if (!me.spriteIndex) me.spriteIndex = me.id;
	setDefault("canMove",false);
	setDefault("canBeCollected",false);
	setDefault("canFall",false);
	setDefault("isStableSurface",true);

	if (me.canFall){
		setDefault("onFallen",function(object,on){
			if (!on.isMoving() && on.gameObject.canBeCrushedBy && on.gameObject.canBeCrushedBy(object)){
				object.moveDown();
				if (on.gameObject.onCrushed) on.gameObject.onCrushed(object,on);
			}
		});
	}

	me.isActive = (me.canMove || me.canFall || hasFunction);

	if (me.isActive){
		me.process = function(tile){
			if (me.canFall && !tile.receiving){
				var tileDown = tile.getTileDown();
				if (me.canMoveTo(tileDown) && !tileDown.receiving){
					tile.moveDown(true);
				}else{
					if (tileDown.is(Y.gameObjects.PLAYER) && tileDown.isMoving() && tileDown.moveDirection != DIRECTION.up && !tileDown.getBottomLayer()){
						tile.moveDown(true);
					}
				}

				if (!tile.isMoving()){
					if (tile.wasMoving() && tile.movedDirection == DIRECTION.down){
						// object has fallen onto something
						var targetTile = tile.getTileDown();
						if (tile.gameObject.onFallen) tile.gameObject.onFallen(tile,targetTile);
						if (targetTile.gameObject.onHit) targetTile.gameObject.onHit(tile,DIRECTION.down,targetTile);
					}

					if (!tile.wasMoving() && !tile.getTileDown().gameObject.isStableSurface && !tile.getTileDown().receiving){
						var canMoveLeft = tile.canMoveTo(tile.getTileLeft(),DIRECTION.left) && tile.canMoveTo(tile.getTileDownLeft(),DIRECTION.down);
						var canMoveRight = tile.canMoveTo(tile.getTileRight(),DIRECTION.right) && tile.canMoveTo(tile.getTileDownRight(),DIRECTION.down);


						if (canMoveLeft && canMoveRight){
							tile.moveToDirection(Game.getRandomHorizontalDirection(),true);
						}

						if (canMoveLeft && !tile.isMoving()) tile.moveLeft(true);
						if (canMoveRight && !tile.isMoving()) tile.moveRight(true);
					}
				}
			}

			if (me.eachStep) me.eachStep(tile);
		};


		if (!me.canMoveTo){
			me.canMoveTo = function(tile,direction,speed){
				speed = speed || 1;
				if (tile.receiving) return false;
				if (tile.is(Y.gameObjects.EMPTYSPACE)) return true;
				if (tile.is(Y.gameObjects.ACID)) return true;
				if (tile.is(Y.gameObjects.ACID2)) return true;
				if (speed == 1 && tile.is(Y.gameObjects.PLAYER) && tile.isMoving()){
					if (tile.moveDirection != DIRECTION_OPPOSITE[direction]) return true;
				}
				return false;
			}
		}


		setDefault("onMoving",function(){});

	}


	return me;
};
