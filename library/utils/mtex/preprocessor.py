class MtexPreprocessor:
    KEY_WORDS = {
        '\\implies'   : '&#10233;',
        '\\qed'       : '<font size="-2" style="float: right;">&#11036;</font>',
        '\\complexity': '<font size="+1">&#119978;</font>',
        '~---'        : ' &mdash;',
        '\\<<'        : '&laquo;',
        '\\>>'        : '&raquo;',
        '\\iff'       : '&Longleftrightarrow;'
    }

    def __init__(self, text: str):
        self.text = text

    def processInput(self) -> str:
        processedText = self.text
        for keyWord, replaceWith in MtexPreprocessor.KEY_WORDS.items():
            processedText = processedText.replace(keyWord, replaceWith)
        return processedText
