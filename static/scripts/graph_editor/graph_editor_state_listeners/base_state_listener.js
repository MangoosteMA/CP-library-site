export class ColumnInterface {
    buildHeader(graphEditor, graphTextarea) {}
    build(element, graphEditor, graphTextarea) {}
}

export class BaseGraphStateListener {
    /*
    Variables:
    details:      html <details> element
    summary:      html <summary> element
    detailsDiv:   html <div> element 
    table:        html <table> element
    columnsTypes: list[ColumnInterface]
    */

    constructor(details, graphTextarea) {
        this.details = details;
        this.summary = details.firstChild;
        this.#mainSummaryText = this.summary.innerText;
        this.#graphTextarea = graphTextarea;

        this.detailsDiv = document.createElement("div");
        this.detailsDiv.setAttribute("class", "nodes-background-div");

        this.table = document.createElement("table");
        this.table.setAttribute("class", "nodes-table");

        this.detailsDiv.appendChild(this.table);
        this.details.appendChild(this.detailsDiv);
        this.clearTable(0);

        this.columnsTypes = [];
    }

// Protected:
    #mainSummaryText;
    #graphTextarea;
    #windowScroll;
    #detailsScroll;

    saveScroll() {
        this.#windowScroll = {scrollX: window.scrollX, scrollY: window.scrollY};
        this.#detailsScroll = {scrollTop: this.details.scrollTop, scrollLeft: this.details.scrollLeft};
    }

    restoreScroll() {
        window.scrollX = this.#windowScroll.scrollX;
        window.scrollY = this.#windowScroll.scrollY;
        this.details.scrollTop = this.#detailsScroll.scrollTop;
        this.details.scrollLeft = this.#detailsScroll.scrollLeft;
    }

    clearTable(numberOfElements) {
        this.table.innerHTML = "";
        this.summary.firstChild.data = this.#mainSummaryText + " (" + numberOfElements + ")";
    }

    buildHeader(graphEditor) {
        const header = document.createElement("tr");
        this.columnsTypes.forEach((columnClass, i) => {
            const container = document.createElement("th");
            const buildedElement = columnClass.buildHeader(graphEditor, this.#graphTextarea);
            if (buildedElement) {
                if (i == 0) {
                    buildedElement.style.marginLeft = "0px";
                }
                container.appendChild(buildedElement);
            }
            header.appendChild(container);
        });
        this.table.appendChild(header);
    }

    renderTable(graphEditor, elements, rowId) {
        elements.forEach(element => {
            const row = document.createElement("tr");
            row.setAttribute("id", rowId(element));
            this.columnsTypes.forEach((columnClass, i) => {
                const container = document.createElement("td");
                const buildedElement = columnClass.build(element, graphEditor, this.#graphTextarea);
                if (buildedElement) {
                    if (i == 0) {
                        buildedElement.style.marginLeft = "0px";
                    }
                    container.appendChild(buildedElement);
                }
                row.appendChild(container);
            });
            this.table.appendChild(row);
        });
    }
}
