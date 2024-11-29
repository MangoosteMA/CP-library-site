import { StableArrangement }           from "./arrangement_interface.js";
import { ArrangementBuilderInterface } from "./arrangement_interface.js";
import { ArrangementOptionInterface }  from "./arrangement_interface.js";
import { PERFECT_DISTANCE }            from "./arrangement_interface.js";

import { Point }                       from "../geometry.js";
import { createTextarea }              from "./utils.js";
import { createTextareaDiv }           from "./utils.js";

class Presets {
    /*
    Variables:
    width: int (1 by default)
    */

    constructor() {
        this.width = 1;
    }
}

export class GridArrangement extends ArrangementBuilderInterface {
    /*
    Variables:
    presets: Presets
    */

    constructor() {
        super();
        this.presets = new Presets();
    }

    build(n, edges) {
        const arrangement = [];
        for (let i = 0; i < n; i++) {
            const y = Math.floor(i / this.presets.width);
            const x = i % this.presets.width;
            arrangement.push(new Point(PERFECT_DISTANCE * x, PERFECT_DISTANCE * y));
        }
        return new StableArrangement(arrangement);
    }

    isPretty(n, edges) {
        return false;
    }
}

export class GridArrangementOption extends ArrangementOptionInterface {
    constructor() {
        super(new GridArrangement());
        this.setWidth(1);
    }

    buildHtml(graphEditor, callback) {
        const outsideDiv = document.createElement("div");
        outsideDiv.style.display = "flex";

        const textarea = createTextarea();
        textarea.value = super.getArrangementBuilder().presets.width;
        const option = this;

        textarea.addEventListener("change", () => {
            option.setWidth(parseInt(textarea.value));
            callback();
        });

        const div = createTextareaDiv();
        div.innerText = "Сетка шириной ";

        outsideDiv.appendChild(div);
        outsideDiv.appendChild(textarea);
        return outsideDiv;
    }

// Private:
    setWidth(newWidth) {
        super.getArrangementBuilder().presets.width = newWidth;
    }
}
