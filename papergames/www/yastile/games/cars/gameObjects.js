var GameObjects = (function(){
    var game = {};
    game.state = {};

    game.resetState = function(){
        game.state = {};
    };

    game.formatTime = function(t){
        var m = Math.floor(t / (1000 * 60));
        t = t - m;
        var s = Math.floor(t / 1000);
        t = t - s;

        var result = s + "." + t;
        if (s<10) result = "0" + result;
        result = m + ":" + result;
        if (m<10) result = "0" + result;
        return result;
    };

    game.init = function(){

        game.CAR = new GameObject({
            id: 1,
            code: "P",
            canMove: true,
            spriteIndex: "car",
            onCreate : function(me){
                me.prevMovements = new Array(20);
                if (me.color){
                    me.setStaticFrame("car_" + me.color);
                }
                me.vectors = [];
                me.acceleration = 0;

                var specs = carProperties.decentCar;
                if (me.autoDrive){
                    specs = carProperties.normalCar;
                }
                for (var key in specs){
                    me[key] = specs[key];
                }

            },
            eachStep : function(me){

                if (me.fireDelay) me.fireDelay--;

                var baseSpeed = me.baseSpeed;
                var maxAcceleration = me.maxAcceleration;
                var accelerationSpeed = me.accelerationSpeed;
                var decelerationSpeed = me.decelerationSpeed;
                var rotationSpeed = me.rotationSpeed;
                var driftDelay = me.driftDelay;
                var traction = me.traction;

                var co = new V(me.left,me.top);

                var drive = false;
                var terrain = World.getTerrain();
                var trackImageData = World.getTrackImageData();

                if (me.nextRotation){
                    // continue rotation from prev step
                    me.rotate(me.nextRotation);
                    me.nextRotation=0;
                }

                if (me.autoDrive){
                    // autodriving car
                    // scan in front of car and turn in the direction that has the longest line of sight;

                    function scanDistance(angle){
                        var scanAngle = me.rotationRadiants;
                        if (angle){
                            scanAngle = me.rotationRadiants + (angle * (Math.PI/180))
                        }
                        var scanOffsetX = 0-Math.sin(scanAngle);
                        var scanOffsetY = Math.cos(scanAngle);

                        var distance = 40;
                        var scanStep = 20;
                        var maxScanDistance = 160;
                        var keepScanning = true;
                        while (keepScanning){
                            var scanX = co.x + 24 - (scanOffsetX*distance);
                            var scanY = co.y + 24 - (scanOffsetY*distance);
                            var scanColor = getPixelFromImageData(trackImageData,scanX/10,scanY/10);

                            // check if there's a car at this position
                            var objects = me.mapLayer.getObjectAtPixels(scanX,scanY);
                            if (objects && objects.length>0){
                                for (var i =0;i<objects.length;i++){
                                    if (me.id != objects[i].id){
                                        scanColor = [0,0,0];
                                    }
                                }
                            }

                            if (scanColor && scanColor[0]>200 && distance<maxScanDistance){
                                distance = distance + scanStep;
                            }else{
                                keepScanning=false;
                            }

                        }

                        return distance;
                    }

                    var distanceFront = scanDistance(0);
                    var distanceLeft = scanDistance(-45);
                    var distanceRight = scanDistance(45);

                    drive = true;
                    if (distanceFront>140){
                        // clear line of sight: drive straight on
                        // avoid driving to close to the edge
                        if (distanceRight> distanceLeft + 40){
                            me.rotate(rotationSpeed)
                        }
                        if (distanceLeft> distanceRight + 40){
                            me.rotate(-rotationSpeed)
                        }
                    }else{
                        // nearing border

                        if (distanceFront<80) drive = false; // too close to border: stop driving;

                        // turn towards the longest line of sight;
                        if (distanceRight>=distanceLeft){
                            me.rotate(rotationSpeed);
                            me.nextRotation = rotationSpeed;
                        }else{
                            me.rotate(-rotationSpeed);
                            me.nextRotation = -rotationSpeed;
                        }
                    }

                }else{
                    if (Input.isUp() || Input.isAction()) drive = true;
                    if (Input.isDown()){
                        // can drive backwards?
                        drive = false;
                        me.speed = -1;
                    }else{
                        me.speed = Math.max(me.speed,0);
                    }

                    if (Input.isLeft()) me.rotate(-rotationSpeed);
                    if (Input.isRight()) me.rotate(rotationSpeed);

                }

                // probably should start with a (1,0) vector and rotate it, no?
                me.moveVector = new V(Math.sin(me.rotationRadiants),Math.cos(me.rotationRadiants));
                me.moveVector = me.moveVector.scale(me.speed);

                if (!me.collisionChecked){
                    me.detectCollistion(true, function (object) {
                        object.collisionChecked = true;
                        var otherMovement = object.moveVector;

                        var dampeningFactor = 0.9;

                        if (otherMovement){
                            me.vectors.push(otherMovement.scale(dampeningFactor));
                            // apply inverse force to other object
                            object.vectors.push(otherMovement.rotate(Math.PI).scale(dampeningFactor));
                        }

                        object.vectors.push(me.moveVector.scale(dampeningFactor));
                        // apply inverse force to other object
                        me.vectors.push(me.moveVector.rotate(Math.PI).scale(dampeningFactor));

                        object.acceleration = 0;
                        me.acceleration = 0;


                    });
                    me.collisionChecked = true;
                }

                if (drive){
                    me.acceleration = Math.min(me.acceleration  + accelerationSpeed,maxAcceleration);
                    me.speed = baseSpeed + me.acceleration;
                }else{
                    if (me.speed>0) me.speed -= decelerationSpeed;
                    me.acceleration = 0;
                }

                me.prevMovements.unshift(me.moveVector);
                me.prevMovements.pop();

                var speedTraction = traction/100;
                var driftTraction = 1-speedTraction;

                var prevMovement = me.prevMovements[driftDelay] || new V(0,0);
                me.moveVector = me.moveVector.scale(speedTraction);
                prevMovement=prevMovement.scale(driftTraction);
                me.moveVector = me.moveVector.add(prevMovement);

                // sloppy!
                me.moveVector.y = -me.moveVector.y;

                // add any external forces if any
                var newMoves = [];
                for (var i=0; i<me.vectors.length; i++){
                    var v = me.vectors[i];
                    me.moveVector = me.moveVector.add(v);

                    // dampening
                    v = v.scale(0.5);
                    if (Math.abs(v.x)>0.5 && Math.abs(v.y)>0.5) newMoves.push(v);
                }
                me.vectors = newMoves;

                var isOnHotSpot = false;
                var now = new Date().getTime();

                // check if we can move to the projected position
                var projectedCo = co.copy();
                if (me.speed) projectedCo = projectedCo.add(me.moveVector);


                // offset to the center of the sprite and scale down (we use a 10% grayscale image of the track )
                projectedCo = projectedCo.add(new V(24,24)).scale(0.1);

                var colors = getPixelFromImageData(trackImageData,projectedCo.x,projectedCo.y);

                if (colors){
                    // terrainSmoothness is a number from 0 to 1 indicating how fast the player can move over the terrain.
                    // 1: fullspeed
                    // 0: can't move
                    // we use a terrainmap in grayscale ... only use the red
                    // maybe use other colors to trigger special zones (finnish?)
                    var terrainSmoothness = colors[0] / 255;
                    var hotspot = colors[1] / 255;
                    me.moveVector = me.moveVector.scale(terrainSmoothness);

                    co = co.add(me.moveVector);

                    if (terrainSmoothness>0.9 && hotspot==0){
                        // we are on a hotspot - only 1 for now: the finnishline
                        now = new Date().getTime();
                        me.lastHotspotTime = me.lastHotspotTime || 1;
                        if ((now - me.lastHotspotTime)>2000) isOnHotSpot = true;
                        me.lastHotspotTime = now;
                    }

                    me.left = co.x;
                    me.top = co.y;
                    me.acceleration *= terrainSmoothness;
                }

                if (!me.autoDrive){

                    if (me.startLapTime){
                        var lapTime = now - me.startLapTime;
                        var hint = "Lap " + me.lap + ": " + game.formatTime(lapTime);
                        if (me.fastestLapTime) hint += " - Fastest: " + me.formattedFastedLapTime;
                        Game.setHint(hint);
                    }

                    if (isOnHotSpot){
                        me.lap = (me.lap || 0) + 1;
                        me.startLapTime = now;

                        if (lapTime && (!me.fastestLapTime || lapTime<me.fastestLapTime)){
                            me.fastestLapTime = lapTime;
                            me.formattedFastedLapTime = game.formatTime(lapTime);
                        }

                        console.error("lap",me.lap);
                    }



                    // keep car on screen
                    var screenX = me.left - terrain.scrollPixelX;
                    var screenY = me.top - terrain.scrollPixelY;
                    var canvasSize = Game.getCanvasSize();
                    var borderMargin = canvasSize.width/4; // start scrolling if player is withen this distance of the canvas border

                    if (screenX > canvasSize.width-borderMargin-me.width){
                        terrain.scrollPixelX += me.moveVector.x;
                    }
                    if (screenX < borderMargin){{
                        terrain.scrollPixelX += me.moveVector.x;
                    }}

                    if (screenY < borderMargin){
                        terrain.scrollPixelY += me.moveVector.y;
                    }
                    if (screenY > canvasSize.height-borderMargin-me.height){
                        terrain.scrollPixelY += me.moveVector.y;
                    }

                    // sync scrolling between layers
                    me.mapLayer.setScrollOffset(terrain.getScrollOffset());
                }

            }
        });
    };
    return game;
}());
