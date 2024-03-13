import { StableArrangement }           from "./arrangement_interface.js";
import { ArrangementBuilderInterface } from "./arrangement_interface.js";
import { ArrangementOptionInterface }  from "./arrangement_interface.js";
import { PERFECT_DISTANCE }            from "./arrangement_interface.js";

import { Point }                       from "../geometry.js";
import { buildGraph }                  from "./utils.js";
import { isDirected }                  from "./utils.js";

function buildLayers(n, edges) {
    const inDegree = Array(n).fill(0);
    edges.forEach(edge => {
        inDegree[edge.to]++;
    });
    const graph = buildGraph(n, edges);

    var layer = [];
    const layers = [];
    const used = Array(n).fill(false);
    while (true) {
        const newLayer = [];
        layer.forEach(v => {
            graph[v].forEach(u => {
                inDegree[u]--;
            })
        });
        for (let v = 0; v < n; v++) {
            if (inDegree[v] == 0 && !used[v]) {
                newLayer.push(v);
                used[v] = true;
            }
        }
        if (newLayer.length == 0) {
            break;
        }
        layer = newLayer;
        layers.push(layer);
    }
    return layers;
}

function topSortExists(n, edges) {
    const layers = buildLayers(n, edges);
    var total = 0;
    layers.forEach(layer => {
        total += layer.length;
    });
    return total == n;
}

export class TopSortArrangementArrangement extends ArrangementBuilderInterface {
    build(n, edges) {
        if (!isDirected(edges) || !topSortExists(n, edges)) {
            return null;
        }

        const graph = buildGraph(n, edges);
        const arrangement = Array(n).fill(null);
        const layers = buildLayers(n, edges);
        var curX = 0;

        layers.forEach(layer => {
            const MAX_Y = 4 * n + 2;
            var cost = Array(layer.length);
            for (let i = 0; i < cost.length; i++) {
                cost[i] = Array(MAX_Y).fill(0);
            }
    
            const INF = n * MAX_Y;
            layer.forEach((u, i) => {
                for (let v = 0; v < n; v++) {
                    if (!graph[v].includes(u)) {
                        continue;
                    }
                    if (arrangement[v].x != curX - PERFECT_DISTANCE) {
                        var onWay = false;
                        for (let u = 0; u < n; u++) {
                            if (graph[v].includes(u) && arrangement[u] != null && arrangement[u].y == arrangement[v].y) {
                                onWay = true;
                                break;
                            }
                        }
                        [-1, 0, 1].forEach(d => {
                            const curY = arrangement[v].y + d;
                            if (0 <= curY && curY < MAX_Y && onWay) {
                                cost[i][curY] += INF * (1 - Math.abs(d) * 2 / 3);
                            }
                        });
                    }
                    for (let y = 0; y < MAX_Y; y++) {
                        const distance = Math.abs(arrangement[v].y - y);
                        cost[i][y] += distance * distance;
                    }
                }
            });
    
            const used = Array(MAX_Y).fill(false);
            for (let it = 0; it < layer.length; it++) {
                var minCost = 0;
                var bestVertex = -1;
                var bestY = -1;
    
                layer.forEach((u, i) => {
                    if (arrangement[u] != null) {
                        return;
                    }
                    var curMinCost = INF * n;
                    var curBestY = 0;
                    for (let y = 0; y < MAX_Y; y++) {
                        const coeff = (y - MAX_Y / 2) / MAX_Y;
                        cost[i][y] += coeff * coeff;
                        if (!used[y] && curMinCost > cost[i][y]) {
                            curMinCost = cost[i][y];
                            curBestY = y;
                        }
                    }
                    if (bestVertex == -1 || minCost > curMinCost) {
                        minCost = curMinCost;
                        bestVertex = u;
                        bestY = curBestY;
                    }
                });
    
                used[bestY] = true;
                arrangement[bestVertex] = new Point(curX, bestY);
            }
    
            function includesY(y) {
                var contains = false;
                layer.forEach(v => {
                    if (arrangement[v].y == y) {
                        contains = true;
                    }
                });
                return contains;
            }
    
            var median = 0;
            var count = 0;
            while (count * 2 < layer.length) {
                count += includesY(median);
                median++;
            }
    
            [-1, 1].forEach(d => {
                for (let y = median; 0 <= y + d && y + d < MAX_Y; y += d) {
                    if (!includesY(y)) {
                        continue;
                    }
                    for (let i = 0; i < layer.length; i++) {
                        if (arrangement[layer[i]].y * d >= (y + d) * d) {
                            arrangement[layer[i]].y += d;
                        }
                    }
                }
            });
    
            var bestCost = 0;
            var bestShift = -1;
            for (let shift = -MAX_Y; shift <= MAX_Y; shift++) {
                var valid = true;
                var curCost = 0;
                layer.forEach((u, i) => {
                    const curY = arrangement[u].y + shift;
                    if (0 <= curY && curY < MAX_Y) {
                        curCost += cost[i][curY];
                    } else {
                        valid = false;
                    }
                });
                if (valid && (bestShift == -1 || bestCost > curCost)) {
                    bestCost = curCost;
                    bestShift = shift;
                }
            }
    
            layer.forEach(u => {
                arrangement[u].y += bestShift;
            });
            curX += PERFECT_DISTANCE;
        });
    
        if (arrangement.filter(x => (x == null)).length != 0) {
            return null;
        }
        for (let i = 0; i < n; i++) {
            arrangement[i].y *= PERFECT_DISTANCE / 2;
        }
        return new StableArrangement(arrangement);
    }

    isPretty(n, edges) {
        return edges.length > 0 && isDirected(edges) && topSortExists(n, edges);
    }
}

export class TopSortArrangementArrangementOption extends ArrangementOptionInterface {
    constructor() {
        super(new TopSortArrangementArrangement());
    }

    buildHtml(graphEditor, callback) {
        const div = document.createElement("div");
        div.innerText = "Топологическая сортировка";
        return div;
    }
}
