function folderButtonClicked(id) {
    const divId = "algo-div-" + id;
    var div = document.getElementById(divId);
    if (div == null) {
        return;
    }

    if (div.style.display.length == 0) {
        div.style.display = 'block';
    } else {
        div.style.display = '';
    }
}

const TAB_SIZE = 40;
var folderId = 0;

function createButton(type, name, depth, id, draft, onclick) {
    const button = document.createElement("button");
    if (draft) {
        button.className = "library-file-folder-button-draft";
    } else {
        button.className = "library-file-folder-button";
    }

    button.style.paddingLeft = (TAB_SIZE * depth) + "px";
    if (id != null) {
        button.id = "algo-button-" + id;
    }
    button.onclick = onclick;

    const innerDiv = document.createElement("div");
    innerDiv.className = "library-file-folder-inside-div";

    const imgContainer = document.createElement("div");
    imgContainer.className = "image-div";
    imgContainer.innerHTML = "<img src=/images/" + type + ".png class=\"file-folder-image\">";

    const nameContainer = document.createElement("div");
    nameContainer.className = "file-folder-name-div";
    nameContainer.innerText = name;

    innerDiv.appendChild(imgContainer);
    innerDiv.appendChild(nameContainer);
    button.appendChild(innerDiv);

    return button;
}

function createFolderButton(container, name, depth) {
    const id = folderId;
    folderId++;

    const button = createButton("folder", name, depth, id, false, () => {
        folderButtonClicked(id);
    });

    const subContainer = document.createElement("div");
    subContainer.className = "folder-items-div";
    subContainer.id = "algo-div-" + id;

    container.appendChild(button);
    container.appendChild(subContainer);

    return subContainer;
}

function createFileButton(name, htmlName, depth) {
    return createButton("file", name, depth, null, htmlName.endsWith("-draft"), () => {
        const link = document.createElement("a");
        link.href = window.location.href + "/" + htmlName;
        link.click();
    });
}

function dfs(data, container, depth) {
    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'object') {
            dfs(value, createFolderButton(container, key, depth), depth + 1);
        } else {
            container.appendChild(createFileButton(key, value, depth));
        }
    }
}

const libraryDiv = document.getElementById("simple-div");
const config = JSON.parse(libraryDiv.innerText);
libraryDiv.innerHTML = "";

const container = document.createElement("div");
container.className = "library-div";
container.id = "library-div";

const titleDiv = document.createElement("div");
titleDiv.className = "library-title-div";

if (window.location.href.includes("algo")) {
    titleDiv.innerText = "Алгоритмы";
} else if (window.location.href.includes("dev")) {
    titleDiv.innerText = "Разработка";
} else {
    titleDiv.innerText = "Unknown";
}

container.appendChild(titleDiv);

dfs(config, container, 1);

libraryDiv.appendChild(container);
