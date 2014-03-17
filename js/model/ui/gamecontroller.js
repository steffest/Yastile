UI.GameController = function(image){
    var self = this;
    this.image = new Image();
    this.image.onload = function() {
        self.width = this.width;
        self.height = this.height;
        self.imageLoaded = true;
        self.setPosition();
    };
    this.image.src = image;

    this.onClick = function(element,x,y){
        processInput(x,y);
    };

    this.onDrag = function(element,x,y){
        processInput(x,y);
    };

    var resetInput = function(){
        self.state = DIRECTION.NONE;
        Input.isLeft(false);
        Input.isRight(false);
        Input.isUp(false);
        Input.isDown(false);
    };

    var processInput = function(x,y){
        x = x-self.left;
        y = y-self.top;
        var margin = 16;
        resetInput();

        if (x < self.width/2 - margin ) {Input.isLeft(true);    self.state = DIRECTION.LEFT;}
        if (x > self.width/2 + margin)  {Input.isRight(true);   self.state = DIRECTION.RIGHT;}
        if (y < self.height/2 - margin) {Input.isUp(true);      self.state = DIRECTION.UP;}
        if (y > self.height/2 + margin) {Input.isDown(true);    self.state = DIRECTION.DOWN;}
    }
};


UI.GameController.prototype.setPosition = function(){
    this.top = canvas.height - 150;
    this.left = 10;
    this.right = this.left + this.width;
    this.bottom = this.top + this.height;
};

UI.GameController.prototype.render = function(){
    if (this.imageLoaded){
        ctx.drawImage(this.image,this.left,this.top);
        UI.registerEventElement(this,this.left,this.top,this.right,this.bottom);
    }
};