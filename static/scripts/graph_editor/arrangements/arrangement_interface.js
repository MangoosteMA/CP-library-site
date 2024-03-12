export const PERFECT_DISTANCE = 140;

export class ArrangementEdge {
    /*
    Variables:
    from:     int
    to:       int
    directed: bool
    */

    constructor(from, to, directed) {
        this.from = from;
        this.to = to;
        this.directed = directed;
    }
};

export class ArrangementInterface {
    build(n, edges) {}
    isPretty(n, edges) {}
}

export class ArrangementOptionInterface {
    constructor(builder) {
        this.#arrangementBuilder = builder;
    }

    buildHtml(graphEditor, callback) {}

    getArrangementBuilder() {
        return this.#arrangementBuilder;
    }

// Private:
    #arrangementBuilder;
}

export class DefaultArrangementOption extends ArrangementOptionInterface {
    constructor() {
        super(null);
    }

    buildHtml(graphEditor, callback) {
        const div = document.createElement("div");
        div.innerText = "По умолчанию";
        return div;
    }
}
