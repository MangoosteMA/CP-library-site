export function isInt(value) {
    return parseInt(value, 0) == value;
}

export function increaseLabelBy(label, value) {
    var labelToInt = parseInt(label, 0);
    if (labelToInt != label) {
        return label;
    }
    labelToInt += value;
    return String(labelToInt);
}

// Returns random integer from [minValue, maxValue)
export function randomInt(minValue, maxValue) {
    return Math.floor(Math.random() * (maxValue - minValue)) + minValue;
}

export function clamp(value, minValue, maxValue) {
    return Math.max(minValue, Math.min(value, maxValue));
}
