const editButton = document.getElementById("library-edit-button");
editButton.style.display = "block";

editButton.addEventListener("click", () => {
    document.getElementById("simple-div").style.display = "none";
    document.getElementById("admin-div").style.display = "block";
});

const saveButton = document.getElementById("save-button");

saveButton.addEventListener("click", () => {
    fetch(window.location.href, {
        method: "POST",
        body: document.getElementById("main-textarea").value,
        headers: {
            "Content-type": "text/plain; charset=UTF-8"
        }
    }).then(response => {
        if (response.status == 200) {
            location.reload();
            return;
        }

        const prevBackgroundColor = saveButton.style.backgroundColor;
        saveButton.style.backgroundColor = "red";
        setTimeout(() => {
            saveButton.style.backgroundColor = prevBackgroundColor;
        }, 1200);
    });
});
