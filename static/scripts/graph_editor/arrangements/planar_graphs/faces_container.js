import { CanonicalOrder }    from "./canonical_order.js";
import { Edge }              from "./edge.js";
import { Face }              from "./face.js";
import { Point }             from "../../geometry.js";
import { getRegularPolygon } from "../regular_arrangement.js";

export class FacesContainer {
    /*
    Variables:
    root:  int
    faces: list[Face]
    */

    constructor(cycle) {
        this.root = 0;
        this.faces = [new Face(cycle)];
    }
    
    layPath(node, path) {
        if (path[0] == path[path.length - 1]) {
            this.faces[node].rotateTo(path[0]);
            const split = Math.floor(path.length / 2);
            const destNode = this.faces[node].cycle[Math.floor(this.faces[node].cycle.length / 2)];
            this.layPath(node, path.slice(0, split + 1).concat([destNode]));
            this.layPath(this.findFaceContaining(path[split]), path.slice(split))
            return;
        }

        this.faces[node].rotateTo(path[0]);
        const cutIndex = this.faces[node].cycle.indexOf(path[path.length - 1]);
        this.faces.push(new Face(path.concat(this.faces[node].cycle.slice(1, cutIndex).reverse())));

        const newFaceCycle = path.concat(this.faces[node].cycle.slice(cutIndex + 1));
        if (this.faces.length == 2) {
            this.faces.push(new Face(newFaceCycle));
        } else {
            this.faces[node].cycle = newFaceCycle;
            if (node == this.root) {
                this.rootAt(this.faces.length - 1);
            }
        }
    }
    
    getVertices() {
        const vertices = new Set();
        this.faces.forEach(face => {
            face.cycle.forEach(v => {
                vertices.add(v);
            });
        });
        return vertices;
    }

    numberOfVerteces() {
        return this.getVertices().size;
    }

    contains(vertex) {
        for (let i = 0; i < this.faces.length; i++) {
            if (this.faces[i].contains([vertex])) {
                return true;
            }
        }
        return false;
    }

    rootAt(node) {
        this.root = node;
    }

    uniteWith(from, to, facesContainer) {
        const leaf = this.findFaceContaining(from);
        facesContainer.rootAt(facesContainer.findFaceContaining(to));

        this.faces[leaf].rotateTo(from);
        facesContainer.faces[facesContainer.root].rotateTo(to);
        const innerCycle = facesContainer.faces[facesContainer.root].cycle;
        const outerCycle = this.faces[leaf].cycle;

        const destNode = outerCycle[Math.floor(outerCycle.length / 2)];
        if (innerCycle.length == 1) {
            this.layPath(leaf, [from, to, destNode]);
            return;
        }

        const split = Math.floor(innerCycle.length / 2);
        this.layPath(leaf, [from].concat(innerCycle.slice(0, split + 1))
                                 .concat([destNode]));

        this.layPath(leaf, innerCycle.slice(split).concat([innerCycle[0]]));

        facesContainer.faces.forEach((face, index) => {
            if (index != facesContainer.root) {
                this.faces.push(face);
            }
        });
    }

    storeArrangement(arrangement, leftX, baseDistance) {
        this.completeTriangulation();

        const n = arrangement.length;
        const currentArrangement = this.findArrangement(n);

        var minX = currentArrangement[0].x;
        currentArrangement.forEach(point => {
            point.x *= baseDistance;
            point.y *= baseDistance;
            minX = Math.min(minX, point.x);
        });
        currentArrangement.forEach(point => {
            point.x += leftX - minX;
        });

        this.getVertices().forEach(v => {
            arrangement[v] = currentArrangement[v];
        });
    }

// Private:
    findArrangement(n) {
        const arrangement = new Array(n);
        for (let i = 0; i < n; i++) {
            arrangement[i] = new Point(0, 0);
        }

        if (this.faces.length == 1) {
            const regular = getRegularPolygon(this.faces[this.root].cycle.length, 1);
            this.faces[this.root].cycle.forEach((v, index) => {
                arrangement[v] = regular[index];
            });
            return arrangement;
        }

        const canonicalOrder = this.findCanonicalOrder(n);
        var outerShape = [canonicalOrder.start_left, canonicalOrder.order[0], canonicalOrder.start_right];
        const children = new Array(n);
        for (let i = 0; i < n; i++) {
            children[i] = [];
        }

        arrangement[canonicalOrder.start_left] = new Point(0, 0);
        arrangement[canonicalOrder.order[0]] = new Point(1, 1);
        arrangement[canonicalOrder.start_right] = new Point(2, 0);

        for (let i = 1; i < canonicalOrder.order.length; i++) {
            const vertex = canonicalOrder.order[i];
            const adjacent = this.findAdjecentOf(vertex, outerShape);
            adjacent.sort();

            for (let i = 1; i + 1 < adjacent.length; i++) {
                children[vertex].push(outerShape[adjacent[i]]);
            }

            const left = adjacent[0];
            const right = adjacent[adjacent.length - 1];
            for (let i = left + 1; i < outerShape.length; i++) {
                this.shiftRightSubtree(outerShape[i], arrangement, children, i >= right ? 2 : 1);
            }

            const a = arrangement[outerShape[left]].y - arrangement[outerShape[left]].x;
            const b = arrangement[outerShape[right]].x + arrangement[outerShape[right]].y;
            arrangement[vertex] = new Point((b - a) / 2, (a + b) / 2);
            outerShape = outerShape.slice(0, left + 1).concat([vertex])
                                                      .concat(outerShape.slice(right));
        }
        return arrangement;
    }

    findAdjecentOf(vertex, outerShape) {
        const adjacent = new Set();
        this.faces.forEach(face => {
            for (let i = 0; i < face.cycle.length; i++) {
                const a = face.cycle[i];
                const b = face.cycle[(i + 1) % face.cycle.length];
                if (a == vertex) {
                    adjacent.add(outerShape.indexOf(b));
                }
                if (b == vertex) {
                    adjacent.add(outerShape.indexOf(a));
                }
            }
        });

        if (adjacent.has(-1)) {
            adjacent.delete(-1);
        }
        return [...adjacent];
    }

    shiftRightSubtree(vertex, arrangement, children, shift) {
        arrangement[vertex].x += shift;
        children[vertex].forEach(u => {
            this.shiftRightSubtree(u, arrangement, children, shift);
        });
    }

    findCanonicalOrder(n) {
        const start_left = this.faces[this.root].cycle[0];
        const start_right = this.faces[this.root].cycle[1];

        const outside = new Array(n).fill(false);
        this.faces[this.root].cycle.forEach(v => {
            outside[v] = true;
        });

        const used = new Array(n).fill(false);
        const edgeRank = new Array(n);
        for (let i = 0; i < n; i++) {
            edgeRank[i] = new Array(n).fill(2);
        }

        this.faces[this.root].cycle.forEach((v, index) => {
            const u = this.faces[this.root].cycle[(index + 1) % this.faces[this.root].cycle.length];
            edgeRank[u][v] = edgeRank[v][u] = 1;
        });

        const order = [];
        while (true) {
            const next = this.findValidVertex(n, used, outside, edgeRank, start_left, start_right);
            if (next == -1) {
                break;
            }
            order.push(next);
            this.removeVertex(next, used, edgeRank, outside);
        }
        return new CanonicalOrder(start_left, start_right, order.reverse());
    }

    findValidVertex(n, used, outside, edgeRank, start_left, start_right) {
        const valid = new Array(n).fill(true);
        this.faces.forEach((face, index) => {
            if (index == this.root) {
                return;
            }
            for (let i = 0; i < 3; i++) {
                const a = face.cycle[i];
                const b = face.cycle[(i + 1) % 3];
                if (outside[a] && outside[b] && edgeRank[a][b] == 2) {
                    valid[a] = valid[b] = false;
                }
            }
        });

        var result = -1;
        this.getVertices().forEach(v => {
            if (valid[v] && !used[v] && outside[v] && v != start_left && v != start_right) {
                result = v;
            }
        });
        return result;
    }

    removeVertex(vertex, used, edgeRank, outside) {
        outside[vertex] = false;
        used[vertex] = true;

        this.faces.forEach((face, index) => {
            if (index == this.root || !face.contains([vertex])) {
                return;
            }
            face.rotateTo(vertex);

            face.cycle.forEach(u => {
                if (!used[u]) {
                    outside[u] = true;
                }
            });

            if (!used[face.cycle[1]] && !used[face.cycle[2]]) {
                this.decreaseEdgeRank(vertex, face.cycle[1], edgeRank);
                this.decreaseEdgeRank(face.cycle[1], face.cycle[2], edgeRank);
                this.decreaseEdgeRank(vertex, face.cycle[2], edgeRank);
            }
        });
    }

    decreaseEdgeRank(v, u, edgeRank) {
        edgeRank[v][u]--;
        edgeRank[u][v]--;
    }

    findFaceContaining(vertex) {
        var longestFace = -1;
        var length = -1;
        for (let i = 0; i < this.faces.length; i++) {
            if (this.faces[i].contains([vertex]) && length < this.faces[i].cycle.length) {
                longestFace = i;
                length = this.faces[i].cycle.length;
            }
        }
        return longestFace;
    }

    completeTriangulation() {
        const edgesSet = new Set();
        this.faces.forEach(face => {
            for (let i = 0; i < face.cycle.length; i++) {
                edgesSet.add(new Edge(face.cycle[i], face.cycle[(i + 1) % face.cycle.length]).encode());
            }
        });

        for (let i = 0; i < this.faces.length; i++) {
            if (i == this.root || this.faces[i].cycle.length <= 3) {
                continue;
            }
            const curEdge = new Edge(this.faces[i].cycle[0], this.faces[i].cycle[2]).encode();
            if (!edgesSet.has(curEdge)) {
                edgesSet.add(curEdge);
                this.layPath(i, [this.faces[i].cycle[0], this.faces[i].cycle[2]]);
            } else {
                this.faces[i].rotateByOne();
            }
            i--;
        }
    }
}
