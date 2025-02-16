import { StableArrangement }   from "./arrangements/arrangement_interface.js";
import { Point }               from "./geometry.js";
import { Node }                from "./node.js";
import { increaseLabelBy }     from "./utils.js";
import { isInt }               from "./utils.js";
import { clamp }               from "./utils.js";
import { uniteBoundingBoxes }  from "./utils.js";
import { ArrangementsBuilder } from "./arrangements_builder.js";
import { ArrangementEdge }     from "./arrangements/arrangement_interface.js";

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
        this.arrangementsBuilder = new ArrangementsBuilder(this);
        this.#radius = 0;
        this.#fontSize = 0;
    }

    resize(newBox) {
        function resizeCoordinate(prevL, prevR, newL, newR, x) {
            return newL + (newR - newL) * (x - prevL) / (prevR - prevL);
        }

        this.nodes.forEach(node => {
            const center = node.getCenter();
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
            return false;
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

        return true;
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
            arrangement[i] = this.get(indexToNode.get(i)).getCenter();
        }
        return arrangement;
    }

    betterNodesArrangement(edgesStateHandler) {
        if (this.nodes.size == 0) {
            return new StableArrangement([]);
        }
        const {n, nodeToIndex, indexToNode} = this.enumerateVerteces();

        var edges = [];
        edgesStateHandler.edges.forEach(edge => {
            const from = nodeToIndex.get(edge.node1.label);
            const to = nodeToIndex.get(edge.node2.label);
            edges.push(new ArrangementEdge(from, to, edge.directed));
        });

        var arrangement = this.arrangementsBuilder.build(n, edges);
        return arrangement || new StableArrangement(this.currentArrangement());
    }

    applyArrangement(arrangement, force=false) {
        arrangement = this.arrangementsBuilder.prettify(arrangement, this.box);
        arrangement = this.unpackArrangement(arrangement);

        const MAX_MOVING_SPEED = (this.box.maxX - this.box.minX + this.box.maxY - this.box.minY) * 0.004;
        const MIN_MOVING_SPEED = MAX_MOVING_SPEED / 5;
        var allDone = true;

        this.nodes.forEach((node, label) => {
            if (!arrangement.has(label)) {
                return;
            }
            const center = node.getCenter();
            var vector = arrangement.get(label).sub(center);
            if (!force) {
                var expectedSpeed = vector.length() / 20;
                expectedSpeed = clamp(expectedSpeed, MIN_MOVING_SPEED, MAX_MOVING_SPEED);
                expectedSpeed = Math.min(expectedSpeed, vector.length());
                if (Math.abs(expectedSpeed - vector.length()) > 1e-5) {
                    vector = vector.normalize(expectedSpeed);
                    allDone = false;
                }
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

    getBoundingBox() {
        var boundingBox = null;
        this.nodes.forEach(node => {
            boundingBox = uniteBoundingBoxes(boundingBox, node.getBoundingBox());
        });
        return boundingBox;
    }

    shiftNodesBy(vector) {
        this.nodes.forEach(node => {
            node.setCoordinates(node.getCenter().add(vector));
        });
    }

    encodeJson() {
        const objects = [];
        this.sortedNodes().forEach(node => {
            objects.push(node.encodeJson());
        });
        return objects;
    }

    decodeJson(data, darkModeColor) {
        this.updateNodesSet([], darkModeColor);
        data.forEach(node => {
            const newNode = this.createNode(node['l']);
            newNode.setCoordinates(new Point(node['x'] * this.box.maxX, node['y'] * this.box.maxY));
        });
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
        const node = new Node(label, this.#radius, this.group, this.box, this.#fontSize);
        this.nodes.set(label, node);
        return node;
    }

    handleShiftIndexesUpdate(newNodes) {
        if (this.nodes.size != newNodes.size) {
            return false;
        }
        var same;
        [-1, 0, 1].every(shift => {
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

    unpackArrangement(arrangement) {
        const indexToNode = this.enumerateVerteces().indexToNode;
        const unpackedArrangement = new Map();
        arrangement.forEach((point, index) => {
            unpackedArrangement.set(indexToNode.get(index), point);
        });
        return unpackedArrangement;
    }
}
