import { BaseGraphStateListener }        from "./base_state_listener.js";
import { ColumnInterface }               from "./base_state_listener.js";

import { createTableCellDiv }            from "./utils.js";
import { createHighlightedTableCellDiv } from "./utils.js";
import { createCheckbox }                from "./utils.js";
import { cloneNode }                     from "./utils.js";
import { createColorInput }              from "./utils.js";
import { saveScroll }                    from "./utils.js";
import { restoreScroll }                 from "./utils.js";
import { findMajority }                  from "./utils.js";

import { Edge }                          from "../edge.js";
import { SVG_NAMESPACE }                 from "../svg_namespace.js";
import { randomInt }                     from "../utils.js";

const EDGE_INFO_ROW = "-edge-info-row";

export function generateEdgeInfoRowId(node1, node2, weight) {
    return node1 + "---" + node2 + "---" + weight + EDGE_INFO_ROW;
}

class EdgesVisualizationColumn extends ColumnInterface {
    buildHeader(graphEditor, graphTextarea) {
        const button = document.createElement("button");
        button.setAttribute("class", "nodes-button");
        button.innerText = "Ребро";

        button.addEventListener("click", function() {
            var anyNotMarkedEdge = false;
            graphEditor.edgesStateHandler.edges.forEach(edge => {
                anyNotMarkedEdge |= !edge.isMarked();
            });
            graphEditor.edgesStateHandler.edges.forEach(edge => {
                if (anyNotMarkedEdge) {
                    if (!edge.isMarked()) {
                        edge.markOrUnmark();
                    }
                } else if (edge.isMarked()) {
                    edge.markOrUnmark();
                }
            });
            graphEditor.edgesStateHandler.render();
            graphEditor.onNodesOrEdgesStateChange();
        });

        return button;
    }

    build(edge, graphEditor, graphTextarea) {
        const svg = document.createElementNS(SVG_NAMESPACE, "svg");
        svg.setAttributeNS(null, "class", "nodes-data-svg");

        const radius = 13;
        const EDGE_LENGTH = 35;
        const PADDING = 18;
        const W = 4 * radius + EDGE_LENGTH + PADDING;
        svg.setAttributeNS(null, "width", W);
        svg.setAttributeNS(null, "height", 2 * radius + PADDING);

        const edgesGroup = document.createElementNS(SVG_NAMESPACE, "g");
        svg.appendChild(edgesGroup);
        const nodesGroup = document.createElementNS(SVG_NAMESPACE, "g");
        svg.appendChild(nodesGroup);

        var center = radius + PADDING / 2;
        const boundingBox1 = {minX: center, maxX: center, minY: center, maxY: center};
        const node1 = cloneNode(edge.node1, nodesGroup, boundingBox1);
        const boundingBox2 = {minX: W - center, maxX: W - center, minY: center, maxY: center};
        const node2 = cloneNode(edge.node2, nodesGroup, boundingBox2);

        const newEdge = new Edge(node1, node2, edge.weight, edge.directed, edgesGroup, /* fontSize: */ 12);
        newEdge.extraTextPadding = 15;
        if (edge.isMarked()) {
            newEdge.markOrUnmark(4);
            if (edge.directed) {
                node2.circle.style.fill = "rgb(25, 25, 25)";
            }
        }
        newEdge.render(0, 1);
        newEdge.setColor("#ffffff");

        svg.addEventListener("click", function() {
            edge.markOrUnmark();
            graphEditor.edgesStateHandler.render();
            graphEditor.onNodesOrEdgesStateChange();
        });

        const cell = createTableCellDiv();
        cell.appendChild(svg);
        return cell;
    }
}

class EdgesWeightsColumn extends ColumnInterface {
    buildHeader(graphEditor, graphTextarea) {
        const button = document.createElement("button");
        button.setAttribute("class", "nodes-button");
        button.innerText = "Вес";

        button.addEventListener("click", function() {
            var anyHiddenWeight = false;
            graphEditor.edgesStateHandler.edges.forEach(edge => {
                anyHiddenWeight |= edge.isWeightHidden();
            });
            graphEditor.edgesStateHandler.edges.forEach(edge => {
                if (anyHiddenWeight) {
                    edge.showWeight();
                } else {
                    edge.hideWeight();
                }
            });
            graphEditor.edgesStateHandler.render();
            graphEditor.onNodesOrEdgesStateChange();
        });

        return button;
    }

    build(edge, graphEditor, graphTextarea) {
        const textarea = document.createElement("textarea");
        textarea.setAttribute("class", "nodes-textarea");
        textarea.innerText = edge.weight;
        textarea.style.width = 30;

        textarea.addEventListener("change", function() {
            graphTextarea.changeWeight(edge.node1.label, edge.node2.label, edge.weight, textarea.value);
        });

        function onCheckboxClick(checkbox) {
            if (checkbox.checked) {
                edge.showWeight();
            } else {
                edge.hideWeight();
            }
            graphEditor.edgesStateHandler.render();
            graphEditor.onNodesOrEdgesStateChange();
        }
        const checkboxId = generateEdgeInfoRowId(edge.node1.label, edge.node2.label, edge.weight) + "-" + randomInt(0, 1000000000) + "-label-button";
        const checkbox = createCheckbox(checkboxId, !edge.isWeightHidden(), onCheckboxClick);

        const cell = createTableCellDiv();
        cell.appendChild(textarea);
        checkbox.style.marginLeft = "5px";
        cell.appendChild(checkbox);
        return cell;
    }
}

class EdgesColorColumn extends ColumnInterface {
    buildHeader(graphEditor, graphTextarea) {
        const {input, inputContainer} = createColorInput();
        if (graphEditor.edgesStateHandler.edges.length > 0) {
            const colors = [];
            graphEditor.edgesStateHandler.edges.forEach(edge => {
                colors.push(edge.getColor());
            });
            input.value = findMajority(colors, input.value);
        }

        input.addEventListener("change", function() {
            graphEditor.edgesStateHandler.edges.forEach(edge => {
                edge.setColor(input.value);
            });
            graphEditor.onNodesOrEdgesStateChange();
        });

        const cell = createHighlightedTableCellDiv();
        cell.innerText = "Цвет";
        cell.appendChild(inputContainer);
        return cell;
    }

    build(edge, graphEditor, graphTextarea) {
        const {input, inputContainer} = createColorInput();
        input.value = edge.getColor();
        input.addEventListener("change", function() {
            edge.setColor(input.value);
            graphEditor.onNodesOrEdgesStateChange();
        });

        const cell = createTableCellDiv();
        cell.appendChild(inputContainer);
        return cell;
    }
}

class EdgesDirectionColumn extends ColumnInterface {
    buildHeader(graphEditor, graphTextarea) {
        const button = document.createElement("button");
        button.setAttribute("class", "nodes-button");
        button.innerHTML = "<span style='font-size:20px'>&#8646;</span>";
        button.style.width = "40px";

        button.addEventListener("click", function() {
            var anyUndirectedEdge = false;
            graphEditor.edgesStateHandler.edges.forEach(edge => {
                anyUndirectedEdge |= !edge.directed;
            });
            graphEditor.edgesStateHandler.edges.forEach(edge => {
                if (anyUndirectedEdge) {
                    edge.directed = true;
                } else {
                    edge.directed = false;
                }
            });
            graphEditor.edgesStateHandler.render();
            graphEditor.onNodesOrEdgesStateChange();
        });

        return button;
    }

    build(edge, graphEditor, graphTextarea) {
        function onCheckboxClick(checkbox) {
            if (checkbox.checked) {
                edge.directed = true;
            } else {
                edge.directed = false;
            }
            graphEditor.edgesStateHandler.render();
            graphEditor.onNodesOrEdgesStateChange();
        }
        const checkboxId = generateEdgeInfoRowId(edge.node1.label, edge.node2.label, edge.weight) + "-" + randomInt(0, 1000000000) + "-direction-button";
        const checkbox = createCheckbox(checkboxId, edge.directed, onCheckboxClick);

        const cell = createTableCellDiv();
        cell.appendChild(checkbox);
        return cell;
    }
}

export class EdgesStateListener extends BaseGraphStateListener {
    constructor(edgesDetails, graphTextarea) {
        super(edgesDetails, graphTextarea);
        super.columnsTypes = [new EdgesVisualizationColumn(),
                              new EdgesWeightsColumn()      ,
                              new EdgesColorColumn()        ,
                              new EdgesDirectionColumn()    ];
    }

    updateState(graphEditor) {
        const scroll = saveScroll();
        const numberOfEdges = graphEditor.edgesStateHandler.edges.length;
        super.clearTable(numberOfEdges);
        if (numberOfEdges > 0) {
            super.buildHeader(graphEditor);
            super.renderTable(graphEditor, graphEditor.edgesStateHandler.edges, function(edge) {
                return generateEdgeInfoRowId(edge.node1.label, edge.node2.label, edge.weight);
            });
        }
        restoreScroll(scroll);
    }
}
