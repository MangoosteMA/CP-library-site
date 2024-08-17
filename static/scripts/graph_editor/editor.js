export class Editor {
    /*
    Variables:
    mainTextarea: html <textarea> object
    background:   html <textarea> object
    linesDiv:     html <textarea> object
    settingsDiv:  html <textarea> object
    listener:     NodesAndEdgesEditorListener (with methods startParsing(), parseLine(line, index), finishParsing() and changeNodesIndexesBy(value, line))
    */

    constructor(mainTextarea, background, linesDiv, settingsDiv, listener) {
        this.mainTextarea = mainTextarea;
        this.background = background;
        this.linesDiv = linesDiv;
        this.settingsDiv = settingsDiv;
        this.listener = listener;
        this.#selectedElements = [];
        this.renderInput();

        const editor = this;
        mainTextarea.addEventListener("input", function() {
            editor.renderInput();
        });
        document.addEventListener("selectionchange", function() {
            editor.highlightSlectedRow();
        });

        function syncScroll(scrollLeft, scrollTop) {
            [mainTextarea, background, linesDiv, settingsDiv].forEach(element => {
                element.scrollLeft = scrollLeft;
                element.scrollTop = scrollTop;
            });
        }

        [mainTextarea, background, linesDiv, settingsDiv].forEach(element => {
            element.addEventListener("scroll", function() {
                syncScroll(element.scrollLeft, element.scrollTop);
            });
        });
    }

    renameNode(label, newLabel) {
        const editor = this;
        editor.updateLines(function(line) {
            return editor.listener.renameNode(label, newLabel, line);
        });
    }

    changeNodesIndexesBy(value) {
        const editor = this;
        editor.updateLines(function(line) {
            return editor.listener.changeNodesIndexesBy(value, line);
        });
    }

    changeWeight(node1, node2, prevWeight, newWeight) {
        const editor = this;
        editor.updateLines(function(line) {
            return editor.listener.changeWeight(node1, node2, prevWeight, newWeight, line);
        }, true);
    }

    changeValue(newValue) {
        this.mainTextarea.value = newValue;
        this.renderInput();
    } 

// Private:
    #selectedElements; // list[html <div> object]

    renderInput() {
        const value = this.mainTextarea.value;
        const lines = value.split("\n");

        this.linesDiv.innerHTML = "";
        this.background.innerHTML = "";
        this.settingsDiv.innerHTML = "";

        this.listener.startParsing();
        lines.forEach((line, index) => {
            const lineIndexDiv = document.createElement("div");
            lineIndexDiv.style.textAlign = "right";
            lineIndexDiv.style.paddingRight = "5px";
            lineIndexDiv.innerText = index + 1;

            const lineContentDiv = document.createElement("div");
            lineContentDiv.style.width = "400%";
            lineContentDiv.style.paddingLeft = "5px";
            if (line.length == 0) {
                lineContentDiv.innerHTML = "<br>";
            } else {
                lineContentDiv.innerText = line;
            }

            var lineSettingsDiv = this.listener.parseLine(line, index);
            if (lineSettingsDiv == null) {
                lineSettingsDiv = document.createElement("div");
                lineSettingsDiv.innerText = "?";
                lineSettingsDiv.style.textAlign = "center";
            }

            this.linesDiv.appendChild(lineIndexDiv)
            this.background.appendChild(lineContentDiv);
            this.settingsDiv.appendChild(lineSettingsDiv);
        });
        this.listener.finishParsing();

        this.highlightSlectedRow();
    }

    removeRowHightLight() {
        if (this.#selectedElements.length == 0) {
            return;
        } 
        this.#selectedElements.forEach(element => {
            element.style.backgroundColor = "transparent";
        });
        this.#selectedElements = [];
    }

    highlightSlectedRow() {
        this.removeRowHightLight();
        if (document.activeElement != this.mainTextarea || this.mainTextarea.selectionStart != this.mainTextarea.selectionEnd) {
            return;
        }

        const rowIndex = this.mainTextarea.value.substring(0, this.mainTextarea.selectionStart).split("\n").length - 1;
        [this.linesDiv, this.background, this.settingsDiv].forEach(element => {
            if (element.children.length > rowIndex) {
                const div = element.children[rowIndex];
                div.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                this.#selectedElements.push(div);
            }
        });
    }

    updateLines(updateLine, breakOnChanged=false) {
        const data = this.mainTextarea.value;
        const lines = data.split("\n");
        const newLines = [];
        var updated = false;

        lines.forEach(line => {
            if (updated && breakOnChanged) {
                newLines.push(line);
            } else {
                const newLine = updateLine(line);
                updated = newLine != line;
                newLines.push(updateLine(line));
            }
        });

        this.changeValue(newLines.join("\n"));
    }
}
