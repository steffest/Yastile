var Intro = (function(){
    var self = {};

    var state={};

    self.init = function(){

        if ((typeof app != "undefined") && (app.reset)){
            app.reset();
        }else{
            window.location.reload();
        }

    };

    self.setState = function(key,value){
        state[key] = value;
    };

    self.getState = function(key){
        return state[key];
    };

    self.levelSelector = function() {

    };


    return self

}());