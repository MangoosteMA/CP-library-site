// Create code editor
import { textColoring }      from "./guess_the_code_game.js";
import { inputPreprocessor } from "./guess_the_code_game.js";
import { Editor }            from "../text_editor/editor.js";

const codeTextarea = document.getElementById("main-textarea-admin-code");
const codeBackground = document.getElementById("main-textarea-background-admin-code");
const codeLinesDiv = document.getElementById("lines-holder-div-admin-code");
const codeEditor = new Editor(codeTextarea, codeBackground, codeLinesDiv, textColoring, inputPreprocessor);

// Create test editor coloring rules
import { TextColoring } from "../text_editor/text_coloring.js";
const testTextColoring = new TextColoring();

import { KeyWordsColoringRule } from "../text_editor/text_coloring_rules/key_words_coloring_rule.js";
testTextColoring.addRule(new KeyWordsColoringRule(["Random"], "rgb(235,101,164)"));

// Create tests editor
import { InputPreprocessor } from "../text_editor/input_preprocessor.js";

const testTextarea = document.getElementById("main-textarea-admin-test");
const testBackground = document.getElementById("main-textarea-background-admin-test");
const testLinesDiv = document.getElementById("lines-holder-div-admin-test");
const testEditor = new Editor(testTextarea, testBackground, testLinesDiv, testTextColoring, new InputPreprocessor("{"));

// Handle edit button
const editButton = document.getElementById("game-edit-button");
editButton.style.display = "block";

const mainEditorDiv = document.getElementById("editor-outer-div");
const adminEditorDiv = document.getElementById("editor-outer-admin-div");

editButton.addEventListener("click", () => {
    editButton.style.display = "none";
    mainEditorDiv.style.display = "none";
    adminEditorDiv.style.display = "block";
    codeEditor.build();
    testEditor.build();
});

// Handle save button
const saveButton = document.getElementById("save-admin-button");
saveButton.addEventListener("click", () => {
    fetch(window.location.href, {
        method: "POST",
        body: JSON.stringify({
            'method': 'update_game',
            'code': codeTextarea.value,
            'testsDescriber': testTextarea.value,
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if (response.status == 200) {
            alert('Saved');
        } else {
            alert('Didn\'t save');
        }
    });
});

// Handle exit button
const exitButton = document.getElementById("exit-admin-button");
exitButton.addEventListener("click", () => {
    location.reload();
});
