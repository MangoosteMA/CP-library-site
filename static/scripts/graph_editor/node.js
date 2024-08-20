import { DraggableObject }    from "./objects/draggable_object.js";
import { Point, Circle }      from "./geometry.js";
import { SVG_NAMESPACE }      from "./svg_namespace.js";
import { randomInt }          from "./utils.js";
import { increaseLabelBy }    from "./utils.js";
import { uniteBoundingBoxes } from "./utils.js";

export function createText() {
    const text = document.createElementNS(SVG_NAMESPACE, "text");
    text.setAttributeNS(null, "font-weight", 500);
    text.setAttributeNS(null, "stroke-width", "1px");
    text.setAttributeNS(null, "text-anchor", "middle");
    text.setAttributeNS(null, "alignment-baseline", "central");
    text.setAttributeNS(null, "dominant-baseline", "central");
    return text;
}

export class Node extends DraggableObject {
    /*
    Variables:
    node:          html <g> object
    label:         string
    circle:        svg object
    text:          svg object
    */

    constructor(label, radius, nodesGroup, box, fontSize) {
        super(box);

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

        this.setFontSize(fontSize);
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

    showLabel() {
        this.setLabel(this.label);
    }

    hideLabel() {
        this.text.textContent = "";
    }

    isLabelHidden() {
        return this.text.textContent != this.label;
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

    getCenter() {
        return this.getCircle().center;
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

    getBoundingBox() {
        var box = this.circle.getBBox();
        if (!this.isLabelHidden()) {
            box = uniteBoundingBoxes(box, this.text.getBBox());
        }
        return box;
    }
}
