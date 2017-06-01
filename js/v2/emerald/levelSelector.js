Yascal.levelSelector = function (initialProperties) {
	var me = Y.panel();
	initialProperties = Y.properties(initialProperties);

	me.left = initialProperties.left || 10;
	me.top = initialProperties.top || 10;
	me.width = initialProperties.width || 100;
	me.height = initialProperties.height || Y.screen.height - 40;

	me.setSize(me.width,me.height);


	var settings = Y.element({width:30,height:28,top:0,left:me.width-30});
	settings.render = function(){
		UIFrame.getSprite("settings").draw(me.ctx,settings.left,settings.top);
	};
	settings.onClick = function(){
		Game.showSettings();
	};
	me.addChild(settings);



	var listbox = Y.listbox();
	listbox.setProperties({
		width: me.width,
		height: me.height - 30,
		left: 0,
		top: 30,
		itemHeight: 30,
		itemWidth: me.width/2,
		backgroundColor: "green",
		smoothDrag: true,
		viewType: "grid"
	});

	listbox.renderFunction = function(item,x,y){

		var textX = x+4;
		var textY = y+16;

		listbox.ctx.fillStyle = "blue";
		listbox.ctx.fillRect(x + 1,y + 1,20,20);

		if (item.icon){
			me.ctx.drawImage(item.icon,x,y);
			textX += item.icon.width + 4;
		}

		listbox.ctx.fillStyle = "white";
		listbox.ctx.fillText(item.label,textX,textY);

	};

	listbox.onClick = function(touchData){
		var x = touchData.x - listbox.left;
		var y = touchData.y - listbox.top;

		var item = listbox.getItemAtPosition(x,y);
		console.error(item);
		if (item && item.filename){
			me.hide();
			Game.loadLevel(item.filename);
		}
	};

	listbox.setItems([
		{label: "Level 1", filename: "levels/level1.json"},
		{label: "Level 2", filename: "levels/level2.json"},
		{label: "Aladdin Mine 01 - level 2", filename: "levels/emc_aladdinMine01_2.json"},
		{label: "Crazy Mine 01 - level 0", filename: "levels/emc_crazymine01_0.json"},
		{label: "item 4"},
		{label: "item 5"},
		{label: "item 6"},
		{label: "item 7"},
		{label: "item 8"}
	]);

	window.listbox = listbox;


	me.addChild(listbox);


	return me;
};