import { ArrangementInterface }       from "./arrangement_interface.js";
import { ArrangementOptionInterface } from "./arrangement_interface.js";
import { PERFECT_DISTANCE }           from "./arrangement_interface.js";

import { Point }                      from "../geometry.js";

export class LineArrangement extends ArrangementInterface {
    build(n, edges) {
        const result = [];
        for (let i = 0; i < n; i++) {
            result.push(new Point(PERFECT_DISTANCE * i, 0));
        }
        return result;
    }

    isPretty(n, edges) {
        return false;
    }
}

export class LineArrangementOption extends ArrangementOptionInterface {
    constructor() {
        super(new LineArrangement());
    }

    buildHtml(graphEditor, callback) {
        const div = document.createElement("div");
        div.innerText = "На одной прямой";
        return div;
    }
}
