const editor = document.getElementById("editor");
const editorBack = document.getElementById("editor-back");
const TAB_SIZE = 4;

function getEditorCursorPosition() {
    return editor.selectionStart;
}

function setEditorFocus(cursorPosition) {
    editor.selectionStart = cursorPosition;
    editor.selectionEnd = cursorPosition;
    editor.focus();
}

function addTextAfterCursor(text) {
    const cursorPosition = getEditorCursorPosition();
    editor.value = editor.value.slice(0, cursorPosition) + text + editor.value.slice(cursorPosition);
    setEditorFocus(cursorPosition);
}

function eraseTextAfterCursor(text) {
    const cursorPosition = getEditorCursorPosition();
    if (cursorPosition + text.length > editor.value.length) {
        return;
    }
    if (editor.value.slice(cursorPosition, cursorPosition + text.length) != text) {
        return;
    }
    editor.value = editor.value.slice(0, cursorPosition) + editor.value.slice(cursorPosition + text.length);
    setEditorFocus(cursorPosition);
}

function handleLineBreak() {
    var cursorPosition = getEditorCursorPosition();
    const text = editor.value;
    if (cursorPosition <= 1 || text[cursorPosition - 1] != '\n') {
        return;
    }

    var prevLineEnd = cursorPosition - 2;
    while (prevLineEnd >= 0 && text[prevLineEnd] != '\n') {
        prevLineEnd--;
    }

    var spaces = 0;
    while (text[prevLineEnd + 1 + spaces] == ' ') {
        spaces++;
    }

    var extraText = " ".repeat(spaces);
    if (text[cursorPosition - 2] == '{') {
        extraText += " ".repeat(TAB_SIZE);
        if (cursorPosition < text.length && text[cursorPosition] == '}') {
            extraText += "\n" + " ".repeat(spaces);
        }
        spaces += TAB_SIZE;
    }

    addTextAfterCursor(extraText);
    setEditorFocus(cursorPosition + spaces);
}

function handleInsertText(insertedText) {
    if (!insertedText) {
        return;
    }

    if (insertedText == "(") {
        addTextAfterCursor(")");
    } else if (insertedText == "{") {
        addTextAfterCursor("}");
    } else if (insertedText == "[") {
        addTextAfterCursor("]");
    } else if (insertedText == ")" || insertedText == "}" || insertedText == "]") {
        eraseTextAfterCursor(insertedText);
    }
}

function handleEvent(event) {
    if (event.inputType == "insertLineBreak") {
        handleLineBreak();
    } else if (event.inputType == "insertText") {
        handleInsertText(event.data);
    }
}

function updateEditor(event) {
    if (event) {
        handleEvent(event);
    }

    const keyElementsColor = "rgb(255, 121, 198)";
    const keyWrodColor     = "rgb(255, 232, 80)";
    const bracketColor     = "rgb(3, 221, 255)";
    const variablesColor   = "rgb(105, 255, 68)";
    const colorWords = [
        {key: "="            , color: bracketColor    },
        {key: "\\details"    , color: keyElementsColor},
        {key: "\\title"      , color: keyElementsColor},
        {key: "\\codeBlock"  , color: keyElementsColor},
        {key: "\\itemize"    , color: keyElementsColor},
        {key: "\\enumerate"  , color: keyElementsColor},
        {key: "\\item"       , color: keyElementsColor},
        {key: "\\complexity" , color: keyWrodColor    },
        {key: "\\qed"        , color: keyWrodColor    },
        {key: "\\implies"    , color: keyWrodColor    },
        {key: "{"            , color: bracketColor    },
        {key: "}"            , color: bracketColor    },
        {key: "["            , color: bracketColor    },
        {key: "]"            , color: bracketColor    },
        {key: "$"            , color: bracketColor    },
        {key: "mainCpp"      , color: variablesColor  },
    ];

    editorBack.innerHTML = editor.value;
    if (editor.value.length > 0 && editor.value[editor.value.length - 1] == '\n') {
        editorBack.innerHTML += "\n"; // LOL, WTF?
    }

    // TODO: optimize it with Aho-Corasick if text is too big maybe?
    colorWords.forEach(function(value) {
        const key = value.key;
        const color = value.color;
        const replaceWith = "<span style='color: " + color + ";'>" + key + "</span>";
        editorBack.innerHTML = editorBack.innerHTML.replaceAll(key, replaceWith);
    });
}

function syncScroll() {
    editorBack.style.height = editor.style.height;
    editorBack.scrollLeft = editor.scrollLeft;
    editorBack.scrollTop = editor.scrollTop;
}

editor.addEventListener("scroll", syncScroll);
editor.addEventListener("input", updateEditor);
updateEditor();
