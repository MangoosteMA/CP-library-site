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
