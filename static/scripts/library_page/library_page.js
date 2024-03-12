function folderButtonClicked(buttonId) {
    const divId = buttonId.replaceAll('button', 'div');
    var div = document.getElementById(divId);
    if (div != null) {
        if (div.style.display.length == 0) {
            div.style.display = 'block';
        } else {
            div.style.display = '';
        }
    }
}
