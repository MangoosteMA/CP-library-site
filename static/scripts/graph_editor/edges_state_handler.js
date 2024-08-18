import { Edge }               from "./edge.js";
import { getRadiusStep }      from "./edge.js";
import { getPointSide }       from "./geometry.js";
import { NodesStateHandler }   from "./nodes_state_handler.js";
import { randomInt }          from "./utils.js";
import { uniteBoundingBoxes } from "./utils.js";
import { RandomInt }          from "./random.js";

function encodeEdge(edge) {
    var from = edge.node1.label != null ? edge.node1.label : edge.node1;
    var to = edge.node2.label != null ? edge.node2.label : edge.node2;
    if (from > to) {
        const aux = from;
        from = to;
        to = aux;
    }
    return String(from) + "---" + String(to);
}

export class EdgesStateHandler {
    /*
    Variables:
    edges:             list[Edge]
    group:             html <g> element
    nodesStateHandler: NodesStateHandler
    */

    constructor(group, nodesStateHandler) {
        this.edges = [];
        this.group = group;
        this.nodesStateHandler = nodesStateHandler;
        this.#randomSeed = 228;
        this.random = new RandomInt(this.#randomSeed);
        this.#fontSize = 0;
    }

    regenerateSeed() {
        this.#randomSeed = randomInt(0, (1 << 30));
    }

    updateEdgesSet(newEdges, nodesStateHandler, darkMode) {
        if (!this.findAnyUpdates(newEdges, nodesStateHandler)) {
            return false;
        }

        const prevEdges = this.edges;
        this.edges = [];
        const curEdgesIndexes = this.getEdgesIndexes(prevEdges).indexes;
        const newEdgesIndexes = this.getEdgesIndexes(newEdges).indexes;

        function findEdge(edges, indexes, edge, index) {
            for (let i = 0; i < edges.length; i++) {
                if (indexes[i] == index && encodeEdge(edges[i]) == encodeEdge(edge)) {
                    return i;
                }
            }
            return null;
        }

        for (let i = 0; i < prevEdges.length; i++) {
            const edge = prevEdges[i];
            const index = curEdgesIndexes[i];
            const j = findEdge(newEdges, newEdgesIndexes, edge, index);
            if (j == null) {
                this.group.removeChild(edge.edge);
            } else {
                if (edge.node1.label != newEdges[j].node1) {
                    const aux = edge.node1;
                    edge.node1 = edge.node2;
                    edge.node2 = aux;
                }
                edge.setWeight(newEdges[j].weight);
                this.edges.push(edge);
            }
        }

        for (let i = 0; i < newEdges.length; i++) {
            const edge = newEdges[i];
            const index = newEdgesIndexes[i];
            if (findEdge(prevEdges, curEdgesIndexes, edge, index) == null) {
                const node1 = this.nodesStateHandler.get(edge.node1);
                const node2 = this.nodesStateHandler.get(edge.node2);
                const newEdge = new Edge(node1, node2, edge.weight, edge.directed, this.group, this.#fontSize);
                this.edges.push(newEdge);
                if (darkMode) {
                    this.setDarkModeForEdge(newEdge);
                }
            }
        }

        this.render();
        return true;
    }

    directAllEdges(directed) {
        this.edges.forEach(edge => {
            edge.setDirected(directed);
        });
        this.render();
    }

    setFontSize(fontSize) {
        this.#fontSize = fontSize;
        this.edges.forEach(edge => {
            edge.setFontSize(fontSize);
        });
        this.render();
    }

    render(force=false) {
        const {indexes, outOf} = this.getEdgesIndexes(this.edges, 0, false);
        const banned = new Map();
        for (let i = 0; i < this.edges.length; i++) {
            const edgeId = encodeEdge(this.edges[i]);
            if (!banned.has(edgeId)) {
                banned.set(edgeId, new Set());
            }
            if (outOf[i] % 2 == 0) {
                banned.get(edgeId).add(0);
            }
        }

        const random = new RandomInt(this.#randomSeed);
        const heights = [];
        this.edges.forEach(edge => {
            if (edge.node1 == edge.node2) {
                heights.push(0);
                return;
            }
            const edgeId = encodeEdge(edge);
            const bannedSegments = [];

            const circle1 = edge.node1.getCircle();
            const circle2 = edge.node2.getCircle();

            this.nodesStateHandler.nodes.forEach(node => {
                if (node == edge.node1 || node == edge.node2) {
                    return;
                }
                const nodeCircle = node.getCircle();
                if (!nodeCircle.intersectsWithSegment(circle1.center, circle2.center, false)) {
                    return;
                }

                var distance = nodeCircle.distanceToLine(circle1.center, circle2.center);
                if (getPointSide(circle1.center, circle2.center, nodeCircle.center) < 0) {
                    distance *= -1;
                }
                const EPS = circle1.radius / 3 + 4;
                bannedSegments.push({l: distance - nodeCircle.radius - EPS, r: distance + nodeCircle.radius + EPS});
            });

            var bestClosest = -1;
            var bestHeight = 0;
            if (edge.nodesIntersects()) {
                bestClosest = 0;
            }

            const orderCoeff = (edge.node1.label < edge.node2.label ? 1 : -1);
            for (let heightAbs = 0; bestClosest == -1; heightAbs++) {
                const randomShift = (random.random() - 0.5) * 1e-5;

                [-heightAbs, heightAbs].forEach(height => {
                    if (banned.get(edgeId).has(height * orderCoeff)) {
                        return true;
                    }
                    const heightValue = (height + randomShift) * getRadiusStep(circle1.radius);
                    var closest = 1e9;
                    var intersect = false;

                    bannedSegments.every(segment => {
                        if (segment.l <= heightValue && heightValue <= segment.r) {
                            intersect = true;
                            return false;
                        }
                        if (heightValue < segment.l) {
                            closest = Math.min(closest, segment.l - heightValue);
                        } else {
                            closest = Math.min(closest, heightValue - segment.r);
                        }
                        return true;
                    });

                    if (!intersect && closest > bestClosest) {
                        bestClosest = closest;
                        bestHeight = height;
                    }
                });
            }
            banned.get(edgeId).add(bestHeight * orderCoeff);
            heights.push(bestHeight);
        });

        var finishedRendering = true;
        this.edges.forEach((edge, i) => {
            finishedRendering &= edge.render(heights[i], indexes[i], force);
        });
        return finishedRendering;
    }

    setDarkMode() {
        this.edges.forEach(edge => {
            this.setDarkModeForEdge(edge);
        });
    }

    setLightMode() {
        this.edges.forEach(edge => {
            edge.setColor("#000000");
        });
    }

    getBoundingBox() {
        var boundingBox = null;
        this.edges.forEach(edge => {
            boundingBox = uniteBoundingBoxes(boundingBox, edge.getBoundingBox());
        });
        return boundingBox;
    }

// Pravate:
    #fontSize;   // int
    #randomSeed; // int

    findAnyUpdates(newEdges, nodesStateHandler) {
        if (this.edges.length != newEdges.length) {
            return true;
        }
        for (let i = 0; i < this.edges.length; i++) {
            if (!this.edges[i].node1.getCircle().center.equalTo(nodesStateHandler.get(newEdges[i].node1).getCircle().center)
             || !this.edges[i].node2.getCircle().center.equalTo(nodesStateHandler.get(newEdges[i].node2).getCircle().center)) {
                return true;
            }
        }
        return false;
    }

    getEdgesIndexes(edges) {
        var edgeToIndexMap = new Map();
        var indexes = [];

        edges.forEach(edge => {
            const edgeId = encodeEdge(edge);
            var index = 0;
            if (edgeToIndexMap.has(edgeId)) {
                index = edgeToIndexMap.get(edgeId);
            }
            edgeToIndexMap.set(edgeId, index + 1);
            indexes.push(index);
        });

        var outOf = [];
        edges.forEach(edge => {
            outOf.push(edgeToIndexMap.get(encodeEdge(edge)));
        });

        return {indexes: indexes, outOf: outOf};
    }

    setDarkModeForEdge(edge) {
        edge.setColor("#ffffff");
    }
}
