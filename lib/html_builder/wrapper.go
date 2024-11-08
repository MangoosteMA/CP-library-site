package html_builder

import "fmt"

type Wrapper struct {
	Header string
	Footer string
}

func NewELementWrapper(elementType string, args *map[string]string) Wrapper {
	header := fmt.Sprintf("<%s", elementType)
	if args != nil {
		for property, value := range *args {
			header += fmt.Sprintf(" %s=\"%s\"", property, value)
		}
	}
	header += ">"
	return Wrapper{
		Header: header,
		Footer: fmt.Sprintf("</%s>", elementType),
	}
}
