package mtex_tokens

const (
	LINK_TOKEN  = "link"
	LINK        = "link"
	LINK_TARGET = "_blank"
)

/*
Arguments:
href string

Structure:
<a class={LINLK} href={args["href"]} target={LINK_TARGET}>
    ...
</a>
*/

func NewLinkToken(args *map[string]string) IToken {
	return &WrapperToken{
		elementType: "a",
		args: &map[string]string{
			"class":  LINK,
			"href":   getArgument("href", args, ""),
			"target": LINK_TARGET,
		},
	}
}
