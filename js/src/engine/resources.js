var Resources = {
    images: {},
    animations : {},
    spritemaps: {},
    loading: {}
};

var Resource = (function(){
    var self = {};

    self.getImage = function(id,onLoad){
        if (Resources.loading[id]) return false;

        if (Resources.images[id]){
            return Resources.images[id];
        }else{
            Resources.loading[id] = true;
            var img = new Image();
            img.onload = function() {
                if (this.id) Resources.images[this.id] = this;
                Resources.loading[id] = false;
                if (onLoad) onLoad(this);
            };
            img.onerror = function(){
                console.error("Error loading url " + this.src);
            };
            img.id = id;
            img.src = id;
        }
    };

    self.getAnimation = function(animation){
        var id = animation.id;

        if (Resources.animations[id]){
            return Resources.animations[id];
        }else{
            var img = self.getImage(animation.img,function(){
                self.getAnimation(animation);
            });
            if (img){
                var spriteProperties = {
                    width: animation.tileWidth,
                    height: animation.tileHeight,
                    name: id
                };
                self.loadSpriteSheet(img,spriteProperties);
                Resources.animations[id] = new Animation(animation);
            }
        }
        return false;
    };

    self.getSpriteMap = function(properties){
        var id = properties.id;
        if (Resources.spritemaps[id]){
            return Resources.spritemaps[id];
        }else{

            var img = self.getImage(properties.img,function(){
                self.getSpriteMap(properties);
            });
            if (img){
                var spriteProperties = {
                    width: properties.tileWidth,
                    height: properties.tileHeight,
                    name: id
                };
                self.loadSpriteSheet(img,spriteProperties);
                Resources.spritemaps[id] = new SpriteMap(properties);
            }
        }
        return false;
    };

    self.loadSpriteSheet = function(img,map){
        if (img){
            if (map.width && map.height){
                // fixed size sprites
                var w = map.width;
                var h = map.height;
                var name = map.name;

                var colCount = Math.floor(img.width/w);
                var rowCount = Math.floor(img.height/h);

                for (var col=0;col<colCount;col++){
                    for (var row=0;row<rowCount;row++){
                        var x = col*w;
                        var y = row*h;
                        var sName = name + ((row*colCount) + col);
                        var s = new Sprite(img,sName,x,y,w,h);
                        sprites[sName] = s;
                    }
                }
            }
        }
    };

    return self;
}());


var Preloader = (function(){
    var self = {};

    var loadCount;
    var totalItems;

    var top,left,width,height;

    self.init = function(items,onDone){

        width = 200;
        height = 10;
        left = (screenWidth-width)/2;
        top = (screenHeight-height)/2;

        totalItems = items.length;
        if (totalItems == 0){
            onDone();
        }else{
            var onUpdate = function(){
                self.render();
                if (loadCount == totalItems){
                    if (onDone) onDone();
                }
            };
            self.render();
            self.load(items,onUpdate)
        }
    };

    self.load = function(items,onUpdate){
        loadCount=0;
        var url;
        for (var i=0; i<totalItems; i++) {
            var thisResource = items[i];
            if (thisResource.url){
                url = thisResource.url;
            }else{
                url = thisResource;
            }

            console.log("preloading " + url);

            if (thisResource.id && typeof userData != "undefined" && userData[thisResource.id]){
                // resource already prefilled by user
                console.log("userdata present for resource " + thisResource.id);
                url = userData[thisResource.id];
            }

            var img = new Image();
            img.onload = function() {
                loadCount++;
                if (this.id) Resources.images[this.id] = this;
                if (onUpdate) onUpdate();
            };
            img.onerror = function(){
                console.error("Error loading url " + this.src);
            };
            img.id = thisResource.id;
            img.src = url;
        }
    };

    self.render = function(){
        UI.clear();
        ctx.strokeStyle="white";
        ctx.fillStyle = "white";
        ctx.rect(left,top,width,height);
        ctx.stroke();

        var barWidth = Math.floor(loadCount*width/totalItems);

        ctx.fillRect(left,top,barWidth,height);
    };

    return self;
}());




