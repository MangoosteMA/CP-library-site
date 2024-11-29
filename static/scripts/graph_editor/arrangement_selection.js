import { DefaultArrangementOption }            from "./arrangements/arrangement_interface.js";
import { DfsTreeArrangementOption }            from "./arrangements/dfs_tree_arrangement.js";
import { GridArrangementOption }               from "./arrangements/grid_arrangement.js";
import { ImprovedRegularArrangementOption }    from "./arrangements/improved_regular_arrangement.js";
import { IterativeArrangementOption }          from "./arrangements/iterative_arrangement.js";
import { LineArrangementOption }               from "./arrangements/line_arrangement.js";
import { PlanarArrangementOption }             from "./arrangements/planar_arrangement.js";
import { RegularArrangementOption }            from "./arrangements/regular_arrangement.js";
import { TopSortArrangementArrangementOption } from "./arrangements/top_sort_arrangement.js";

import { createCheckbox }                      from "./graph_editor_state_listeners/utils.js";

export class ArrangementSelection {
    /*
    Variables:
    selectionDiv:   html <div> element
    graphEditor:    GraphEditor
    options:        list[ArrangementOptionInterface];
    selectedOption: ArrangementOptionInterface
    table:          html <table> element
    */

    constructor(selectionDiv, settingsButton, graphEditor) {
        this.selectionDiv = selectionDiv;
        this.graphEditor = graphEditor;
        this.options = [new DefaultArrangementOption()                               ,
                        new DfsTreeArrangementOption(graphEditor.nodesStateHandler)  ,
                        new RegularArrangementOption()                               ,
                        new ImprovedRegularArrangementOption()                       ,
                        new TopSortArrangementArrangementOption()                    ,
                        new LineArrangementOption()                                  ,
                        new IterativeArrangementOption(graphEditor.nodesStateHandler),
                        new PlanarArrangementOption()                                ,
                        new GridArrangementOption()                                  ];

        this.selectedOption = this.options[0];

        function onClick() {
            if (selectionDiv.style.display != "none") {
                selectionDiv.style.display = "none";
            } else {
                selectionDiv.style.display = "";
            }
        }

        selectionDiv.addEventListener("click", function(evt) {
            if (evt.target == selectionDiv) {
                onClick();
            }
        });

        settingsButton.addEventListener("click", onClick);
        Array.from(selectionDiv.getElementsByClassName("exit-selection-button")).forEach(exitButton => {
            exitButton.addEventListener("click", onClick);
        });

        this.table = null;
        this.render();
    }

    render() {
        const selectionInsideDiv = this.selectionDiv.getElementsByClassName("arrangement-selection-div")[0];
        const arrangementSelection = this;

        if (this.table != null) {
            selectionInsideDiv.removeChild(this.table);
        }
        this.table = document.createElement("table");
        this.table.setAttribute("class", "selection-table");

        this.options.forEach((option, i) => {
            const tableRow = document.createElement("tr");

            function callback() {
                arrangementSelection.selectedOption = option;
                arrangementSelection.graphEditor.updateArrangementBuilder(option.getArrangementBuilder());
                arrangementSelection.render();
            }

            const checkboxHolder = document.createElement("td");
            const checkbox = createCheckbox(i + "-arrangement-selection-checkbox", (option == arrangementSelection.selectedOption), callback);

            checkbox.style.marginTop = "auto";
            checkbox.style.marginBottom = "auto";
            checkboxHolder.style.paddingRight = "10px";
            checkboxHolder.appendChild(checkbox);

            const dataHolder = document.createElement("td");
            dataHolder.style.paddingRight = "4px";
            dataHolder.appendChild(option.buildHtml(arrangementSelection.graphEditor, callback));

            tableRow.appendChild(checkboxHolder);
            tableRow.appendChild(dataHolder);
            arrangementSelection.table.appendChild(tableRow);
        });

        selectionInsideDiv.appendChild(this.table);
    }
}
