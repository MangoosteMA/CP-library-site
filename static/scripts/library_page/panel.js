const textarea = document.getElementById("main-textarea");
const editorDiv = document.getElementById("library-editor");
const renameDiv = document.getElementById("panel-rename-div");
const imagesDiv = document.getElementById("panel-images-div");
var activeDiv = editorDiv;

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

        const auxDiv = document.createElement("div");
        auxDiv.innerHTML = ret.text;

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

function openNewDiv(div) {
    activeDiv.style.display = "none";
    div.style.display = "";
    activeDiv = div;
}

function panelRename() {
    openNewDiv(renameDiv);
}

function panelOpenEditor() {
    openNewDiv(editorDiv);
}

function panelImages() {
    openNewDiv(imagesDiv);
}

function panelApplyRename() {
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

function updateImageDivContent(innerHTML) {
    const auxDiv = document.createElement("div");
    auxDiv.innerHTML = innerHTML;

    const newImagesContent = auxDiv.getElementsByClassName("panel-images-div");
    if (newImagesContent.length == 1) {
        imagesDiv.innerHTML = newImagesContent[0].innerHTML;
    }
}

function panelSaveImage() {
    const form = document.getElementById("panel-new-image-form");
    const formData = new FormData(form);
    
    fetch(window.location.href, {
        method: 'POST',
        body: formData,
    }).then(response => {
        return response.text().then(text => ({
            status: response.status,
            text: text,
        }));
    }).then(ret => {
        if (ret.status != 200) {
            alert(ret.text);
        } else {
            updateImageDivContent(ret.text);
        }
    });
}

function panelDeleteImage(imageName) {
    fetch(window.location.href, {
        method: 'DELETE',
        body: imageName,
    }).then(response => {
        return response.text().then(text => ({
            status: response.status,
            text: text,
        }));
    }).then(ret => {
        if (ret.status != 200) {
            alert(ret.text);
        } else {
            updateImageDivContent(ret.text);
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
