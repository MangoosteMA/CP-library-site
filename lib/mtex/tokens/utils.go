package mtex_tokens

func MakeToken(tokenName string, args *map[string]string) IToken {
	switch tokenName {
	case CENTER_TOKEN:
		return NewCenterToken()
	case CODE_TOKEN:
		return NewCodeToken(args)
	case DETAILS_TOKEN:
		return NewDetailsToken(args)
	case ENUMERATE_TOKEN:
		return NewEnumerateToken()
	case IMAGE_TOKEN:
		return NewImageToken(args)
	case ITEM_TOKEN:
		return NewItemToken()
	case ITEMIZE_TOKEN:
		return NewItemizeToken()
	case LINK_TOKEN:
		return NewLinkToken(args)
	case TITLE_TOKEN:
		return NewTitleToken()
	default:
		return nil
	}
}

func RequirePureText(token IToken) bool {
	switch token.(type) {
	case *CodeToken:
		return true
	default:
		return false
	}
}

func getArgument(arg string, args *map[string]string, def string) string {
	if value, ok := (*args)[arg]; ok {
		return value
	}
	return def
}
