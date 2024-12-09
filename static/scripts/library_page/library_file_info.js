const bodyDiv = document.getElementById("body-div");

function copyCode(codeSectionId) {
    var codeSection = document.getElementById(codeSectionId);
    if (codeSection != null) {
        navigator.clipboard.writeText(codeSection.innerText);
        var checkImage = document.getElementById(codeSectionId + '-check-img');
        if (checkImage != null) {
            checkImage.style.display = 'block';
            setTimeout(function() {
                checkImage.style.display = 'none';
            }, 2000);
        }
    }
}

function openAllSections() {
    for (const details of bodyDiv.querySelectorAll("details")) {
        details.open = true;
    }
}

function closeAllSections() {
    for (const details of bodyDiv.querySelectorAll("details")) {
        details.open = false;
    }
}

for (const title of document.getElementsByClassName("library-title-div")) {
    title.style.cursor = "pointer";
    title.addEventListener("click", () => {
        var anyClosed = false;
        for (const details of bodyDiv.querySelectorAll("details")) {
            anyClosed |= !details.open;
        }
        if (anyClosed) {
            openAllSections();
        } else {
            closeAllSections();
        }
    });
}
