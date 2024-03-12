import { GraphEditor } from "./graph_editor.js";

const MIN_HEIGHT = 200;

export class GraphEditorResizer {
    /*
    Variables:
    offsetY: int or null
    */

    constructor(resizeDiv, graphEditor) {
        this.offsetY = null;
        const resizer = this;

        resizeDiv.addEventListener("mousedown", function(evt) {
            resizer.offsetY = evt.pageY;
        });

        window.addEventListener("mousemove", function(evt) {
            if (resizer.offsetY == null) {
                return;
            }
            const newHeight = Math.max(MIN_HEIGHT, graphEditor.height + evt.pageY - resizer.offsetY);
            graphEditor.resize(graphEditor.width, newHeight);
            graphEditor.play();
            resizer.offsetY = evt.pageY;
        });

        window.addEventListener("mouseup", function(evt) {
            resizer.offsetY = null;
        });
    }
}
