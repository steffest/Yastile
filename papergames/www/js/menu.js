touchData["menu_play"]={
    onTap : function(){
        showAppSection(APPSECTION.GAME)
    }
};

touchData["menu_create"]={
    onTap : function(){
        showAppSection(APPSECTION.EDITOR)
    }
};

touchData["menu_memory"]={
    onTap : function(){
        selectGame(GameInfo.memory);
    }
};

touchData["menu_cars"]={
    onTap : function(){
        selectGame(GameInfo.cars);
    }
};

touchData["menu_shooter"]={
    onTap : function(){
        selectGame(GameInfo.shooter);
    }
};


touchData["menu_flappy"]={
    onTap : function(){
        selectGame(GameInfo.flappy);
    }
};