import { Point }      from "./geometry.js";
import { ObjectBase } from "./objects/object_base.js";
import { TextObject } from "./objects/text_object.js";
import { RandomInt }  from "./random.js";

export class ObjectsStateHandler {
    /*
    Variables:
    box:          Struct with minX, maxX, minY and maxY
    group:        html <g> element
    idsGenerator: RandomInt
    objects:      Map[id : ObjectBase]
    */

    constructor(box, group) {
        this.box = box;
        this.group = group;
        this.idsGenerator = new RandomInt();
        this.objects = new Map();
        this.#fontSize = 0;
        this.#darkMode = false;
    }

    get(id) {
        return this.objects.get(id);
    }

    resize(newBox) {
        function resizeCoordinate(prevL, prevR, newL, newR, x) {
            return newL + (newR - newL) * (x - prevL) / (prevR - prevL);
        }

        this.objects.forEach(object => {
            const center = object.getCenter();
            object.setBox(newBox);
            object.setCoordinates(new Point(resizeCoordinate(this.box.minX, this.box.maxX, newBox.minX, newBox.maxX, center.x),
                                            resizeCoordinate(this.box.minY, this.box.maxY, newBox.minY, newBox.maxY, center.y)));
        });
        this.box = newBox;
    }

    setFontSize(fontSize) {
        this.#fontSize = fontSize;
        this.objects.forEach(object => {
            object.setFontSize(fontSize);
        });
    }

    setDarkMode() {
        this.#darkMode = true;
        this.objects.forEach(object => {
            object.setDarkMode();
        });
    }

    setLightMode() {
        this.#darkMode = false;
        this.objects.forEach(object => {
            object.setLightMode();
        });
    }

    render(force) {
        var finishedRendering = true;
        this.objects.forEach(object => {
            finishedRendering &= object.render(force);
        });
        return finishedRendering;
    }

    createNewTextObject() {
        this.appendNewObject(new TextObject(this.group, this.box, this.getRandomId(), this.#fontSize));
        if (this.#darkMode) {
            this.setDarkMode();
        }
    }

// Private:
    #fontSize; // int
    #darkMode; // bool

    getRandomId() {
        while (true) {
            const id = String(this.idsGenerator.random());
            if (!this.objects.has(id)) {
                return id;
            }
        }
    }

    appendNewObject(newObject) {
        this.objects.set(newObject.id, newObject);
        this.group.appendChild(newObject.object);
    }

    deleteObject(object) {
        this.objects.delete(object.id);
        this.group.removeChild(object.object);
    }
}
