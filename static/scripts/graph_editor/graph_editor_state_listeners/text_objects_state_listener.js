import { BaseGraphStateListener }        from "./base_state_listener.js";
import { ColumnInterface }               from "./base_state_listener.js";

import { createTableCellDiv }            from "./utils.js";
import { createHighlightedTableCellDiv } from "./utils.js";
import { createColorInput }              from "./utils.js";
import { findMajority }                  from "./utils.js";
import { isInt }                         from "../utils.js";

class TextObjectsDataColumn extends ColumnInterface {
    buildHeader(graphEditor, graphTextarea) {
        const cell = createHighlightedTableCellDiv();
        cell.innerText = "Значение";
        return cell;
    }

    build(object, graphEditor, graphTextarea) {
        const textarea = document.createElement("textarea");
        textarea.setAttribute("class", "nodes-textarea");
        textarea.innerText = object.content();
        textarea.style.width = "75px";

        textarea.addEventListener("change", function() {
            object.setText(textarea.value);
            graphEditor.renderObjects();
        });

        const cell = createTableCellDiv();
        cell.appendChild(textarea);
        return cell;
    }
}

class TextObjectsColorColumn extends ColumnInterface {
    buildHeader(graphEditor, graphTextarea) {
        const {input, inputContainer} = createColorInput();
        if (graphEditor.objectsStateHandler.objects.size > 0) {
            const colors = [];
            graphEditor.objectsStateHandler.objects.forEach(object => {
                colors.push(object.getColor());
            });
            input.value = findMajority(colors, input.value);
        }

        input.addEventListener("change", function() {
            graphEditor.objectsStateHandler.objects.forEach(object => {
                object.setColor(input.value);
            });
            graphEditor.onObjectsStateChange();
        });

        const cell = createHighlightedTableCellDiv();
        cell.innerText = "Цвет";
        cell.appendChild(inputContainer);
        return cell;
    }

    build(object, graphEditor, graphTextarea) {
        const {input, inputContainer} = createColorInput();
        input.value = object.getColor();
        input.addEventListener("change", function() {
            object.setColor(input.value);
            graphEditor.onObjectsStateChange();
        });

        const cell = createTableCellDiv();
        cell.appendChild(inputContainer);
        return cell;
    }
}

class TextObjectsPinColumn extends ColumnInterface {
    buildHeader(graphEditor, graphTextarea) {
        const cell = createHighlightedTableCellDiv();
        cell.style.width = "35px";
        cell.innerText = "Pin";
        return cell;
    }

    build(object, graphEditor, graphTextarea) {
        const textarea = document.createElement("textarea");
        textarea.setAttribute("class", "nodes-textarea");
        if (object.isPinned()) {
            textarea.value = object.pinnedNode.label;
        }

        textarea.addEventListener("change", function() {
            const node = graphEditor.nodesStateHandler.get(textarea.value);
            if (node != null) {
                object.pinTo(node);
                graphEditor.renderObjects();
            }
        });

        const cell = createTableCellDiv();
        cell.appendChild(textarea);
        return cell;
    }
}

class TextObjectsAngleColumn extends ColumnInterface {
    buildHeader(graphEditor, graphTextarea) {
        const cell = createHighlightedTableCellDiv();
        cell.style.width = "40px";
        cell.innerText = "Угол";
        return cell;
    }

    build(object, graphEditor, graphTextarea) {
        const textarea = document.createElement("textarea");
        textarea.setAttribute("class", "nodes-textarea");
        if (object.pinAngle != null) {
            textarea.value = object.pinAngle;
        }

        function changeAngle() {
            if (isInt(textarea.value)) {
                object.setPinAngle(parseInt(textarea.value));
            } else {
                object.setPinAngle(null);
            }
            graphEditor.renderObjects();
        }
        
        changeAngle();
        textarea.addEventListener("change", changeAngle);

        const cell = createTableCellDiv();
        cell.appendChild(textarea);
        return cell;
    }
}

class TextObjectsDeleteColumn extends ColumnInterface {
    buildHeader(graphEditor, graphTextarea) {
        const button = this.createDeleteButton();
        button.addEventListener("click", function() {
            graphEditor.objectsStateHandler.deleteAllObjects();
            graphEditor.onObjectsStateChange();
        });
        return button
    }

    build(object, graphEditor, graphTextarea) {
        const button = this.createDeleteButton();
        button.addEventListener("click", function() {
            graphEditor.objectsStateHandler.deleteObject(object);
            graphEditor.onObjectsStateChange();
        });
        return button
    }

// Private:
    createDeleteButton() {
        const img = document.createElement("img");
        img.setAttribute("class", "play-pause-image");
        img.src = "/images/trash_bin.png";
        
        const button = document.createElement("button");
        button.setAttribute("class", "nodes-button");
        button.style.width = "30px";
        button.appendChild(img);
        return button;
    }
}

export class TextObjectsStateListener extends BaseGraphStateListener {
    constructor(textObjectsDetails, graphTextarea) {
        super(textObjectsDetails, graphTextarea);
        super.columnsTypes = [new TextObjectsDataColumn()  ,
                              new TextObjectsColorColumn() ,
                              new TextObjectsPinColumn()   ,
                              new TextObjectsAngleColumn() ,
                              new TextObjectsDeleteColumn()];
    }

    updateState(graphEditor) {
        super.saveScroll();
        const numberOfObjects = graphEditor.objectsStateHandler.objects.size;
        super.clearTable(numberOfObjects);
        if (numberOfObjects > 0) {
            super.buildHeader(graphEditor);
            super.renderTable(graphEditor, graphEditor.objectsStateHandler.sortedObjects(), function(object) {
                return "useless-for-now-id";
            });
        }
        super.restoreScroll();
    }
}
