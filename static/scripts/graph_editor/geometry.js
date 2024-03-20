export class Point {
    /*
    Variables:
    x: float
    y: float
    */

    constructor(x, y) {
        this.x = parseFloat(x);
        this.y = parseFloat(y);
    }

    add(point) {
        return new Point(this.x + point.x, this.y + point.y);
    }

    sub(point) {
        return new Point(this.x - point.x, this.y - point.y);
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    scale(coeff) {
        return new Point(this.x * coeff, this.y * coeff);
    }

    normalize(newLength=1.0) {
        return this.scale(newLength / this.length());
    }

    rotateBy(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Point(this.x * cos - this.y * sin,
                         this.x * sin + this.y * cos);
    }

    polarAngle() {
        var angle = Math.atan2(this.y, this.x);
        if (angle < 0) {
            angle += 2 * Math.PI;
        }
        return angle;
    }

    cross(vector) {
        return this.x * vector.y - this.y * vector.x;
    }

    dot(vector) {
        return this.x * vector.x + this.y * vector.y;
    }

    angleBetween(vector) {
        return (new Point(this.dot(vector), this.cross(vector))).polarAngle();
    }
}

export class Line {
    /*
    Variables:
    a: float
    b: float
    c: float

    ax + by + c = 0
    */

    constructor(point1, point2) {
        point1 = point2.sub(point1);
        this.a = point1.y;
        this.b = -point1.x;
        this.c = -(this.a * point2.x + this.b * point2.y);
    }

    normal() {
        return new Point(this.a, this.b);
    }

    distanceToPoint(point) {
        return Math.abs(this.a * point.x + this.b * point.y + this.c) / Math.sqrt(this.a * this.a + this.b * this.b);
    }
}

export class Circle {
    /*
    Variables:
    center: Point
    radius: float
    */

    constructor(center, radius) {
        this.center = center;
        this.radius = parseFloat(radius);
    }

    distanceToLine(a, b) {
        return (new Line(a, b)).distanceToPoint(this.center);
    }

    intersectsWithSegment(a, b, distanceCheck=true) {
        if (distanceCheck && this.distanceToLine(a, b) > this.radius) {
            return false;
        }
        const vecAC = this.center.sub(a);
        const vecBC = this.center.sub(b);
        const vecAB = b.sub(a);
        const vecBA = a.sub(b);
        var angle1 = vecAC.angleBetween(vecAB);
        var angle2 = vecBC.angleBetween(vecBA);
        angle1 = Math.min(angle1, 2 * Math.PI - angle1);
        angle2 = Math.min(angle2, 2 * Math.PI - angle2);
        return Math.max(angle1, angle2) < Math.PI / 2;
    }
}

export function getPointSide(a, b, c) {
    const prod = b.sub(a).cross(c.sub(a));
    const EPS = 1e-7;
    if (prod > EPS) {
        return -1;
    }
    return prod > -EPS ? 0 : 1;
}

// Returns true if points a and b are on different sides from line (c, d)
export function differentSide(a, b, c, d) {
    const prod1 = c.sub(a).cross(d.sub(a));
    const prod2 = c.sub(b).cross(d.sub(b));
    return prod1 * prod2 <= 0;
}

export function onSegment(a, b, c) {
    return Math.abs(b.sub(a).length() + c.sub(a).length() - c.sub(b).length()) < 1e-5;
}

export function segmentsIntersect(a, b, c, d, extendCDBy=1) {
    var vector = d.sub(c);
    vector = vector.normalize(vector.length() * (extendCDBy - 1));
    d = d.add(vector);
    c = c.sub(vector);
    if (Math.abs(vector.cross(b.sub(a))) < 1e-5) {
        return onSegment(c, a, b) && onSegment(d, a, b);
    }
    return differentSide(a, b, c, d) && differentSide(c, d, a, b);
}
