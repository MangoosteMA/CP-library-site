def isSymbolASCII(symbol: chr):
    specialSymbols = {65288, 65289}
    return ord(symbol) < 128 or ord(symbol) in specialSymbols

def removeAllNonASCIISymbols(string: str):
    return ''.join(symbol for symbol in string if isSymbolASCII(symbol))
