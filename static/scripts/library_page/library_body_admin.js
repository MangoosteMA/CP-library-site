// Create text coloring rules
import { TextColoring } from "../text_editor/text_coloring.js";
const textColoring = new TextColoring();

// Add special symbols coloring rule
import { KeyWordsColoringRule } from "../text_editor/text_coloring_rules/key_words_coloring_rule.js";
textColoring.addRule(new KeyWordsColoringRule(["-", "&quot;", ":"], "rgb(235,101,164)"));

// Add draft mark coloring
textColoring.addRule(new KeyWordsColoringRule(["draft"], "rgb(139,233,253)"));

// Add bracket coloring rule
import { BracketColoringRule } from "../text_editor/text_coloring_rules/bracket_coloring_rule.js";
textColoring.addRule(new BracketColoringRule(["rgb(235,101,164)", "rgb(225,146,82)", "rgb(69,178,207)"], "rgb(255,69,69)"));

// Create editor
import { Editor }            from "../text_editor/editor.js";
import { InputPreprocessor } from "../text_editor/input_preprocessor.js";

const textarea = document.getElementById("main-textarea");
const background = document.getElementById("main-textarea-background");
const linesDiv = document.getElementById("lines-holder-div");
const editor = new Editor(textarea, background, linesDiv, textColoring, new InputPreprocessor());
editor.build();

// Handle edit button
const editButton = document.getElementById("library-edit-button");
editButton.style.display = "block";

editButton.addEventListener("click", () => {
    document.getElementById("simple-div").style.display = "none";
    document.getElementById("admin-div").style.display = "block";
    editor.build();
});

const saveButton = document.getElementById("save-button");

saveButton.addEventListener("click", () => {
    fetch(window.location.href, {
        method: "POST",
        body: textarea.value,
        headers: {
            "Content-type": "text/plain; charset=UTF-8"
        }
    }).then(response => {
        if (response.status == 200) {
            location.reload();
            return;
        }

        const prevBackgroundColor = saveButton.style.backgroundColor;
        saveButton.style.backgroundColor = "red";
        setTimeout(() => {
            saveButton.style.backgroundColor = prevBackgroundColor;
        }, 1200);
    });
});
