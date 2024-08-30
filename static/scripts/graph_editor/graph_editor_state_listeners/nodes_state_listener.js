import { BaseGraphStateListener }        from "./base_state_listener.js";
import { ColumnInterface }               from "./base_state_listener.js";

import { createTableCellDiv }            from "./utils.js";
import { createHighlightedTableCellDiv } from "./utils.js";
import { createCheckbox }                from "./utils.js";
import { cloneNode }                     from "./utils.js";
import { createColorInput }              from "./utils.js";
import { parseColorToHex }               from "./utils.js";
import { findMajority }                  from "./utils.js";

import { Node }                          from "../node.js";
import { SVG_NAMESPACE }                 from "../svg_namespace.js";

export const NODE_INFO_ROW = "-node-info-row";

class NodesVisualizationColumn extends ColumnInterface {
    buildHeader(graphEditor, graphTextarea) {
        const button = document.createElement("button");
        button.setAttribute("class", "nodes-button");
        button.innerText = "Вершина";

        button.addEventListener("click", function() {
            var anyNotMarkedNode = false;
            graphEditor.nodesStateHandler.nodes.forEach(node => {
                anyNotMarkedNode |= !node.isMarked();
            });
            graphEditor.nodesStateHandler.nodes.forEach(node => {
                if (anyNotMarkedNode) {
                    if (!node.isMarked()) {
                        node.markOrUnmark();
                    }
                } else if (node.isMarked()) {
                    node.markOrUnmark();
                }
            });
            graphEditor.onNodesOrEdgesStateChange();
        });

        return button;
    }

    build(node, graphEditor, graphTextarea) {
        const svg = document.createElementNS(SVG_NAMESPACE, "svg");
        svg.setAttributeNS(null, "class", "nodes-data-svg");
        const radius = 13;
        const W = 2 * radius + 6;
        svg.setAttributeNS(null, "width", W);
        svg.setAttributeNS(null, "height", W);

        const group = document.createElementNS(SVG_NAMESPACE, "g");
        svg.appendChild(group);

        const boundingBox = {minX: W / 2, maxX: W / 2, minY: W / 2, maxY: W / 2};
        cloneNode(node, group, boundingBox);

        svg.addEventListener("click", function() {
            node.markOrUnmark();
            graphEditor.onNodesOrEdgesStateChange();
        });

        const cell = createTableCellDiv();
        cell.appendChild(svg);
        return cell;
    }
}

class NodesLabelsColumn extends ColumnInterface {
    buildHeader(graphEditor, graphTextarea) {
        const button = document.createElement("button");
        button.setAttribute("class", "nodes-button");
        button.innerText = "Метка";

        button.addEventListener("click", function() {
            var anyHiddenLabel = false;
            graphEditor.nodesStateHandler.nodes.forEach(node => {
                anyHiddenLabel |= node.isLabelHidden();
            });
            graphEditor.nodesStateHandler.nodes.forEach(node => {
                if (anyHiddenLabel) {
                    node.showLabel();
                } else {
                    node.hideLabel();
                }
            });
            graphEditor.onNodesOrEdgesStateChange();
        });

        return button;
    }

    build(node, graphEditor, graphTextarea) {
        const textarea = document.createElement("textarea");
        textarea.setAttribute("class", "nodes-textarea");
        textarea.innerText = node.label;
        textarea.style.width = 20;

        textarea.addEventListener("change", function() {
            graphTextarea.renameNode(node.label, textarea.value);
        });

        function onCheckboxClick(checkbox) {
            if (checkbox.checked) {
                node.showLabel();
            } else {
                node.hideLabel();
            }
        }
        const checkbox = createCheckbox(node.label + "-label-button", !node.isLabelHidden(), onCheckboxClick);

        const cell = createTableCellDiv();
        cell.appendChild(textarea);
        checkbox.style.marginLeft = "5px";
        cell.appendChild(checkbox);
        return cell;
    }
}

class NodesColorColumn extends ColumnInterface {
    buildHeader(graphEditor, graphTextarea) {
        const {input, inputContainer} = createColorInput();
        if (graphEditor.nodesStateHandler.nodes.size > 0) {
            const colors = [];
            graphEditor.nodesStateHandler.nodes.forEach(node => {
                colors.push(node.getColor());
            });
            input.value = findMajority(colors, input.value);
        }

        input.addEventListener("change", function() {
            graphEditor.nodesStateHandler.nodes.forEach(node => {
                node.setColor(input.value);
            });
            graphEditor.onNodesOrEdgesStateChange();
        });

        const cell = createHighlightedTableCellDiv();
        cell.innerText = "Цвет";
        cell.appendChild(inputContainer);
        return cell;
    }

    build(node, graphEditor, graphTextarea) {
        const {input, inputContainer} = createColorInput();
        input.value = node.getColor();
        input.addEventListener("change", function() {
            node.setColor(input.value);
            graphEditor.onNodesOrEdgesStateChange();
        });

        const cell = createTableCellDiv();
        cell.appendChild(inputContainer);
        return cell;
    }
}

class NodesBackgroundColumn extends ColumnInterface {
    buildHeader(graphEditor, graphTextarea) {
        const {input, inputContainer} = createColorInput();
        if (graphEditor.nodesStateHandler.nodes.size > 0) {
            const colors = [];
            graphEditor.nodesStateHandler.nodes.forEach(node => {
                colors.push(parseColorToHex(node.getBackgroundColor()));
            });
            input.value = findMajority(colors, input.value);
        }

        input.addEventListener("change", function() {
            graphEditor.nodesStateHandler.nodes.forEach(node => {
                node.setBackgroundColor(input.value);
            });
            graphEditor.onNodesOrEdgesStateChange();
        });

        const cell = createHighlightedTableCellDiv();
        cell.innerText = "Фон";
        cell.appendChild(inputContainer);
        return cell;
    }

    build(node, graphEditor, graphTextarea) {
        const {input, inputContainer} = createColorInput();
        input.value = parseColorToHex(node.getBackgroundColor());
        input.addEventListener("change", function() {
            node.setBackgroundColor(input.value);
            graphEditor.onNodesOrEdgesStateChange();
        });

        const cell = createTableCellDiv();
        cell.appendChild(inputContainer);
        return cell;
    }
}

export class NodesStateListener extends BaseGraphStateListener {
    constructor(nodesDetails, graphTextarea) {
        super(nodesDetails, graphTextarea);
        super.columnsTypes = [new NodesVisualizationColumn(),
                              new NodesLabelsColumn()       ,
                              new NodesColorColumn()        ,
                              new NodesBackgroundColumn()   ];
    }

    updateState(graphEditor) {
        super.saveScroll();
        const numberOfNodes = graphEditor.nodesStateHandler.nodes.size;
        super.clearTable(numberOfNodes);
        if (numberOfNodes > 0) {
            super.buildHeader(graphEditor);
            super.renderTable(graphEditor, graphEditor.nodesStateHandler.sortedNodes(), function(node) {
                return node.label + NODE_INFO_ROW;
            });
        }
        super.restoreScroll();
    }
}
