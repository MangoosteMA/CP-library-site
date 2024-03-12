import { generateEdgeInfoRowId } from "./graph_editor_state_listeners/edges_state_listener.js"
import { NODE_INFO_ROW }         from "./graph_editor_state_listeners/nodes_state_listener.js"
import { increaseLabelBy }       from "./utils.js";

const SEPARATORS = [" ", ","];

class Token {
    /*
    Variables:
    startPosition: int
    endPosition:   int
    value:         string
    */

    constructor(startPosition, endPosition, line) {
        this.startPosition = startPosition;
        this.endPosition = endPosition;
        this.value = line.slice(startPosition, endPosition);
    }
}

class TokenizedNode {
    /*
    Variables:
    label: Token
    */

    constructor(label) {
        this.label = label;
    }
}

class TokenizedEdge {
    /*
    Variables:
    node1:  Token
    node2:  Token
    weight: Token or null
    */

    constructor(node1, node2, weight) {
        this.node1 = node1;
        this.node2 = node2;
        this.weight = weight;
    }
}

class NodesAndEdgesParser {
    constructor() {}

    // Returns EdgeInfo if line was parsed as an edge successfully (null otherwise)
    parseLine(line) {
        const tokens = this.parseLineIntoTokens(line);
        if (tokens.length == 1) {
            return new TokenizedNode(tokens[0]);
        } else if (tokens.length == 2) {
            return new TokenizedEdge(tokens[0], tokens[1], null);
        } else if (tokens.length == 3) {
            return new TokenizedEdge(tokens[0], tokens[1], tokens[2]);
        }
        return null;
    }

    renameNode(label, newLabel, line) {
        return this.updateNodes(line, function(nodeLine) {
            return nodeLine == label ? newLabel : nodeLine;
        });
    }

    changeNodesIndexesBy(value, line) {
        return this.updateNodes(line, function(nodeLine) {
            return increaseLabelBy(nodeLine, value)
        });
    }

    changeWeight(node1, node2, prevWeight, newWeight, line) {
        const parsedLine = this.parseLine(line);
        if (parsedLine instanceof TokenizedEdge && parsedLine.node1.value == node1 &&
                                                   parsedLine.node2.value == node2 &&
                                                   (parsedLine.weight ? parsedLine.weight.value : "") == prevWeight) {
            if (parsedLine.weight == null) {
                return line.trim() + " " + newWeight;
            }
            const leftLinePart = line.slice(0, parsedLine.weight.startPosition);
            return leftLinePart + newWeight;
        }
        return line;
    }

// Private:
    parseLineIntoTokens(line) {
        const tokens = [];
        for (let position = 0; position < line.length;) {
            const tokenStart = this.findNextTokenStart(line, position);
            if (tokenStart == null) {
                break;
            }
            const tokenEnd = tokens.length == 2 ? line.length :  this.findTokenEnd(line, tokenStart);
            tokens.push(new Token(tokenStart, tokenEnd, line));
            position = tokenEnd;
        }
        return tokens;
    }

    findNextTokenStart(line, position) {
        while (position < line.length && SEPARATORS.includes(line[position])) {
            position++;
        }
        if (position == line.length) {
            return null;
        }
        return position;
    }

    findTokenEnd(line, tokenStart) {
        var position = tokenStart + 1;
        while (position < line.length && !SEPARATORS.includes(line[position])) {
            position++;
        }
        return position;
    }

    updateNodes(line, updateNode) {
        const parsedLine = this.parseLine(line);
        const tokensToChange = [];
        if (parsedLine instanceof TokenizedNode) {
            tokensToChange.push(parsedLine.label);
        } else if (parsedLine instanceof TokenizedEdge) {
            tokensToChange.push(parsedLine.node1);
            tokensToChange.push(parsedLine.node2);
        }

        tokensToChange.reverse();
        tokensToChange.forEach(token => {
            const leftLinePart = line.slice(0, token.startPosition);
            const middlePart = line.slice(token.startPosition, token.endPosition);
            const rightLinePart = line.slice(token.endPosition, line.length);
            line = leftLinePart + updateNode(middlePart) + rightLinePart;
        });

        return line;
    }
}

export class EdgeInfo {
    /*
    Variables:
    node1:    string
    node2:    string
    directed: bool
    weight:   string
    index:    int
    */

    constructor(node1, node2, directed, weight, index) {
        this.node1 = node1;
        this.node2 = node2;
        this.directed = directed;
        this.weight = weight;
        this.index = null;
    }
}


export class NodesAndEdgesEditorListener {
    /*
    Variables:
    editor: graph editor
    edges:  list[EdgeInfo]
    nodes:  Set[string]
    */

    constructor(editor) {
        this.editor = editor;
        this.startParsing();
        this.#nodesAndEdgesParser = new NodesAndEdgesParser();
    }

    startParsing() {
        this.edges = [];
        this.nodes = new Set();
    }

    parseLine(line, index) {
        const parsedObject = this.#nodesAndEdgesParser.parseLine(line);
        if (parsedObject == null) {
            return null;
        }

        const settingsDiv = document.createElement("div");
        settingsDiv.style.textAlign = "center";

        if (parsedObject instanceof TokenizedNode) {
            this.nodes.add(parsedObject.label.value);
            settingsDiv.innerText = "V";
            const nodeInfoRowId = parsedObject.label.value + NODE_INFO_ROW;
            this.addFocusEvent(settingsDiv, nodeInfoRowId);
        } else {
            const weight = parsedObject.weight ? parsedObject.weight.value : "";
            this.edges.push(new EdgeInfo(parsedObject.node1.value, parsedObject.node2.value, false, weight, index));
            this.nodes.add(parsedObject.node1.value);
            this.nodes.add(parsedObject.node2.value);
            settingsDiv.innerText = "E";
            const edgeInfoRowId = generateEdgeInfoRowId(parsedObject.node1.value, parsedObject.node2.value, weight);
            this.addFocusEvent(settingsDiv, edgeInfoRowId);
        }
        return settingsDiv;
    }

    finishParsing() {
        this.editor.updateNodesAndEdges(this.nodes, this.edges);
    }

    renameNode(label, newLabel, line) {
        return this.#nodesAndEdgesParser.renameNode(label, newLabel, line);
    }

    changeNodesIndexesBy(value, line) {
        return this.#nodesAndEdgesParser.changeNodesIndexesBy(value, line);
    }

    changeWeight(node1, node2, prevWeight, newWeight, line) {
        return this.#nodesAndEdgesParser.changeWeight(node1, node2, prevWeight, newWeight, line);
    }

// Private:
    #nodesAndEdgesParser; // NodesAndEdgesParser

    addFocusEvent(div, objectId) {
        div.style.cursor = "pointer";
        div.addEventListener("click", function() {
            const object = document.getElementById(objectId);
            if (object) {
                var parentDetails = object.parentElement;
                while (parentDetails != null && parentDetails.nodeName != "DETAILS") {
                    parentDetails = parentDetails.parentElement;
                }
                if (parentDetails) {
                    parentDetails.open = true;
                }
                object.style.background = "rgba(255, 255, 255, 0.4)";
                object.scrollIntoView();
                setTimeout(function() {
                    object.style.background = "";
                }, 500);
            }
        });
    }
}
