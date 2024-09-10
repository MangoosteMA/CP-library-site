import { TextColoring }      from "./text_coloring.js";
import { InputPreprocessor } from "./input_preprocessor.js";

export class Editor {
    /*
    Variables:
    textarea:          html <textarea> object
    background:        html <div> object
    linesHolder:       html <div> object
    textColoring:      TextColoring
    inputPreprocessor: InputPreprocessor
    */

    constructor(textarea, background, linesHolder, textColoring, inputPreprocessor) {
        this.textarea = textarea;
        this.background = background;
        this.linesHolder = linesHolder;
        this.textColoring = textColoring;
        this.inputPreprocessor = inputPreprocessor;
        this.build();

        const editor = this;
        textarea.addEventListener("input", function(event) {
            editor.inputPreprocessor.processInput(editor.textarea, event)
            editor.build();
        });

        function syncScroll(scrollLeft, scrollTop) {
            [textarea, background, linesHolder].forEach(element => {
                element.scrollLeft = scrollLeft;
                element.scrollTop = scrollTop;
            });
        }

        [textarea, background, linesHolder].forEach(element => {
            element.addEventListener("scroll", () => {
                syncScroll(element.scrollLeft, element.scrollTop);
            });
        });
    }

    build() {
        this.buildBackgroundHtml();
        this.buildLinesHtml();
    }

// Private:
    replaceAllHtmlSpecialSymbols() {
        var text = this.textarea.value;
        text = text.replaceAll("&", "&amp;")
        text = text.replaceAll("<", "&lt;")
        text = text.replaceAll(">", "&gt;")
        text = text.replaceAll('"', "&quot;")
        text = text.replaceAll('\'', "&#x27;")
        return text;
    }

    buildBackgroundHtml() {
        const text = this.textColoring.applyAllRulesTo(this.replaceAllHtmlSpecialSymbols());
        const newBackground = document.createElement("div");

        text.split("\n").forEach(line => {
            const div = document.createElement("div");
            if (line.length == 0) {
                div.innerHTML = "<br>";
            } else {
                div.innerHTML = line;
            }
            newBackground.appendChild(div);
        });

        this.background.innerHTML = newBackground.innerHTML;
    }

    buildLinesHtml() {
        const newLines = document.createElement("div");

        this.background.childNodes.forEach((child, index) => {
            const div = document.createElement("div");
            div.innerText = index + 1;
            div.style.height = child.getBoundingClientRect().height + "px";
            div.style.textAlign = "right";
            div.style.paddingRight = "5px";
            newLines.appendChild(div);
        });

        this.linesHolder.innerHTML = newLines.innerHTML;
    }
}
