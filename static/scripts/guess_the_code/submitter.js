import { Test }                from "./test.js";
import { createTrueVerict }    from "./utils.js";
import { createFalseVerict }   from "./utils.js";
import { createErrorVerict }   from "./utils.js";
import { createNoneVerict }    from "./utils.js";
import { createSimpleVerdict } from "./utils.js";

const ACTIVE_ROW_STYLE = "output-table-active-row";

export class Submitter {
    /*
    Variables:
    codeTextarea:  html <textarea> element
    variablesForm: html <form> element
    outputTable:   html <table> element
    tests:         list[Test]
    firstRowHtml:  html <tr> element
    activeRow:     html <tr> element
    activeTest:    int
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
        this.activeRow = null;
        this.activeTest = null;

        window.addEventListener("keydown", (event) => {
            if (this.activeRow == null) {
                return;
            }
            if (event.key === 'Backspace' || event.key === 'Delete') {
                this.deleteActiveTest();
            } else if (event.key === 'ArrowUp') {
                this.moveActiveTestUp();
            } else if (event.key === 'ArrowDown') {
                this.moveActiveTestDown();
            } else {
                return;
            }
            event.preventDefault();
        });
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
        const a = parseInt(elements['a'].value);
        const b = parseInt(elements['b'].value);
        const c = parseInt(elements['c'].value);

        if (isNaN(a) || isNaN(b) || isNaN(c)) {
            alert("a, b and c must be integers");
            return;
        }

        fetch(window.location.href, {
            method: 'POST',
            body: JSON.stringify({
                'method': 'add_test',
                'a': String(a),
                'b': String(b),
                'c': String(c),
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            if (response.status == 200) {
                return response.json().then(json => ({
                    status: response.status,
                    json: json,
                }));
            }

            return response.text().then(text => ({
                status: response.status,
                text: text,
            }));
        }).then(ret => {
            if (ret.status != 200) {
                alert("Error: " + ret.text);
                return;
            }

            const test = new Test(a, b, c, ret.json.result, null);
            this.appendTest(test);
        });
    }

    runCode() {
        var content = "";
        this.tests.forEach((test, i) => {
            if (i > 0) {
                content += ";";
            }
            content += String(test.a) + ";" + String(test.b) + ";" + String(test.c)
        });

        fetch(window.location.href, {
            method: 'POST',
            body: JSON.stringify({
                'method': 'run',
                'code': this.codeTextarea.value,
                'tests': content,
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            if (response.status == 200) {
                return response.json().then(json => ({
                    status: response.status,
                    json: json,
                }));
            }

            return response.text().then(text => ({
                status: response.status,
                text: text,
            }));
        }).then(ret => {
            if (ret.status != 200) {
                alert("Error: " + ret.text);
                return;
            }
            
            const parsedArray = ret.json.result;
            for (let i = 0; i < parsedArray.length; i++) {
                this.tests[i].codeOutput = parsedArray[i];
            }
            this.render();
        });
    }

    submit() {
        fetch(window.location.href, {
            method: 'POST',
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

    deleteActiveTest() {
        this.tests.splice(this.activeTest, 1);
        this.activeRow = null;
        this.activeTest = -1;
        this.render();
    }

    moveActiveTestUp() {
        if (this.activeTest == 0) {
            return;
        }
        [this.tests[this.activeTest - 1], this.tests[this.activeTest]] =
            [this.tests[this.activeTest], this.tests[this.activeTest - 1]];
        this.activeTest -= 1;
        this.render();
    }

    moveActiveTestDown() {
        if (this.activeTest + 1 >= this.tests.length) {
            return;
        }
        [this.tests[this.activeTest + 1], this.tests[this.activeTest]] =
            [this.tests[this.activeTest], this.tests[this.activeTest + 1]];
        this.activeTest += 1;
        this.render();
    }

    render() {
        this.outputTable.innerHTML = "";

        const firstRow = document.createElement("tr");
        firstRow.innerHTML = this.firstRowHtml;
        this.outputTable.appendChild(firstRow);

        this.tests.forEach((test, index) => {
            const row = document.createElement("tr");
            if (this.activeTest == index) {
                this.activeRow = row;
                row.classList.add(ACTIVE_ROW_STYLE);
            }

            row.addEventListener("click", () => {
                if (this.activeRow == row) {
                    this.activeRow = null;
                    this.activeTest = -1;
                    row.classList.remove(ACTIVE_ROW_STYLE);
                } else {
                    if (this.activeRow != null) {
                        this.activeRow.classList.remove(ACTIVE_ROW_STYLE);
                    }
                    this.activeRow = row;
                    this.activeTest = index;
                    row.classList.add(ACTIVE_ROW_STYLE);
                }
            });

            [test.a, test.b, test.c].forEach(value => {
                const tableCell = document.createElement("td");
                tableCell.innerText = value;
                row.appendChild(tableCell);
            });

            [test.correctOutput, test.codeOutput].forEach(value => {
                const tableCell = document.createElement("td");
                if (value == "False") {
                    tableCell.appendChild(createFalseVerict());
                } else if (value == "True") {
                    tableCell.appendChild(createTrueVerict());
                } else if (value == "error") {
                    tableCell.appendChild(createErrorVerict());
                } else if (value == null || value == "None") {
                    tableCell.appendChild(createNoneVerict());
                } else {
                    tableCell.appendChild(createSimpleVerdict(value));
                }
                row.appendChild(tableCell);
            });

            this.outputTable.appendChild(row);
        });
    }
}
