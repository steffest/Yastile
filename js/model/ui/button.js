UI.Button = function(image){
    var self = this;

    this.image = new Image();
    this.image.onload = function() {
        self.tileSize = this.width;
        self.imageLoaded = true;
        self.setPosition();
    };
    this.image.src = image;

};

UI.Button.prototype.setPosition = function(){
    this.top = 10;
    this.right = canvas.width - 10;
    this.left = this.right - this.tileSize;
    this.bottom = this.top + this.tileSize;
};

UI.Button.prototype.render = function(){
    if (this.imageLoaded){
        ctx.drawImage(this.image,this.left,this.top);
        UI.registerEventElement(this,this.left,this.top,this.right,this.bottom);
    }
};