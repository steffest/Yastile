var GameObject = function(properties){

    var hasFunction = false;
    for (var key in properties){
        this[key] = properties[key];
        if (typeof properties[key] == "function") hasFunction=true;
    }

    this.setDefault("canMove",false);
    this.setDefault("canBePickedUp",true);
    this.setDefault("canFall",false);
    this.setDefault("isStableSurface",true);

    this.spriteIndex = this.id;
    if (properties.spriteIndex) this.spriteIndex = properties.spriteIndex;
    this.spriteIndexes = properties.spriteIndexes;

    // simple animation system;
    this.animationFrames = {};
    if (properties.animationRight) this.animationFrames[DIRECTION.RIGHT] = properties.animationRight;
    if (properties.animationLeft) this.animationFrames[DIRECTION.LEFT] = properties.animationLeft;
    if (properties.animationUp) this.animationFrames[DIRECTION.UP] = properties.animationUp;
    if (properties.animationDown) this.animationFrames[DIRECTION.DOWN] = properties.animationDown;

    this.inActive = !(this.canMove || this.canFall || hasFunction);

    GameObjects[this.id] = this;
    GameObjects[this.code] = this;
};

GameObject.prototype.getAnimationFrame = function(animation,step){
    var frame = this.spriteIndex;
    var animationFrames = this.animationFrames[animation];
    if (!animationFrames) animationFrames = this["animation" + animation];
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


GameObject.prototype.isEmpty = function(){
    return (this.id == 0);
};

GameObject.prototype.isPlayer = function(){
    return (this.id == GameObjects.PLAYER.id);
};

GameObject.prototype.setDefault = function(property,value){
    if (typeof this[property] == "undefined") this[property]=value;
};

GameObject.prototype.canMoveTo = function(targetObject,direction){
    var targetGameObject = targetObject.gameObject;
    if (targetGameObject.isEmpty()) return true;

    if (this.isPlayer()){
        if (targetGameObject.canBePickedUp) return true;
    }

    if (targetGameObject.isPlayer()){
        if (targetObject.moveDirection){
            var opposite = DIRECTION_OPPOSITE[targetObject.moveDirection];
            if (direction != opposite) return true;
        }
    }

    return false;


};







