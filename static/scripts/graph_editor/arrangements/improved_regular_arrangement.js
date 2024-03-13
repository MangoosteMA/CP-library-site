import { StableArrangement }           from "./arrangement_interface.js";
import { ArrangementBuilderInterface } from "./arrangement_interface.js";
import { ArrangementOptionInterface }  from "./arrangement_interface.js";

import { Point }                       from "../geometry.js";
import { getRegularPolygon }           from "./regular_arrangement.js";
import { buildGraph }                  from "./utils.js";

export class ImprovedRegularArrangement extends ArrangementBuilderInterface {
    build(n, edges) {
        const graph = buildGraph(n, edges, false);
        const used = Array(n).fill(false);
        const depth = Array(n).fill(-1);
        const minDepthUp = Array(n);
        const order = [];

        function dfsFill(v) {
            minDepthUp[v] = depth[v];
            graph[v].forEach(u => {
                if (depth[u] == -1) {
                    depth[u] = depth[v] + 1;
                    dfsFill(u);
                    minDepthUp[v] = Math.min(minDepthUp[v], minDepthUp[u]);
                } else {
                    minDepthUp[v] = Math.min(minDepthUp[v], depth[u]);
                }
            });
        }

        function dfsOrder(v) {
            used[v] = true;
            order.push(v);
            graph[v].sort((a, b) => {
                if (minDepthUp[a] != minDepthUp[b]) {
                    return minDepthUp[b] - minDepthUp[a];
                }
                return a - b;
            });
            graph[v].forEach(u => {
                if (!used[u]) {
                    dfsOrder(u);
                }
            });
        }

        for (let i = 0; i < n; i++) {
            if (used[i]) {
                continue;
            }
            depth[i] = 0;
            dfsFill(i);
            dfsOrder(i);
        }

        const regular = getRegularPolygon(n);
        const arrangement = Array(n);
        for (let i = 0; i < n; i++) {
            arrangement[order[i]] = regular[i];
        }
        return new StableArrangement(arrangement);
    }

    isPretty(n, edges) {
        return true;
    }
}

export class ImprovedRegularArrangementOption extends ArrangementOptionInterface {
    constructor() {
        super(new ImprovedRegularArrangement());
    }

    buildHtml(graphEditor, callback) {
        const div = document.createElement("div");
        div.innerText = "Правильный многоугольник 2";
        return div;
    }
}
