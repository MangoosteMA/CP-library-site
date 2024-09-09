export class TextModifier {
    /*
    Variables:
    left:        int (included)
    right:       int (excluded)
    replaceWith: str
    */

    constructor(left, right, replaceWith) {
        this.left = left;
        this.right = right;
        this.replaceWith = replaceWith;
    }
}

export function applyModifiersToText(text, modifiers) {
    if (modifiers.length == 0) {
        return text;
    }

    modifiers.sort((lhs, rhs) => {
        return rhs.left - lhs.left;
    });

    var modifiedText = "";
    var pointer = text.length;
    modifiers.forEach(modifier => {
        if (modifier.right < pointer) {
            modifiedText = text.substring(modifier.right, pointer) + modifiedText;
        }
        modifiedText = modifier.replaceWith + modifiedText;
        pointer = modifier.left;
    });

    if (pointer > 0) {
        modifiedText = text.substring(0, pointer) + modifiedText;
    }
    return modifiedText;
}

export function coloredText(text, color) {
    return "<span style=\"color: " + color + "\">" + text + "</span>";
}
