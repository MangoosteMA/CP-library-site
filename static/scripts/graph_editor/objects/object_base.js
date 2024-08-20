import { Point }           from "../geometry.js";
import { SVG_NAMESPACE }   from "../svg_namespace.js";
import { DraggableObject } from "./draggable_object.js";
import { Node }            from "../node.js";

export class ObjectBase extends DraggableObject {
    /*
    Variables:
    id:         str
    object:     html <g> element
    pinnedNode: Node or null
    pinAngle:   null or int
    */

    constructor(objectsGroup, box, id) {
        super(box);
        this.id = id;

        this.object = document.createElementNS(SVG_NAMESPACE, "g");
        this.object.setAttributeNS(null, "class", "object");
        this.object.setAttributeNS(null, "id", id);
        objectsGroup.appendChild(this.object);

        this.pinnedNode = null; 
        this.pinAngle = null;
    }

    pinTo(node) {
        this.pinnedNode = node;
    }

    isPinned() {
        return this.pinnedNode != null;
    }

    unpin() {
        this.pinnedNode = null;
    }

    setPinAngle(pinAngle) {
        this.pinAngle = pinAngle;
    }

    drag(newMousePosition) {
        this.unpin();
        super.drag(newMousePosition);
    }

    // virtual:
    render() {}
    getCenter() {}
    setCoordinates(point) {}
    setFontSize(fontSize) {}
    setDarkMode() {}
    setLightMode() {}
}
