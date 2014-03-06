var GameObject = function(properties){
    this.id = properties.id;
    this.canMove = (typeof properties.canMove == "undefined") ? false : properties.canMove;
    this.canMoveThrough = (typeof properties.canMoveThrough == "undefined") ? true : properties.canMoveThrough;
    this.spriteIndex = this.id;
    if (properties.spriteIndex) this.spriteIndex = properties.spriteIndex;
    this.spriteIndexes = properties.spriteIndexes;

    // simple animation system;
    this.animationFrames = {};
    if (properties.animationRight) this.animationFrames[DIRECTION.RIGHT] = properties.animationRight;
    if (properties.animationLeft) this.animationFrames[DIRECTION.LEFT] = properties.animationLeft;
    if (properties.animationUp) this.animationFrames[DIRECTION.UP] = properties.animationUp;
    if (properties.animationDown) this.animationFrames[DIRECTION.DOWN] = properties.animationDown;

    GameObjects[this.id] = this;
};

GameObject.prototype.getAnimationFrame = function(direction,step){
    var frame = this.spriteIndex;
    var animationFrames = this.animationFrames[direction];
    if (animationFrames && animationFrames.length>step){
        frame = animationFrames[step];
    }
    return sprites[frame];
};

GameObject.prototype.getStaticFrame = function(){
    var frame = this.spriteIndex;
    if (this.spriteIndexes && this.spriteIndexes.length>0){
            frame = this.spriteIndexes[Math.floor(Math.random() * this.spriteIndexes.length)];
    }
    return frame;
};






