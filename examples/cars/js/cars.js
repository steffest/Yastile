var carProperties={
    slowCar:{
        baseSpeed: 1,
        maxAcceleration: 5,
        accelerationSpeed: 0.05,
        decelerationSpeed: 0.2,
        rotationSpeed: 4, // degrees to turn when going left/right
        driftDelay: 8, // increase to get more drift, up to length of the array prevAngle, for large values you probably want to do some averaging first.
        traction: 40 // in percent, increase to get more traction (less effect of drift)
    },
    normalCar:{
        baseSpeed: 2,
        maxAcceleration: 6,
        accelerationSpeed: 0.15,
        decelerationSpeed: 0.4,
        rotationSpeed: 4, // degrees to turn when going left/right
        driftDelay: 8, // increase to get more drift, up to length of the array prevAngle, for large values you probably want to do some averaging first.
        traction: 30 // in percent, increase to get more traction (less effect of drift)
    },
    decentCar:{
        baseSpeed: 2,
        maxAcceleration: 7,
        accelerationSpeed: 0.2,
        decelerationSpeed: 0.2,
        rotationSpeed: 4,
        driftDelay: 6,
        traction: 40
    },
    prettyGoodCar:{
        baseSpeed: 2,
        maxAcceleration: 9,
        accelerationSpeed: 0.25,
        decelerationSpeed: 0.3,
        rotationSpeed: 4,
        driftDelay: 6,
        traction: 60
    },
    drifter:{
        baseSpeed: 2,
        maxAcceleration: 9,
        accelerationSpeed: 0.2,
        decelerationSpeed: 0.3,
        rotationSpeed: 4,
        driftDelay: 8,
        traction: 10
    },
    fastcar:{
        baseSpeed: 2,
        maxAcceleration: 12,
        accelerationSpeed: 0.5,
        decelerationSpeed: 0.4,
        rotationSpeed: 4,
        driftDelay: 4,
        traction: 60
    },
    formula1:{
        baseSpeed: 2,
        maxAcceleration: 15,
        accelerationSpeed: 0.8,
        decelerationSpeed: 0.4,
        rotationSpeed: 6,
        driftDelay: 3,
        traction: 70
    },
    superman:{
        baseSpeed: 4,
        maxAcceleration: 30,
        accelerationSpeed: 1,
        decelerationSpeed: 0.5,
        rotationSpeed: 15,
        driftDelay: 0,
        traction: 100
    }
};