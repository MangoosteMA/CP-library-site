import { StableArrangement }           from "./arrangement_interface.js";
import { ArrangementBuilderInterface } from "./arrangement_interface.js";
import { ArrangementOptionInterface }  from "./arrangement_interface.js";
import { PERFECT_DISTANCE }            from "./arrangement_interface.js";

import { Point }                       from "../geometry.js";

export function getRegularPolygon(n) {
    const arrangement = new Array(n);
    if (n == 1) {
        arrangement[0] = new Point(0, 0);
        return arrangement;
    }

    if (n == 2) {
        arrangement[0] = new Point(0, 0);
        arrangement[1] = new Point(PERFECT_DISTANCE, 0);
        return arrangement;
    }

    const ANGLE_STEP = 2 * Math.PI / n;
    const DIAGONAL_LENGTH = PERFECT_DISTANCE / 2 / Math.sin(ANGLE_STEP / 2);
    var angle = -Math.PI / 2;
    for (let i = 0; i < n; i++) {
        arrangement[i] = new Point(Math.cos(angle), Math.sin(angle)).scale(DIAGONAL_LENGTH);
        angle += ANGLE_STEP;
    }
    return arrangement;
}

export class RegularArrangement extends ArrangementBuilderInterface {
    build(n, edges) {
        return new StableArrangement(getRegularPolygon(n));
    }

    isPretty(n, edges) {
        return false;
    }
}

export class RegularArrangementOption extends ArrangementOptionInterface {
    constructor() {
        super(new RegularArrangement());
    }

    buildHtml(graphEditor, callback) {
        const div = document.createElement("div");
        div.innerText = "Правильный многоугольник";
        return div;
    }
}
