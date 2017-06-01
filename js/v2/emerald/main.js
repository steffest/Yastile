var Main = function(){
	var me = {};

	me.onLoad = function(){
		console.log("scripts loaded");

		var stats = new Stats();
		stats.setMode(0); // 0: fps, 1: ms
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.left = '0px';
		stats.domElement.style.top = '0px';
		stats.domElement.style.zIndex = 100;
		document.body.appendChild( stats.domElement );
		Main.stats = stats;

		var wegGl = getUrlParameter("gl") || ((typeof useGl == "boolean") && useGl);

		Y.init({useWebGL:wegGl});
		Y.screen.setProperties({backGroundColor: "rgb(0,0,0)"});
		Y.screen.canvas.style["transform"] = "translatez(0)";

		var height = Math.min(720,window.innerHeight);
		height = 320;


		var body = document.getElementsByTagName("body")[0];
		body.appendChild(Y.canvas);

		me.setScreenSize(height);
		Y.screen.setScaleFactor(true);

		Game.start();
		//Game.showLevelSelector();
	};

	me.setScreenSize = function(height){
		var aspectRatio = window.innerWidth/window.innerHeight;

		var width = height*aspectRatio;
		if (width<320) {
			width = 320;
			height = width/aspectRatio;
		}
		Y.screen.setSize(width,height);
		Y.screen.clear();
		Y.screen.setScaleFactor();
	};

	return me;
}();


function getUrlParameter(param){
	if (window.location.getParameter){
		return window.location.getParameter(param);
	} else if (location.search) {
		var parts = location.search.substring(1).split('&');
		for (var i = 0; i < parts.length; i++) {
			var nv = parts[i].split('=');
			if (!nv[0]) continue;
			if (nv[0] == param) {
				return nv[1] || true;
			}
		}
	}
}
