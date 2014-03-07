function loadUrl(url,callback){
    url = url + "?t=" + new Date().getTime();
    var http_request;
    try{
        http_request = new XMLHttpRequest();
    }catch (e){
        try{
            http_request = new ActiveXObject("Msxml2.XMLHTTP");
        }catch (e) {
            try{
                http_request = new ActiveXObject("Microsoft.XMLHTTP");
            }catch (e){
                callback({});
            }
        }
    }
    http_request.onreadystatechange  = function(){
        if (http_request.readyState == 4  )
        {
            var jsonObj = JSON.parse(http_request.responseText);
            callback(jsonObj);

        }
    };
    http_request.open("GET", url, true);
    http_request.send();
}

