import { Edge }                from "./edge.js";
import { EdgesStateHandler }   from "./edges_state_handler.js"
import { EdgesStateListener }  from "./graph_editor_state_listeners/edges_state_listener.js";
import { Point }               from "./geometry.js";
import { SVG_NAMESPACE }       from "./svg_namespace.js";
import { Node }                from "./node.js";
import { NodesStateHandler }   from "./nodes_state_handler.js";
import { NodesStateListener }  from "./graph_editor_state_listeners/nodes_state_listener.js";
import { ObjectBase }          from "./objects/object_base.js";
import { ObjectsStateHandler } from "./objects_state_handler.js";
import { uniteBoundingBoxes }  from "./utils.js";

const DEFAULT_RADIUS = 20;
const DEFAULT_FONT_SIZE = 16;
const ANIMATION_DELAY = 10; // ms

export class GraphEditor {
    /*
    Variables:
    svg:                 html <svg> object
    width:               int
    height:              int
    nodesStateHandler:   NodesStateHandler
    edgesStateHandler:   EdgesStateHandler
    objectsStateHandler: ObjectsStateHandler
    */

    constructor(svg) {
        this.svg = svg;
        this.width = svg.width.baseVal.value;
        this.height = svg.height.baseVal.value;

        const nodesGroup = document.createElementNS(SVG_NAMESPACE, "g");
        const edgesGroup = document.createElementNS(SVG_NAMESPACE, "g");
        const objectsGroup = document.createElementNS(SVG_NAMESPACE, "g");
        svg.appendChild(edgesGroup);
        svg.appendChild(nodesGroup);
        svg.appendChild(objectsGroup);

        this.#radius = DEFAULT_RADIUS;
        this.#fontSize = DEFAULT_FONT_SIZE;

        const nodesBox = this.getNodesBoundingBox();
        this.nodesStateHandler = new NodesStateHandler(nodesBox, nodesGroup);
        this.edgesStateHandler = new EdgesStateHandler(edgesGroup, this.nodesStateHandler);
        this.objectsStateHandler = new ObjectsStateHandler(nodesBox, objectsGroup);

        this.#selectedNode = null;
        this.#selectedNodeMoved = false;
        this.#selectionPaused = false;
        this.#selectedObject = null;
        this.#allEdgesAreDirected = false;

        this.updateRadius();
        this.updateFontSize();

        this.registerListeners();
        this.rearrangeNodes();

        this.#nodesStateListener = null;
        this.#edgesStateListener = null;
        this.#textObjectsStateListener = null;

        this.#isPlaying = false;
        this.#betterArrangement = null;
        this.#edgesRendering = false;
        this.#objectsRendering = false;
        this.#playButton = null;
        this.#pauseButton = null;
        this.#darkModeColor = null;
    }

    resize(newWidth, newHeight) {
        this.width = newWidth;
        this.height = newHeight;
        this.svg.setAttribute("width", this.width);
        this.svg.setAttribute("height", this.height);

        const box = this.getNodesBoundingBox();
        this.nodesStateHandler.resize(box);
        this.objectsStateHandler.resize(box);
        this.renderEdgesAndObjects();
    }

    reset() {
        this.#radius = DEFAULT_RADIUS;
        this.#fontSize = DEFAULT_FONT_SIZE;
        this.updateRadius();
        this.updateFontSize();
        this.rearrangeNodes();
        this.onNodesOrEdgesStateChange();
    }

    increaseNodesRadiusBy(value) {
        if (this.#radius + value >= 0) {
            this.#radius += value;
            this.updateRadius();
            this.onNodesOrEdgesStateChange();
        }
    }

    increaseFontSizeBy(value) {
        if (this.#fontSize + value >= 0) {
            this.#fontSize += value;
            this.updateFontSize();
            this.onNodesOrEdgesStateChange();
        }
    }

    directAllEdges(directed) {
        this.#allEdgesAreDirected = directed;
        this.edgesStateHandler.directAllEdges(directed);
        this.onNodesOrEdgesStateChange();
        this.renderEdges();
    }

    registerNodesStateListener(nodesStateListener) {
        this.#nodesStateListener = nodesStateListener;
    }

    registerEdgesStateListener(edgesStateListener) {
        this.#edgesStateListener = edgesStateListener;
    }

    registerTextObjectsStateListener(textObjectsStateListener) {
        this.#textObjectsStateListener = textObjectsStateListener;
    }

    updateNodesAndEdges(newNodes, newEdges) {
        if (this.#allEdgesAreDirected) {
            newEdges.forEach(edge => {
                edge.directed = true;
            });
        }
        var updated = this.nodesStateHandler.updateNodesSet(newNodes, this.#darkModeColor);
        updated |= this.edgesStateHandler.updateEdgesSet(newEdges, this.#darkModeColor != null);
        this.onNodesOrEdgesStateChange();
        if (updated) {
            this.play();
        }
    }

    isPlaying() {
        return this.#isPlaying;
    }

    play() {
        if (this.#playButton == null) {
            return;
        }
        this.buildBetterArrangement();
        if (this.isPlaying()) {
            return;
        }
        this.#isPlaying = true;
        this.#playButton.style.display = "none";
        this.#pauseButton.style.display = "";
        this.startPlaying();
    }

    pause() {
        if (!this.isPlaying()) {
            return;
        }
        this.#isPlaying = false;
        this.#pauseButton.style.display = "none";
        this.#playButton.style.display = "";
        this.renderEdgesAndObjects();
    }

    skipAnimation() {
        this.buildBetterArrangement();
        this.nodesStateHandler.applyArrangement(this.#betterArrangement.getArrangement(), true);
        this.renderEdgesAndObjects(true);
    }

    registerPlayPauseButtons(playButton, pauseButton) {
        this.#playButton = playButton;
        this.#pauseButton = pauseButton;
        const editor = this;
        playButton.addEventListener("click", function() {
            editor.edgesStateHandler.regenerateSeed();
            editor.play();
        });
        pauseButton.addEventListener("click", function() {
            editor.pause();
        });
    }

    registerSkipAnimationButton(skipAnimationButton) {
        const editor = this;
        skipAnimationButton.addEventListener("click", function() {
            editor.edgesStateHandler.regenerateSeed();
            editor.skipAnimation();
        });
    }

    registerNewTextObjectButton(newTextObjectButton) {
        const editor = this;
        newTextObjectButton.addEventListener("click", function(evt) {
            evt.preventDefault();
            editor.objectsStateHandler.createNewTextObject();
            editor.onObjectsStateChange();
        });
    }

    onNodesOrEdgesStateChange() {
        if (this.#nodesStateListener) {
            this.#nodesStateListener.updateState(this);
        }
        if (this.#edgesStateListener) {
            this.#edgesStateListener.updateState(this);
        }
    }

    onObjectsStateChange() {
        if (this.#textObjectsStateListener) {
            this.#textObjectsStateListener.updateState(this);
        }
    }

    setDarkMode(color) {
        this.#darkModeColor = color;
        this.nodesStateHandler.setDarkMode(color);
        this.edgesStateHandler.setDarkMode();
        this.objectsStateHandler.setDarkMode();
        this.onNodesOrEdgesStateChange();
        this.onObjectsStateChange();
    }

    setLightMode() {
        this.#darkModeColor = null;
        this.nodesStateHandler.setLightMode();
        this.edgesStateHandler.setLightMode();
        this.objectsStateHandler.setLightMode();
        this.onNodesOrEdgesStateChange();
        this.onObjectsStateChange();
    }

    updateArrangementBuilder(newArrangementBuilder) {
        this.nodesStateHandler.arrangementsBuilder.mode = newArrangementBuilder;
        this.play();
    }

    getBoundingBox() {
        const nodesBoundingBox = this.nodesStateHandler.getBoundingBox();
        const edgesBoundingBox = this.edgesStateHandler.getBoundingBox();
        const objectsBoundingBox = this.objectsStateHandler.getBoundingBox();
        var union = uniteBoundingBoxes(nodesBoundingBox, edgesBoundingBox);
        union = uniteBoundingBoxes(union, objectsBoundingBox);
        if (union == null) {
            return {x: 0, y: 0, width: 1, height: 1};
        }

        const EXTRA_PADDING = 10;
        union.x -= EXTRA_PADDING;
        union.y -= EXTRA_PADDING;
        union.width += 2 * EXTRA_PADDING;
        union.height += 2 * EXTRA_PADDING;
        return union;
    }

    shiftNodesBy(vector) {
        this.nodesStateHandler.shiftNodesBy(vector);
        this.renderEdgesAndObjects(true);
    }

    encodeJson() {
        return {
            nodes: this.nodesStateHandler.encodeJson(),
            edges: this.edgesStateHandler.encodeJson(),
        };
    }

    decodeJson(data, editor) {
        const nodes = data['nodes'];
        const edges = data['edges'];
        const darkMode = this.#darkModeColor != null;
        this.nodesStateHandler.decodeJson(nodes, darkMode);
        this.edgesStateHandler.decodeJson(edges, darkMode);

        var newTextareaValue = "";
        edges.forEach(edge => {
            newTextareaValue += edge['v'] + ' ' + edge['u'];
            if (edge['w']) {
                newTextareaValue += ' ' + edge['w'];
            }
            newTextareaValue += '\n';
        });

        nodes.forEach(node => {
            newTextareaValue += node['l'] + '\n';
        });

        editor.changeValue(newTextareaValue);
    }

// Private:
    #radius;                   // int
    #fontSize;                 // int
    #selectedNode;             // Node or null
    #selectedNodeMoved;        // bool
    #selectionPaused;          // bool
    #selectedObject;           // BaseObject or null
    #allEdgesAreDirected;      // bool
    
    #nodesStateListener;       // NodesStateListener
    #edgesStateListener;       // EdgeStateListener
    #textObjectsStateListener; // TextObjectsStateListener

    #isPlaying;                // bool
    #betterArrangement;        // ArrangementInterface or null
    #edgesRendering;           // bool
    #objectsRendering;         // bool
    #playButton;               // html <button> element
    #pauseButton;              // html <button> element
    #darkModeColor;            // string or null

    buildBetterArrangement() {
        this.#betterArrangement = this.nodesStateHandler.betterNodesArrangement(this.edgesStateHandler);
    }
    
    getNodesBoundingBox() {
        const PADDING = 5;
        const minX = this.#radius + PADDING;
        const maxX = this.width - this.#radius - PADDING;
        const minY = this.#radius + PADDING;
        const maxY = this.height - this.#radius - PADDING;
        return {minX: minX, maxX: maxX, minY: minY, maxY: maxY};
    }

    getMousePosition(evt) {
        var ctm = this.svg.getScreenCTM();
        return new Point((evt.clientX - ctm.e) / ctm.a, (evt.clientY - ctm.f) / ctm.d);
    }

    handleStartDragNode(nodeElement, evt) {
        this.#selectedNode = this.nodesStateHandler.get(nodeElement.id);
        this.#selectedNodeMoved = false;
        this.#selectedNode.setMousePosition(this.getMousePosition(evt));
        if (this.isPlaying()) {
            this.pause();
            this.#selectionPaused = true;
        }
    }

    handleStartDragObject(nodeElement, evt) {
        this.#selectedObject = this.objectsStateHandler.get(nodeElement.id);
        this.#selectedObject.setMousePosition(this.getMousePosition(evt));
    }

    startDrag(evt) {
        const parentElement = evt.target.parentElement;
        if (parentElement.tagName != 'g') {
            return;
        }
        if (parentElement.classList.contains("node")) {
            this.handleStartDragNode(parentElement, evt);
        } else if (parentElement.classList.contains("object")) {
            this.handleStartDragObject(parentElement, evt);
        }
    }

    drag(evt) {
        if (this.#selectedNode != null) {
            evt.preventDefault();
            this.#selectedNode.drag(this.getMousePosition(evt));
            this.#selectedNodeMoved = true;
            if (!this.#edgesRendering) {
                this.#edgesRendering = true;
                this.renderEdges();
            }
            if (!this.#objectsRendering) {
                this.#objectsRendering = true;
                this.renderObjects();
            }
        } else if (this.#selectedObject != null) {
            evt.preventDefault();
            this.#selectedObject.drag(this.getMousePosition(evt));
            this.onObjectsStateChange();
        }
    }

    endDrag() {
        if (this.#selectedObject != null) {
            this.#selectedObject = null;
            this.onObjectsStateChange();
            return;
        }

        if (!this.#selectedNodeMoved && this.#selectedNode) {
            this.#selectedNode.markOrUnmark();
            this.onNodesOrEdgesStateChange();
        }
        this.#selectedNode = null;
        if (this.#selectionPaused) {
            this.#selectionPaused = false;
            this.play();
        }
    }

    registerListeners() {
        const editor = this;
        this.svg.addEventListener("mousedown", function(evt) {
            editor.startDrag(evt);
        });
        this.svg.addEventListener("mousemove", function(evt) {
            editor.drag(evt);
        });
        this.svg.addEventListener("mouseup", function(evt) {
            editor.endDrag(evt);
        });
        this.svg.addEventListener("mouseleave", function(evt) {
            editor.endDrag(evt);
        });
    }

    rearrangeNodes() {
        this.nodesStateHandler.rearrangeNodes();
        this.renderEdgesAndObjects(true);
    }

    updateRadius() {
        this.nodesStateHandler.setRadius(this.#radius);
        this.renderEdgesAndObjects();
    }

    updateFontSize() {
        this.nodesStateHandler.setFontSize(this.#fontSize);
        this.edgesStateHandler.setFontSize(this.#fontSize);
        this.objectsStateHandler.setFontSize(this.#fontSize);
    }

    startPlaying() {
        if (!this.isPlaying() || !this.#betterArrangement) {
            return;
        }
        var done = this.#betterArrangement.prettify();
        done &= this.nodesStateHandler.applyArrangement(this.#betterArrangement.getArrangement());
        this.edgesStateHandler.render();
        this.objectsStateHandler.render();

        if (done) {
            this.pause();
        } else {
            const editor = this;
            setTimeout(function() {
                editor.startPlaying();
            }, ANIMATION_DELAY);
        }
    }

    renderEdgesAndObjects(force=false) {
        if (!force && this.isPlaying()) {
            return;
        }
        this.renderObjects(force);
        this.renderEdges(force);
    }

    renderObjects(force=false) {
        if (!this.objectsStateHandler.render(force)) {
            const editor = this;
            setTimeout(function() {
                editor.renderObjects();
            }, ANIMATION_DELAY);
        } else {
            this.#objectsRendering = false;
        }
    }

    renderEdges(force=false) {
        if (!this.edgesStateHandler.render(force)) {
            const editor = this;
            setTimeout(function() {
                editor.renderEdges();
            }, ANIMATION_DELAY);
        } else {
            this.#edgesRendering = false;
        }
    }
}
