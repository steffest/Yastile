var UIFrame = function(){
    var me = {};
    var spritesheet;



    var bitmapFont_chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ.,?:'-*1234567890";

    var spriteMap = {
        "settings" : {x:100,y:0,w:30,h:28},
        "close" : {x:130,y:0,w:30,h:28}
    };

    var cx = 1;
    var cy = 1;
    var charWidth = 9;
    var charHeight = 11;
    var bitmapFont_maxWidth = 11 * charWidth;
    bitmapFont_chars.split("").forEach(function(c){
        spriteMap[c] = {x:cx,y:cy,w:8,h:10};
        cx += charWidth;
        if (cx>bitmapFont_maxWidth){
            cx = 1;
            cy += charHeight;
        }
    });

    me.init = function(next){
        spritesheet = Y.spriteSheet();
        spritesheet.loadFromImage("img/game_intro_ui.png",spriteMap,function(){
            console.log("sprites UI frame loaded");
            if (next) next();
        });
    };

    me.drawText = function(ctx,text,x,y){
        var chars = text.toUpperCase().split("");
        chars.forEach(function(c){
            var i = spritesheet.sprites[c];
            if (i) ctx.drawImage(i.canvas,x,y);
            x += charWidth;
        });

    };

    me.getSprite = function(name){
        return spritesheet.sprites[name];
    };

    return me;
}();