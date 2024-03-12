function showEditButton() {
    var button = document.getElementById("library-edit-button");
    if (button != null) {
        button.style.display = 'block';
    }
}

async function saveChangedData() {
    const editor = document.getElementById("editor");
    const newData = editor.value;
    const currentUrl = window.location.href;
    await fetch(currentUrl, {
        method: "POST",
        body: JSON.stringify({
            newData: newData
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    }).then(function(response) {
        return response.text();
    }).then(function(html) {
        var auxDiv = document.createElement('div');
        auxDiv.innerHTML = html;
        const candidates = auxDiv.getElementsByClassName("library-body-inside-div");
        if (candidates.length > 0) {
            const detailsElements = candidates[0].getElementsByTagName('details');
            for (let i = 0; i < detailsElements.length; i++) {
                detailsElements[i].open = true;
            }
            document.getElementById("admin-fileinfo-div").innerHTML = candidates[0].innerHTML;
            if (MathJax) {
                MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
            }
            if (hljs) {
                hljs.highlightAll();
            }
        }
    });
}

async function saveChangedDataAndExit() {
    await saveChangedData().then(function() {
        location.reload();
    });
}

function resizeAdminBodyDiv() {
    if (document.getElementById("admin-div").style.display == "block") {
        document.getElementById("body-div").style.width = (window.innerWidth - 100) + "px";
    }
}

function editLibrary() {
    document.getElementById("simple-div").style.display = "none";
    document.getElementById("admin-div").style.display = "block";
    resizeAdminBodyDiv();
}

window.addEventListener("resize", resizeAdminBodyDiv);
showEditButton();
