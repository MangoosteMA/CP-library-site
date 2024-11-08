package common

type Platform int

const (
	PLATFORM_ATCODER Platform = iota
	PLATFORM_CODEFORCES
)

func (platform Platform) String() string {
	switch platform {
	case PLATFORM_ATCODER:
		return "atcoder"
	case PLATFORM_CODEFORCES:
		return "codeforces"
	default:
		return "undefined"
	}
}
