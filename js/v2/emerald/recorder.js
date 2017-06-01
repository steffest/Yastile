Y.recorder = function(){
	var me = {};
	var recording = [];
	var isRecording = false;
	var isPlaying = false;
	var playBackPosition = 0;

	me.start = function(){
		isRecording = true;
		recording = [];
	};

	me.update = function(input){
		if (isRecording)recording.push(input);
		if (isPlaying){
			input = recording[playBackPosition];
			playBackPosition++;
		}

		return input;
	};

	me.stop = function(){
		if (isRecording){
			isRecording = false;
			console.log(recording.join(""));
		}
	};

	me.getRecording = function(joined){
		if (joined){
			return recording.join('');
		}else{
			return recording;
		}

	};

	me.playBack = function(tape){
		isRecording = false;
		isPlaying = true;
		playBackPosition = 0;
		recording = tape.split("");
	};


	return me;
}();