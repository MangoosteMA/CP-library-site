// TODO: shift points by bounding box so svg is not too big

export function exportToSvg(svg, darkmodeOn) {
    const auxSvg = document.createElement("svg");
    auxSvg.innerHTML = svg.innerHTML;
    auxSvg.setAttribute("width", svg.getAttribute("width"));
    auxSvg.setAttribute("height", svg.getAttribute("height"));

    if (darkmodeOn) {
        const elements = auxSvg.getElementsByTagName("*");
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const TAGS = new Set(["CIRCLE", "TEXT", "PATH"]);
            if (TAGS.has(element.tagName)) {
                if (element.getAttribute("fill") == "#ffffff") {
                    element.setAttribute("fill", "#000000");
                }
                if (element.getAttribute("stroke") == "#ffffff") {
                    element.setAttribute("stroke", "#000000");
                }
            }
            if (element.tagName == "CIRCLE" && element.style.fill == "rgb(25, 25, 25)") {
                element.style.fill = "rgb(255, 255, 255)";
            }
        }
    }

    var serializer = new XMLSerializer();
    var source = serializer.serializeToString(auxSvg);
    source = source.replace("http://www.w3.org/1999/xhtml", "http://www.w3.org/2000/svg")
    source = '<?xml version="1.0" encoding="utf-8" standalone="no"?>\r\n' + source;

    const link = document.createElement("a");
    const file = new Blob([source], { type: "image/svg+xml" });
    link.href = URL.createObjectURL(file);
    link.download = "graph.svg";
    link.click();
    URL.revokeObjectURL(link.href);
}