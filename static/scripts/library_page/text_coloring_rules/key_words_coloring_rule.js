import { ColoringRuleInterface }     from "./coloring_rule_interface.js";
import { TextModifier, coloredText } from "./text_modifier.js";

export class KeyWordsColoringRule extends ColoringRuleInterface {
    /*
    Variables:
    sequences: array[str]
    color:     str
    */

    constructor(sequences, color) {
        super();
        this.sequences = sequences;
        this.color = color;
    }

    applyRuleTo(text) {
        var modifiers = [];

        // TODO: optimize it with Aho-Korasik
        for (let i = 0; i < text.length; i++) {
            for (let j = 0; j < this.sequences.length; j++) {
                if (i + this.sequences[j].length > text.length) {
                    continue;
                }

                var equal = true;
                for (let p = 0; p < this.sequences[j].length; p++) {
                    if (text[i + p] != this.sequences[j][p]) {
                        equal = false;
                        break;
                    }
                }

                if (!equal) {
                    continue;
                }

                const endPos = i + this.sequences[j].length;
                const coloredSubstring = coloredText(text.substring(i, endPos), this.color);
                modifiers.push(new TextModifier(i, i + this.sequences[j].length, coloredSubstring));

                i = endPos - 1;
                break;
            }
        }
        return modifiers;
    }
}
