class MtexPreprocessor:
    KEY_WORDS = {
        'implies'   : '&#8658;',
        'qed'       : '<font size="-2" style="float: right;">&#11036;</font>',
        'complexity': '<font size="+1">&#119978;</font>'
    }

    def __init__(self, text):
        self.text = text

    def processInput(self) -> str:
        processedText = self.text
        for keyWord, replaceWith in MtexPreprocessor.KEY_WORDS.items():
            processedText = processedText.replace(f'\\{keyWord}', replaceWith)
        return processedText
