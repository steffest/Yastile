// TODO rename to gridObject

var MapPosition = function(gameObject,index,mapLayer){
    this.gameObject = gameObject;
    this.id = gameObject.id;
    this.index = index;
    this.staticFrame = gameObject.getStaticFrame();
    this.mapLayer = mapLayer;

    this.left = index % mapLayer.levelWidth;
    this.top = Math.floor(index / mapLayer.levelWidth);

    // override this if you want certain tiles to move faster/slower
    this.tileSize = Game.getTileSize();
    this.tickOffset = this.tileSize/Game.getTargetTicksPerSecond();
};

MapPosition.prototype.isVisible = function(scrollOffset){

    return this.left >= scrollOffset.tileX-1
        && this.left < scrollOffset.tileX+Game.getViewPort().width+1
        && this.top >= scrollOffset.tileY-1
        && this.top < scrollOffset.tileY+Game.getViewPort().height+1;
};

MapPosition.prototype.render = function(step,scrollOffset,layer){



    var x = (this.left-scrollOffset.tileX) * this.tileSize;
    var y = (this.top-scrollOffset.tileY) * this.tileSize;

    if (!isDefined(layer)) layer = 1;

    x += scrollOffset.x*step;
    y += scrollOffset.y*step;

    var baseX = x;
    var baseY = y;

    if (this.moveDirection == DIRECTION.DOWN){
        y += step*this.tickOffset;
    }

    if (this.moveDirection == DIRECTION.UP){
        y -= step*this.tickOffset;
    }

    if (this.moveDirection == DIRECTION.LEFT){
        x -= step*this.tickOffset;
    }

    if (this.moveDirection == DIRECTION.RIGHT){
        x += step*this.tickOffset;
    }

    if (this.bottomlayer && this.mapLayer.id == "bottom"){
        frame = sprites[this.bottomlayer].canvas;
        ctx.drawImage(frame,baseX, baseY);
    }else{
        if (this.id>0){
            var frame;
            if (this.animation){
                frame = this.gameObject.getAnimationFrame(this.animation, step + this.animationStartFrame).canvas;
            }else{
                frame = sprites[this.staticFrame].canvas;
            }

            ctx.drawImage(frame,x, y);
        }

        if (this.toplayer){
            frame = sprites[this.toplayer].canvas;
            ctx.drawImage(frame,baseX, baseY);
        }
    }


};

MapPosition.prototype.process = function(){
    if (this.processed) return;

    var me = this;
    var obj = me.gameObject;
    var targetObject;
    if (obj.inActive) return; // inanimate object, don't bother;

    if (obj.isPlayer()){
        var d, u, l, r;

        if (Input.isAction()){
            this.actionDownCount = (this.actionDownCount || 0) + 1;
            if (this.actionDownCount>5 && this.gameObject.onLongPress){
                this.gameObject.onLongPress(this);
            }

            if (Input.isDown())  d = this.zapIfPossible(DIRECTION.DOWN);
            if (Input.isUp())    u = this.zapIfPossible(DIRECTION.UP);
            if (Input.isLeft())  l = this.zapIfPossible(DIRECTION.LEFT);
            if (Input.isRight()) r = this.zapIfPossible(DIRECTION.RIGHT);
        }else{
            this.actionDownCount = 0;
            if (Input.isDown())  d = this.moveIfPossible(DIRECTION.DOWN);
            if (Input.isUp())    u = this.moveIfPossible(DIRECTION.UP);
            if (Input.isLeft())  l = this.moveIfPossible(DIRECTION.LEFT);
            if (Input.isRight()) r = this.moveIfPossible(DIRECTION.RIGHT);
        }

        targetObject = d || u || l || r;

        if (targetObject){
                var direction = undefined;
                if (d) direction = DIRECTION.DOWN;
                if (u) direction = DIRECTION.UP;
                if (l) direction = DIRECTION.LEFT;
                if (r) direction = DIRECTION.RIGHT;

                if (targetObject.gameObject.onCollected){
                    targetObject.gameObject.onCollected(this,targetObject,direction);
                }

                if (Input.isAction()){
                    // object is zapped;
                    targetObject.transformInto(Game.getSettings().defaultGameObject);
                }
        }

        if (!this.isMoving()){
            if (Input.isRight()){
                targetObject = this.getObject(DIRECTION.RIGHT);
                if (targetObject.gameObject.canBePushed && targetObject.gameObject.canBePushed.horizontal){
                    this.animate(ANIMATION.PUSH_RIGHT);
                    if (targetObject.canMove(DIRECTION.RIGHT) && !(targetObject.gameObject.canFall && targetObject.canMove(DIRECTION.DOWN))) {
                        Maybe(function(){
                            targetObject.move(DIRECTION.RIGHT);
                            me.move(DIRECTION.RIGHT);
                        },1-targetObject.gameObject.canBePushed.friction);

                    }
                }
            }
            if (Input.isLeft()){
                targetObject = this.getObject(DIRECTION.LEFT);
                if (targetObject.gameObject.canBePushed && targetObject.gameObject.canBePushed.horizontal){
                    this.animate(ANIMATION.PUSH_LEFT);
                    if (targetObject.canMove(DIRECTION.LEFT) && !(targetObject.gameObject.canFall && targetObject.canMove(DIRECTION.DOWN))){
                        Maybe(function(){
                            targetObject.move(DIRECTION.LEFT);
                            me.move(DIRECTION.LEFT);
                        },1-targetObject.gameObject.canBePushed.friction);

                    }
                }
            }

            if (Input.isUp()){
                targetObject = this.getObject(DIRECTION.UP);
                if (targetObject.gameObject.canBePushed && targetObject.gameObject.canBePushed.vertical){
                    this.animate(ANIMATION.PUSH_UP);
                    if (targetObject.canMove(DIRECTION.UP)){
                        Maybe(function(){
                            targetObject.move(DIRECTION.UP);
                            me.move(DIRECTION.UP);
                        },1-targetObject.gameObject.canBePushed.friction);

                    }
                }
            }

            if (Input.isDown()){
                targetObject = this.getObject(DIRECTION.DOWN);
                if (targetObject.gameObject.canBePushed && targetObject.gameObject.canBePushed.vertical){
                    this.animate(ANIMATION.PUSH_DOWN);
                    if (targetObject.canMove(DIRECTION.DOWN)){
                        Maybe(function(){
                            targetObject.move(DIRECTION.DOWN);
                            me.move(DIRECTION.DOWN);
                        },1-targetObject.gameObject.canBePushed.friction);
                    }
                }
            }
        }

    }else{
        if (obj.canFall) this.moveIfPossible(DIRECTION.DOWN);
        if (!this.isMoving() && !this.wasMoving()){
            if (obj.canFall && !this.getObject(DIRECTION.DOWN).gameObject.isStableSurface){
                var canFallLeft = this.canMove(DIRECTION.LEFTDOWN);
                var canFallRight = this.canMove(DIRECTION.RIGHTDOWN);

                if (canFallLeft && canFallRight){
                    this.move(Game.getRandomHorizontalDirection());
                }

                if (!this.isMoving()){
                    if (canFallLeft) this.move(DIRECTION.LEFT);
                    if (canFallRight) this.move(DIRECTION.RIGHT);
                }
            }
        }
    }

    if (this.wasMoving() && !this.isMoving()){
        // object stopped moving
        if (this.wasMovingToDirection == DIRECTION.DOWN){
            // object has fallen onto something;
            targetObject = this.getObject(DIRECTION.DOWN);
            if (obj.onFallen) obj.onFallen(this,targetObject);
            if (targetObject.gameObject.onHit) targetObject.gameObject.onHit(this,DIRECTION.DOWN,targetObject);
        }
    }

    //if (!this.isMoving()){
        if (obj.eachStep) {
            obj.eachStep(this);
        }
    //}


    if (this.isMoving() && !obj.isPlayer()){
        targetObject = this.getObject(this.moveDirection);
        if (targetObject.gameObject.onCollected && !targetObject.isMoving()){
            targetObject.gameObject.onCollected(obj,targetObject,this.moveDirection)
        }
    }

    this.processed = true;


};

MapPosition.prototype.fullStep = function(step){
    if (this.next){
        for (var key in this.next){
            this[key] = this.next[key];
        }
        this.gameObject = GameObjects[this.id];
        this.staticFrame = this.gameObject.getStaticFrame();
        this.wasMovingToDirection = this.movingInToDirection;
        if (this.id == GameObjects.PLAYER.id) this.mapLayer.setPlayerObject(this);
        this.animation = false;
    }else{
        this.wasMovingToDirection = undefined;
    }

    if (this.animation){

        if (this.animation.length > this.animationStartFrame + step + 1){
            this.animationStartFrame = this.animationStartFrame + step + 1;
        }else{
            this.animation = false;
        }
    }

    this.reset();

    if (this.action){
        this.action(this);
        this.action = undefined;
    }
};

MapPosition.prototype.reset = function(){
    this.moveDirection = undefined;
    this.next = undefined;
    this.movingInToDirection = undefined;
    this.processed = false;
};

MapPosition.prototype.setNext= function(property,value){
    this.next = this.next || {};
    this.next[property] = value;
};

MapPosition.prototype.getObject = function(direction){
    var width = this.mapLayer.levelWidth;
    var map = this.mapLayer.objects;
    switch (direction){
        case DIRECTION.DOWN: return map[this.index + width]; break;
        case DIRECTION.UP: return map[this.index - width]; break;
        case DIRECTION.LEFT: return map[this.index -1]; break;
        case DIRECTION.RIGHT: return map[this.index +1]; break;
        case DIRECTION.LEFTDOWN: return map[this.index -1 + width]; break;
        case DIRECTION.RIGHTDOWN: return map[this.index +1 + width]; break;
        case DIRECTION.LEFTUP: return map[this.index -1 - width]; break;
        case DIRECTION.RIGHTUP: return map[this.index +1 - width]; break;
        case DIRECTION.NONE: return map[this.index]; break;
    }
};

MapPosition.prototype.canMove = function(direction){
    // object is already moving
    if (this.isMoving()) return false;

    var targetObject
    if (direction > 100){
        // combined direction
        if (direction == DIRECTION.LEFTDOWN){
            var l = this.getObject(DIRECTION.LEFT);
            var d = this.getObject(DIRECTION.LEFTDOWN);
            if (l.next || d.next) return false;
            if (this.gameObject.canMoveTo(l,DIRECTION.LEFT) && this.gameObject.canMoveTo(d,DIRECTION.DOWN)) return true;
        }
        if (direction == DIRECTION.RIGHTDOWN){
            var r = this.getObject(DIRECTION.RIGHT);
            var d = this.getObject(DIRECTION.RIGHTDOWN);
            if (r.next || d.next) return false;
            if (this.gameObject.canMoveTo(r,DIRECTION.RIGHT) && this.gameObject.canMoveTo(d,DIRECTION.DOWN)) return true;
        }
    }else{
        // targetobject is accepting a moving object
        targetObject = this.getObject(direction);
        if (targetObject){
            if (targetObject.next && targetObject.next.id) return false;

            if (this.gameObject.canMoveTo(targetObject,direction)){
                return true;
            }
        }else{
            console.error("could not get object in direction" + direction,this);
        }

    }

    return false;

};

MapPosition.prototype.canMoveLeft = function(){
    return this.canMove(DIRECTION.LEFT);
};

MapPosition.prototype.canMoveRight = function(){
    return this.canMove(DIRECTION.RIGHT);
};

MapPosition.prototype.canMoveUp = function(){
    return this.canMove(DIRECTION.UP);
};

MapPosition.prototype.canMoveDown = function(){
    return this.canMove(DIRECTION.DOWN);
};

MapPosition.prototype.isMoving = function(){
    return !!this.moveDirection;
};

MapPosition.prototype.wasMoving = function(){
    return !!this.wasMovingToDirection;
};

MapPosition.prototype.sameDirection = function(){
    return this.wasMovingToDirection;
};

MapPosition.prototype.move = function(direction){
    this.moveDirection = direction;
    var nextObjectId = this.nextObjectId || 0;
    this.setNext("id",nextObjectId);
    this.nextObjectId = undefined;
    this.animate(direction);
    if (this.onMove){
        this.onMove(this);
        this.onMove = undefined;
    }

    var targetObject = this.getObject(direction);
    targetObject.setNext("id",this.id);
    targetObject.setNext("_objectProperties",this._objectProperties);
    targetObject.movingInToDirection = direction;

    return targetObject;
};

MapPosition.prototype. moveIfPossible = function(direction){
    if (this.canMove(direction)) {
        return this.move(direction);
    }else{
        return false;
    }
};

MapPosition.prototype.moveLeftIfPossible = function(){
    this.moveIfPossible(DIRECTION.LEFT);
};
MapPosition.prototype.moveRightIfPossible = function(){
    this.moveIfPossible(DIRECTION.RIGHT);
};
MapPosition.prototype.moveUpIfPossible = function(){
    this.moveIfPossible(DIRECTION.UP);
};
MapPosition.prototype.moveDownIfPossible = function(){
    this.moveIfPossible(DIRECTION.DOWN);
};
MapPosition.prototype.animate = function(animation){

    if (typeof animation == "string" || typeof animation == "number"){
        this.animation = this.gameObject[animation];
        if (!this.animation) this.animation = this.gameObject["animation" + animation];
        if (!this.animation) this.animation = this.gameObject.animationFrames[animation];
        if (!this.animation) this.animation = this.gameObject.animationFrames["animation" + animation];
    }else{
        this.animation = animation
    }

    this.animationStartFrame = 0;
};

MapPosition.prototype.zapIfPossible = function(direction){

    var targetObject = false;
    if (this.canMove(direction)) {
        targetObject = this.getObject(direction);
    }
    return targetObject;
};

MapPosition.prototype.animateIfPossible = function(animation){
    if (!this.isAnimating()) this.animate(animation)
};

MapPosition.prototype.isAnimating = function(){
    return this.animation;
};

MapPosition.prototype.isNextTo = function(object){
    var l = this.getObject(DIRECTION.LEFT).gameObject.id;
    var r = this.getObject(DIRECTION.RIGHT).gameObject.id;
    var d = this.getObject(DIRECTION.DOWN).gameObject.id;
    var u = this.getObject(DIRECTION.UP).gameObject.id;

    var id = object.id;

    return ((l == id) || (u == id) || (r == id) || (d == id))
};

MapPosition.prototype.isGameObject = function(object){
    return this.gameObject.id == object.id;
};

MapPosition.prototype.refresh = function(){
    this.setNext("id",this.id);
};

MapPosition.prototype.transformInto = function(gameObject,animation,onComplete){
    this.setNext("id",gameObject.id);
    if (animation) this.animate(animation);
    if (onComplete) this.setNext("action",onComplete)
};

MapPosition.prototype.addLayer = function(spriteIndex,position){
    if (position == "bottom"){
        this.bottomlayer = spriteIndex;
        var bottomLayer = Map.getLayer("bottom");
        if (!bottomLayer) {
            bottomLayer = Map.addLayer({
                id: "bottom",
                zIndex: 0,
                type: MAPLAYERTYPE.SPOT,
                parentLayer: this.mapLayer});
            Map.sortLayers();
        }

        var bottomThis = new MapPosition(this.gameObject,this.index,bottomLayer);
        bottomLayer.addObject(bottomThis,MAPOBJECTTYPE.GRID);
    }else{
       this.toplayer = spriteIndex;
    }
};

MapPosition.prototype.removeLayer = function(position){
    if (position == "bottom"){
        this.bottomlayer = undefined;
        var bottomLayer = Map.getLayer("bottom");
        if (bottomLayer) bottomLayer.removeObject(this);
    }else{
        this.toplayer = undefined;
    }
};

MapPosition.prototype.hasLayer = function(position){
    if (position == "bottom"){
        return this.bottomlayer != undefined;
    }else{
        return this.toplayer != undefined;
    }
};

MapPosition.prototype.objectProperties = function(){
    this._objectProperties = this._objectProperties || {};
    return this._objectProperties;
};

MapPosition.prototype.getExplodeIntoObjects = function(){
    var obj = Game.getSettings().defaultGameObject;
    if (this.gameObject.explodeIntoObjects) obj = this.gameObject.explodeIntoObjects();
    if (this.gameObject.explodeIntoObject) obj = this.gameObject.explodeIntoObject;
    return obj;
};



