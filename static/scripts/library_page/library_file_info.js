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
    const div = document.getElementById("body-div");
    for (const details of div.querySelectorAll("details")) {
        details.open = true;
    }
}

for (const title of document.getElementsByClassName("library-title-div")) {
    title.style.cursor = "pointer";
    title.addEventListener("click", () => {
        openAllSections();
    });
}
