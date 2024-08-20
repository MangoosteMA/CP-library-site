import { Point }      from "../geometry.js";
import { ObjectBase } from "./object_base.js";
import { createText } from "../node.js";
import { clamp }      from "../utils.js";

const DEFAULT_TEXT = "Text";

export class TextObject extends ObjectBase {
    /*
    Variables:
    text:            html <g> element
    extraPinPadding: int (5 by default)
    */

    constructor(objectsGroup, box, id, fontSize) {
        super(objectsGroup, box, id);
        this.text = createText();
        this.setText(DEFAULT_TEXT);
        this.setCoordinates(new Point((9 * box.minX + box.maxX) / 10, (9 * box.minY + box.maxY) / 10));
        this.setFontSize(fontSize);
        this.setColor("#000000");
        this.object.appendChild(this.text);
        this.extraPinPadding = 5;
    }

    getCenter() {
        return new Point(parseFloat(this.text.getAttribute("x")), parseFloat(this.text.getAttribute("y")));
    }

    setCoordinates(point) {
        this.text.setAttributeNS(null, "x", point.x);
        this.text.setAttributeNS(null, "y", point.y);
    }

    setFontSize(fontSize) {
        this.text.style.fontSize = fontSize;
    }

    setText(text) {
        this.text.textContent = text;
    }

    content() {
        return this.text.textContent;
    }

    getColor() {
        const color = this.text.getAttribute("stroke");
        return color ? color : "#000000";
    }

    setColor(newColor) {
        this.text.setAttributeNS(null, "fill", newColor);
        this.text.setAttributeNS(null, "stroke", newColor);
    }

    getBoundingBox() {
        return this.text.getBBox();
    }

    setDarkMode() {
        this.setColor("#ffffff");
    }

    setLightMode() {
        this.setColor("#000000");
    }

    render(force) {
        if (!this.isPinned()) {
            return true;
        }
    
        const MAX_MOVING_SPEED = (this.box.maxX - this.box.minX + this.box.maxY - this.box.minY) * 0.007;
        const MIN_MOVING_SPEED = MAX_MOVING_SPEED / 5;
        const center = this.getCenter();
        const newCenter = this.getPinPosition();

        var vector = newCenter.sub(center);
        if (!force) {
            var speed = clamp(vector.length() / 20, MIN_MOVING_SPEED, MAX_MOVING_SPEED);
            speed = Math.min(speed, vector.length());
            if (speed > 1e-5) {
                vector = vector.normalize(speed);
            }
        }

        this.setCoordinates(center.add(vector));
        return this.getCenter().sub(newCenter).length() < 1e-5;
    }

// Private:
    getPinPosition() {
        const node = this.pinnedNode;
        if (this.pinAngle == null) {
            return node.getCenter();
        }

        var box = this.text.getBBox();
        const circle = node.getCircle();
        const direction = (new Point(1, 0)).rotateBy(-this.pinAngle / 180 * Math.PI);

        function check(dist) {
            const shift = direction.scale(dist);
            const shiftedCenter = circle.center.add(shift);
            const angles = [shiftedCenter.add(new Point(-box.width / 2, -box.height / 2)),
                            shiftedCenter.add(new Point(box.width / 2, -box.height / 2)) ,
                            shiftedCenter.add(new Point(box.width / 2, box.height / 2))  ,
                            shiftedCenter.add(new Point(-box.width / 2, box.height / 2)) ];

            for (let i = 0; i < 4; i++) {
                if (circle.intersectsWithSegment(angles[i], angles[(i + 1) % 4])) {
                    return false;
                }
            }
            return true;
        }

        var lb = circle.radius;
        var rb = lb;
        while (!check(rb)) {
            lb = rb;
            rb *= 2;
        }

        for (let it = 0; it < 100; it++) {
            const mid = (lb + rb) / 2;
            if (check(mid)) {
                rb = mid;
            } else {
                lb = mid;
            }
        }
        return circle.center.add(direction.scale(rb + this.extraPinPadding));
    }
}
