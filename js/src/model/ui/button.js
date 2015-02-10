UI.Button = function(properties){
    var self = this;

    for (var key in properties){
        this[key] = properties[key];
    }

    this.image = new Image();
    this.image.onload = function() {
        if (!isDefined(self.width)) self.width = this.width;
        if (!isDefined(self.height)) self.height = this.height;
        if (!self.states){
            // button with 1 state
            self.states = [[0,0,self.width,self.height]];
        }
        if (!isDefined(self.initialState)) self.initialState=0;
        self.state = self.states[self.initialState];
        self.imageLoaded = true;
        self.setPosition();
    };
    this.image.src = Game.getSettings().resourcePath + this.url;

};

UI.Button.prototype.setSate = function(index){
    this.state = this.states[index];
};

UI.Button.prototype.setPosition = function(){
    if (!isDefined(this.left)) this.left = this.right - this.width;
    if (!isDefined(this.right)) this.right = this.left + this.width;
    if (!isDefined(this.top)) this.top = this.bottom - this.height;
    if (!isDefined(this.bottom)) this.bottom = this.top + this.height;
};

UI.Button.prototype.render = function(){
    if (this.imageLoaded){
        ctx.drawImage(this.image,this.state[0],this.state[1],this.state[2],this.state[3],this.left,this.top,this.width,this.height);
        UI.registerEventElement(this,this.left,this.top,this.right,this.bottom);
    }
};