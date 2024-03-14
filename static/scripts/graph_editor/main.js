// Create graph Editor
import { GraphEditor } from "./graph_editor.js";
const mainSvg = document.getElementById("svg");
var graphEditor = null;
if (mainSvg) {
    graphEditor = new GraphEditor(mainSvg);
}

// Create edges textareas
import { Editor }                      from "./editor.js";
import { NodesAndEdgesEditorListener } from "./nodes_and_edges_parser.js";

const edgesTextarea = document.getElementById("edges-textarea");
const edgesTextareaBackgound = document.getElementById("edges-textarea-background");
const edgesLinesDiv = document.getElementById("edges-lines-div");
const edgesSettingsDiv = document.getElementById("edges-settings-div");

const nodesAndEdgesEditorListener = new NodesAndEdgesEditorListener(graphEditor);
var graphTextarea = null;
if (edgesTextarea && edgesTextareaBackgound) {
    graphTextarea = new Editor(edgesTextarea, edgesTextareaBackgound, edgesLinesDiv, edgesSettingsDiv, nodesAndEdgesEditorListener);
}

// Handle window resizing
const svgDiv = document.getElementById("main-svg-div");

function resizeGraphEditor() {
    const minWidth = 500;
    const newHeight = graphEditor.height; // Do not change height
    graphEditor.resize(0, newHeight);
    const newWidth = Math.max(minWidth, svgDiv.clientWidth - svgDiv.clientTop);
    graphEditor.resize(newWidth, newHeight);
    graphEditor.play();
}
window.addEventListener("load", resizeGraphEditor);
window.addEventListener("resize", resizeGraphEditor);

// Register reset button
const resetButton = document.getElementById("reset-button")
if (resetButton) {
    resetButton.addEventListener("click", function() {
        graphEditor.reset();
    });
}

// Register decrease/increase radius buttons
const decreaseRadiusButton = document.getElementById("decrease-radius-button");
const increaseRadiusButton = document.getElementById("increase-radius-button");
if (decreaseRadiusButton && increaseRadiusButton) {
    decreaseRadiusButton.addEventListener("click", function() {
        graphEditor.increaseNodesRadiusBy(-1);
        graphEditor.increaseFontSizeBy(-1);
    });
    increaseRadiusButton.addEventListener("click", function() {
        graphEditor.increaseNodesRadiusBy(1);
        graphEditor.increaseFontSizeBy(1);
    });
}

// Register decrease/increase font-size buttons
const decreaseFontSizeButton = document.getElementById("decrease-font-size-button");
const increaseFontSizeButton = document.getElementById("increase-font-size-button");
if (decreaseFontSizeButton && increaseFontSizeButton) {
    decreaseFontSizeButton.addEventListener("click", function() {
        graphEditor.increaseFontSizeBy(-1);
    });
    increaseFontSizeButton.addEventListener("click", function() {
        graphEditor.increaseFontSizeBy(1);
    });
}

// Register decrease/increase nodes indexes buttons
const decreaseNodesButton = document.getElementById("decrease-nodes-button");
const increaseNodesButton = document.getElementById("increase-nodes-button");
if (decreaseNodesButton && increaseNodesButton) {
    decreaseNodesButton.addEventListener("click", function() {
        graphTextarea.changeNodesIndexesBy(-1);
    });
    increaseNodesButton.addEventListener("click", function() {
        graphTextarea.changeNodesIndexesBy(1);
    });
}

// Register direction/undirection buttons
const makeDirectedButton = document.getElementById("make-directed-button");
const removeDirectionButton = document.getElementById("remove-direction-button");
if (makeDirectedButton && removeDirectionButton) {
    makeDirectedButton.addEventListener("click", function() {
        graphEditor.directAllEdges(true);
    });
    removeDirectionButton.addEventListener("click", function() {
        graphEditor.directAllEdges(false);
    });
}

// Register play/pause buttons
const playButton = document.getElementById("play-button");
const pauseButton = document.getElementById("pause-button");
if (playButton && pauseButton) {
    graphEditor.registerPlayPauseButtons(playButton, pauseButton);
}

// Register skip animation button
const skipAnimationButton = document.getElementById("skip-animation-button");
if (skipAnimationButton) {
    graphEditor.registerSkipAnimationButton(skipAnimationButton);
}

// Register nodes state listeners
import { NodesStateListener } from "./graph_editor_state_listeners/nodes_state_listener.js";
const nodesDetails = document.getElementById("nodes-details");
if (nodesDetails) {
    const nodesStateListener = new NodesStateListener(nodesDetails, graphTextarea);
    graphEditor.registerNodesStateListener(nodesStateListener);
}

// Register edges state listeners
import { EdgesStateListener } from "./graph_editor_state_listeners/edges_state_listener.js";
const edgesDetails = document.getElementById("edges-details");
if (edgesDetails) {
    const edgesStateListener = new EdgesStateListener(edgesDetails, graphTextarea);
    graphEditor.registerEdgesStateListener(edgesStateListener);
}

// Register graph resizer
import { GraphEditorResizer } from "./graph_editor_resizer.js";
const resizerDiv = document.getElementById("graph-editor-resizer-div");
if (resizerDiv) {
    new GraphEditorResizer(resizerDiv, graphEditor);
}

// Register arrangement selection
import { ArrangementSelection } from "./arrangement_selection.js";
const arrangementDiv = document.getElementById("arrangement-selection-div");
const arrangementSelectionButton = document.getElementById("arrangements-selection-button");
if (arrangementDiv && arrangementSelectionButton) {
    new ArrangementSelection(arrangementDiv, arrangementSelectionButton, graphEditor);
}

// Register random graphs generator
import { RandomGraphsGenerator } from "./random_graphs_generator.js";
const randomGraphsDetails = document.getElementById("random-graphs-generation-details");
if (randomGraphsDetails) {
    new RandomGraphsGenerator(randomGraphsDetails, graphTextarea);
}

// Register dark-light mode switcher
import { getCookieValue } from "./utils.js";
const DARKMODE_COOKIE = "darkmode";

const darkModeButton = document.getElementById("dark-mode-button");
const lightModeButton = document.getElementById("light-mode-button");
if (darkModeButton && lightModeButton) {
    var changedElements = [];

    darkModeButton.addEventListener("click", function() {
        darkModeButton.style.display = "none";
        lightModeButton.style.display = "";
        svgDiv.style.backgroundColor = "rgb(25, 25, 25)";
        svgDiv.style.border = "1px solid rgb(225, 225, 225)";
        graphEditor.setDarkMode(svgDiv.style.backgroundColor);
        document.body.style.backgroundColor = "rgb(45, 48, 61)";

        const elements = document.getElementsByTagName("*");
        changedElements = [];
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const style = window.getComputedStyle(element);
            const shadow = style.getPropertyValue('box-shadow');
            if (shadow && shadow != "none") {
                changedElements.push({element: element, shadow: shadow});
                if (element.tagName == "NAV") {
                    element.style.boxShadow = "none";
                } else {
                    element.style.boxShadow = shadow.replace("rgba(0, 0, 0", "rgba(255, 255, 255");
                }
            }
        }
        document.cookie = DARKMODE_COOKIE + "=true";
    });

    lightModeButton.addEventListener("click", function() {
        lightModeButton.style.display = "none";
        darkModeButton.style.display = "";
        svgDiv.style.backgroundColor = "";
        svgDiv.style.border = ""
        graphEditor.setLightMode();
        document.body.style.backgroundColor = "";
        changedElements.forEach(value => {
            value.element.style.boxShadow = value.shadow;
        })
        document.cookie = DARKMODE_COOKIE + "=false";
    });

    window.addEventListener("load", function() {
        if (getCookieValue(DARKMODE_COOKIE) == "true") {
            darkModeButton.click();
        }
    });
}

// Register exports
import { exportToSvg } from "./exports/svg_export.js";
const svgExportButton = document.getElementById("export-to-svg-button");
if (svgExportButton) {
    svgExportButton.addEventListener("click", function() {
        exportToSvg(mainSvg, darkModeButton.style.display == "none");
    });
}
