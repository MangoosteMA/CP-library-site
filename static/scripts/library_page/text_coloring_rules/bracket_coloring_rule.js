import { ColoringRuleInterface }     from "./coloring_rule_interface.js";
import { TextModifier, coloredText } from "./text_modifier.js";

export class BracketColoringRule extends ColoringRuleInterface {
    /*
    Variables:
    colorSequence:  list[str]
    notPairedColor: str
    */

    constructor(colorSequence, notPairedColor) {
        super();
        this.colorSequence = colorSequence;
        this.notPairedColor = notPairedColor;
    }

    applyRuleTo(text) {
        const PAIRING = new Map([
           ['(', ')'],
           ['{', '}'],
           ['[', ']']
        ]);

        function isClosedBracket(symbol) {
            for (var bracket of PAIRING.values()) {
                if (bracket == symbol) {
                    return true;
                }
            }
            return false;
        }

        var modifiers = [];
        var stack = [];
        const currentRule = this;

        for (let i = 0; i < text.length; i++) {
            if (PAIRING.has(text[i])) {
                stack.push(i);
            } else if (isClosedBracket(text[i])) {
                var color = "";
                if (stack.length > 0 && PAIRING.get(text[stack[stack.length - 1]]) == text[i]) {
                    color = currentRule.colorSequence[(stack.length - 1) % currentRule.colorSequence.length];
                } else {
                    color = currentRule.notPairedColor;
                }

                modifiers.push(new TextModifier(i, i + 1, coloredText(text[i], color)));
                if (stack.length > 0) {
                    modifiers.push(new TextModifier(stack[stack.length - 1], stack[stack.length - 1] + 1, coloredText(text[stack[stack.length - 1]], color)));
                    stack.pop();
                }
            } 
        }

        stack.forEach(index => {
            modifiers.push(new TextModifier(index, index + 1, coloredText(text[index], currentRule.notPairedColor)));
        });

        return modifiers;
    }
}
