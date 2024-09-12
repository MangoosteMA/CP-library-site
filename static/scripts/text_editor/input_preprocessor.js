const BRACKETS_PAIRING = new Map([
    ['(', ')'],
    ['{', '}'],
    ['[', ']']
]);

const TAB_SIZE = 4;

function isCloseBracket(symbol) {
    for (var bracket of BRACKETS_PAIRING.values()) {
        if (bracket == symbol) {
            return true;
        }
    }
    return false;
}

export class InputPreprocessor {
    /*
    Variables:
    breakingSymbolsSet: Set[char]
    */

    constructor(breakingSymbols) {
        this.breakingSymbolsSet = new Set(breakingSymbols);
    }

    processInput(textarea, event) {
        if (event.inputType == "insertLineBreak") {
            this.processLineBreak(textarea);
        } else if (event.inputType == "insertText") {
            if (BRACKETS_PAIRING.has(event.data)) {
                this.processOpenBracket(textarea, event.data);
            } else if (isCloseBracket(event.data)) {
                this.processCloseBracket(textarea, event.data);
            }
        }
    }

// Private:
    getSelectedPosition(textarea) {
        return textarea.selectionStart;
    }

    focusAt(textarea, pos) {
        textarea.selectionStart = textarea.selectionEnd = pos;
    }

    processLineBreak(textarea) {
        const value = textarea.value;
        const pos = this.getSelectedPosition(textarea);

        var prevLineEnd = pos - 2;
        while (prevLineEnd >= 0 && value[prevLineEnd] != '\n') {
            prevLineEnd--;
        }

        var cntSpaces = 0;
        while (prevLineEnd + cntSpaces + 1 < pos && value[prevLineEnd + cntSpaces + 1] == ' ') {
            cntSpaces++;
        }

        var stringToInsert = " ".repeat(cntSpaces);
        var positionToFocus = pos + cntSpaces;
        if (pos - 2 >= 0 && this.breakingSymbolsSet.has(value[pos - 2])) {
            stringToInsert += " ".repeat(TAB_SIZE);
            if (pos < value.length && value[pos] == '}') {
                stringToInsert += "\n" + " ".repeat(cntSpaces);
            }
            positionToFocus += TAB_SIZE;
        }

        textarea.value = value.substring(0, pos) + stringToInsert + value.substring(pos);
        this.focusAt(textarea, positionToFocus);
    }

    processOpenBracket(textarea, bracket) {
        const value = textarea.value;
        const pos = this.getSelectedPosition(textarea);
        textarea.value = value.substring(0, pos) + BRACKETS_PAIRING.get(bracket) + value.substring(pos);
        this.focusAt(textarea, pos);
    }

    processCloseBracket(textarea, bracket) {
        const pos = this.getSelectedPosition(textarea);
        if (pos < textarea.value.length && textarea.value[pos] == bracket) {
            const value = textarea.value;
            textarea.value = value.substring(0, pos) + value.substring(pos + 1);
            this.focusAt(textarea, pos);
        }
    }
}
