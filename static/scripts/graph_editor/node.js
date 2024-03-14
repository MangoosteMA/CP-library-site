import { Point, Circle }              from "./geometry.js";
import { SVG_NAMESPACE }              from "./svg_namespace.js";
import { randomInt, increaseLabelBy } from "./utils.js";

export function createText() {
    const text = document.createElementNS(SVG_NAMESPACE, "text");
    text.setAttributeNS(null, "font-weight", 500);
    text.setAttributeNS(null, "stroke-width", "1px");
    text.setAttributeNS(null, "text-anchor", "middle");
    text.setAttributeNS(null, "alignment-baseline", "central");
    text.setAttributeNS(null, "dominant-baseline", "central");
    return text;
}

export class Node {
    /*
    Variables:
    node:     html <g> object
    label:    string
    circle:   svg object
    text:     svg object
    position: Point
    box:      Struct with minX, maxX, minY and maxY
    */

    constructor(label, radius, nodesGroup, box, fontSize) {
        this.box = box;

        this.node = document.createElementNS(SVG_NAMESPACE, 'g');
        this.node.setAttributeNS(null, "class", "node");
        this.node.setAttributeNS(null, "stroke", "#000000");
        this.circle = document.createElementNS(SVG_NAMESPACE, "circle");
        this.circle.setAttributeNS(null, "fill", "#ffffff");
        this.circle.setAttributeNS(null, "stroke-width", "2");
        this.text = createText();

        this.setRadius(radius);
        this.setLabel(label);

        this.setRandomCoordinates();
        this.node.appendChild(this.circle);
        this.node.appendChild(this.text);
        nodesGroup.appendChild(this.node);
        this.mousePosition = null;

        this.setFontSize(fontSize);
    }

    setBox(newBox) {
        this.box = newBox;
    }

    isMarked() {
        return this.circle.style.strokeWidth != "";
    }

    markOrUnmark(strokeWidth=5) {
        if (this.isMarked()) {
            this.circle.style.strokeWidth = "";
        } else {
            this.circle.style.strokeWidth = strokeWidth;
        }
    }

    setMousePosition(mousePosition) {
        this.mousePosition = mousePosition;
    }

    showLabel() {
        this.setLabel(this.label);
    }

    hideLabel() {
        this.text.textContent = "";
    }

    isLabelHidden() {
        return this.text.textContent != this.label;
    }

    drag(newMousePosition) {
        const box = this.box;

        function add(floatStr, delta) {
            return parseFloat(floatStr) + delta;
        }
        function clampX(x) {
            return Math.min(Math.max(box.minX, x), box.maxX);
        }
        function clampY(y) {
            return Math.min(Math.max(box.minY, y), box.maxY);
        }

        const deltaX = newMousePosition.x - this.mousePosition.x;
        const deltaY = newMousePosition.y - this.mousePosition.y;
        const circle = this.getCircle();

        this.setCoordinates(new Point(clampX(add(circle.center.x, deltaX)), clampY(add(circle.center.y, deltaY))));
        this.mousePosition = newMousePosition;
    }

    setRandomCoordinates() {
        this.setCoordinates(new Point(randomInt(this.box.minX, this.box.maxX), randomInt(this.box.minY, this.box.maxY)));
    }

    setCoordinates(point) {
        this.circle.setAttributeNS(null, "cx", point.x);
        this.circle.setAttributeNS(null, "cy", point.y);
        this.text.setAttributeNS(null, "x", point.x);
        this.text.setAttributeNS(null, "y", point.y);
    }

    setRadius(radius) {
        this.circle.setAttributeNS(null, "r", radius);
    }

    getCircle() {
        const x = this.circle.getAttribute("cx");
        const y = this.circle.getAttribute("cy");
        return new Circle(new Point(x, y), this.circle.getAttribute("r"));
    }

    setFontSize(fontSize) {
        this.text.style.fontSize = fontSize;
    }

    setLabel(label) {
        this.node.setAttributeNS(null, "id", label);
        this.label = label;
        this.text.textContent = label;
    }

    increaseLabelBy(value) {
        this.setLabel(increaseLabelBy(this.label, value));
    }

    fixNodeForInfoDisplaying() {
        this.setColor("#ffffff");
        this.circle.style.fill = "none";
    }

    getColor() {
        const color = this.text.getAttribute("stroke");
        return color ? color : "#000000";
    }

    setBackgroundColor(newColor) {
        this.circle.style.fill = newColor;
    }

    getBackgroundColor() {
        const color = this.circle.style.fill;
        return color && color != "none" ? color : "#ffffff";
    }

    setColor(newColor) {
        this.circle.setAttributeNS(null, "stroke", newColor);
        this.text.setAttributeNS(null, "fill", newColor);
        this.text.setAttributeNS(null, "stroke", newColor);
    }
}
