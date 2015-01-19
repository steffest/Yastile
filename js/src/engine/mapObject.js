var MapObject = function(properties){
    for (var key in properties){
        this[key] = properties[key];
    }

    this.id = this.gameObject.id;
    this.staticFrame = this.gameObject.getStaticFrame();
    var sprite = sprites[this.staticFrame];
    this.height = sprite.height;
    this.width = sprite.width;
};

MapObject.prototype.isVisible = function(scrollOffset){
    return true;
};

MapObject.prototype.render = function(step,scrollOffset,layer){

    var x = this.left - (scrollOffset.tileX * 32) + (scrollOffset.x * step);
    var y = this.top - (scrollOffset.tileY * 32) + (scrollOffset.y * step);

    if (this.id>0){
        var frame;
        if (this.animation){
            this.animationStartFrame++;
            if (this.animationStartFrame >= this.animation.length) this.animationStartFrame = 0;
            frame = this.gameObject.getAnimationFrame(this.animation, this.animationStartFrame);
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
    if (obj.inActive) return; // inanimate object, don't bother;

    if (obj.isPlayer()){


    }else{

    }


    //if (!this.isMoving()){
    if (obj.eachStep) {
        obj.eachStep(this);
    }
    //}


    //this.processed = true;


};



MapObject.prototype.destroy = function(){
     this.mapLayer.removeObject(this);
};

MapObject.prototype.detectCollistion = function(){
    for (var i=0; i<this.mapLayer.objects.length; i++){
        var object = this.mapLayer.objects[i];

          if (
              object &&
              object.gameObject.isEnemy &&
              this.left < object.left + object.width &&
              this.left + this.width > object.left &&
              this.top < object.top + object.height &&
              this.height + this.top > object.top) {


              this.mapLayer.addObject(
                  new MapObject({
                      left: object.left - 8,
                      top: object.top - 8,
                      gameObject: GameObjects.EXPLOSION
                  }));
              object.destroy();
          }

    }
};


MapObject.prototype.animate = function(animation){

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

MapObject.prototype.animateIfPossible = function(animation){
    if (!this.isAnimating()) this.animate(animation)
};

MapObject.prototype.isAnimating = function(){
    return this.animation;
};

