var GameObjects = (function(){
    var self = {};

    self.init = function(){

        self.FLOWER = new GameObject({
            id: 1,
            code: "T",
            onCreate : function(me){
                UI.registerGameObjectForTouch(me);
                me.scale(0.8);
            },
            onDown: function(data,me){
                me.drop = 0;
                me.startLeft = me.left;
                me.startTop = me.top;
                me.scale(1);
            },
            onDrag: function(data,me){
                var deltaX = data.x - data.startX;
                var deltaY = data.y - data.startY;

                me.left = me.startLeft + deltaX;
                me.top = me.startTop + deltaY;

            },
            onUp: function(data,me){
                me.drop = 50;
            },
            eachStep: function(me){
                if (me.drop){
                    var steps = 50;
                    var step = steps - me.drop;

                    var d = Easing.easeOutElastic(step,1,-0.2,steps);
                    me.scale(d);

                    me.drop--;
                }
            }
        });
    };
    return self;
}());
