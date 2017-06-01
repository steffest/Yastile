Yascal.tile = function(initialProperties){
	var me;

	me = Y.element(initialProperties);

	me.gameObject = initialProperties.gameObject || {};
	me.parent = initialProperties.parent || {};
	me.offsetLeft = 0;
	me.offsetTop = 0;
	me.moveX = 0;
	me.moveY = 0;

	var bottomLayer;
	var topLayer;

	me.render = function(){

		var spriteIndex = me.animation ? me.animation.frames[me.animation.currentFrame] : me.spriteIndex || me.gameObject.spriteIndex;
		if (Y.useWebGL){
			if (spriteIndex){
				me.region = me.parent.spriteSheet.sprites[spriteIndex].region;
			}else{
				me.region = undefined;
			}
		}else{
			if (me.needsRendering){
				me.ctx.clearRect(0,0,me.width,me.height);



				if (spriteIndex){
					var sprite = me.parent.spriteSheet.sprites[spriteIndex];
					if (sprite){
						me.ctx.drawImage(sprite.canvas,0,0,me.width,me.height);
					}

				}
			}
			me.needsRendering = false;
			return me.canvas;
		}
	};

	me.getBackground = function(){
		return SPRITE.backGroundTile;
	};
	me.getBottomLayer = function(){
		return bottomLayer;
	};
	me.getTopLayer = function(){
		return topLayer;
	};
	me.setBottomLayer = function(index){
		bottomLayer = index;
	};
	me.setTopLayer = function(index){
		topLayer = index;
	};

	me.canMoveTo=function(tile,direction,speed){
		if (!tile) return false;
		if (!tile.gameObject) return true;
		if (tile.receiving) return false;
		if (!me.gameObject.canMoveTo) return false;




		return me.gameObject.canMoveTo(tile,direction,speed);

		//return (tile.gameObject.color == "black" || tile.gameObject.color == "green");
	};

	me.canMoveToDirection=function(direction){

		var tile =  me.getTileDirection(direction);

		if (!tile) return false;
		if (!tile.gameObject) return true;
		if (!me.gameObject.canMoveTo) return false;

		return me.gameObject.canMoveTo(tile,direction);

		//return (tile.gameObject.color == "black" || tile.gameObject.color == "green");
	};

	me.moveRight = function(checked,speed){
		speed = speed || 1;
		if (me.isMoving()) return;
		var target = me.parent.getTile(me.left + (1 * speed),me.top);
		if (checked || me.canMoveTo(target,DIRECTION.right,speed)){
			me.moveDirection = DIRECTION.right;
			me.moveTarget = target;
			if (target) me.moveTarget.receiving = me;
			me.move(me.width * speed,0);
			me.gameObject.onMoving(me);
		}
	};

	me.moveLeft = function(checked,speed){
		speed = speed || 1;
		if (me.isMoving()) return;
		var target = me.parent.getTile(me.left - (1 * speed),me.top);
		if (checked || me.canMoveTo(target,DIRECTION.left,speed)){
			me.moveDirection = DIRECTION.left;
			me.moveTarget = target;
			if (target) me.moveTarget.receiving = me;
			me.move(-me.width*speed,0);
			me.gameObject.onMoving(me);
		}
	};

	me.moveUp = function(checked,speed){
		speed = speed || 1;
		if (me.isMoving()) return;
		var target =  me.parent.getTile(me.left, me.top - (1 * speed));
		if (checked || me.canMoveTo(target,DIRECTION.up,speed)) {
			me.moveDirection = DIRECTION.up;
			me.moveTarget = target;
			if (target) me.moveTarget.receiving = me;
			me.move(0, -me.height*speed);
			me.gameObject.onMoving(me);
		}
	};

	me.moveDown = function(checked,speed){
		speed = speed || 1;
		if (me.isMoving()) return;
		var target =  me.parent.getTile(me.left,me.top + (1 * speed));
		if (checked || me.canMoveTo(target,DIRECTION.down,speed)) {
			me.moveDirection = DIRECTION.down;
			me.moveTarget = target;
			if (target) me.moveTarget.receiving = me;
			me.move(0,me.height*speed);
			me.gameObject.onMoving(me);
		}
	};

	me.moveToDirection = function(direction,checked,speed){
		switch (direction){
			case DIRECTION.left:
				me.moveLeft(checked,speed);
				break;
			case DIRECTION.right:
				me.moveRight(checked,speed);
				break;
			case DIRECTION.up:
				me.moveUp(checked,speed);
				break;
			case DIRECTION.down:
				me.moveDown(checked,speed);
				break;
		}
	};


	me.move = function(x,y){
		me.moveX = x;
		me.moveY = y;
		if (me.isPlayer()){
			me.parent.centerTile(me.moveTarget);
			me.moveTarget.nextStep(function(tile){
				Game.setPlayer(tile);
			});
		}

		me.nextStep(function(tile){
			tile.gameObject = Y.gameObjects.EMPTYSPACE;
			if (tile.getBottomLayer()) tile.gameObject = Y.gameObjects.BUSY;
			tile.spriteIndex = undefined;
			tile.animation = undefined;
			tile.moveTarget = undefined;
			tile.refresh();

		});

		me.moveTarget.nextObject = {
			gameObject: me.gameObject,
			animation: me.animation,
			spriteIndex: me.spriteIndex,
			moveDirection: me.moveDirection
		};
		if (me.moveTarget.gameObject.onReceive) me.moveTarget.gameObject.onReceive(me);

		me.moveTarget.originTile = me;

		me.moveTarget.nextStep(function(tile){
			tile.gameObject = tile.nextObject.gameObject;
			tile.receiving = undefined;
			tile.moved = 1;
			tile.movedDirection = tile.nextObject.moveDirection;
			tile.animation = tile.nextObject.animation;
			tile.spriteIndex = tile.nextObject.spriteIndex;
			tile.nextObject = undefined;
			tile.refresh();
		});

		me.parent.registerStepAction(0,1,function(state,progress){
			me.offsetLeft = me.moveX*progress;
			me.offsetTop = me.moveY*progress;

			// shouldn't this be done at Set ?
			if (progress == 1){
				me.moveX = 0;
				me.moveY = 0;
				me.offsetLeft = 0;
				me.offsetTop = 0;
			}

			me.parent.refresh();
		})
	};

	me.isMoving = function(){
		return (me.moveX != 0 || me.moveY != 0);
	};

	me.wasMoving = function(){
		return !!(me.moved);
	};

	me.isPlayer = function(){
		return me.gameObject.id == Y.gameObjects.PLAYER.id;
	};

	me.getTileDown = function(){
		return me.parent.getTile(me.left,me.top + 1)
	};
	me.getTileUp = function(){
		return me.parent.getTile(me.left,me.top - 1)
	};
	me.getTileLeft = function(){
		return me.parent.getTile(me.left-1,me.top)
	};
	me.getTileRight = function(){
		return me.parent.getTile(me.left+1,me.top)
	};
	me.getTileDownLeft = function(){
		return me.parent.getTile(me.left-1,me.top + 1)
	};
	me.getTileDownRight = function(){
		return me.parent.getTile(me.left+1,me.top + 1)
	};
	me.getTileDirection = function(direction){
		switch (direction){
			case DIRECTION.left: return me.getTileLeft(); break;
			case DIRECTION.right: return me.getTileRight(); break;
			case DIRECTION.up: return me.getTileUp(); break;
			case DIRECTION.down: return me.getTileDown(); break;
		}
	};

	me.is = function(object){
		return me.gameObject && me.gameObject.id == object.id;
	};
	me.isGoingToBe = function(object){
		return me.receiving && me.receiving.id == object.id;
	};

	// updates all the tiles to the new situation
	// this needs to be done for each tile before processing to set the entire grid to a state.
	me.set = function(step){

		if (me.setStep == step) return;
		me.setStep = step;

		if (me.next && me.next.length){
			var todo = me.next.slice(0);
			me.next = [];
			todo.forEach(function(t){
				if (t.step <= step){
					t.f(me);
				}else{
					me.next.push(t);
				}
			});
		}

	};

	me.process = function(){
		if (me.gameObject && me.gameObject.process) me.gameObject.process(me);
		if (me.moved) me.moved--;
	};

	me.animate = function(override,animation,speed,repeat){
		var frames = animation.frames || animation;
		var name = animation.name;
		speed = speed || 1;

		if (!me.animation || override){
			var setAnimation = true;
			if (override && repeat && me.animation && me.animation.name){
				if (me.animation.name == name) setAnimation = false;
			}

			if (setAnimation){
				me.animation = {
					currentFrame: 0,
					step:0,
					frames:frames,
					speed: speed,
					repeat: repeat,
					name: name
				}
			}
		}
		me.refresh();
	};

	me.isAnimating = function(){
		return !! me.animation;
	};

	me.updateAnimation = function(){
		// this is currently tied to the frame rate in the render loop of the tilemap... decouple it ?
		if (me.animation){
			me.animation.step++;
			me.animation.currentFrame = Math.floor(me.animation.step * me.animation.speed);
			if (me.animation.currentFrame>=me.animation.frames.length){
				if (me.animation.repeat) {
					me.animation.currentFrame = 0;
					me.animation.step=0;
				}else{
					me.animation = undefined;
				}
			}
			if (me.moveTarget && me.moveTarget.nextObject) me.moveTarget.nextObject.animation = me.animation;
			me.refresh();
		}
		return !!me.animation;
	};

	// schecule somethin to happen on a certain step
	me.onStep = function(f,step){
		me.next = me.next || [];
		me.next.push({f:f,step:step});
	};

	me.nextStep = function(f){
		me.onStep(f,me.parent.getCurrentStep()+1);
	};

	me.setNextProperty = function(key,value){
		me.nextStep(function(tile){
			tile[key] = value;
		});
	};

	me.turnInto = function(object){
		me.nextStep(function(tile){
			tile.gameObject = object;
			tile.spriteIndex = undefined;
			tile.animation = undefined;
			tile.refresh();
		});
	};

	me.isNextTo = function(gameObject){
		var l = me.getTileLeft().gameObject.id;
		var r = me.getTileRight().gameObject.id;
		var d = me.getTileDown().gameObject.id;
		var u = me.getTileUp().gameObject.id;

		var id = gameObject.id;

		return ((l == id) || (u == id) || (r == id) || (d == id))
	};


	return me;
};