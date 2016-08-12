Editor = {
    tool: "hand"
};

var editorcanvas;

touchData["editorcanvas"]={
    defaultDrag : true,
    defaultScale: true,
    defaultRotate: true,
    preventDefault: true,
    onTouchStart: function(data,event){
        var i = convertPointFromPageToNode(data.srcElement,data.startX,data.startY);
        Editor.lastX = i.x;
        Editor.lastY = i.y;
    },
    onDrag: function(data,event){

        if (!data.isMultiTouch){

            // calculate Page coordinates to element coördinates
            // as the element can have a CSS transform
            var i = convertPointFromPageToNode(data.srcElement,data.currentX,data.currentY);
            var pX = i.x;
            var pY = i.y;

            ctx.beginPath();
            if (Editor.tool == "healer") {
                ctx.globalCompositeOperation="source-over";
                ctx.strokeStyle = Editor.activeColor ? Editor.activeColor : "rgb(0,0,0)";
                ctx.lineWidth = 5;
                ctx.lineJoin="round";
                ctx.lineCap="round";
                ctx.moveTo(Editor.lastX,Editor.lastY);
                ctx.lineTo(pX ,pY);
                ctx.stroke();
            }else if (Editor.tool == "eraser"){
                ctx.globalCompositeOperation="destination-out";
                ctx.lineWidth = 10;
                ctx.lineJoin="round";
                ctx.lineCap="round";
                ctx.moveTo(Editor.lastX,Editor.lastY);
                ctx.lineTo(pX ,pY);
                ctx.stroke();
                //ctx.arc(pX,pY,8,0,Math.PI*2,false);
                //ctx.fill();
            }
            Editor.lastX = pX;
            Editor.lastY = pY;
            ctx.closePath(pX);
        }
    },
    onTouchEnd: function(data,event){
        console.log("mouse up");
    },
    allowDrag: function(){
        return Editor.tool == "hand";
    }

};

touchData["startposition"]={
    defaultDrag : true,
    defaultScale: true,
    defaultRotate: true,
    preventDefault: true,
    allowDrag: function(){
        return true;
    }
};

touchData["trackcanvas"]={
    defaultDrag : false,
    defaultScale: false,
    defaultRotate: false,
    preventDefault: true,
    onTouchStart: function(data,event){
        var i = convertPointFromPageToNode(data.srcElement,data.startX,data.startY);
        Editor.lastX = i.x;
        Editor.lastY = i.y;
    },
    onDrag: function(data,event){

        if (!data.isMultiTouch){

            // calculate Page coordinates to element coördinates
            // as the element can have a CSS transform
            var i = convertPointFromPageToNode(data.srcElement,data.currentX,data.currentY);
            var pX = i.x;
            var pY = i.y;

            var cx = el("trackcanvas").getContext("2d");

            var lineWidth = 5;
            if (Editor.activeColor == "white") lineWidth = 10;
            if (Editor.activeColor == "black") lineWidth = 10;

            cx.beginPath();
            cx.globalCompositeOperation="source-over";
            cx.strokeStyle = Editor.activeColor ? Editor.activeColor : "rgb(0,0,0)";
            cx.lineWidth = lineWidth;
            cx.lineJoin="round";
            cx.lineCap="round";
            cx.moveTo(Editor.lastX,Editor.lastY);
            cx.lineTo(pX ,pY);
            cx.stroke();

            Editor.lastX = pX;
            Editor.lastY = pY;
            cx.closePath(pX);
        }
    },
    onTouchEnd: function(data,event){
        console.log("mouse up");
        // save track

        var imageData = el("trackcanvas").toDataURL();
        userData[Editor.currentResourceId] = imageData;
        //var c = el("canvas_tracksmall");
        //var cx = c.getContext("2d");
        //cx.clearRect(0,0, c.width, c.height);
        //cx.drawImage(el("trackcanvas"),0,0,343, 221);

        // save to localStorage
        try {
            localStorage.setItem(currentGame.name + "_" + Editor.currentResourceId,imageData);
        } catch(domException) {
            if (domException.name === 'QuotaExceededError' ||
                domException.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                alert("Whoops, like your browser doesn't allow saving data this big...")
            }
        }
    }
};

touchData["btn_camera"]={
    onTap: function(){
        importImage("cam");
    }
};

touchData["btn_hand"]={
    onTap: function(elm){
        setEditorTool("hand");
    }
};

touchData["btn_library"]={
    onTap: function(){
        importImage("lib");
    }
};

touchData["btn_eraser"]={
    onTap: function(elm){
        Editor.tool = "eraser";
        setActiveButton(elm.srcElement);
    }
};

touchData["btn_healer"]={
    onTap: function(elm){
        Editor.tool = "healer";
        setActiveButton(elm.srcElement);
        if (!el("color0")){
            buildPallete();
        }
    }
};

touchData["btn_cut"]={
    onTap: function(){
        Editor.tool = "eraser";
        var imageData = ctx.getImageData(0, 0, editorcanvas.width, editorcanvas.height);

        var clearIndex = [];

        // start clearing canvas from the outside to the inside
        // until a transparent pixel is found
        for (var x = 0; x<editorcanvas.width; x++){
            var doneTop = false;
            var doneBottom = false;

            for (var y = 0; y<editorcanvas.height/2+1; y++){
                var indexTop = ((y*editorcanvas.width)+x) * 4;
                var indexBottom = (((editorcanvas.height-y-1)*editorcanvas.width)+x) * 4;

                if (!doneTop){
                    var alphaTop = imageData.data[indexTop + 3];
                    if (alphaTop>50){
                        clearIndex.push(indexTop + 3);
                    }else{
                        doneTop = true;
                    }
                }

                if (!doneBottom){
                    var alphaBottom = imageData.data[indexBottom + 3];
                    if (alphaBottom>50){
                        clearIndex.push(indexBottom + 3);
                    }else{
                        doneBottom = true;
                    }
                }

                if (doneTop && doneBottom){
                    y = editorcanvas.height;
                }
            }
        }

        for (var y = 0; y<editorcanvas.height; y++){
            var doneLeft = false;
            var doneRight = false;

            for (var x = 0; x<editorcanvas.width/2+1; x++){
                var indexLeft = ((y*editorcanvas.width)+x) * 4;
                var indexRight = ((y*editorcanvas.width) + (editorcanvas.width-x-1))  * 4;

                if (!doneLeft){
                    var alphaLeft = imageData.data[indexLeft + 3];
                    if (alphaLeft>50){
                        clearIndex.push(indexLeft + 3);
                    }else{
                        doneLeft = true;
                    }
                }

                if (!doneRight){
                    var alphaRight = imageData.data[indexRight + 3];
                    if (alphaRight>50){
                        clearIndex.push(indexRight + 3);
                    }else{
                        doneRight = true;
                    }
                }

                if (doneLeft && doneRight){
                    x = editorcanvas.width;
                }
            }
        }


        // clear the marked pixels
        for (var i = 0, len = clearIndex.length; i<len; i++){
            imageData.data[clearIndex[i]] = 0;
        }

        ctx.putImageData(imageData, 0, 0);
        console.error("done");

    }
};


touchData["btn_fx"]={
    onTap: function(){
        touchData["canvas"].imageData = ctx.getImageData(0, 0, editorcanvas.width, editorcanvas.height);
        resetFilter();
        dom.addClass(el("toolbar"),"hidden");
        dom.addClass(el("more"),"hidden");
        dom.removeClass(el("fx"),"hidden");
    }
};

touchData["btn_more"]={
    onTap: function(){
        dom.toggleClass(el("more"),"hidden");
        dom.addClass(el("diskoperations"),"hidden");
        dom.addClass(el("fx"),"hidden");
    }
};

touchData["btn_zoomin"]={
    onTap: function(){
        TouchController.scale(editorcanvas,160);
        setEditorTool("hand");
    }
};

touchData["btn_zoomout"]={
    onTap: function(){
        TouchController.scale(editorcanvas,62.5);
        setEditorTool("hand");
    }
};

touchData["btn_rotate"]={
    onTap: function(){
        TouchController.rotate(editorcanvas,90);
        setEditorTool("hand");
    }
};



touchData["btn_fx_done"]={
    onTap: function(){
        dom.addClass(el("fx"),"hidden");
        dom.addClass(el("diskoperations"),"hidden");
        dom.removeClass(el("toolbar"),"hidden");
    }
};

touchData["btn_disk"]={
    onTap: function(){
        dom.addClass(el("toolbar"),"hidden");
        dom.addClass(el("fx"),"hidden");
        dom.removeClass(el("diskoperations"),"hidden");
    }
};

touchData["btn_disk_done"]={
    onTap: function(){
        dom.addClass(el("fx"),"hidden");
        dom.addClass(el("diskoperations"),"hidden");
        dom.removeClass(el("toolbar"),"hidden");
    }
};


touchData["btn_save"]={
    onTap: function(){
        renderToCanvas(editorcanvas);
        var index = userData.currentSpriteMapIndex;
        var item = sprites[index];
        var w = GameProperties.tileSize;
        var h = w;
        if (spriteMap){
            item = spriteMap[index];
            w = item.w;
            h = item.h;
        }

        var canvas = document.createElement("canvas");
        canvas.width  = w;
        canvas.height = h;
        var ctx2 = canvas.getContext("2d");

        ctx2.drawImage(userData.targetCanvas,0,0,userData.targetCanvas.width,userData.targetCanvas.height,0,0,w,h);

        var srcName = item.name;
        if (spriteMap){
            spriteMap[index].canvas = canvas; // -> picked up in yastile to override the spritesheet image
        }else{
            sprites[index].canvas = canvas;
        }

        var editCanvas = el("sprite" + index);
        var editCtx = editCanvas.getContext("2d");
        editCtx.clearRect(0,0,editCanvas.width,editCanvas.height);
        editCtx.drawImage(canvas,0,0);
    }
};

touchData["btn_export"]={
    onTap : function(){
        buildExport("show");
    }
};

touchData["btn_download"]={
    onTap : function(){
        buildExport("download");
    }
};

touchData["btn_import"]={
    onTap : function(){
        importSpriteSet();
    }
};


touchData["btn_importresource"]={
    onTap : function(){
        importResource();
    }
};

touchData["btn_exportresource"]={
    onTap : function(){
        exportResource();
    }
};

touchData["btn_resetresource"]={
    onTap : function(){
        clearResource();
    }
};

touchData["btn_reset"]={
    onTap : function(){
        clearStorage();
    }
};

touchData["btn_start"]={
    onTap : function(){
        buildExport();
        showAppSection(APPSECTION.GAME)
    }
};

touchData["btn_start2"]={
    onTap : function(){
        showAppSection(APPSECTION.GAME)
    }
};



// renders a CSS translated element to canvas
function renderToCanvas(element,x,y){
    x = x||0;
    y = y||0;

    var elm = element;
    if (typeof element == "string") elm = el(element);

    var m = window.getComputedStyle(elm,null).getPropertyValue("-webkit-transform");
    var i = m.indexOf("(");
    m = m.substr(i+1);
    i = m.indexOf(")");
    m = m.substr(0,i);

    var matrix = m.split(",");

    var o = window.getComputedStyle(elm, null).getPropertyValue("-webkit-transform-origin");
    o = o.split("px").join("");
    var origin = o.split(" ");

    // draw scaled image on canvas
    var imageWidth = elm.offsetWidth;
    var imageHeight = elm.offsetHeight;

    var scaleImg = document.createElement("canvas");
    scaleImg.setAttribute("width",imageWidth);
    scaleImg.setAttribute("height",imageHeight);
    var scaleCtx = scaleImg.getContext("2d");
    scaleCtx.drawImage(elm,0,0,imageWidth,imageHeight);

    var container = el("canvasFrame");
    var canvasWidth = container.offsetWidth;
    var canvasHeight = container.offsetHeight;

    var targetCanvas = document.createElement("canvas");
    targetCanvas.setAttribute("width",canvasWidth);
    targetCanvas.setAttribute("height",canvasHeight);
    var ctx = targetCanvas.getContext("2d");

    // translate is depended on scale
    var scaleX = 1;
    var scaleY = 1;
    var rotationOffsetX = 0;
    var rotationOffsetY = 0;

    var transform = elm.style.webkitTransform;
    if (transform){
        var scale = getTransformationProperty(transform,"scale");
        var rotation = getTransformationProperty(transform,"rotate");

        var scaleParts = scale.split(",");
        scaleX = scaleParts[0];
        scaleY = scaleParts[1];

        rotation = rotation.split("deg").join("");

        // this formula is kind of invented by trial/error - I have no idea why it works ...
        rotationOffsetX = 0 - (Math.cos(rotation * (Math.PI/180)) * (imageWidth/2) - (imageWidth/2)) + (Math.sin(rotation * (Math.PI/180)) * (imageHeight/2));
        rotationOffsetY = 0 - (Math.cos(rotation * (Math.PI/180)) * (imageHeight/2) - (imageHeight/2)) -  (Math.sin(rotation * (Math.PI/180)) * (imageWidth/2));

    }

    var translateX = (origin[0] - (imageWidth*scaleX)/2) + rotationOffsetX*scaleX + x;
    var translateY = (origin[1] - (imageHeight*scaleY)/2) + rotationOffsetY*scaleX  + y;

    ctx.clearRect(0,0,canvasWidth,canvasHeight);

    ctx.save();
    ctx.translate(translateX,translateY);
    if (m) ctx.transform.apply(ctx,matrix);
    ctx.drawImage(scaleImg,0,0);
    ctx.restore();


    userData.targetCanvas = targetCanvas;


}


function getTransformationProperty(transform,propery){
    var result = "";
    var i = transform.toLowerCase().indexOf(propery);
    if (i>=0) transform=transform.substr(i+1);
    var i = transform.indexOf("(");
    if (i>0) transform=transform.substr(i+1);
    var i = transform.indexOf(")");
    if (i>0) {
        transform=transform.substr(0,i);
        result = transform;
    }
    return result
}


function addImageSlider(id,range){

    var sliderId = "slider" + id;
    var container = el("sliders");

    var slider = document.createElement("div");
    slider.className = "sliderContainer";

    var sliderButton = document.createElement("div");
    sliderButton.className = "sliderButton";
    sliderButton.id = sliderId;
    sliderButton.style.left = "185px";

    var sliderLabel = document.createElement("div");
    sliderLabel.className = "sliderLabel";
    sliderLabel.innerHTML = id;

    slider.appendChild(sliderButton);
    slider.appendChild(sliderLabel);
    container.appendChild(slider);

    touchData["canvas"] = touchData["canvas"] || {};
    touchData["canvas"].sliders = touchData["canvas"].sliders || [];
    touchData["canvas"].sliders.push(id);

    touchData[sliderId]={
        dragY: true,
        preventDefault: true,
        onTouchStart: function(data){
            clearInterval(touchData["canvas"].updateInterval);
            touchData[sliderId].originX = parseInt(sliderButton.style.left);
        },
        onDrag: function(data){
            var deltaX = data.currentX - data.startX;
            var origin = touchData[sliderId].originX;
            var left = (origin + deltaX);

            left=between(0,left,400);

            sliderButton.style.left = left + "px";

            var value = (left/200) - 1;
            value *= range;
            touchData["canvas"].filters[id] = value;
            //if (!touchData["canvas"].updateInterval){
            //    touchData["canvas"].updateInterval = setInterval(function(){
            //        updateFilter();
            //    },60);
            //}
        },
        onDrop: function(data){
            clearInterval(touchData["canvas"].updateInterval);
            updateFilter();
        }
    };

}

function resetFilter(){
    var sliders = touchData["canvas"].sliders;
    touchData["canvas"].filters = {};
    for (var i = 0, len=sliders.length; i<len; i++){
        console.error(sliders[i]);
        el("slider" + sliders[i]).style.left = "185px";
        touchData["canvas"].filters[sliders[i]] = 0;
    }
}

function updateFilter(){
    var filters = touchData["canvas"].filters;
    var contrast = filters.contrast || 0;
    var brightness= filters.brightness || 0;
    var red = filters.red || 0;
    var green= filters.green || 0;
    var blue= filters.blue || 0;

    var filtered = ImageFilters.BrightnessContrastPhotoshop(touchData["canvas"].imageData, brightness, contrast);
    filtered = ImageFilters.ColorTransformFilter(filtered, 1, 1, 1, 1, red, green, blue, 1);

    ctx.putImageData(filtered, 0, 0);
}


function buildPallete(){
    var container = el("palette");
    for (var i = 0;i<16;i++){
        var grey = i*16;
        var color = "rgb(" + grey + "," + grey + "," + grey + ")";
        var tile = document.createElement("div");
        tile.className = "color";
        tile.color = color;
        tile.style.backgroundColor = color;

        tile.id = "color" + grey;
        touchData[tile.id] = {
            onTap:function(data){
                dom.addClass(data.srcElement,"active");
                if (Editor.activeColorId){
                    dom.removeClass(el(Editor.activeColorId),"active");
                }
                Editor.activeColor = data.srcElement.color;
                Editor.activeColorId = data.srcElement.id;
            }
        };

        container.appendChild(tile);
    }
}

function buildTrackPallete(){
    var container = el("trackpalette");
    var colors = ["white","grey","black","red"];
    for (var i = 0;i<colors.length;i++){

        var color = colors[i];
        var tile = document.createElement("div");
        tile.className = "color";
        tile.color = color;
        tile.style.backgroundColor = color;

        tile.id = "color" + color;
        touchData[tile.id] = {
            onTap:function(data){
                dom.addClass(data.srcElement,"active");
                if (Editor.activeColorId){
                    dom.removeClass(el(Editor.activeColorId),"active");
                }
                Editor.activeColor = data.srcElement.color;
                Editor.activeColorId = data.srcElement.id;
            }
        };

        container.appendChild(tile);
    }
}

function  buildExport(target){
    var h = 0;
    var w = 1;
    var i,len,c;
    var x, y;

    var sprites = el("sprites");
    var canvasList = sprites.querySelectorAll("canvas");
    len = canvasList.length;
    for (i= 0;i<len;i++){
        c = canvasList[i];
        if (!dom.hasClass(c,"external")){
            w = Math.max(w, c.width);
            h += c.height;
        }
    }

    var targetCanvas = document.createElement("canvas");
    targetCanvas.width = w;
    targetCanvas.height = h;
    console.error(w,h);
    var context = targetCanvas.getContext("2d");

    y=0;
    for (i= 0;i<len;i++){
        c = canvasList[i];
        if (!dom.hasClass(c,"external")){
            context.drawImage(c, 0, y);
            y += c.height;
        }
    }


    // save to localStorage
    var dataUrl = targetCanvas.toDataURL();

    if (spriteMap && spriteMap.length){

    }else{
        userData["spritesheet"] = dataUrl;
    }


    try {
        localStorage.setItem(currentGame.name + "_canvas",dataUrl);
        console.log("saved to localStorage " + currentGame.name + "_canvas");
    } catch(domException) {
        if (domException.name === 'QuotaExceededError' ||
            domException.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            alert("Whoops, like your browser doesn't allow saving data this big...")
        }
    }

    if (target == "show"){
        window.open(dataUrl);
    }

    if (target == "download"){
        var a = document.createElement("a");
        a.download = currentGame.name + "_spriteset.png";
        a.href= dataUrl;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        //note: the appendChild/removeChild part is needed for Firefox

        //var url = dataUrl .replace(/^data:image\/[^;]/, 'data:application/octet-stream');
        //location.href = url;
    }
}

function importSpriteSet(){

    getPictureFromAlbum(function(imageData){

        var img = new Image();
        img.onload = function(){
            var i,len, c,cx,y;

            var sprites = el("sprites");
            var canvasList = sprites.querySelectorAll("canvas");
            len = canvasList.length;

            y = 0;
            for (i= 0;i<len;i++){
                c = canvasList[i];
                if (!dom.hasClass(c,"external")){
                    cx = c.getContext("2d");
                    cx.clearRect(0,0,c.width,c.height);
                    cx.drawImage(img,0,y,c.width,c.height,0,0, c.width, c.height);
                    y += c.height;

                    if (spriteMap){
                        spriteMap[i].canvas = c;
                    }else{
                        sprites[i].canvas = c;
                    }
                }
            }

        };
        img.src = imageData;
    });

}


function importResource(){

    getPictureFromAlbum(function(imageData){

        var img = new Image();
        img.onload = function(){

            if (Editor.currentResourceId == "track"){
                // resize to 3425 x 2208
                if (img.width != 3425){
                    console.log("resizing to 3425 x 2208");
                    var c = document.createElement("canvas");
                    c.width = 3425;
                    c.height = 2208;
                    c.getContext("2d").drawImage(img,0,0,c.width,c.height);
                    imageData =  c.toDataURL('image/jpeg', 0.5);
                }
            }

            userData[Editor.currentResourceId] = imageData;
            drawResource(img,true);

            // save to localStorage
            try {
                localStorage.setItem(currentGame.name + "_" + Editor.currentResourceId,imageData);
            } catch(domException) {
                if (domException.name === 'QuotaExceededError' ||
                    domException.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                    alert("Whoops, like your browser doesn't allow saving data this big...")
                }
            }
        };
        img.src = imageData;
    });

}

function exportResource(){

    var a = document.createElement("a");

    var type = Editor.currentResourceUrl.indexOf(".jpg")>0 ? ".jpg" : ".png";

    //a.download = currentGame.name + "_" + Editor.currentResourceId + type;
    a.href= Editor.currentResourceUrl;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

}

function importLocalStorage(){
    var data = localStorage.getItem(currentGame.name + "_canvas");
    if (data){
        var i,len, c,cx,y;

        var sprites = el("sprites");
        var canvasList = sprites.querySelectorAll("canvas");
        len = canvasList.length;

        var img=new Image();
        img.onload=function(){
            y = 0;
            for (i= 0;i<len;i++){
                c = canvasList[i];
                cx = c.getContext("2d");
                cx.clearRect(0,0,c.width,c.height);
                cx.drawImage(img,0,y,c.width,c.height,0,0, c.width, c.height);
                y += c.height;

                if (spriteMap){
                    spriteMap[i].canvas = c;
                }else{
                    sprites[i].canvas = c;
                }
            }
        };
        img.src=data;
    }
}

function clearStorage(){
    localStorage.removeItem(currentGame.name + "_canvas");
    listSprites();
}

function clearResource(){
    localStorage.removeItem(currentGame.name + "_" + Editor.currentResourceId);
    userData[Editor.currentResourceId] = false;

    Editor.clearResourceId = Editor.currentResourceId;

    listSprites();

}

function setActiveButton(button){
    var toolbar = el("toolbar");
    dom.removeClass(".button","active",toolbar);
    dom.addClass(button,"active");
}

function setEditorTool(tool){
    Editor.tool = tool;

    if (Editor.tool == "hand") setActiveButton(el("btn_hand"));
    if (Editor.tool == "eraser") setActiveButton(el("btn_eraser"));
    if (Editor.tool == "healer") setActiveButton(el("btn_healer"));
}

function listSprites(){
    var container = el("sprites");
    container.innerHTML = "";
    var img = new Image();
    var localData = localStorage.getItem(currentGame.name + "_canvas");
    img.onload = function() {

        var maxSprites;
        var i,len;

        if (spriteMap && spriteMap.length){
            maxSprites = spriteMap.length;
            for (i = 0, len = maxSprites; i<len;i++){
                var co = spriteMap[i];
                if (co.modify){
                    var  s = new Sprite(img,co.name,co.l,co.t,co.w,co.h);
                    s.canvas.id = "sprite" + i;
                    s.canvas.index = i;

                    touchData["sprite" + i] = {
                        onTap: function(data){
                            var canvas = data.srcElement;
                            editImage(canvas);
                        }
                    };
                    container.appendChild(s.canvas);
                }
            }
        }else{
            var t = GameProperties.tileSize;

            maxSprites = Math.floor(img.width/t) * Math.floor(img.height/t);
            for (i=0;i<maxSprites;i++){
                var s = new Sprite(img,i,t);
                s.canvas.id = "sprite" + i;
                s.canvas.index = i;

                touchData["sprite" + i] = {
                    onTap: function(data){
                        var canvas = data.srcElement;
                        editImage(canvas);
                    }
                };

                container.appendChild(s.canvas);
                sprites[i] = s;
            }
        }

        var preload = [];
        if (GameProperties.preload) preload = GameProperties.preload.slice(0);
        if (GameProperties.backgroundImage) preload.push({id: "backGroundImage", url: GameProperties.backgroundImage, modify: true});


        if (preload.length){
            for (i = 0, len = preload.length; i<len;i++){
                var resource = preload[i];
                if (resource.modify){
                    var preloadimg = new Image();

                    preloadimg.onload = function() {


                        var spriteCanvas = document.createElement("canvas");
                        spriteCanvas.width = this.width;
                        spriteCanvas.height = this.height;

                        var spritectx = spriteCanvas.getContext("2d");
                        spritectx.drawImage(this,0,0);

                        spriteCanvas.id = "canvas_" + this.id;
                        spriteCanvas.className = "external";
                        var url = this.getAttribute('data-url');

                        spriteCanvas.setAttribute('data-url', url);
                        spriteCanvas.setAttribute('data-id', this.id);

                        touchData[spriteCanvas.id] = {
                            onTap: function(data){
                                var canvas = data.srcElement;
                                editResource(canvas);
                            }
                        };

                        container.appendChild(spriteCanvas);

                        if (Editor.clearResourceId){
                            Editor.clearResourceId = false;
                            editResource(spriteCanvas);
                        }

                    };
                    preloadimg.onerror = function(){
                        console.error("Error loading url " + this.src);
                    };
                    preloadimg.id = resource.id;
                    preloadimg.setAttribute('data-url', resource.url);


                    var localData = localStorage.getItem(currentGame.name + "_" + resource.id);
                    if (localData){
                        userData[resource.id] = localData;
                        preloadimg.src = localData;
                    }else{
                        preloadimg.src = resource.url + "_editor.png";
                    }


                }
            }
        }


        //track

        if (spriteMap && spriteMap.length) importLocalStorage();

    };

    if (spriteMap && spriteMap.length){
        if (localData){
            img.src = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
        }else{
            img.src =  GameProperties.spriteSheet;
        }
    }else{
        if (localData){
            console.error("loading local data");
            img.src = localData;
        }else{
            img.src =  GameProperties.spriteSheet;
        }
    }

}

function importImage(source){

    //if (isApp){
    var getPicture =  getPictureFromCamera;
    if (source=="lib"){
        getPicture = getPictureFromAlbum;
    }
    getPicture(function(imageData){
        userData.rawImage = imageData;

        var img = new Image();
        img.onload = function(){
            editImage(img,true);
        };
        img.src = userData.rawImage;
    });
    //}else{
    //    var img = new Image();
    //    img.onload = function(){
    //        editImage(img,true);
    //    };
    //    img.src = "images/dummy.png";
    //}
}

function editImage(img,keepAspect){

    dom.removeClass(el("spriteeditor"),"hidden");
    dom.addClass(el("resourceeditor"),"hidden");

    if (!isNaN(img.index)) userData.currentSpriteMapIndex = img.index;
    editorcanvas=document.getElementById("editorcanvas");
    ctx=editorcanvas.getContext("2d");

    // reset CSS transitions

    editorcanvas.style.webkitTransform = "";

    var thisTouchData = touchData["editorcanvas"];

    thisTouchData.lastScale = 1;
    thisTouchData.lastRotation = 0;
    thisTouchData.posX =  0;
    thisTouchData.posy = 0;
    thisTouchData.lastPosX = 0;
    thisTouchData.lastPosY = 0;

    ctx.globalCompositeOperation="source-over";
    ctx.clearRect(0, 0, editorcanvas.width, editorcanvas.height);

    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;

    var w = 400;
    var h = 400;
    if (keepAspect){
        var aspectRatio = img.width/img.height;
        if (aspectRatio<1) {
            w = w*aspectRatio;
        }else{
            h = h*img.height/img.width;
        }
    }

    ctx.drawImage(img,0,0,w,h);

}


function editResource(img){

    Editor.currentResourceId = img.getAttribute("data-id");
    Editor.currentResourceUrl = img.getAttribute("data-url");
    Editor.currentResourceCanvas = img;

    dom.addClass(el("spriteeditor"),"hidden");
    dom.removeClass(el("resourceeditor"),"hidden");

    drawResource(img);

}

function drawResource(img,includeSpriteList){
    var resourcecanvas = el("resourcecanvas");
    var resourcectx=resourcecanvas.getContext("2d");

    var w = resourcecanvas.width;
    var h = resourcecanvas.height;

    resourcectx.clearRect(0, 0, w, h);

    //var aspectRatio = img.width/img.height;
    //if (aspectRatio<1) {
    //    w = w*aspectRatio;
    //}else{
    //    h = h*img.height/img.width;
    //}

    var trackCanvas = el("trackcanvas");
    var trackEditor = el("trackeditor");
    if (Editor.currentResourceId == "tracksmall"){

        var trackctx = trackCanvas.getContext("2d");
        trackctx.drawImage(img,0,0,w,h);
        dom.removeClass(trackEditor,"hidden");

        img = el("canvas_track");

        if (!el("colorred")){
            buildTrackPallete();
        }
    }else{
        dom.addClass(trackEditor,"hidden");
    }

    resourcectx.drawImage(img,0,0,w,h);

    if (includeSpriteList && Editor.currentResourceCanvas){
        resourcectx=Editor.currentResourceCanvas.getContext("2d");
        w = Editor.currentResourceCanvas.width;
        h = Editor.currentResourceCanvas.height;
        resourcectx.drawImage(img,0,0,w,h);
    }
}

