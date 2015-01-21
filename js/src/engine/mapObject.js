var MapObject = function(properties){
    for (var key in properties){
        this[key] = properties[key];
    }

    this.id = this.gameObject.id;
    this.staticFrame = this.gameObject.getStaticFrame();
    var sprite = sprites[this.staticFrame];
    this.height = sprite.canvas.height;
    this.width = sprite.canvas.width;
    this.rotation = 0;
    this.rotationRadiants = 0;
};

MapObject.prototype.isVisible = function(scrollOffset){
    return true;
};

MapObject.prototype.render = function(step,scrollOffset,layer){

    var offsetX = scrollOffset.pixelX;
    var offsetY = scrollOffset.pixelY;

    if (this.mapLayer.tileSize){
        offsetX = (scrollOffset.tileX * 32) + (scrollOffset.x * step);
        offsetY = (scrollOffset.tileY * 32) + (scrollOffset.y * step);
    }

    var x = this.left - offsetX;
    var y = this.top - offsetY;

    if (this.id>0){
        var frame;
        if (this.animation){
            this.animationStartFrame++;
            if (this.animationStartFrame >= this.animation.length) this.animationStartFrame = 0;
            frame = this.gameObject.getAnimationFrame(this.animation, this.animationStartFrame).canvas;
        }else{
            frame = sprites[this.staticFrame].canvas;
        }

        if (this.rotation) {
            frame = sprites[this.staticFrame].rotated[this.rotation];
            if (!frame){
                console.error('Warning: rotation ' + this.rotation + " is not prerendered for sprite ",sprites[this.staticFrame]);
                frame = sprites[this.staticFrame].canvas;
            }
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

MapObject.prototype.rotate = function(degree){
    this.rotation = ((this.rotation || 0) + degree) % 360;
    if (this.rotation<0) this.rotation += 360;

    this.rotationRadiants = this.rotation * Math.PI/180;

    var sprite = sprites[this.staticFrame];
    if (!sprite.rotated[this.rotation]){
        sprite.rotate(this.rotation);
    }
};

