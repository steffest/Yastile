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
        if (this.moveDirection){
            frame = this.gameObject.getAnimationFrame(this.moveDirection,step);
        }else{
            frame = sprites[this.staticFrame];
        }

        ctx.drawImage(frame,x, y);
    }

};

MapObject.prototype.process = function(){
    if (this.id == GameObjects.PLAYER.id){
        Map.setPlayerObject(this);
        if (Input.isDown()  && this.canMove(DIRECTION.DOWN))    this.move(DIRECTION.DOWN);
        if (Input.isUp()    && this.canMove(DIRECTION.UP))      this.move(DIRECTION.UP);
        if (Input.isLeft()  && this.canMove(DIRECTION.LEFT))    this.move(DIRECTION.LEFT);
        if (Input.isRight() && this.canMove(DIRECTION.RIGHT))   this.move(DIRECTION.RIGHT);
    }
};

MapObject.prototype.fullStep = function(){
    if (typeof this.next != "undefined"){
        //console.error("setting next " + this.id + " to " + this.next)
        this.id = this.next;
        this.gameObject = GameObjects[this.id];
        this.staticFrame = this.gameObject.getStaticFrame();
    }
    this.reset();
};

MapObject.prototype.reset = function(){
    this.moveDirection = undefined;
    this.next = undefined;
};

MapObject.prototype.setNextId = function(id){
    this.next = id;
};

MapObject.prototype.setId = function(id){
    this.id = id;
};

MapObject.prototype.getObject = function(direction){
    if (direction == DIRECTION.DOWN){
        return map[this.index + Game.getLevel().width]
    }
    if (direction == DIRECTION.UP){
        return map[this.index - Game.getLevel().width]
    }
    if (direction == DIRECTION.LEFT){
        return map[this.index -1]
    }
    if (direction == DIRECTION.RIGHT){
        return map[this.index +1]
    }
};

MapObject.prototype.canMove = function(direction){
    // object is already moving
    if (this.moveDirection) return false;

    // targetobject is accepting a moving object
    var targetObject = this.getObject(direction);
    if (targetObject.next) return false;

    if (targetObject.gameObject && !targetObject.gameObject.canMoveThrough) return false;

    return true;

};

MapObject.prototype.move = function(direction){
    this.moveDirection = direction;
    this.next = 0;

    var targetObject = this.getObject(direction);
    targetObject.setNextId(this.id);
    targetObject.setId(0);
};

