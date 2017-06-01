Yascal.gameSettings = function (initialProperties) {

	var settings = {};
	var reloadOnClose;

	var settingValues = [
		{label: "OnScreen Controls", key: "onscreencontrols", type:"checkbox",defaultValue:true},
		{label: "Spotlight on player", key: "overlay", type:"checkbox"},
		{label: "SpriteSet", key:"spriteset", type:"text", values: ["original","nextgen","c64"],defaultValue:"nextgen",needsReload:true},
		{label: "Screen", key:"screensize", type:"text", values: ["240","320","480","600","800","1024","auto"],defaultValue:"320",needsReload:true}
	];
	var defaultSettings = {};

	settingValues.forEach(function(setting){
		if (setting.defaultValue) defaultSettings[setting.key] = setting.defaultValue;
	});

	var me = Y.panel();
	initialProperties = Y.properties(initialProperties);

	me.left = initialProperties.left || 10;
	me.top = initialProperties.top || 10;
	me.width = initialProperties.width || 100;
	me.height = initialProperties.height || 200;

	me.setSize(me.width,me.height);



	var close = Y.element({width:30,height:28,top:0,left:me.width-30});
	close.render = function(){
		UIFrame.getSprite("close").draw(me.ctx,close.left,close.top);
	};
	close.onClick = function(){
		if (reloadOnClose){
			window.location.reload();
		}else{
			Game.showLevelSelector();
		}
	};
	me.addChild(close);


	var listbox = Y.listbox();
	listbox.setProperties({
		width: me.width,
		height: me.height,
		left: 0,
		top: 30,
		itemHeight: 30,
		itemWidth: me.width,
		backgroundColor: "black",
		smoothDrag: true
	});
	listbox.renderSelectionHighLight =  function(){};

	listbox.renderFunction = function(item,x,y){

		var textX = x+4;
		var textY = y+10;
		var charWidth = 11;
		var vX;

		//listbox.ctx.fillStyle = "white";
		//listbox.ctx.fillText(item.label,textX,textY);

		UIFrame.drawText(listbox.ctx,item.label,textX,textY);
		if (item.type == "checkbox"){
			var checked = !!me.getSettings(item.key);
			vX = me.width - 3 * charWidth;
			UIFrame.drawText(listbox.ctx, checked ? "On" : "Off",vX,textY);
		}
		if (item.type == "text"){
			var value = me.getSettings(item.key) || "";
			vX = me.width - value.length * charWidth;
			UIFrame.drawText(listbox.ctx, value,vX,textY);
		}

	};

	listbox.onClick = function(touchData){
		var x = touchData.x - listbox.left;
		var y = touchData.y - listbox.top;

		console.error(x,y);
		var item = listbox.getItemAtPosition(x,y);
		if (item){
			if (item.type == "checkbox"){
				settings[item.key] = !me.getSettings(item.key);
			}
			if (item.type == "text"){
				if (item.values){
					var currentValue = me.getSettings(item.key).toString();
					console.error(currentValue,item.values);
					var index = item.values.indexOf("" + me.getSettings(item.key));
					console.error(index);
					if (index<0 || index==item.values.length-1) index=-1;
					settings[item.key] = item.values[++index];
				}
				if (item.needsReload) reloadOnClose=true;
			}
			listbox.refresh();
			me.saveSettings();
		}
	};

	listbox.setItems(settingValues);


	me.addChild(listbox);

	me.loadSettings = function(next){
		localforage.getItem('settings', function (err, value) {
			if (err){
				settings = {};
				console.error("error loading local settings, falling back to defaults");
			}else{
				settings = value;
				if (!settings){
					console.log("no local settings, falling back to defaults");
					settings = {};
				}else{
					console.log("local settings loaded",settings);
				}
			}
			if (next) next();
		});
	};

	me.saveSettings = function(){
		localforage.setItem('settings', settings, function (err) {
			if (err){
				console.error("couldn't save settings")
			}
		});
	};

	me.getSettings = function(key){
		if (key){
			var value = settings[key];
			if (typeof value == "undefined")value = defaultSettings[key];
			return value;
		}else{
			return settings;
		}
	};

	me.setLayout = function(){
		close.setPosition(me.width-30,0);
		listbox.setProperties({
			width: me.width,
			height: me.height,
			itemWidth: me.width
		});
	};


	return me;
};