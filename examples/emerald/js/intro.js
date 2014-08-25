var Intro = (function(){
    var self = {};

    var levels = [
        {name: "level 1" , url: "examples/emerald/levels/level1.json"},
        {name: "level 2" , url: "examples/emerald/levels/level2.json"},
        {name: "Aladdin level 2" , url: "examples/emerald/levels/emc_aladdinMine01_2.json"},
        {name: "CrazyMine level 0" , url: "examples/emerald/levels/emc_crazymine01_0.json"},
        {name: "Emerald Mine 1 level 0" , url: "examples/emerald/levels/kingsoft_em01_0.json"},
        {name: "Emerald Mine 1 level 3" , url: "examples/emerald/levels/kingsoft_em01_3.json"},
        {name: "Emerald Mine 1 level 39" , url: "examples/emerald/levels/kingsoft_em01_39.json"},
        {name: "Sokoban 1" , url: "examples/emerald/levels/sokoban1.json"},
        {name: "Sokoban 2" , url: "examples/emerald/levels/sokoban2.json"},
        {name: "Sokoban 3" , url: "examples/emerald/levels/sokoban3.json"},
        {name: "emeralds" , url: "examples/emerald/levels/emeralds.json"},
        {name: "bugs" , url: "examples/emerald/levels/bugs.json"},
        {name: "level 1" , url: "examples/emerald/levels/level1.json"},
        {name: "Sokoban 1" , url: "examples/emerald/levels/sokoban1.json"},
        {name: "level 1" , url: "examples/emerald/levels/level1.json"},
        {name: "Sokoban 1" , url: "examples/emerald/levels/sokoban1.json"},
        {name: "level 1" , url: "examples/emerald/levels/level1.json"},
        {name: "Sokoban 1" , url: "examples/emerald/levels/sokoban1.json"},
        {name: "level 1" , url: "examples/emerald/levels/level1.json"},
        {name: "Sokoban 1" , url: "examples/emerald/levels/sokoban1.json"},
        {name: "level 1" , url: "examples/emerald/levels/level1.json"},
        {name: "Sokoban 1" , url: "examples/emerald/levels/sokoban1.json"}
    ];



    self.init = function(){

        UI.removeAllElements();
        var listboxProperties = {
            items: levels,
            onSelect: function(selectedItem){loadLevel(selectedItem)}
        };

        var levelSelector = new UI.Listbox(listboxProperties);
        UI.addElement(levelSelector);

        Game.setGameSection(Intro.levelSelector);

    };

    self.levelSelector = function() {
        UI.clear();
        UI.renderElements();
    };

    function loadLevel(selectedItem){
        Game.loadLevel(selectedItem.url)
    }

    return self

}());