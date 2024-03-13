import { StableArrangement }           from "./arrangement_interface.js";
import { ArrangementBuilderInterface } from "./arrangement_interface.js";
import { ArrangementOptionInterface }  from "./arrangement_interface.js";
import { PERFECT_DISTANCE }            from "./arrangement_interface.js";

import { Point }                       from "../geometry.js";

export class LineArrangement extends ArrangementBuilderInterface {
    build(n, edges) {
        const arrangement = [];
        for (let i = 0; i < n; i++) {
            arrangement.push(new Point(PERFECT_DISTANCE * i, 0));
        }
        return new StableArrangement(arrangement);
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
