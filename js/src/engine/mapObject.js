var MapObject = function(properties){
    for (var key in properties){
        this[key] = properties[key];
    }

    this.id = properties.id || this.gameObject.id;
    if (this.gameObject){
        this.staticFrame = this.gameObject.getStaticFrame();
        var sprite = sprites[this.staticFrame];
        this.height = sprite.canvas.height;
        this.width = sprite.canvas.width;
    }

    this.rotation = this.rotation || 0;
    this.scaleIndex = this.scaleIndex || 1;
    this.flipX = this.flipX ? 1 : 0;
    this.flipY = this.flipY ? 1 : 0;
    this.rotationRadiants = 0;

    if (this.rotation>0){
        var r = this.rotation;
        this.rotation = 0;
        this.rotate(r);
    }

    if (this.spriteMap){
        Resource.getSpriteMap(this.spriteMap);
    }

    if (this.gameObject && this.gameObject.onCreate){
        this.gameObject.onCreate(this);
    }
};


MapObject.prototype.setStaticFrame = function(spriteIndex){
    this.staticFrame = spriteIndex;

    var sprite = sprites[this.staticFrame];
    if (sprite){
        this.height = sprite.canvas.height;
        this.width = sprite.canvas.width;
    }else{
        console.error("Warning: MapObject " + this.id + " doesn't seem to have a sprite!")
    }

};

MapObject.prototype.getCurrentFrame = function(){
    var frame;
    if (this.component){
        return this.component.getCurrentFrame();
    }
    if (this.animation){
        this.animationStartFrame++;
        if (this.animationStartFrame >= this.animation.length) {
            // TODO: loop?
            //this.animationStartFrame = 0;
            this.animation = false;
            if (sprites[this.staticFrame]){
                frame = sprites[this.staticFrame].canvas;
            }
        }
        if (this.gameObject){
            frame = this.gameObject.getAnimationFrame(this.animation, this.animationStartFrame).canvas;
        }else{
            var spriteName = this.animation[this.animationStartFrame];
            var sprite = sprites[spriteName];
            if (sprite){
                frame = sprite.canvas;
            }
            //frame = sprites[spriteName].canvas;
        }

    }else{
        if (sprites[this.staticFrame]){
            frame = sprites[this.staticFrame].canvas;
        }
    }

    if (this.isTransformed()) {
        frame = sprites[this.staticFrame].transformed[this.getTransformation()];
        if (!frame){
            //console.error('Warning: transformation ' + this.rotation + " is not prerendered for sprite ",sprites[this.staticFrame]);
            frame = sprites[this.staticFrame].canvas;
        }
    }

    return frame;
};

MapObject.prototype.isVisible = function(scrollOffset){
    return true;
};

MapObject.prototype.render = function(step,scrollOffset,layer){

    var offsetX = scrollOffset.pixelX;
    var offsetY = scrollOffset.pixelY;

    if (this.mapLayer.tileSize){
        offsetX = (scrollOffset.tileX * this.mapLayer.tileSize) - (scrollOffset.x * step);
        offsetY = (scrollOffset.tileY * this.mapLayer.tileSize) - (scrollOffset.y * step);
    }

    var x = this.left - offsetX;
    var y = this.top - offsetY;

    if (this.id){
        var frame = this.getCurrentFrame();
        ctx.drawImage(frame,x, y);
    }
};

MapObject.prototype.process = function(){

    if (this.processed) return;

    var me = this;
    var obj = me.gameObject || me.component;
    if (obj.inActive) return; // inanimate object, don't bother;


    //if (!this.isMoving()){
    if (obj.eachStep) {
        obj.eachStep(this);
    }
    //}

    this.processed = true;

};

MapObject.prototype.fullStep = function(){
    this.processed = false;
    this.collisionChecked = false;
};

MapObject.prototype.destroy = function(){
     this.mapLayer.removeObject(this);
};

MapObject.prototype.detectCollistion = function(onPixelLevel,onCollision,preFilter){
    var originId = this.id;
    var me = this;
    for (var i= 0, len=me.mapLayer.objects.length; i<len; i++){
        var other = me.mapLayer.objects[i];

          var checkObject = true;
          if (preFilter) checkObject = preFilter(other);
          if (
              checkObject &&
              other &&
              other.id != this.id &&
              me.left < other.left + other.width &&
              me.left + this.width > other.left &&
              me.top < other.top + other.height &&
              me.height + me.top > other.top) {
                var isCollision = true;

                Game.addDebugRect("red",me.left-me.mapLayer.scrollPixelX,me.top-me.mapLayer.scrollPixelY,me.width,me.height,false);
                Game.addDebugRect("blue", other.left-me.mapLayer.scrollPixelX,other.top-me.mapLayer.scrollPixelY, other.width,other.height,false);

                if (onPixelLevel){
                    isCollision = false;

                    // first find the intersecting rectangle
                    var x = Math.max(me.left,other.left);
                    var x2 = Math.min(me.left+me.width,other.left+other.width);
                    var w = x2-x;

                    var y = Math.max(me.top,other.top);
                    var y2 = Math.min(me.top+me.height,other.top+other.height);
                    var h = y2-y;

                    Game.addDebugRect("yellow",x-me.mapLayer.scrollPixelX,y-me.mapLayer.scrollPixelY,w,h,false);

                    if (w>0 && h>0){
                        var thisData = me.getCurrentFrame().getContext("2d").getImageData(x-me.left,y-me.top,w,h).data;
                        var otherData = other.getCurrentFrame().getContext("2d").getImageData(x-other.left,y-other.top,w,h).data;

                        // check for pixels that are not transparent in both imageDatas
                        // TODO: optimise this to work e.g. from the borders to the middle, or use hitpoints
                        var scanIndex = 0;
                        while (!isCollision && scanIndex < (w*h)*4){
                            // only check alpha level
                            var alphaTreshold = 100;
                            var thisPixel = thisData[scanIndex + 3];
                            var otherPixel = otherData[scanIndex + 3];
                            if (thisPixel>alphaTreshold && otherPixel>alphaTreshold) isCollision = true;
                            scanIndex +=4;
                        }
                    }

                }
                if (isCollision) onCollision(other)
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
    this.rotation = Math.round(((this.rotation || 0) + degree) % 360);
    if (this.rotation<0) this.rotation += 360;
    this.rotationRadiants = this.rotation * Math.PI/180;

    this.generateTransformedSprite();
};

MapObject.prototype.setRotation = function(degree){
    this.rotation = Math.round(degree % 360);
    if (this.rotation<0) this.rotation += 360;
    this.rotationRadiants = this.rotation * Math.PI/180;
    this.generateTransformedSprite();
};

MapObject.prototype.flip = function(horizontal,vertical){
    this.flipX = vertical ? 1 : 0;
    this.flipY = horizontal ? 1 : 0;

    this.generateTransformedSprite();
};

MapObject.prototype.scale = function(scaleIndex){
    this.scaleIndex = scaleIndex;
    this.generateTransformedSprite();
};

MapObject.prototype.generateTransformedSprite = function(){
    var key = this.getTransformation();

    var sprite = sprites[this.staticFrame];
    if (!sprite.transformed[key]){
        sprite.transform(this.rotation,this.scaleIndex,this.flipX,this.flipY);
    }
};

MapObject.prototype.isTransformed = function(){
    return (this.rotation != 0 || this.scaleIndex != 1 || this.flipX || this.flipY);
};

MapObject.prototype.getTransformation = function(){
    return "" + this.rotation + "_" + this.scaleIndex + "_" + this.flipX + "_" + this.flipY;
};



