Y.level = function(){
	var me = {};

	me.loadFromUrl = function(url,next){
		FetchService.json(url,function(result){
			if (next) next(result);
		})
	};

	me.buildMap = function(map,level){
		var player;
		map.getMap().forEach(function(tile){

			var line = level.map[tile.top];
			var code = line.substr(tile.left * 2,2);

			tile.gameObject = Y.gameObjectForCode[code];
			if (!tile.gameObject){
				console.warn("Unknown object " + code);
				tile.gameObject = Y.gameObjects.GRASS
			}
			if (tile.is(Y.gameObjects.PLAYER)) player = tile;


		});

		return {
			player: player
		}
	};

	return me;
}();