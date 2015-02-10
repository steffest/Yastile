UI.GameController = function(settings){
    var self = this;
    this.sprites = [];
    this.state = 0;

    this.image = new Image();
    this.image.onload = function() {
        self.tileSize = this.height;
        for (var i = 0; i<5; i++){
            var controllerSprite = new Sprite(this,i,self.tileSize);
            self.sprites.push(controllerSprite);
        }
        self.imageLoaded = true;
        self.setPosition();
    };
    this.image.src = Game.getSettings().resourcePath + settings.image;

    this.onDown = function(touchData){
        processInput(touchData.x,touchData.y);
    };

    this.onDrag = function(touchData){
        processInput(touchData.x,touchData.y);
    };

    this.onUp = function(touchData){
        resetInput();
    };

    var resetInput = function(){
        self.state = DIRECTION.NONE;
        Input.isLeft(false);
        Input.isRight(false);

        if (settings.input == 4){
            Input.isUp(false);
            Input.isDown(false);
        }
    };

    var processInput = function(x,y){
        resetInput();
        x = x-self.left;
        y = y-self.top;
        var margin = 16;
        var half = self.tileSize/2;

        if (x < half - margin) {Input.isLeft(true);    self.state = DIRECTION.LEFT;}
        if (x > half + margin) {Input.isRight(true);   self.state = DIRECTION.RIGHT;}

        if (settings.input == 4){
            if (y < half - margin) {Input.isUp(true);      self.state = DIRECTION.UP;}
            if (y > half + margin) {Input.isDown(true);    self.state = DIRECTION.DOWN;}
        }
    }
};


UI.GameController.prototype.setPosition = function(){
    this.top = canvas.height - 150;
    this.left = 10;
    this.right = this.left + this.tileSize;
    this.bottom = this.top + this.tileSize;
};

UI.GameController.prototype.render = function(){
    if (this.imageLoaded){
        var spriteIndex = Math.max(this.state - DIRECTION.LEFT + 1,0);
        ctx.drawImage(this.sprites[spriteIndex].canvas,this.left,this.top);
        UI.registerEventElement(this,this.left,this.top,this.right,this.bottom);
    }
};