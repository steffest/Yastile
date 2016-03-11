var Input = (function() {

    var self = {};
    var keyState = {};

    var KEY={
        left: 37,
        up: 38,
        right: 39,
        down: 40,
        space:32,
        ctrl:17,
        enter: 13,
        action:1000
    };

    document.addEventListener("keydown",handleKeyDown, false);
    document.addEventListener("keyup",handleKeyUp, false);

    function handleKeyDown(event){
        var keyCode = event.keyCode;
        keyState[keyCode] = state(keyCode);
        keyState[keyCode].isDown = true;

        if (keyCode == KEY.space || keyCode == KEY.ctrl || keyCode == KEY.enter){
            keyState[KEY.action] = state(KEY.action);
            keyState[KEY.action].isDown = true;
        }
    }

    function handleKeyUp(event){
        var keyCode = event.keyCode;
        keyState[keyCode] = state(keyCode);
        keyState[keyCode].isDown = false;

        if (keyCode == KEY.space || keyCode == KEY.ctrl || keyCode == KEY.enter){
            keyState[KEY.action] = state(KEY.action);
            keyState[KEY.action].isDown = false;
        }
    }

    self.isDown = function(value){
        return self.isKeyDown(KEY.down,value);
    };

    self.isUp = function(value){
        return self.isKeyDown(KEY.up,value);
    };

    self.isLeft = function(value){
        return self.isKeyDown(KEY.left,value);
    };

    self.isRight = function(value){
        return self.isKeyDown(KEY.right,value);
    };

    self.isAction = function(value){
        return self.isKeyDown(KEY.action,value);
    };

    self.isEnter = function(value){
        return self.isKeyDown(KEY.enter,value);
    };

    self.isKeyDown = function(keyCode,value){
        keyState[keyCode] = state(keyCode);
        if (typeof value !== "undefined") keyState[keyCode].isDown = value;
        return keyState[keyCode].isDown;
    };

    function state(keyCode){
        return keyState[keyCode] || {};
    }

   return self;

}());
