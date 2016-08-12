var Page = (function(){
    var self = {};

    var state={};

    self.init = function(){

        UI.removeAllElements();

        var pages = [
            {
                "backgroundColor" : "green"
            },
            {
                "backgroundColor" : "blue"
            },
            {
                "backgroundColor" : "red"
            },
            {
                "backgroundColor" : "yellow"
            }
        ];

        var pagerProperties = {
            pages: pages,
            left: 0,
            top: 0,
            width: Game.getSettings().canvasWidth,
            height: Game.getSettings().canvasHeight,
            onResize: function(listbox){

            },
            onSwipe: function(){

            }
        };

        var pager = new UI.Pager(pagerProperties);
        UI.addElement(pager);

        Game.setGameSection(Page.renderPage);

    };


    self.renderPage = function() {
        UI.clear();
        UI.renderElements();
    };

    return self

}());