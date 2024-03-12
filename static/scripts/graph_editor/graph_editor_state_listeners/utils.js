import { Node } from "../node.js";

export function createTableCellDiv() {
    const cell = document.createElement("div");
    cell.setAttribute("class", "table-cell-div");
    return cell;
}

export function createHighlightedTableCellDiv() {
    const cell = document.createElement("div");
    cell.setAttribute("class", "highlighted-table-cell-div");
    return cell;
}

export function createCheckbox(id, checked, onclick) {
    const input = document.createElement("input");
    input.setAttribute("type", "checkbox");
    input.setAttribute("id", id);
    input.style.opacity = 0;
    input.checked = checked;
    input.addEventListener("click", function() { onclick(input); });

    const label = document.createElement("label");
    label.setAttribute("for", id);

    const div = document.createElement("div");
    div.setAttribute("class", "node-checkbox-input-div");
    div.appendChild(input);
    div.appendChild(label);
    return div;
}

export function cloneNode(node, group, boundingBox) {
    const newNode = new Node(node.label, 13, group, boundingBox, 12);
    if (node.isMarked()) {
        newNode.markOrUnmark(4);
    }
    newNode.fixNodeForInfoDisplaying();
    newNode.node.style.cursor = "default";
    return newNode;
}

export function createColorInput() {
    const inputContainer = document.createElement("div");
    inputContainer.setAttribute("class", "color-input-div");
    const input = document.createElement("input");
    input.setAttribute("type", "color");
    inputContainer.appendChild(input);
    return {input: input, inputContainer: inputContainer}
}

export function saveScroll() {
    return {top: window.scrollY, left: window.scrollX};
}

export function restoreScroll(savedScroll) {
    window.scrollTo(savedScroll);
}

export function parseColorToHex(color) {
    if (!color.startsWith("rgb")) {
        return color;
    }
    return '#' + color.match(/\d+/g).map(x => (+x).toString(16).padStart(2, 0)).join``;
}

export function findMajority(elements, defaultValue) {
    const frequencies = new Map();
    elements.forEach(element => {
        frequencies.set(element, (frequencies.has(element) ? frequencies.get(element) : 0) + 1);
    });

    var maxFrequency = 0;
    var majority = defaultValue;
    frequencies.forEach((freqency, value) => {
        if (maxFrequency < freqency) {
            maxFrequency = freqency;
            majority = value;
        }
    });

    return majority;
}
