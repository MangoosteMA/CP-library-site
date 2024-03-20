import { Point, Line }   from "./geometry.js";
import { SVG_NAMESPACE } from "./svg_namespace.js";
import { Node }          from "./node.js";
import { createText }    from "./node.js";

export function getRadiusStep(nodeRadius) {
    return 1.5 * nodeRadius;
}

function findIntersectionAndTangentOfCircleAndEllipse(majorRadius, minorRadius, radius) {
    function square(value) {
        return value * value;
    }
    function calcEllipseY(x) {
        return Math.sqrt(Math.max(0, 1 - square(x / majorRadius)) * square(minorRadius));
    }
    function calcCircleY(x) {
        return Math.sqrt(Math.max(0, square(radius) - square(x + majorRadius)));
    }

    var left = -majorRadius;
    var right = left + radius;
    for (let i = 0; i < 20; i++) {
        var mid = (left + right) / 2;
        if (calcEllipseY(mid) > calcCircleY(mid)) {
            right = mid;
        } else {
            left = mid;
        }
    }

    var x = (left + right) / 2;
    var y = calcEllipseY(x);
    return {point: new Point(x + majorRadius, y), tangent: new Point(10, calcEllipseY(x + 10) - y)};
}

export class Edge {
    /*
    Variables:
    edge:             html <g> object
    node1:            Node
    node2:            Node
    weight:           string or null
    directed:         bool (if true, then edge goes from node1 to node2)
    edgeLine:         html <path> object
    text:             html <text> object
    edgeDirection:    html <path> object
    extraTextPadding: int (5 by default)
    index:            int or null
    */

    constructor(node1, node2, weight, directed, edgesGroup, fontSize) {
        this.node1 = node1;
        this.node2 = node2;

        this.edge = document.createElementNS(SVG_NAMESPACE, 'g');
        this.edge.setAttributeNS(null, "class", "edge");

        if (node1 == node2) {
            this.edgeLine = document.createElementNS(SVG_NAMESPACE, "ellipse");
        } else {
            this.edgeLine = document.createElementNS(SVG_NAMESPACE, "path");
        }
        this.edgeLine.setAttributeNS(null, "fill", "none");
        this.edgeLine.setAttributeNS(null, "stroke", "black");
        this.edgeLine.setAttributeNS(null, "stroke-width", "2");

        this.text = createText();
        this.edgeDirection = document.createElementNS(SVG_NAMESPACE, "path");

        this.setDirected(directed);
        this.setWeight(weight);

        edgesGroup.appendChild(this.edge);
        this.edge.appendChild(this.edgeLine);
        this.edge.appendChild(this.text);
        this.edge.appendChild(this.edgeDirection);

        this.setFontSize(fontSize);
        this.extraTextPadding = 5;
        this.index = null;

        this.#currentHeight = 0;
    }

    render(height, index, force) {
        this.index = index;
        if (this.node1 == this.node2) {
            this.renderSelfLoop(index);
            return true;
        }
        this.renderSimpleEdge(height, force);
        return this.#currentHeight == height;
    }

    isMarked() {
        return this.edgeLine.style.strokeWidth != "";
    }

    markOrUnmark(strokeWidth=5) {
        if (this.isMarked()) {
            this.edgeLine.style.strokeWidth = "";
        } else {
            this.edgeLine.style.strokeWidth = strokeWidth;
        }
    }

    setColor(newColor) {
        this.edgeLine.setAttributeNS(null, "stroke", newColor);
        this.text.setAttributeNS(null, "fill", newColor);
        this.text.setAttributeNS(null, "stroke", newColor);
        this.edgeDirection.setAttributeNS(null, "fill", newColor);
        this.edgeDirection.setAttributeNS(null, "stroke", newColor);
    }

    getColor() {
        const color = this.edgeLine.getAttribute("stroke");
        return color ? color : "#000000";
    }

    setDirected(directed) {
        this.directed = directed;
    }

    setWeight(weight) {
        this.weight = weight;
        this.text.textContent = weight;
    }

    setFontSize(fontSize) {
        this.text.style.fontSize = fontSize;
    }

    isWeightHidden() {
        return this.text.textContent != this.weight;
    }

    showWeight() {
        this.setWeight(this.weight);
    }

    hideWeight() {
        this.text.textContent = "";
    }

    nodesIntersects() {
        const circle1 = this.node1.getCircle();
        const circle2 = this.node2.getCircle();
        const distance = circle1.center.sub(circle2.center).length();
        return distance < circle1.radius;
    }

// Private:
    #currentHeight;

    renderDirection(startPoint, vector) {
        if (!this.directed) {
            this.edgeDirection.setAttributeNS(null, "d", "");
            return;
        }

        const ANGLE = 0.4;
        const LENGTH = 10;

        this.edgeDirection.setAttributeNS(null, "fill", this.getColor());
        this.edgeDirection.setAttributeNS(null, "stroke", this.getColor());
        this.edgeDirection.setAttributeNS(null, "stroke-width", this.isMarked() ? "5" : "2");

        const arrow0 = startPoint.sub(vector.normalize(1.5));
        const arrow1 = arrow0.add(vector.normalize(LENGTH).rotateBy(Math.PI - ANGLE));
        const arrow2 = arrow0.add(vector.normalize(LENGTH).rotateBy(Math.PI + ANGLE));

        this.edgeDirection.setAttributeNS(null, "d", "M " + arrow0.x + " " + arrow0.y + " " +
                                                     "L " + arrow1.x + " " + arrow1.y + " " +
                                                     "L " + arrow2.x + " " + arrow2.y + " " +
                                                     "L " + arrow0.x + " " + arrow0.y + " z");
    }

    renderSimpleEdge(height, force) {
        const circle1 = this.node1.getCircle();
        const circle2 = this.node2.getCircle();

        const MAX_HEIGHT_CHANGE = (!force ? 0.05 : height + Math.abs(this.#currentHeight) + 1e9);
        if (this.#currentHeight < height) {
            this.#currentHeight += Math.min(height - this.#currentHeight, MAX_HEIGHT_CHANGE);
        } else {
            this.#currentHeight -= Math.min(this.#currentHeight - height, MAX_HEIGHT_CHANGE);
        }
        height = this.#currentHeight;

        if (this.nodesIntersects()) {
            return;
        }

        var vector = circle2.center.sub(circle1.center).normalize(circle1.radius);
        var border1 = circle1.center.add(vector);
        var border2 = circle2.center.sub(vector);
        var extraTextShift = 0;

        const line = new Line(circle1.center, circle2.center);
        var normal = line.normal();

        if (Math.abs(height) < 0.1) {
            this.edgeLine.setAttributeNS(null, "d", "M " + border1.x + " " + border1.y + " " +
                                                    "L " + border2.x + " " + border2.y);

            if (normal.y < 0) {
                normal = normal.scale(-1);
            }
        } else {
            const ellipseSide = height < 0 ? 0 : 1;
            const angleRadians = circle2.center.sub(circle1.center).polarAngle();
            const angleDegrees = angleRadians * 180 / Math.PI;
            const majorRadius = circle2.center.sub(circle1.center).length() / 2;
            const minorRadius = getRadiusStep(circle1.radius) * Math.abs(height);
            extraTextShift = minorRadius;

            this.edgeLine.setAttributeNS(null, "d", "M " + /* start point  */ circle1.center.x + " " + circle1.center.y + " " +
                                                    "A " + /* major radius */ majorRadius                               + " " +
                                                           /* minor radius */ minorRadius                               + " " +
                                                           /* rotation     */ angleDegrees                              + " " +
                                                           /* ???          */ "0"                                       + " " +
                                                           /* ellipse side */ ellipseSide                               + " " +
                                                           /* dest point   */ circle2.center.x + " " + circle2.center.y        );

            var {point, tangent} = findIntersectionAndTangentOfCircleAndEllipse(majorRadius, minorRadius, circle1.radius);
            if (ellipseSide == 0) {
                point.y = -point.y;
                tangent.y = -tangent.y;
                extraTextShift = -extraTextShift;
            }
            border2 = circle2.center.sub(point.rotateBy(angleRadians));
            vector = tangent.rotateBy(angleRadians);
        }

        this.renderDirection(border2, vector);

        const middle = circle1.center.add(circle2.center).scale(0.5);
        const box = this.text.getBBox();
        const maxDistance = Math.max(line.distanceToPoint(middle.add(new Point(box.width / 2, box.height / 2))),
                                     line.distanceToPoint(middle.add(new Point(box.width / 2, -box.height / 2))));

        const textShiftCoefficient = this.node1.label < this.node2.label && extraTextShift != 0 ? 1 : -1;
        const textCenter = middle.add(normal.normalize((maxDistance + this.extraTextPadding) * textShiftCoefficient + extraTextShift));
        this.text.setAttributeNS(null, "x", textCenter.x);
        this.text.setAttributeNS(null, "y", textCenter.y);
    }

    renderSelfLoop(index) {
        const circle = this.node1.getCircle();
        const minorRadius = 18 + 15 * index;
        const majorRadius = 25 + 15 * index;

        this.edgeLine.setAttributeNS(null, "rx", minorRadius);
        this.edgeLine.setAttributeNS(null, "ry", majorRadius);
        this.edgeLine.setAttributeNS(null, "cx", circle.center.x);
        this.edgeLine.setAttributeNS(null, "cy", circle.center.y - majorRadius);

        var {point, tangent} = findIntersectionAndTangentOfCircleAndEllipse(majorRadius, minorRadius, circle.radius);
        tangent.y *= -1;
        tangent = tangent.rotateBy(-Math.PI / 2);
        tangent.x *= -1;
        point.y *= -1;
        point.x *= -1;
        point = circle.center.sub(point.rotateBy(-Math.PI / 2));

        this.renderDirection(point, tangent.scale(-1));

        this.text.setAttributeNS(null, "x", circle.center.x);
        this.text.setAttributeNS(null, "y", circle.center.y - 2 * majorRadius - 10);
    }
}
