package mtex_tokens

import (
	"fmt"

	"cp-library-site/lib/html_builder"
)

const (
	DETAILS_TOKEN = "details"
	DETAILS       = "details"
	SUMMARY       = "summary"
)

/*
Arguments:
mode    string: 'main' or 'simple' (default)
summary string

Structure:
<details class={args["mode"]}-{DETAILS}>
	<summary class={args["mode"]}-{SUMMARY}><span style="margin-left: 7px;">{args["summary"]}</span></summary>
	<div class={TAB_DIV}>
		...
	</div>
</details>
*/

type DetailsToken struct {
	mode    string
	summary string
}

func NewDetailsToken(args *map[string]string) IToken {
	return &DetailsToken{
		mode:    getArgument("mode", args, "simple"),
		summary: getArgument("summary", args, ""),
	}
}

func (token *DetailsToken) Apply(builder *html_builder.HTMLBuilder) *html_builder.HTMLBuilder {
	root := html_builder.NewHTMLBuilder()

	body := root.AddEdge(html_builder.NewELementWrapper("details", &map[string]string{
		"class": fmt.Sprintf("%s-%s", token.mode, DETAILS),
	}))

	body.AddEdge(html_builder.NewELementWrapper("summary", &map[string]string{
		"class": fmt.Sprintf("%s-%s", token.mode, SUMMARY),
	})).InnerText = "<span style=\"margin-left: 7px;\">" + token.summary + "</span>"

	body.AddEdge(html_builder.NewELementWrapper("div", &map[string]string{
		"class": TAB_DIV,
	})).AppendChild(builder)

	return root
}
