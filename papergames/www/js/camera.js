function getPictureFromCamera(callback){
    if (navigator.camera && navigator.camera.getPicture){
        // we are in a Cordova App
        navigator.camera.getPicture(onSuccess, onFail, {
            quality: 50,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.CAMERA,
            targetWidth: 400,
            targetHeight: 400,
            cameraDirection: Camera.Direction.FRONT
        });

        function onSuccess(imageData) {
            callback(imageData);
        }

        function onFail(message) {
            alert('Camera failed because: ' + message);
        }
    }else{
        // no camera - probably running in browser: fallback to file reader / image upload
        getPictureFromAlbum(callback);
        //alert("sorry, this feature is not supported in your browser");
        //callback("img/dummy_selfie.png");
    }

}

function getPictureFromAlbum(callback){
    if (navigator.camera && navigator.camera.getPicture){
        // we are in a Cordova App
        navigator.camera.getPicture(onSuccess, onFail, {
            quality: 50,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            targetWidth: 400,
            targetHeight: 400
        });

        function onSuccess(imageData) {
            callback(imageData);
        }

        function onFail(message) {
            //alert('Camera failed because: ' + message);
        }
    }else{
        // fallback to file select;
        Uploader.init();
        Uploader.capture(function(result){
            callback(result)
        });
    }

}