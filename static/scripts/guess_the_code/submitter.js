import { Test }              from "./test.js";
import { createTrueVerict }  from "./utils.js";
import { createFalseVerict } from "./utils.js";
import { createErrorVerict } from "./utils.js";
import { createNoneVerict }  from "./utils.js";

export class Submitter {
    /*
    Variables:
    codeTextarea:  html <textarea> element
    variablesForm: html <form> element
    outputTable:   html <table> element
    tests:         list[Test]
    firstRowHtml:  html <tr> element
    */

    constructor(codeTextarea, variablesForm, outputTable) {
        this.codeTextarea = codeTextarea;
        this.variablesForm = variablesForm;
        this.outputTable = outputTable;
        this.tests = [];

        var firstRow = this.outputTable.firstChild;
        while (firstRow.nodeType == 3) {
            firstRow = firstRow.nextSibling;
        }
        this.firstRowHtml = firstRow.innerHTML;
    }

    registerAddTestButton(addTestButton) {
        const submitter = this;
        addTestButton.addEventListener("click", () => {
            submitter.addTest();
        });
    }

    registerRunCodeButton(runCodeButton) {
        const submitter = this;
        runCodeButton.addEventListener("click", () => {
            submitter.runCode();
        });
    }

    registerSubmitButton(submitButton) {
        const submitter = this;
        submitButton.addEventListener("click", () => {
            submitter.submit();
        });
    }

// Private:
    addTest() {
        const elements = this.variablesForm.elements;
        const a = parseInt(elements['a'].value, 0);
        const b = parseInt(elements['b'].value, 0);
        const c = parseInt(elements['c'].value, 0);

        fetch(window.location.href, {
            method: "POST",
            body: JSON.stringify({
                'method': 'add_test',
                'a': a, 'b': b, 'c': c,
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            return response.text();
        }).then(value => {
            const test = new Test(a, b, c, value, null);
            this.appendTest(test);
        });
    }

    runCode() {
        var tests = [];
        this.tests.forEach(test => {
            tests.push({'a': test.a, 'b': test.b, 'c': test.c});
        });

        fetch(window.location.href, {
            method: "POST",
            body: JSON.stringify({
                'method': 'run_code',
                'code': this.codeTextarea.value,
                'tests': tests,
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            return response.text();
        }).then(values => {
            const parsedArray = values.split(",");
            for (let i = 0; i < parsedArray.length; i++) {
                this.tests[i].codeOutput = parsedArray[i];
            }
            this.render();
        });
    }

    submit() {
        fetch(window.location.href, {
            method: "POST",
            body: JSON.stringify({
                'method': 'submit',
                'code': this.codeTextarea.value,
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            return response.text();
        }).then(value => {
            if (value.trim() == 'True') {
                alert('OK!');
            } else {
                alert('Wrong')
            }
        });
    }

    appendTest(test) {
        this.tests.push(test);
        this.render();
    }

    render() {
        this.outputTable.innerHTML = "";

        const firstRow = document.createElement("tr");
        firstRow.innerHTML = this.firstRowHtml;
        this.outputTable.appendChild(firstRow);

        this.tests.forEach(test => {
            const row = document.createElement("tr");

            [test.a, test.b, test.c].forEach(value => {
                const tableCell = document.createElement("td");
                tableCell.innerText = value;
                row.appendChild(tableCell);
            });

            [test.correctOutput, test.codeOutput].forEach(value => {
                const tableCell = document.createElement("td");
                if (value == "0") {
                    tableCell.appendChild(createFalseVerict());
                } else if (value == "1") {
                    tableCell.appendChild(createTrueVerict());
                } else if (value == "2") {
                    tableCell.appendChild(createErrorVerict());
                } else {
                    tableCell.appendChild(createNoneVerict());
                }
                row.appendChild(tableCell);
            });

            this.outputTable.appendChild(row);
        });
    }
}
