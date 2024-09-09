import { ColoringRuleInterface }              from "./text_coloring_rules/coloring_rule_interface.js";
import { TextModifier, applyModifiersToText } from "./text_coloring_rules/text_modifier.js";

export class TextColoring {
    /*
    Variables:
    coloringRules: array[ColoringRuleInterface]
    */

    constructor() {
        this.coloringRules = [];
    }

    addRule(rule) {
        this.coloringRules.push(rule);
    }

    applyAllRulesTo(text) {
        var used = [];
        for (let i = 0; i < text.length; i++) {
            used.push(false);
        }
        var usefulModifiers = [];

        this.coloringRules.forEach(rule => {
            rule.applyRuleTo(text).forEach(modifier => {
                var canApply = true;
                for (let i = modifier.left; i < modifier.right; i++) {
                    if (used[i]) {
                        canApply = false;
                        break;
                    }
                }

                if (!canApply) {
                    return;
                }

                usefulModifiers.push(modifier);
                for (let i = modifier.left; i < modifier.right; i++) {
                    used[i] = true;
                }
            });
        });

        return applyModifiersToText(text, usefulModifiers);
    }
}
