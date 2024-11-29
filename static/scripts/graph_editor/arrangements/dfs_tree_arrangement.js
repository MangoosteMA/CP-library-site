import { StableArrangement }           from "./arrangement_interface.js";
import { ArrangementBuilderInterface } from "./arrangement_interface.js";
import { ArrangementOptionInterface }  from "./arrangement_interface.js";
import { PERFECT_DISTANCE }            from "./arrangement_interface.js";

import { Point }                       from "../geometry.js";
import { isForest, isTree }            from "./utils.js";
import { getUniqueEdges }              from "./utils.js";
import { buildGraph }                  from "./utils.js";
import { getComponents }               from "./utils.js";
import { isDirected }                  from "./utils.js";
import { createTextarea }              from "./utils.js";
import { createTextareaDiv }           from "./utils.js";

class Data {
    constructor(index, point) {
        this.index = index;
        this.point = point;
    }
};

function mergeTrees(trees, root) {
    var result = [];
    trees.forEach(tree =>  {
        while (result.length < tree.length) {
            result.push([]);
        }
        var leastXShift = 0;
        for (let layer = 0; layer < tree.length; layer++) {
            const size = result[layer].length;
            if (size != 0) {
                leastXShift = Math.max(leastXShift, result[layer][size - 1].point.x + PERFECT_DISTANCE - tree[layer][0].point.x);
            }
        }

        for (let layer = 0; layer < tree.length; layer++) {
            tree[layer].forEach(data => {
                data.point.x += leastXShift;
                result[layer].push(data);
            });
        }
    });

    if (root != -1) {
        for (let layer = 0; layer < result.length; layer++) {
            for (let i = 0; i < result[layer].length; i++) {
                result[layer][i].point.y += PERFECT_DISTANCE;
            }
        }

        var newX = 0;
        if (result.length != 0) {
            if (result[0].length % 2 == 1) {
                newX = result[0][Math.floor(result[0].length / 2)].point.x;
            } else if (result[0].length != 0) {
                newX = (result[0][result[0].length / 2].point.x + result[0][result[0].length / 2 - 1].point.x) / 2;
            }
        }
        result.unshift([new Data(root, new Point(newX, 0))]);
    }
    return result;
}

class Presets {
    /*
    Variables:
    root:     int (0 by default)
    */

    constructor() {
        this.root = 0;
    }
}

export class DfsTreeArrangement extends ArrangementBuilderInterface {
    /*
    Variables:
    presets: Presets
    */

    constructor() {
        super();
        this.presets = new Presets();
    }

    build(n, edges) {
        const graph = buildGraph(n, getUniqueEdges(edges), false);
        const used = Array(n);
        for (let i = 0; i < n; i++) {
            used[i] = false;
        }
    
        function dfs(v) {
            used[v] = true;
            var childTrees = [];
            graph[v].forEach(u => {
                if (!used[u]) {
                    childTrees.push(dfs(u));
                }
            });
            return mergeTrees(childTrees, v);
        }

        var componentsTrees = [];
        componentsTrees.push(dfs(this.presets.root));
        for (let i = 0; i < n; i++) {
            if (!used[i]) {
                componentsTrees.push(dfs(i))
            }
        }

        const result = mergeTrees(componentsTrees);
        const arrangement = Array(n);
        for (let layer = 0; layer < result.length; layer++) {
            result[layer].forEach(data => {
                arrangement[data.index] = data.point;
            });
        }
        return new StableArrangement(arrangement);
    }

    isPretty(n, edges) {
        return isTree(n, edges) || (!isDirected(edges) && isForest(n, getUniqueEdges(edges)) && getComponents(n, edges) <= 3);
    }
}

export class DfsTreeArrangementOption extends ArrangementOptionInterface {
    constructor(nodesStateHandler) {
        super(new DfsTreeArrangement());
        this.#nodesStateHandler = nodesStateHandler;
        this.setNewRoot("1");
    }

    getArrangementBuilder() {
        return super.getArrangementBuilder();
    }

    buildHtml(graphEditor, callback) {
        const outsideDiv = document.createElement("div");
        outsideDiv.style.display = "flex";

        const textarea = createTextarea();
        textarea.value = this.#root;

        const option = this;
        textarea.addEventListener("change", function() {
            option.setNewRoot(textarea.value);
            callback();
        });

        const div = createTextareaDiv();
        div.innerText = "Дерево DFS с корнем в ";

        outsideDiv.appendChild(div);
        outsideDiv.appendChild(textarea);
        return outsideDiv;
    }

// Private:
    #root;
    #nodesStateHandler;

    setNewRoot(newRoot) {
        this.#root = newRoot;
        const nodeToIndex = this.#nodesStateHandler.enumerateVerteces().nodeToIndex;
        if (nodeToIndex.has(newRoot)) {
            super.getArrangementBuilder().presets.root = nodeToIndex.get(newRoot);
        }
    }
}
