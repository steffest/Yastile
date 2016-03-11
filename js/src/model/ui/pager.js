UI.Pager = function(properties){
	var self = this;

	this.isVisible = true;

	this.activePage = properties.activePage || 1;

	this.top = properties.top;
	this.left = properties.left || 0;
	this.width = properties.width || 400;
	this.height = properties.height || 400;

	this.pages = properties.pages || [];

	self.scrollDeltaX = 0;
	self.scrollOffetX = 0;

	self.onDown = function(touchData){
		this.animStep = 0;
	};

	self.onDrag = function(touchData){
		var deltaX = touchData.x - touchData.startX;
		self.scrollDeltaX = parseInt(deltaX);
	};

	self.onUp = function(touchData){
		self.isDown = false;

		self.scrollOffetX += self.scrollDeltaX;
		self.scrollDeltaX = 0;

		self.targetX = 0;
		self.animMax = 40;
		self.animStep = 40;
	};

};

UI.Pager.prototype.getPage = function(){
	return  this.pages[this.activePage-1];
};

UI.Pager.prototype.getPageLeft = function(){
	if (this.activePage == 1){
		// carrousel ?
		return this.pages[this.pages.length-1];
	}else{
		return this.pages[this.activePage-2];
	}
};

UI.Pager.prototype.getPageRight = function(){
	if (this.activePage == this.pages.length-1){
		// carrousel ?
		return this.pages[0];
	}else{
		return this.pages[this.activePage];
	}
};

UI.Pager.prototype.render = function(){

	if (!this.isVisible) return;

	if (this.animStep > 0 && this.animMax>0){
		this.animStep--;
		this.scrollOffetX  += (this.targetX - this.scrollOffetX) * ((this.animMax-this.animStep)/this.animMax);
	}

	var x = this.left + this.scrollOffetX + this.scrollDeltaX;
	var y = this.top;
	var w = this.left + this.width;
	var h = this.top + this.height;

	var page = this.pages[this.activePage-1];
	if (page.backgroundColor){
		ctx.fillStyle = page.backgroundColor;
		ctx.fillRect(x,y,w,h);
	}

	UI.registerEventElement(this,x,y,w,h);

};


