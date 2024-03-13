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

export function getCookieValue(name) {
    const parts = decodeURIComponent(document.cookie).split(";");
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i].trim();
        const position = part.indexOf("=");
        if (position != -1 && part.substring(0, position) == name) {
            return part.substring(position + 1, part.length);
        }
    }
    return null;
}
