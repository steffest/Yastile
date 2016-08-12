var World = (function(){
    var self = {};

    self.init = function(){

        var layer = Map.addLayer({
            id : "main",
            zIndex : 1,
            type: MAPLAYERTYPE.FREE
        });


        var grid = new MapObject({
            id: "simCityMap",
            left: 10,
            top: 50,
            component: simCityMap
        });

        layer.addObject(grid,MAPOBJECTTYPE.FREE);

        Game.setGameSection(World.render);
    };

    self.render = function(){
        UI.clear("black");
        Map.render();

        //console.error("render");
    };

    return self

}());