from .tokens     import *
from dataclasses import dataclass, astuple

PARAGRAPHS_DISTANCE = '10px'

class MtexTokenizer:
    POSSIBLE_TOKENS_LIST = [CenterToken   ,
                            CodeBlockToken,
                            DetailsToken  ,
                            EnumerateToken,
                            ItemToken     ,
                            ItemizeToken  ,
                            MathToken     ,
                            TabZoneToken  ,
                            TitleToken    ]

    def __init__(self, textData: str):
        textData = textData.strip().strip('\n')
        self.text = '\n'.join([line.rstrip() for line in textData.strip().split('\n')])
        self.processingStack = []
        if len(textData) > 0:
            self.processingStack.append(MtexTokenizer.__ParsingInfo(leftPosition=0, rightPosition=len(self.text)))

    def empty(self) -> bool:
        return len(self.processingStack) == 0

    def nextToken(self) -> TokenInterface:
        assert not self.empty(), 'No tokens left.'
        if self.processingStack[-1].leftPosition >= self.processingStack[-1].rightPosition:
            self.processingStack.pop()
            return None

        token = self.__tryFindToken()
        if token is not None:
            return token
        return self.__parseTextToken()

    @staticmethod
    def findTokenClassByName(tokenName: str) -> TokenInterface:
        for tokenClass in MtexTokenizer.POSSIBLE_TOKENS_LIST:
            if tokenClass.getTokenName() == tokenName:
                return tokenClass
        return None

# Private:
    @dataclass
    class __ParsingInfo:
        leftPosition:  int
        rightPosition: int

        def __iter__(self):
            return iter(astuple(self))

    def __tryParseMathToken(self) -> MathToken:
        leftPosition, rightPosition = self.processingStack[-1]
        if self.text[leftPosition] != '$':
            return None

        nextPosition = leftPosition + 1 + self.text[leftPosition + 1:rightPosition].find('$')
        if nextPosition <= leftPosition:
            return None

        self.processingStack[-1].leftPosition = self.__findNextUsefulPosition(nextPosition + 1, rightPosition)
        self.processingStack.append(MtexTokenizer.__ParsingInfo(leftPosition=leftPosition + 1, rightPosition=nextPosition))
        return MathToken(dict())

    def __findDataEndPos(self, dataStartPos: int, rightPosition: int) -> int:
        bracketBalance = 0
        for i in range(dataStartPos, rightPosition):
            if self.text[i] == '{':
                bracketBalance += 1
            elif self.text[i] == '}':
                if bracketBalance == 0:
                    return i
                bracketBalance -= 1

        assert False, 'Did not find the bracket.'

    def __parsePresets(self, presetsStartPos: int, presetsEndPos: int) -> dict[str, str]:
        parsedPresets: dict[str, str] = {}
        for preset in self.text[presetsStartPos:presetsEndPos].split(';'):
            middlePosition = preset.find('=')
            if middlePosition != -1:
                parsedPresets[preset[:middlePosition].strip()] = preset[middlePosition + 1:].strip()
        return parsedPresets

    def __findNextUsefulPosition(self, position: int, lastPosition: int) -> int:
        for i in range(2):
            if position < lastPosition and self.text[position] == '\n':
                position += 1
        return position

    def __tryFindToken(self) -> TokenInterface:
        leftPosition, rightPosition = self.processingStack[-1]
        parsedToken = self.__tryParseMathToken()
        if parsedToken is not None:
            return parsedToken

        if self.text[leftPosition] != '\\':
            return None

        try:
            presetsStartPos = leftPosition + self.text[leftPosition:rightPosition].index('[') + 1
            presetsEndPos = presetsStartPos + self.text[presetsStartPos:].index(']')

            dataStartPos = presetsEndPos + self.text[presetsEndPos:].index('{') + 1
            for i in range(presetsEndPos + 1, dataStartPos - 1):
                assert self.text[i].isspace(), 'No strange symbols should appear.'

            tokenName = self.text[leftPosition + 1:presetsStartPos - 1]
            tokenClass = MtexTokenizer.findTokenClassByName(tokenName)
            if tokenClass is None:
                return None

            dataEndPos = self.__findDataEndPos(dataStartPos, rightPosition)
            presets = self.__parsePresets(presetsStartPos, presetsEndPos)
            parsedToken = tokenClass(presets)
        except:
            return None

        self.processingStack[-1].leftPosition = self.__findNextUsefulPosition(dataEndPos + 1, rightPosition)
        self.processingStack.append(MtexTokenizer.__ParsingInfo(leftPosition=dataStartPos, rightPosition=dataEndPos))
        return parsedToken

    def __parseTextToken(self) -> TextToken:
        leftPosition, rightPosition = self.processingStack[-1]
        nextPosition = leftPosition + 1
        while nextPosition < rightPosition and self.text[nextPosition] not in {'\\', '$'}:
            nextPosition += 1
        self.processingStack[-1].leftPosition = nextPosition

        text = ''
        i = leftPosition
        NEW_PARAGRAPH = f'<br><div style=\"height: {PARAGRAPHS_DISTANCE}\"></div>'
        if self.text[i] == '\n':
            i += 1

        while i < nextPosition:
            if i + 1 < nextPosition and self.text[i] == '\n' and self.text[i + 1] == '\n':
                text += NEW_PARAGRAPH
                i += 1
            elif self.text[i] == '\n':
                text += ' '
            else:
                text += self.text[i]
            i += 1

        return TextToken(text)
