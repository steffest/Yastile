var MapObject = function(gameObject,index){
    this.gameObject = gameObject;
    this.id = gameObject.id;
    this.index = index;
    this.staticFrame = gameObject.getStaticFrame();

    this.left = index % Game.getLevel().width;
    this.top = Math.floor(index / Game.getLevel().width);

    // override this if you want certain tiles to move faster/slower
    this.tileSize = Game.getTileSize();
    this.tickOffset = this.tileSize/Game.getTargetTicksPerSecond();
};

MapObject.prototype.isVisible = function(scrollOffset){
    return this.left >= scrollOffset.tileX-1
        && this.left < scrollOffset.tileX+Game.getViewPort().width+1
        && this.top >= scrollOffset.tileY-1
        && this.top < scrollOffset.tileY+Game.getViewPort().height+1;
};

MapObject.prototype.render = function(step,scrollOffset){

    var x = (this.left-scrollOffset.tileX) * this.tileSize;
    var y = (this.top-scrollOffset.tileY) * this.tileSize;

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

    x += scrollOffset.x*step;
    y += scrollOffset.y*step;

    if (this.id>0){
        var frame;
        if (this.animation){
            frame = this.gameObject.getAnimationFrame(this.animation,step);
        }else{
            frame = sprites[this.staticFrame];
        }

        ctx.drawImage(frame,x, y);
    }

};

MapObject.prototype.process = function(){
    if (this.processed) return;

    var me = this;
    var obj = me.gameObject;
    var targetObject;


    if (this.id == GameObjects.PLAYER.id){

        if (Input.isDown())  this.moveIfPossible(DIRECTION.DOWN);
        if (Input.isUp())    this.moveIfPossible(DIRECTION.UP);
        if (Input.isLeft())  this.moveIfPossible(DIRECTION.LEFT);
        if (Input.isRight()) this.moveIfPossible(DIRECTION.RIGHT);

        if (!this.isMoving()){
            if (Input.isRight()){
                targetObject = this.getObject(DIRECTION.RIGHT);
                if (targetObject.gameObject.canBePushed && targetObject.gameObject.canBePushed.horizontal){
                    this.animation = ANIMATION.PUSH_RIGHT;
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
                    this.animation = ANIMATION.PUSH_LEFT;
                    if (targetObject.canMove(DIRECTION.LEFT) && !(targetObject.gameObject.canFall && targetObject.canMove(DIRECTION.DOWN))){
                        Maybe(function(){
                            targetObject.move(DIRECTION.LEFT);
                            me.move(DIRECTION.LEFT);
                        },1-targetObject.gameObject.canBePushed.friction);

                    }
                }
            }
        }

    }else{
        if (obj.canFall) this.moveIfPossible(DIRECTION.DOWN);
        if (!this.isMoving()){
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
        if (this.movedInFrom == DIRECTION.DOWN){
            // object has fallen onto something;
            if (obj.onFallen) obj.onFallen(this.getObject(DIRECTION.DOWN))
        }
    }

    this.processed = true;


};

MapObject.prototype.fullStep = function(){
    if (typeof this.next != "undefined"){
        this.id = this.next;
        this.gameObject = GameObjects[this.id];
        this.staticFrame = this.gameObject.getStaticFrame();
        this.movedInFrom = this.movingInFrom;
        if (this.id == GameObjects.PLAYER.id) Map.setPlayerObject(this);
    }else{
        this.movedInFrom = undefined;
    }

    this.reset();
};

MapObject.prototype.reset = function(){
    this.moveDirection = undefined;
    this.next = undefined;
    this.movingInFrom = undefined;
    this.animation = false;
    this.processed = false;
};

MapObject.prototype.setNextId = function(id){
    this.next = id;
};

MapObject.prototype.setId = function(id){
    this.id = id;
};

MapObject.prototype.getObject = function(direction){
    switch (direction){
        case DIRECTION.DOWN: return map[this.index + Game.getLevel().width]; break;
        case DIRECTION.UP: return map[this.index - Game.getLevel().width]; break;
        case DIRECTION.LEFT: return map[this.index -1]; break;
        case DIRECTION.RIGHT: return map[this.index +1]; break;
        case DIRECTION.LEFTDOWN: return map[this.index -1 + Game.getLevel().width]; break;
        case DIRECTION.RIGHTDOWN: return map[this.index +1 + Game.getLevel().width]; break;
    }
};

MapObject.prototype.canMove = function(direction){
    // object is already moving
    if (this.isMoving()) return false;

    var targetObject
    if (direction > 100){
        // combines direction
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
        var targetObject = this.getObject(direction);
        if (targetObject.next) return false;

        if (this.gameObject.canMoveTo(targetObject,direction)){
            return true;
        }
    }





    return false;

};

MapObject.prototype.isMoving = function(){
    return !!this.moveDirection;
};

MapObject.prototype.wasMoving = function(){
    return !!this.movedInFrom;
};

MapObject.prototype.move = function(direction){
    this.moveDirection = direction;
    this.next = 0;
    this.animation = direction;

    var targetObject = this.getObject(direction);
    targetObject.setNextId(this.id);
    //targetObject.setId(0);
    targetObject.movingInFrom = direction;
};

MapObject.prototype.moveIfPossible = function(direction){
    if (this.canMove(direction)) this.move(direction);
};


