package mtex

import (
	"strings"

	"cp-library-site/lib/html_builder"
	mtex_tokens "cp-library-site/lib/mtex/tokens"
)

var DEFINES map[string]string = map[string]string{
	"\\implies":    "&#10233;",
	"\\qed":        "<font size=\"-2\" style=\"float: right;\">&#11036;</font>",
	"\\complexity": "<font size=\"+1\">&#119978;</font>",
	"~---":         " &mdash;",
	"\\<<":         "&laquo;",
	"\\>>":         "&raquo;",
	"\\iff":        "&Longleftrightarrow;",
}

func findNextSymbol(text string, from int, symbol byte) int {
	for from < len(text) && text[from] != symbol {
		from++
	}
	if from == len(text) {
		return -1
	}
	return from
}

func findEndOfData(source string, dataStart int) int {
	dataEnd := dataStart + 1
	balance := 1

	for dataEnd < len(source) {
		if source[dataEnd] == '{' {
			balance++
		} else if source[dataEnd] == '}' {
			balance--
		}

		if balance == 0 {
			return dataEnd
		}

		dataEnd++
	}
	return -1
}

func parseArguments(text string) *map[string]string {
	args := make(map[string]string)
	for _, argument := range strings.Split(text, ";") {
		splitter := findNextSymbol(argument, 0, '=')
		if splitter == -1 {
			continue
		}
		args[strings.TrimSpace(argument[:splitter])] = strings.TrimSpace(argument[splitter+1:])
	}
	return &args
}

func parseToken(source string) (mtex_tokens.IToken, string, string) {
	if len(source) == 0 || source[0] != '\\' {
		return nil, "", ""
	}

	argsLeft := findNextSymbol(source, 1, '[')
	if argsLeft == -1 {
		return nil, "", ""
	}

	argsRight := findNextSymbol(source, argsLeft+1, ']')
	if argsRight == -1 {
		return nil, "", ""
	}

	args := parseArguments(source[argsLeft+1 : argsRight])
	if args == nil {
		return nil, "", ""
	}

	dataStart := findNextSymbol(source, argsRight+1, '{')
	if dataStart == -1 {
		return nil, "", ""
	}

	dataEnd := findEndOfData(source, dataStart)
	if dataEnd == -1 {
		return nil, "", ""
	}

	token := mtex_tokens.MakeToken(strings.TrimSpace(source[1:argsLeft]), args)
	if token == nil {
		return nil, "", ""
	}
	return token, source[dataStart+1 : dataEnd], source[dataEnd+1:]
}

func applyDefines(text string) string {
	for pattern, value := range DEFINES {
		text = strings.ReplaceAll(text, pattern, value)
	}
	return text
}

func rtrimText(text string) string {
	trimmedText := ""
	for id, part := range strings.Split(text, "\n") {
		if id > 0 {
			trimmedText += "\n"
		}
		trimmedText += strings.TrimRight(part, " ")
	}
	return trimmedText
}

func processParagraphs(text string) string {
	runes := make([]rune, 0, len(text))
	for _, value := range text {
		runes = append(runes, value)
	}
	if len(runes) > 0 && runes[0] == '\n' {
		runes = runes[1:]
	}

	const NEW_PARAGRAPH = "<br><div style=\"height: 10px\"></div>"
	processed := ""

	for ptr := 0; ptr < len(runes); ptr++ {
		if ptr+1 < len(runes) && runes[ptr] == '\n' && runes[ptr+1] == '\n' {
			processed += NEW_PARAGRAPH
			ptr++
		} else if runes[ptr] == '\n' {
			processed += " "
		} else {
			processed += string(runes[ptr])
		}
	}

	return processed
}

func processText(text string) string {
	text = rtrimText(text)
	return processParagraphs(text)
}

func compileDfs(source string, pureText bool) *html_builder.HTMLBuilder {
	root := html_builder.NewHTMLBuilder()
	if len(source) == 0 {
		return root
	}

	if pureText {
		root.InnerText = source
		return root
	}

	if token, tokenSource, outisdeSource := parseToken(source); token != nil {
		root.AppendChild(token.Apply(compileDfs(tokenSource, mtex_tokens.RequirePureText(token))))
		root.AppendChild(compileDfs(outisdeSource, false))
	} else {
		splitter := findNextSymbol(source, 1, '\\')
		if splitter == -1 {
			root.InnerText = processText(source)
		} else {
			root.InnerText = processText(source[:splitter])
			root.AppendChild(compileDfs(source[splitter:], false))
		}
	}

	return root
}
