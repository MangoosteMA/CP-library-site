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
    prettify() {}
    // Returns an array of points
    getArrangement() {}
}

export class StableArrangement extends ArrangementInterface {
    constructor(arrangement) {
        super();
        this.#arrangement = arrangement;
    }

    prettify() {
        return true;
    }

    getArrangement() {
        return this.#arrangement;
    }

// Private:
    #arrangement;
}

export class ArrangementBuilderInterface {
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
