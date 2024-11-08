package mtex_tokens

const (
	CENTER_TOKEN = "center"
	CENTER_DIV   = "center-align-div"
)

/*
Structure:
<div class=CENTER_DIV>
	...
</div>
*/

func NewCenterToken() IToken {
	return &WrapperToken{
		elementType: "div",
		args: &map[string]string{
			"class": CENTER_DIV,
		},
	}
}
