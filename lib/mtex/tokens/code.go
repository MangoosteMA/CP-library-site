package mtex_tokens

import (
	"fmt"
	"html"
	"math/rand/v2"
	"strings"

	"cp-library-site/lib/html_builder"
)

const (
	CODE_TOKEN      = "code"
	CODE_DIV        = "code-details-div"
	CODE_NAVIGATION = "code-navigation-div"
	CODE_COPY       = "copy-code-button"
	CODE_ONCLICK    = "copyCode"
	CODE_TEXT       = "Скопировать"
	CODE_LANGUAGE   = "language-div"
	CODE_MARK_IMG   = "check-mark-image"
	CODE_CHECK_SRC  = "/images/check_mark.png"
)

/*
Arguments:
language string: "C++" by default

Structure:
<div class={CODE_DIV}>
	<div class={CODE_NAVIGATION}>
		<div class={CODE_LANGUAGE}>{args["language"]}</div>
		<button class={CODE_COPY} onclick="{CODE_ONCLICK}(uuid)">
			{CODE_TEXT}
		</button>
		<img class={CODE_MARK_IMG} src={CODE_CHECK_SRC} id="uuid">
	</div>
	<pre><code class={args["language"]} id=uuid>...</code></pre>
</div>
*/

type CodeToken struct {
	language string
}

func NewCodeToken(args *map[string]string) IToken {
	return &CodeToken{
		language: getArgument("language", args, "C++"),
	}
}

func (token *CodeToken) Apply(builder *html_builder.HTMLBuilder) *html_builder.HTMLBuilder {
	codeSource := ""
	if builder != nil {
		codeSource = strings.TrimSpace(html.EscapeString(builder.Compile()))
	}

	root := html_builder.NewHTMLBuilder()
	uuid := fmt.Sprintf("%d.code", rand.IntN(1e9))

	body := root.AddEdge(html_builder.NewELementWrapper("div", &map[string]string{
		"class": CODE_DIV,
	}))

	navigation := body.AddEdge(html_builder.NewELementWrapper("div", &map[string]string{
		"class": CODE_NAVIGATION,
	}))

	navigation.AddEdge(html_builder.NewELementWrapper("div", &map[string]string{
		"class": CODE_LANGUAGE,
	})).InnerText = token.language

	navigation.AddEdge(html_builder.NewELementWrapper("button", &map[string]string{
		"class":   CODE_COPY,
		"onclick": fmt.Sprintf("%s('%s')", CODE_ONCLICK, uuid),
	})).InnerText = CODE_TEXT

	navigation.AddEdge(html_builder.Wrapper{
		Header: fmt.Sprintf("<img class=\"%s\" src=\"%s\" id=\"%s-check-img\">", CODE_MARK_IMG, CODE_CHECK_SRC, uuid),
		Footer: "",
	})

	body = body.AddEdge(html_builder.NewELementWrapper("pre", nil))
	body.AddEdge(html_builder.NewELementWrapper("code", &map[string]string{
		"class": token.language,
		"id":    uuid,
	})).InnerText = codeSource

	return root
}
