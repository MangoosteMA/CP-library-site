package mtex_tokens

const (
	TAB_TOKEN = "tab"
	TAB_DIV   = "add-tab-div"
)

/*
Structure:
<div class={TAB_DIV}>
	...
</div>
*/

func NewTabToken() IToken {
	return &WrapperToken{
		elementType: "div",
		args: &map[string]string{
			"class": TAB_DIV,
		},
	}
}
