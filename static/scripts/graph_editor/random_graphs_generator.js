import { createCheckbox } from "./graph_editor_state_listeners/utils.js";
import { randomInt }      from "./utils.js";

class Edge {
    /*
    Variables:
    v: int
    u: int
    w: str
    */

    constructor(v, u, w) {
        this.v = v;
        this.u = u;
        this.w = w;
    }

    encode() {
        return Math.min(this.v, this.u) + "---" + Math.max(this.v, this.u);
    }

    asString() {
        return ((this.v + 1) + " " + (this.u + 1) + " " + this.w).trim();
    }
}

class Graph {
    /*
    Variables:
    n:          int
    edges:      list[Edge]
    edgesCodes: set[Edge.encode()]
    */

    constructor(n) {
        this.n = n;
        this.edges = [];
        this.edgesCodes = new Set();
    }

    addEdge(edge) {
        if (edge.v > edge.u) {
            const aux = edge.v;
            edge.v = edge.u;
            edge.u = aux;
        }
        this.edges.push(edge);
        this.edgesCodes.add(edge.encode());
    }
    
    hasEdge(edge) {
        return this.edgesCodes.has(edge.encode());
    }

    generateWeights(minWeight, maxWeight) {
        this.edges.forEach(edge => {
            edge.w = randomInt(minWeight, maxWeight + 1);
        });
    }

    asString() {
        this.edges.sort((edge1, edge2) => {
            if (edge1.v != edge2.v) {
                return edge1.v - edge2.v;
            }
            return edge1.u - edge2.u;
        });

        var result = "";
        for (let i = 0; i < this.n; i++) {
            result += (i + 1) + "\n";
        }
        this.edges.forEach(edge => {
            result += edge.asString() + "\n";
        });
        return result;
    }
}

function getShuffledEdges(n) {
    const edges = [];
    for (let v = 0; v < n; v++) {
        for (let u = v + 1; u < n; u++) {
            edges.push(new Edge(v, u, ""));
        }
    }
    for (let i = 1; i < edges.length; i++) {
        const j = randomInt(0, i + 1);
        if (i != j) {
            const auxEdge = new Edge(edges[i].v, edges[i].u, edges[i].w);
            edges[i] = edges[j];
            edges[j] = auxEdge;
        }
    }
    return edges;
}

function randomPruferCode(n) {
    const pruferCode = Array(n - 2);
    for (let i = 0; i < pruferCode.length; i++) {
        pruferCode[i] = randomInt(0, n);
    }
    return pruferCode;
}

function generateTree(n) {
    const graph = new Graph(n);
    if (n == 2) {
        graph.addEdge(new Edge(0, 1, ""));
    }
    if (n <= 2) {
        return graph;
    }

    const pruferCode = randomPruferCode(n);
    const count = Array(n).fill(0);
    pruferCode.forEach(vertex => {
        count[vertex]++;
    });

    var pointer = 0;
    var option = -1;
    pruferCode.forEach(vertex => {
        if (option == -1) {
            while (count[pointer] > 0) {
                pointer++;
            }
            option = pointer;
            pointer++;
        }
        graph.addEdge(new Edge(vertex, option, ""));
        option = -1;
        --count[vertex];
        if (count[vertex] == 0 && vertex < pointer) {
            option = vertex;
        }
    });

    if (pruferCode[n - 3] == n - 1) {
        while (count[pointer] > 0) {
            pointer++;
        }
        graph.addEdge(new Edge(pointer, n - 1, ""));
    } else {
        graph.addEdge(new Edge(pruferCode[n - 3], n - 1, ""));
    }
    return graph;
}

function createLeftColumnDiv() {
    const div = document.createElement("div");
    div.style.lineHeight = "20px";
    div.style.textAlign = "right";
    return div;
}

function createTextarea() {
    const textarea = document.createElement("textarea");
    textarea.setAttribute("class", "nodes-textarea");
    return textarea;
}

export class RandomGraphsGenerator {
    /*
    Variables:
    graphTextarea: Editor
    n:             int (0 by default)
    m:             int (0 by default)
    connected:     bool (true by default)
    weighted:      bool (false by default)
    minWeight:     int (1 by default)
    maxWeight:     int (2 by default)
    */

    constructor(details, graphTextarea) {
        this.graphTextarea = graphTextarea;

        const tableHolder = document.createElement("div");
        tableHolder.style.display = "flex";
        const leftTableDiv = document.createElement("div");
        const rightTableDiv = document.createElement("div");
        leftTableDiv.style.width = "44%";
        rightTableDiv.style.flex = "1";
        tableHolder.appendChild(leftTableDiv);
        tableHolder.appendChild(rightTableDiv);

        const leftTable = document.createElement("table");
        const rightTable = document.createElement("table");
        leftTableDiv.appendChild(leftTable);
        rightTableDiv.appendChild(rightTable);

        function addRow(leftColumn, rightColumn, table) {
            leftColumn.style.paddingLeft = "10px";

            const rightColumnOuter = document.createElement("div");
            rightColumnOuter.style.height = "25px";
            rightColumnOuter.style.display = "inline-flex";
            rightColumnOuter.appendChild(rightColumn);

            const rightColumnCell = document.createElement("td");
            rightColumnCell.style.width = "40px";
            rightColumnCell.style.textAlign = "center";
            rightColumnCell.appendChild(rightColumnOuter);

            const row = document.createElement("tr");
            row.appendChild(leftColumn);
            row.appendChild(rightColumnCell);
            table.appendChild(row);
        }

        function createLeftColumn(text) {
            const leftColumn = document.createElement("td");
            const insideDiv = createLeftColumnDiv();
            insideDiv.innerText = text;
            leftColumn.appendChild(insideDiv);
            return leftColumn;
        }

        function createIntegerInfo(table, text, defaultValue, onChange) {
            const rightColumn = document.createElement("div");
            rightColumn.style.display = "flex";

            const textarea = createTextarea();
            textarea.value = defaultValue;
            textarea.addEventListener("change", function() {
                onChange(textarea.value);
            });

            rightColumn.appendChild(textarea);
            addRow(createLeftColumn(text), rightColumn, table);
        }

        function createBoolInfo(table, text, defaultValue, onChange) {
            const rightColumn = document.createElement("td");
            rightColumn.style.display = "flex";
            const checkbox = createCheckbox(text + "-random-graph-checkbox", defaultValue, function(input) {
                onChange(input.checked);
            });
            checkbox.style.display = "inline-block";
            checkbox.style.marginLeft = "auto";
            checkbox.style.marginRight = "auto";
            rightColumn.appendChild(checkbox);
            addRow(createLeftColumn(text), rightColumn, table);
        }

        const randomGraphsGenerator = this;

        // Nodes number
        this.n = 0;
        createIntegerInfo(leftTable, "Вершины:", this.n, function(value) {
            randomGraphsGenerator.n = parseInt(value, 0);
        });

        // Edges number
        this.m = 0;
        createIntegerInfo(leftTable, "Рёбра:", this.m, function(value) {
            randomGraphsGenerator.m = parseInt(value, 0);
        });

        // Connected
        this.connected = true;
        createBoolInfo(leftTable, "Связность:", this.connected, function(value) {
            randomGraphsGenerator.connected = value;
        });

        // Weighted
        this.weighted = false;
        createBoolInfo(rightTable, "Взвешенность:", this.weighted, function(value) {
            randomGraphsGenerator.weighted = value;
        });

        // Min weight
        this.minWeight = 1;
        createIntegerInfo(rightTable, "Минимальный вес:", this.minWeight, function(value) {
            randomGraphsGenerator.minWeight = value;
        });

        // Max weight
        this.maxWeight = 2;
        createIntegerInfo(rightTable, "Максимальный вес:", this.maxWeight, function(value) {
            randomGraphsGenerator.maxWeight = value;
        });

        const buttonHolder = document.createElement("div");
        buttonHolder.style.textAlign = "center";
        buttonHolder.style.marginBottom = buttonHolder.style.marginTop = "8px";
        const generateButton = document.createElement("button");
        generateButton.style.width = "auto";
        generateButton.setAttribute("class", "nodes-button");
        generateButton.innerText = "Сгенерировать";
        buttonHolder.appendChild(generateButton);

        generateButton.addEventListener("click", function() {
            randomGraphsGenerator.generateGraph();
        });

        details.appendChild(tableHolder);
        details.appendChild(buttonHolder);
    }

    generateGraph() {
        if (this.weighted && this.maxWeight < this.minWeight) {
            console.log("Failed to generate graph: maxWeight < minWeight");
            return;
        }

        var graph = new Graph(this.n);
        var remainingEdges = this.m;
        if (this.connected) {
            graph = generateTree(this.n);
            remainingEdges -= this.n - 1;
        }

        if (remainingEdges > 0) {
            if (this.m > this.n * (this.n - 1) / 2) {
                getShuffledEdges(this.n).forEach(edge => {
                    if (remainingEdges > 0 && !graph.hasEdge(edge)) {
                        remainingEdges--;
                        graph.addEdge(edge);
                    }
                });
            } else {
                for (let its = 0; remainingEdges > 0 && its < 10000; its++) {
                    const v = randomInt(0, this.n);
                    const u = randomInt(0, this.n);
                    if (v != u && !graph.hasEdge(new Edge(v, u, ""))) {
                        remainingEdges--;
                        graph.addEdge(new Edge(v, u, ""));
                    }
                }
            }
        }

        if (this.weighted) {
            graph.generateWeights(this.minWeight, this.maxWeight);
        }
        this.graphTextarea.changeValue(graph.asString());
    }
}
