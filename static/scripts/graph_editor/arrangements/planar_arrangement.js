import { StableArrangement }           from "./arrangement_interface.js";
import { ArrangementBuilderInterface } from "./arrangement_interface.js";
import { ArrangementOptionInterface }  from "./arrangement_interface.js";
import { PERFECT_DISTANCE }            from "./arrangement_interface.js";
import { PlanarGraphLaying }           from "./planar_graphs/planar_graph_laying.js";

import { buildGraph }                  from "./utils.js";

export class PlanarArrangement extends ArrangementBuilderInterface {
    build(n, edges) {
        const laying = new PlanarGraphLaying(buildGraph(n, edges, false));
        if (!laying.isPlanar) {
            return null;
        }
        return new StableArrangement(laying.getPossibleComponentsLaying(PERFECT_DISTANCE));
    }

    isPretty(n, edges) {
        return false;
    }
}

export class PlanarArrangementOption extends ArrangementOptionInterface {
    constructor() {
        super(new PlanarArrangement());
    }

    buildHtml(graphEditor, callback) {
        const div = document.createElement("div");
        div.innerText = "Планарный граф";
        return div;
    }
}
