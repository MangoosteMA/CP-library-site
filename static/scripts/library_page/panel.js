const textarea = document.getElementById("main-textarea");
const editorDiv = document.getElementById("library-editor");
const renameDiv = document.getElementById("panel-rename-div");

function panelSave() {
    fetch(window.location.href, {
        method: 'PUT',
        body: textarea.value,
        headers: {
            'Content-Type': 'text/plain; charset=UTF-8'
        }
    }).then(response => {
        return response.text().then(text => ({
            status: response.status,
            text: text
        }));
    }).then(ret => {
        if (ret.status != 200) {
            alert(ret.text)
            return
        }

        const value = ret.text;
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

function applyRename() {
    const form = document.getElementById("panel-rename-form");
    const elements = form.elements;

    fetch(window.location.href, {
        method: "PATCH",
        body: JSON.stringify({
            'htmlName': elements['htmlName'].value,
            'fileName': elements['fileName'].value,
            'filePath': elements['filePath'].value,
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        return response.text().then(text => ({
            status: response.status,
            text: text
        }));
    }).then(ret => {
        if (ret.status != 200) {
            alert(ret.text);
        } else {
            location.replace('/lib/algo');
        }
    });
}

// Handle (ctrl or cmd) + s
textarea.addEventListener("keypress", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key == 's') {
        event.preventDefault();
        panelSave();
    }
});
