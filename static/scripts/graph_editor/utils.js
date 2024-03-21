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

export function uniteBoundingBoxes(box1, box2) {
    if (box1 == null) {
        return box2;
    }
    if (box2 == null) {
        return box1;
    }
    const xl = Math.min(box1.x, box2.x);
    const yl = Math.min(box1.y, box2.y);
    const xr = Math.max(box1.x + box1.width, box2.x + box2.width);
    const yr = Math.max(box1.y + box1.height, box2.y + box2.height);
    return {x:      xl     ,
            y:      yl     ,
            width:  xr - xl,
            height: yr - yl};
}
