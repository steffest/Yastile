var Uploader = (function () {
    var self = {};

    var apiUrl = "http://ikjijwij.toep.be/api/upload.aspx";
    var _callback;

    // output information
    function Output(msg) {
        var m = el("messages");
        m.innerHTML = msg + m.innerHTML;
    }

    // file selection
    function FileSelectHandler(e) {
        // fetch FileList object
        var files = e.target.files || e.dataTransfer.files;

        // process all File objects
        for (var i = 0, f; f = files[i]; i++) {
            readFile(f);
            //UploadFile(f);
        }
    }

    // output file information
    function readFile(file) {
        console.log("reading file",file);

        // display an image
        if (file.type.indexOf("image") == 0) {
            var reader = new FileReader();
            reader.onload = function(e) {
                console.log("reading file done");
                if (_callback) _callback(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }


    // upload JPEG files
    function UploadFile(file) {
	
		console.error("uploading");

        var maxSize = 30000000;

        var xhr = new XMLHttpRequest();
        var errorMessage = false;



        if (!xhr || !xhr.upload) errorMessage = "no xhr upload available";
        if (file.type != "image/jpeg" && file.type != "image/png") errorMessage = "no image: " + file.type;
        if (file.size > maxSize) errorMessage = "File too big: " + file.size;


        if (errorMessage) {
            console.error(errorMessage);
        }else{
		
		    console.error("xhr upload available");

            // create progress bar
            var o = el("progress");
            var progress = o.appendChild(document.createElement("p"));
            progress.appendChild(document.createTextNode("upload " + file.name));


            // progress bar
            xhr.upload.addEventListener("progress", function(e) {
				
                var pc = parseInt(100 - (e.loaded / e.total * 100));
				console.error("progress: " + e.loaded,pc);
                progress.style.backgroundPosition = pc + "% 0";
            }, false);

            // file received/failed
            xhr.onreadystatechange = function(e) {
                if (xhr.readyState == 4) {
                    progress.className = (xhr.status == 200 ? "success" : "failure");
					console.error("done, status: " + xhr.status);
                }
            };

            // start upload
            xhr.open("POST", apiUrl, true);
            xhr.setRequestHeader("X_FILENAME", file.name);
            xhr.send(file);

        }

    }

    self.capture = function(callback){
        _callback = callback || function(){};
        var button = el("fileselect");
        button.click();
    };


    self.init = function(){
        console.error('upload init');

        if (window.File && window.FileList && window.FileReader){
            var fileselect      = el("fileselect"),
                submitbutton    = el("submitbutton");

            // file select
            fileselect.addEventListener("change", FileSelectHandler, false);

            // is XHR2 available?
            var xhr = new XMLHttpRequest();
            if (xhr.upload) {

                // file drop
                //filedrag.style.display = "block";

                // remove submit button
                //submitbutton.style.display = "none";
            }
        }else{
            console.error("no filereader ....")
        }


    };
    return self;
}());

