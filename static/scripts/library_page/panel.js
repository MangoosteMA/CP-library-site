const textarea = document.getElementById("main-textarea");
const editorDiv = document.getElementById("library-editor");
const renameDiv = document.getElementById("panel-rename-div");

function panelSave() {
    fetch(window.location.href, {
        method: "POST",
        body: JSON.stringify({
            'method': 'save',
            'data': document.getElementById("main-textarea").value,
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        return response.text();
    }).then(value => {
        const auxDiv = document.createElement("div");
        auxDiv.innerHTML = value;

        const ID = "admin-fileinfo-div";
        const newSrouce = auxDiv.getElementsByClassName(ID);
        if (newSrouce.length != 1) {
            return;
        }

        const body = document.getElementById(ID);
        const prevScrollTop = body.parentNode.scrollTop;
        body.innerHTML = newSrouce[0].innerHTML;

        const details = body.getElementsByTagName('details');
        for (let i = 0; i < details.length; i++) {
            details[i].open = true;
        }

        function restoreScroll() {
            body.parentNode.scrollTop = prevScrollTop;
        }

        if (MathJax) {
            MathJax.Hub.Queue(["Typeset", MathJax.Hub], [restoreScroll]);
        }
        if (hljs) {
            hljs.highlightAll();
        }
    });
}

function panelExit() {
    location.reload();
}

function panelRename() {
    editorDiv.style.display = "none";
    renameDiv.style.display = "";
}

function cancelRename() {
    editorDiv.style.display = "";
    renameDiv.style.display = "none";
}

function applyRename(prevHtmlName) {
    const form = document.getElementById("panel-rename-form");
    const elements = form.elements;
    fetch(window.location.href, {
        method: "POST",
        body: JSON.stringify({
            'method': 'rename',
            'prevHtmlName': prevHtmlName,
            'htmlName': elements['htmlName'].value,
            'fileName': elements['fileName'].value,
            'filePath': elements['filePath'].value,
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(() => {
        location.replace('/library');
    });
}

// Handle (ctrl or cmd) + s
textarea.addEventListener("keypress", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key == 's') {
        event.preventDefault();
        panelSave();
    }
});
