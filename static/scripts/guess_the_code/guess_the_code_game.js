// Create text coloring rules
import { TextColoring } from "../text_editor/text_coloring.js";
export const textColoring = new TextColoring();

// Add special symbols coloring rule
import { KeyWordsColoringRule } from "../text_editor/text_coloring_rules/key_words_coloring_rule.js";
textColoring.addRule(new KeyWordsColoringRule(["&lt;", "=", "&gt;", "+", "-", "&quot;",
                                               "&#x27;", "#", ":", "%", "/"], "rgb(235,101,164)"));

// Add key words coloring rule
textColoring.addRule(new KeyWordsColoringRule(["int", "in", "bool", "and", "or"], "rgb(139,233,253)"));
textColoring.addRule(new KeyWordsColoringRule(["def", "for", "return", "from",
                                               "import", "if", "else", "pass"], "rgb(235,101,164)"));
textColoring.addRule(new KeyWordsColoringRule(["True", "False"], "rgb(188,147,249)"));

// Add bracket coloring rule
import { BracketColoringRule } from "../text_editor/text_coloring_rules/bracket_coloring_rule.js";
textColoring.addRule(new BracketColoringRule(["rgb(235,101,164)", "rgb(225,146,82)", "rgb(69,178,207)"], "rgb(255,69,69)"));

// Create editor
import { Editor }            from "../text_editor/editor.js";
import { InputPreprocessor } from "../text_editor/input_preprocessor.js";

const textarea = document.getElementById("main-textarea");
const background = document.getElementById("main-textarea-background");
const linesDiv = document.getElementById("lines-holder-div");
export const inputPreprocessor = new InputPreprocessor([':']);
const editor = new Editor(textarea, background, linesDiv, textColoring, inputPreprocessor);

// Handle window resize
window.addEventListener("resize", () => {
    editor.build();
});

// Create submitter
import { Submitter } from "./submitter.js";

const variablesForm = document.getElementById("variables-form");
const outputTable = document.getElementById("output-table");
const submitter = new Submitter(textarea, variablesForm, outputTable);

// Register add test button
const addTestButton = document.getElementById("add-test-button");
if (addTestButton != null) {
    submitter.registerAddTestButton(addTestButton);
}

// Register run code button
const runCodeButton = document.getElementById("run-code-button");
if (runCodeButton != null) {
    submitter.registerRunCodeButton(runCodeButton);
}

// Register submit button
const submitCodeButton = document.getElementById("submit-button");
if (submitCodeButton != null) {
    submitter.registerSubmitButton(submitCodeButton);
}
