package atcoder

import (
	"errors"
	"time"

	"cp-library-site/lib/common"

	"github.com/anaskhan96/soup"
	"github.com/bmuller/arrow"
)

const JAPAN_UTC_SHIFT = time.Duration(9 * time.Hour)

func parseContestStart(str string) (time.Time, error) {
	t, err := arrow.CParse("%Y-%m-%d %H:%M:%S+0900", str)
	if err != nil {
		return time.Time{}, err
	}
	return t.Time.Add(-JAPAN_UTC_SHIFT), nil
}

func parseContestDuration(url string) (time.Duration, error) {
	bodyHTML, err := common.RequestHTTP(url)
	if err != nil {
		return 0, err
	}

	root := soup.HTMLParse(string(bodyHTML))
	durationNode := root.Find("small", "class", "contest-duration")
	if durationNode.Error != nil {
		return 0, durationNode.Error
	}

	nodes := durationNode.FindAll("time")
	if len(nodes) != 2 {
		return time.Duration(0), errors.New("seems that atcoder has changed it's time format")
	}

	start, err := parseContestStart(nodes[0].Text())
	if err != nil {
		return 0, err
	}
	end, err := parseContestStart(nodes[1].Text())
	if err != nil {
		return 0, err
	}
	return end.Sub(start), nil
}
