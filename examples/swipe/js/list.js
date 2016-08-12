var List = (function(){
    var self = {};

    var levels = [
        {icon: 1, name: "level 1" , url: "levels/level1.json"},
        {icon: 2, name: "level 2" , url: "levels/level2.json"},
        {icon: 3, name: "Aladdin level 2" , url: "levels/emc_aladdinMine01_2.json"},
        {icon: 4, name: "CrazyMine level 0" , url: "levels/emc_crazymine01_0.json"},
        {icon: 20, name: "Emerald Mine 1 level 0" , url: "levels/kingsoft_em01_0.json"},
        {icon: 22, name: "Emerald Mine 1 level 3" , url: "levels/kingsoft_em01_3.json"},
        {icon: 23, name: "Emerald Mine 1 level 39" , url: "levels/kingsoft_em01_39.json"},
        {icon: 24, name: "Sokoban 1" , url: "levels/sokoban1.json"},
        {icon: 9, name: "Sokoban 2" , url: "levels/sokoban2.json"},
        {icon: 10, name: "Sokoban 3" , url: "levels/sokoban3.json"},
        {icon: 200, name: "emeralds" , url: "levels/emeralds.json"},
        {icon: 169, name: "bugs" , url: "levels/bugs.json"},
        {icon: 13, name: "level 1" , url: "levels/level1.json"},
        {icon: 14, name: "Sokoban 1" , url: "levels/sokoban1.json"},
        {icon: 15, name: "level 1" , url: "levels/level1.json"},
        {icon: 16, name: "Sokoban 1" , url: "levels/sokoban1.json"},
        {icon: 17, name: "level 1" , url: "levels/level1.json"},
        {icon: 18, name: "Sokoban 1" , url: "levels/sokoban1.json"},
        {icon: 19, name: "level 1" , url: "levels/level1.json"},
        {icon: 20, name: "Sokoban 1" , url: "levels/sokoban1.json"},
        {icon: 21, name: "level 1" , url: "levels/level1.json"},
        {icon: 22, name: "Sokoban 1" , url: "levels/sokoban1.json"}
    ];

    var state={};

    self.init = function(){

        UI.removeAllElements();
        var listboxProperties = {
            items: levels,
            itemHeight: 64,
            left: 20,
            top: 30,
            width: Game.getSettings().canvasWidth - 40,
            height: Game.getSettings().canvasHeight - 100,
            scrollY: self.getState("listbox_scrollY") || 0,
            onSelect: function(selectedItem){loadLevel(selectedItem)},
            onResize: function(listbox){
                listbox.width = Game.getSettings().canvasWidth - 40;
                listbox.height = Game.getSettings().canvasHeight - 100;
            },
            onSwipe: function(item){
                console.error(item.parent.scrollDeltaX)
            },
            onUp: function(item){
                var listbox = item.parent;
            },
            preserveState: function(key,value){
                self.setState("listbox_"+key,value)
            },
            renderItem : function (item){
                var lineHeight = 0.5;
                var lineTop = 54;
                var listbox = item.parent;

                var x = listbox.itemX;
                var y = listbox.itemY;

                var itemWidth = listbox.width;
                var itemHeight= listbox.itemHeight;

                y += itemHeight;

                if(listbox.isDown && listbox.currentElement == item){
                    x += listbox.scrollDeltaX;
                }


                ctx.fillStyle = "Green";
                ctx.fillRect(x,y+lineTop,itemWidth,lineHeight); // why is this white?

                ctx.fillStyle="#FF0000";
                ctx.fillRect(x,y+10,20,20);

                //ctx.drawImage(frame,x, y);

                ctx.fillStyle = "Grey";
                ctx.font      = "normal 10pt Arial";
                ctx.fillText(item.name, x + 40, y + 16);

                UI.registerEventElement(item,x,y,x+itemWidth,y+itemHeight);

                return {
                    x: x,
                    y: y
                }
            }
        };

        var levelSelector = new UI.Listbox(listboxProperties);
        UI.addElement(levelSelector);

        Game.setGameSection(List.levelSelector);

    };

    self.setState = function(key,value){
        state[key] = value;
    };

    self.getState = function(key){
        return state[key];
    };

    self.levelSelector = function() {
        UI.clear();
        UI.renderElements();
    };

    function loadLevel(selectedItem){
        console.error(selectedItem);
        //Game.loadLevel(selectedItem.url)
    }

    return self

}());