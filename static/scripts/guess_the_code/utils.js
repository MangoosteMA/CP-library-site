export function createTrueVerict() {
    const div = document.createElement("div");
    div.classList.add("true-verdict-div");
    div.innerText = "true";
    return div;
}

export function createFalseVerict() {
    const div = document.createElement("div");
    div.classList.add("false-verdict-div");
    div.innerText = "false";
    return div;
}

export function createErrorVerict() {
    const div = document.createElement("div");
    div.classList.add("error-verdict-div");
    div.innerText = "error";
    return div;
}

export function createNoneVerict() {
    const div = document.createElement("div");
    div.classList.add("none-verdict-div");
    div.innerText = "none";
    return div;
}
