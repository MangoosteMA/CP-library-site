import { Point } from "../geometry.js";

export class DraggableObject {
    /*
    Variables:
    box:            Struct with minX, maxX, minY and maxY
    mousePossition: Point or null
    */

    constructor(box) {
        this.box = box;
        this.mousePossition = null;
    }

    setBox(newBox) {
        this.box = newBox;
    }

    setMousePosition(mousePosition) {
        this.mousePosition = mousePosition;
    }

    drag(newMousePosition) {
        const deltaX = newMousePosition.x - this.mousePosition.x;
        const deltaY = newMousePosition.y - this.mousePosition.y;
        const point = this.getCenter().add(new Point(deltaX, deltaY));
        point.x = Math.min(Math.max(point.x, this.box.minX), this.box.maxX);
        point.y = Math.min(Math.max(point.y, this.box.minY), this.box.maxY);
        this.setCoordinates(point);
        this.setMousePosition(newMousePosition);
    }

    // virtual:
    getCenter() {}
    setCoordinates(point) {}
}
