import { Point }         from "./geometry.js";
import { SVG_NAMESPACE } from "./svg_namespace.js";

export class ExportsHandler {
    constructor(graphEditor, isDarkModeOn) {
        this.#graphEditor = graphEditor;
        this.#isDarkModeOn = isDarkModeOn;
    }

    registerExportToSvg(exportToSvgButton) {
        this.registerExportButton(exportToSvgButton, true, () => {
            this.exportToSvg();
        });
    }

    registerExportToPng(exportToPngButton) {
        this.registerExportButton(exportToPngButton, true, () => {
            this.exportToPng();
        });
    }

    registerExportToURL(exportToURLButton) {
        this.registerExportButton(exportToURLButton, false, () => {
            this.exportToURL();
        });
    }

// Private:
    #graphEditor;  // GraphEditor
    #isDarkModeOn; // function -> bool
    #boundingBox;  // {.x, .y, .width, .height}
    #shiftVector;  // Point

    prepareExport() {
        this.#boundingBox = this.#graphEditor.getBoundingBox(svg);
        this.#shiftVector = new Point(this.#boundingBox.x, this.#boundingBox.y);
        this.#graphEditor.shiftNodesBy(this.#shiftVector.scale(-1));
    }

    exportAftercare() {
        this.#graphEditor.shiftNodesBy(this.#shiftVector);
    }

    registerExportButton(button, prepare, handler) {
        const exportsHandler = this;
        button.addEventListener("click", () => {
            if (prepare) {
                exportsHandler.prepareExport();
            }
            handler();
            if (prepare) {
                exportsHandler.exportAftercare();
            }
        });
    }

    handleDarkMode(computedSvg) {
        const elements = computedSvg.getElementsByTagName("*");
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const TAGS = new Set(["circle", "text", "path", "ellipse"]);
            if (TAGS.has(element.tagName)) {
                if (element.getAttribute("fill") == "#ffffff") {
                    element.setAttribute("fill", "#000000");
                }
                if (element.getAttribute("stroke") == "#ffffff") {
                    element.setAttribute("stroke", "#000000");
                }
            }
            if (element.tagName == "circle" && element.style.fill == "rgb(25, 25, 25)") {
                element.style.fill = "rgb(255, 255, 255)";
            }
        }
    }

    getComputedSvg() {
        const computedSvg = this.#graphEditor.svg.cloneNode(true);
        computedSvg.setAttribute("width", this.#boundingBox.width);
        computedSvg.setAttribute("height", this.#boundingBox.height);
        if (this.#isDarkModeOn()) {
            this.handleDarkMode(computedSvg);
        }
        return computedSvg;
    }

    getSerializedSvg() {
        const computedSvg = this.getComputedSvg();
        return (new XMLSerializer()).serializeToString(computedSvg);
    }

    installFile(fileRef, extention) {
        const link = document.createElement("a");
        link.href = fileRef;
        link.download = "graph." + extention;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    exportToSvg() {
        var source = this.getSerializedSvg();
        source = source.replace("http://www.w3.org/1999/xhtml", SVG_NAMESPACE);
        source = '<?xml version="1.0" encoding="utf-8" standalone="no"?>\r\n' + source;
        const file = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
        this.installFile(URL.createObjectURL(file), "svg");
    }

    exportToPng() {
        const image = document.createElement("img");
        image.addEventListener("load", () => {
            let canvas = document.createElement("canvas");
            let context = canvas.getContext("2d");
            canvas.height = this.#boundingBox.height;
            canvas.width = this.#boundingBox.width;
            context.drawImage(image, 0, 0);
            this.installFile(canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream'), "png");
        });

        const source = this.getSerializedSvg();
        const file = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
        image.src = URL.createObjectURL(file);
    }

    exportToURL() {
        const object = this.#graphEditor.encodeJson();
        const graphData = JSON.stringify(object);
        const encoded = encodeURIComponent(graphData);
        navigator.clipboard.writeText(window.location.origin + window.location.pathname + "?data=" + encoded);
        alert("copied");
    }
}
