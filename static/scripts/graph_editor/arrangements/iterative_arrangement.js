import { ArrangementInterface }           from "./arrangement_interface.js";
import { ArrangementBuilderInterface }    from "./arrangement_interface.js";
import { ArrangementOptionInterface }     from "./arrangement_interface.js";
import { PERFECT_DISTANCE }               from "./arrangement_interface.js";

import { buildGraph }                     from "./utils.js";
import { randomInt }                      from "../utils.js";
import { Point, Line, segmentsIntersect } from "../geometry.js";

const PRETTIFY_ARRANGEMENT_ITERATIONS = 20;
const DEFAULT_TEMPERATURE = 0.08;
const TEMPERATURE_BASE = 0.9995;
const MAX_SHIFT = 5;

const K = 0.002;
const DEFAULT_RANDOM_MOVE_PROB = 0.015;
const RANDOM_MOVE_BASE = 0.99;
const DONE_MAX_LENGTH = 0.02;
const MAX_RANDOM_MOVE_DISTANCE_COEFF = 1.1;

const RANDOM_MOVE_ITERATIONS = 4;
const VERTECES_TO_SWAP = 2;
const SWAPS_PERIOD = 30;
const MIN_SWAP_ITERATIONS_SHOULD_PASS = 300;

class Swap {
    /*
    Variables:
    v:         int
    u:         int
    iteration: int
    */

    constructor(v, u, iteration) {
        this.v = Math.min(v, u);
        this.u = Math.max(v, u);
        this.iteration = iteration;
    }
}

function lengthFunction(value) {
    const sq = value * value;
    return value < 0 ? -sq : sq;
}

class IterativePrettifier extends ArrangementInterface {
    constructor(nodesStateHandler, n, edges) {
        super();
        this.#arrangement = nodesStateHandler.currentArrangement();
        this.#graph = buildGraph(n, edges, false);
        for (let i = 0; i < n; i++) {
            this.#graph[i].sort((a, b) => a - b);
        }

        this.#edges = edges;
        this.#temperature = DEFAULT_TEMPERATURE;
        this.#done = false;
        this.#randomMoveProb = DEFAULT_RANDOM_MOVE_PROB;
        this.#randomMoveIterationsLeft = RANDOM_MOVE_ITERATIONS;
        this.#vertexToSwap = 0;

        this.#currentIteration = 0;
        this.#previousSwaps = [];

        for (let i = 0; i < 5; i++) {
            this.prettify();
        }
        for (let i = 0; i < 5; i++) {
            this.makeRandomMove();
        }
        this.makeSwaps();
    }

    getArrangement() {
        return this.#arrangement;
    }

    prettify() {
        for (let it = 0; it < PRETTIFY_ARRANGEMENT_ITERATIONS; it++) {
            this.prettifyIteration();
        }
        if (this.#currentIteration % SWAPS_PERIOD == 0) {
            this.makeSwaps();
        }
        if (Math.random() < this.#randomMoveProb) {
            this.#randomMoveProb *= RANDOM_MOVE_BASE;
            this.makeRandomMove();
        }

        this.#temperature *= TEMPERATURE_BASE;
        this.#currentIteration++;
        return this.#done;
    }

// Private:
    #arrangement;              // list[Point]
    #graph;                    // list[list[int]]
    #edges;                    // list[ArrangementEdge]
    #temperature;              // float
    #done;                     // bool
    #randomMoveProb;           // float
    #randomMoveIterationsLeft; // int
    #vertexToSwap;             // int

    #currentIteration;         // int
    #previousSwaps;            // List[Swap]

    size() {
        return this.#graph.length;
    }

    hasEdge(v, u) {
        var left = -1;
        var right = this.#graph[v].length;
        while (right - left > 1) {
            var mid = Math.floor((left + right) / 2);
            if (this.#graph[v][mid] <= u) {
                left = mid;
            } else {
                right = mid;
            }
        }
        return (left != -1 && this.#graph[v][left] == u);
    }

    edgesIntersect(v, u, x, y, extendXY=1) {
        return segmentsIntersect(this.#arrangement[v], this.#arrangement[u],
                                 this.#arrangement[x], this.#arrangement[y],
                                 extendXY);
    }

    getDist(v, u) {
        return this.#arrangement[u].sub(this.#arrangement[v]).length();
    }

    removeExpiredSwaps() {
        while (this.#previousSwaps.length > 0 &&
               this.#currentIteration - this.#previousSwaps[0].iteration > MIN_SWAP_ITERATIONS_SHOULD_PASS) {
            this.#previousSwaps.shift();
        }
    }

    makeSwaps() {
        this.removeExpiredSwaps();
        for (let i = 0; i < VERTECES_TO_SWAP; i++) {
            var v = this.#vertexToSwap;
            this.#vertexToSwap = (v + 1) % this.size();
            if (this.#graph[v].length == 0) {
                continue;
            }

            const order = [];
            for (let u = v + 1; u < this.size(); u++) {
                order.push(u);
            }
            order.sort((a, b) => {
                return this.getDist(v, a) - this.getDist(v, b);
            });

            order.forEach((u, i) => {
                var fail = (i > 10);
                this.#previousSwaps.every(swap => {
                    fail |= (Math.min(v, u) == swap.v && Math.max(v, u) == swap.u);
                    return !fail;
                });
                if (fail) {
                    return;
                }

                var delta = 0;
                this.#graph[v].forEach(x => {
                    this.#graph[u].forEach(y => {
                        if (x == u || y == v || x == y) {
                            return;
                        }
                        delta -= this.edgesIntersect(v, x, u, y);
                        delta += this.edgesIntersect(u, x, v, y);
                    });
                });

                [v, u].forEach(x => {
                    const other = (x == v ? u : v);
                    this.#graph[x].forEach(y => {
                        if (y == other || this.hasEdge(other, y)) {
                            return;
                        }
                        this.#edges.forEach(edge => {
                            if (edge.from == v || edge.to == v || edge.from == u ||
                                edge.to == u || edge.from == y || edge.to == y) {
                                return;
                            }
                            delta -= this.edgesIntersect(x, y, edge.from, edge.to);
                            delta += this.edgesIntersect(other, y, edge.from, edge.to);
                        });
                    });
                });

                if (delta < 0) {
                    this.#previousSwaps.push(new Swap(v, u, this.#currentIteration));
                    const auxPoint = this.#arrangement[v];
                    this.#arrangement[v] = this.#arrangement[u];
                    this.#arrangement[u] = auxPoint;
                }
            });
        }
    }

    isVertexMirroringBetter(v, edge, ignored=null) {
        if (ignored == edge.from || ignored == edge.to) {
            return false;
        }
        const distToEdge = (new Line(this.#arrangement[edge.from], this.#arrangement[edge.to])).distanceToPoint(this.#arrangement[v]);
        if (distToEdge > MAX_RANDOM_MOVE_DISTANCE_COEFF * PERFECT_DISTANCE) {
            return false;
        }
        var allIntersecting = true;
        var count = 0;

        this.#graph[v].every(u => {
            if (u == edge.from || u == edge.to || v == edge.from || v == edge.to || ignored == u) {
                return true;
            }
            count++;
            allIntersecting &= this.edgesIntersect(v, u, edge.from, edge.to, 1.5);
            return allIntersecting;
        });
        return allIntersecting && count != 0;
    }

    makeRandomMove() {
        const moved = Array(this.size()).fill(false);
        for (let v = 0; v < this.size(); v++) {
            var adjMoved = false;
            this.#graph[v].every(u => {
                adjMoved |= moved[u];
                return !adjMoved;
            });
            if (adjMoved || this.#graph[v].length == 0) {
                continue;
            }
            const intersectingEdges = [];

            this.#edges.forEach(edge => {
                if (this.isVertexMirroringBetter(v, edge)) {
                    intersectingEdges.push(edge);
                    return;
                }

                var found = false;
                this.#graph[v].every(u => {
                    if (this.#graph[u].length != 1) {
                        return true;
                    }
                    found |= this.isVertexMirroringBetter(v, edge, u);
                    return !found;
                });

                if (found) {
                    intersectingEdges.push(edge);
                }
            });

            if (intersectingEdges.length == 0 || Math.random() < 0.5) {
                continue;
            }

            const edge = intersectingEdges[randomInt(0, intersectingEdges.length)];
            const center = this.#arrangement[edge.from].add(this.#arrangement[edge.to]).scale(0.5);
            const coeff = Math.random() * 1.25 + 0.25;
            var vector = center.sub(this.#arrangement[v]).scale(coeff + 1);
            vector = vector.normalize(Math.min(vector.length(), PERFECT_DISTANCE));

            moved[v] = true;
            this.#arrangement[v] = this.#arrangement[v].add(vector.scale(coeff + 1));
            this.#done = false;

            this.#temperature *= Math.pow(1 / TEMPERATURE_BASE, 25);
            this.#temperature = Math.min(this.#temperature, DEFAULT_TEMPERATURE);
        }
    }

    findForce(v) {
        var force = new Point((Math.random() - 0.5) * 1e-5, (Math.random() - 0.5) * 1e-5);
        for (let u = 0; u < this.size(); u++) {
            if (v == u) {
                continue;
            }
            var vector = this.#arrangement[u].sub(this.#arrangement[v]);
            if (vector.length() < 1e-5) {
                vector = new Point(Math.random() - 0.5, Math.random() - 0.5);
            }

            const distance = vector.length();
            var currentForce;
            if (!this.hasEdge(v, u)) {
                currentForce = -Math.max(0, lengthFunction(PERFECT_DISTANCE - distance)) * K;
            } else {
                currentForce = lengthFunction(distance - PERFECT_DISTANCE) * K;
            }
            force = force.add(vector.normalize(currentForce));
        }
        return force;
    }

    applyForce(force) {
        var maxLength = 0;
        for (let i = 0; i < this.size(); i++) {
            var shiftVector = force[i].scale(this.#temperature);
            if (shiftVector.length() > MAX_SHIFT) {
                shiftVector = shiftVector.normalize(MAX_SHIFT);
            }
            maxLength = Math.max(maxLength, shiftVector.length());
            this.#arrangement[i] = this.#arrangement[i].add(shiftVector);
        }

        if (maxLength < DONE_MAX_LENGTH) {
            if (this.#randomMoveIterationsLeft > 0) {
                this.#randomMoveIterationsLeft--;
                this.makeRandomMove();
                this.makeSwaps();
            } else {
                this.#done = true;
            }
        }
    }

    prettifyIteration() {
        const force = [];
        for (let i = 0; i < this.size(); i++) {
            force.push(this.findForce(i));
        }
        this.applyForce(force);
    }
}

export class IterativeArrangement extends ArrangementBuilderInterface {
    constructor(nodesStateHandler) {
        super();
        this.#nodesStateHandler = nodesStateHandler;
    }

    build(n, edges) {
        return new IterativePrettifier(this.#nodesStateHandler, n, edges);
    }

    isPretty(n, edges) {
        return true;
    }

// Private:
    #nodesStateHandler;
}

export class IterativeArrangementOption extends ArrangementOptionInterface {
    constructor(nodesStateHandler) {
        super(new IterativeArrangement(nodesStateHandler));
    }

    buildHtml(graphEditor, callback) {
        const div = document.createElement("div");
        div.innerText = "Итеративное улучшение";
        return div;
    }
}
