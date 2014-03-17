var Intro = (function(){
    var self = {};

    var levels = [
        {name: "level 1" , url: "resources/levels/level1.json"},
        {name: "Sokoban 1" , url: "resources/levels/sokoban1.json"}
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