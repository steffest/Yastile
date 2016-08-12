var GameObjects = (function(){
    var self = {};

    self.init = function(){

        self.TILE = new GameObject({
            id: 1,
            spriteIndex: 1,
            code: "T",
            onCreate : function(me){
                UI.registerGameObjectForTouch(me);
                me.scale(0.8);
            },
            onDown: function(data,me){
                if (!me.isTurned){
                    if (Game.turnCount<2){
                        Game.turnCount++;
                        me.drop = 0;
                        me.startLeft = me.left;
                        me.startTop = me.top;
                        me.left -= 10;
                        me.top -= 10;
                        me.scale(1);
                        me.isTurned = true;
                        me.isActive = true;
                        me.setStaticFrame(me.value + 1);
                        console.log(me.value);

                        if (Game.turnCount == 1){
                            Game.firstSelection = me;
                        }

                        if (Game.turnCount == 2){
                            Game.secondSelection = me;

                            me.wait = Game.firstSelection.value == Game.secondSelection.value ? 10 : 40;
                        }
                    }else{
                        if (Game.firstSelection && Game.firstSelection.wait) Game.firstSelection.wait=1;
                        if (Game.secondSelection && Game.secondSelection.wait) Game.secondSelection.wait=1;
                    }
                }

            },
            /*onDrag: function(data,me){
                var deltaX = data.x - data.startX;
                var deltaY = data.y - data.startY;

                me.left = me.startLeft + deltaX;
                me.top = me.startTop + deltaY;

            },*/
            onUp: function(data,me){
                if (me.isActive) {
                    me.isActive = false;
                    me.drop = 50;
                }
            },
            eachStep: function(me){
                if (me.drop){
                    var steps = 50;
                    var step = steps - me.drop;

                    var d = Easing.easeOutElastic(step,1,-0.2,steps);
                    me.scale(d);

                    if (step<10){
                        me.left += 1;
                        me.top += 1;
                    }

                    me.drop--;
                }

                if (me.wait){
                    me.wait--;
                    if (!me.wait){
                        endTurn();
                    }
                }
            }
        });


        self.STAR = new GameObject({
            id: 2,
            spriteIndex: 26,
            code: "S",
            onCreate : function(me){
                me.scale(0.4);
            },
            eachStep: function(me){
                if (me.value == Game.getScore()){
                    me.setStaticFrame(25);
                    me.scale(0.4);
                }
            }
        });
    };

    self.resetState = function(){

    };


    function resetTile(me){
        me.setStaticFrame(1);
        me.scale(0.8);
        me.isActive = false;
        me.isTurned = false;
    }

    function endTurn(){
        if (Game.firstSelection.value == Game.secondSelection.value){
            Game.addScore(1);
        }else{
            resetTile(Game.firstSelection);
            resetTile(Game.secondSelection);
        }
        Game.turnCount = 0;
    }

    return self;
}());
