// Create text coloring rules
import { TextColoring } from "./text_coloring.js";
const textColoring = new TextColoring();

// Add special symbols coloring rule
import { KeyWordsColoringRule } from "./text_coloring_rules/key_words_coloring_rule.js";
textColoring.addRule(new KeyWordsColoringRule(["&lt;", "=", "&gt;", "+", "-", "&quot;", "&#x27;", "#"], "rgb(235,101,164)"));

// Add '$' coloring
textColoring.addRule(new KeyWordsColoringRule(["$"], "rgb(225,146,82)"));

// Add mtex key words coloring rule
textColoring.addRule(new KeyWordsColoringRule(["\\title", "\\code", "\\details",
                                               "\\link", "\\itemize", "\\item", "\\center"], "rgb(139,233,253)"));

// Add utf symbols coloring rule
textColoring.addRule(new KeyWordsColoringRule(["\\complexity", "\\implies", "\\qed"], "rgb(225,146,82)"));

// Add bracket coloring rule
import { BracketColoringRule } from "./text_coloring_rules/bracket_coloring_rule.js";
textColoring.addRule(new BracketColoringRule(["rgb(235,101,164)", "rgb(225,146,82)", "rgb(69,178,207)"], "rgb(255,69,69)"));

// Create editor
import { Editor }            from "./editor.js";
import { InputPreprocessor } from "./input_preprocessor.js";

const textarea = document.getElementById("main-textarea");
const background = document.getElementById("main-textarea-background");
const linesDiv = document.getElementById("lines-holder-div");
const editor = new Editor(textarea, background, linesDiv, textColoring, new InputPreprocessor());

// Handle edit button
const editButton = document.getElementById("library-edit-button");
editButton.style.display = 'block';

function resizeAdminBodyDiv() {
    if (document.getElementById("admin-div").style.display == "block") {
        document.getElementById("body-div").style.width = (window.innerWidth - 70) + "px";
    }
    editor.build();
}

function editLibrary() {
    document.getElementById("simple-div").style.display = "none";
    document.getElementById("admin-div").style.display = "block";
    resizeAdminBodyDiv();
}

window.addEventListener("resize", resizeAdminBodyDiv);
editButton.addEventListener("click", editLibrary);
