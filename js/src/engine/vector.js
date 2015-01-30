var V = function(x, y) {
    this.x = x;
    this.y = y;
};

V.prototype.add = function(v) {
    return new V(v.x + this.x, v.y + this.y);
};

V.prototype.subtract = function(v) {
    return new V(this.x - v.x, this.y - v.y);
};

V.prototype.scale = function(s) {
    return new V(this.x * s, this.y * s);
};

V.prototype.dot = function(v) {
    return (this.x * v.x + this.y * v.y);
};

/* Normally the vector cross product function returns a vector. But since we know that all our vectors will only be 2D (x and y only), any cross product we calculate will only have a z-component. Since we don't have a 3D vector class, let's just return the z-component as a scalar. We know that the x and y components will be zero. This is absolutely not the case for 3D. */
V.prototype.cross = function(v) {
    return (this.x * v.y - this.y * v.x);
};

V.prototype.rotate = function(angle, vector) {
    if (typeof vector == "undefined") vector = new V(0,0);
    var x = this.x - vector.x;
    var y = this.y - vector.y;

    var x_prime = vector.x + ((x * Math.cos(angle)) - (y * Math.sin(angle)));
    var y_prime = vector.y + ((x * Math.sin(angle)) + (y * Math.cos(angle)));

    return new V(x_prime, y_prime);
};

V.prototype.copy = function(){
    return new V(this.x, this.y);
};