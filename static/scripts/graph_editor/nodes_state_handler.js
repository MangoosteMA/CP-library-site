import { Point }                  from "./geometry.js";
import { Node }                   from "./node.js";
import { increaseLabelBy, isInt } from "./utils.js";
import { ArrangementsBuilder }    from "./arrangements_builder.js";
import { ArrangementEdge }        from "./arrangements/arrangement_interface.js";

export class NodesStateHandler {
    /*
    Variables:
    box:                 Struct with minX, maxX, minY and maxY
    nodes:               Map[label : Node]
    group:               html <g> element
    arrangementsBuilder: ArrangementsBuilder
    */

    constructor(box, group) {
        this.box = box;
        this.nodes = new Map();
        this.group = group;
        this.arrangementsBuilder = new ArrangementsBuilder();

        this.#radius = 0;
        this.#fontSize = 0;
    }

    resize(newBox) {
        function resizeCoordinate(prevL, prevR, newL, newR, x) {
            return newL + (newR - newL) * (x - prevL) / (prevR - prevL);
        }

        this.nodes.forEach(node => {
            const center = node.getCircle().center;
            node.setBox(newBox);
            node.setCoordinates(new Point(resizeCoordinate(this.box.minX, this.box.maxX, newBox.minX, newBox.maxX, center.x),
                                          resizeCoordinate(this.box.minY, this.box.maxY, newBox.minY, newBox.maxY, center.y)));
        });
        this.box = newBox;
    }

    get(label) {
        return this.nodes.get(label);
    }

    sortedNodes() {
        // Checking if a should go before b
        function compare(b, a) {
            const a_label = a.label;
            const b_label = b.label;
            if (isInt(a_label) && isInt(b_label)) {
                return parseInt(a_label) < parseInt(b_label);
            }
            if (isInt(a_label) && !isInt(b_label)) {
                return true;
            }
            if (isInt(b_label)) {
                return false;
            }
            return a_label < b_label;
        }

        return [...this.nodes.values()].sort(compare);
    }

    updateNodesSet(newNodes, darkModeColor) {
        if (this.handleShiftIndexesUpdate(newNodes)) {
            return;
        }
        const prevNodes = this.nodes;
        this.nodes = new Map();

        prevNodes.forEach((node, label) => {
            if (!newNodes.has(label)) {
                console.log("Deleting node with label", node.label);
                this.group.removeChild(node.node);
            } else {
                this.nodes.set(label, node);
            }
        });

        newNodes.forEach(node => {
            if (!prevNodes.has(node)) {
                this.createNode(node);
                if (darkModeColor) {
                    this.setDarkModeForNode(this.get(node), darkModeColor);
                }
            }
        });
    }

    rearrangeNodes() {
        this.nodes.forEach(node => {
            // TODO: make it not random
            node.setRandomCoordinates();
        });
    }

    setRadius(radius) {
        this.#radius = radius;
        this.nodes.forEach(node => {
            node.setRadius(radius);
        });
    }

    setFontSize(fontSize) {
        this.#fontSize = fontSize;
        this.nodes.forEach(node => {
            node.setFontSize(fontSize);
        });
    }

    currentArrangement() {
        const {n, nodeToIndex, indexToNode} = this.enumerateVerteces();
        const arrangement = Array(n);
        for (let i = 0; i < n; i++) {
            arrangement[i] = this.get(indexToNode.get(i)).getCircle().center;
        }
        return this.unpackArrangement(arrangement, indexToNode);
    }

    betterNodesArrangement(edgesStateHandler) {
        if (this.nodes.size == 0) {
            return new Map();
        }
        const {n, nodeToIndex, indexToNode} = this.enumerateVerteces();

        var edges = [];
        edgesStateHandler.edges.forEach(edge => {
            const from = nodeToIndex.get(edge.node1.label);
            const to = nodeToIndex.get(edge.node2.label);
            edges.push(new ArrangementEdge(from, to, edge.directed));
        });

        var arrangement = this.arrangementsBuilder.build(n, edges);
        if (arrangement == null) {
            return this.currentArrangement();
        }
        arrangement = this.arrangementsBuilder.prettify(arrangement, this.box);
        return this.unpackArrangement(arrangement, indexToNode);
    }

    applyArrangement(arrangement) {
        const MOVING_SPEED = (this.box.maxX - this.box.minX + this.box.maxY - this.box.minY) * 0.008;
        var allDone = true;

        this.nodes.forEach((node, label) => {
            if (!arrangement.has(label)) {
                return;
            }
            const center = node.getCircle().center;
            var vector = arrangement.get(label).sub(center);
            if (vector.length() > MOVING_SPEED) {
                vector = vector.normalize(MOVING_SPEED);
                allDone = false;
            }
            node.setCoordinates(center.add(vector));
        });

        return allDone;
    }

    setDarkMode(color) {
        this.nodes.forEach(node => {
            this.setDarkModeForNode(node, color);
        });
    }

    setLightMode() {
        this.nodes.forEach(node => {
            node.setBackgroundColor("#ffffff");
            node.setColor("black");
        });
    }

    enumerateVerteces() {
        const nodeToIndex = new Map();
        const indexToNode = new Map();
        var n = 0;
        this.sortedNodes().forEach(node => {
            nodeToIndex.set(node.label, n);
            indexToNode.set(n, node.label);
            n += 1;
        });
        return {n: n, nodeToIndex: nodeToIndex, indexToNode: indexToNode};
    }

// Private:
    #radius;
    #fontSize;

    createNode(label) {
        if (this.nodes.has(label)) {
            console.log("Did not create a node. [Duplicate]");
            return;
        }
        console.log("Creating node with label", label);
        this.nodes.set(label, new Node(label, this.#radius, this.group, this.box, this.#fontSize));
    }

    handleShiftIndexesUpdate(newNodes) {
        if (this.nodes.size != newNodes.size) {
            return false;
        }
        var same;
        [-1, 1].every(shift => {
            same = true;
            const newNodesMap = new Map();
            this.nodes.forEach((node, label) => {
                const realLabel = increaseLabelBy(label, shift);
                if (!newNodes.has(realLabel)) {
                    same = false;
                } else {
                    newNodesMap.set(realLabel, node);
                }
            });

            if (same) {
                this.nodes = newNodesMap;
                this.nodes.forEach(node => {
                    node.increaseLabelBy(shift);
                })
                return false;
            }
            return true;
        });
        return same;
    }
    
    setDarkModeForNode(node, color) {
        node.setBackgroundColor(color);
        node.setColor("#ffffff");
    }

    unpackArrangement(arrangement, indexToNode) {
        const unpackedArrangement = new Map();
        arrangement.forEach((point, index) => {
            unpackedArrangement.set(indexToNode.get(index), point);
        });
        return unpackedArrangement;
    }
}
