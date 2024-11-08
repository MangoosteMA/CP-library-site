package atcoder

import (
	"cp-library-site/lib/common"

	"github.com/anaskhan96/soup"
)

const ATCODER_URL = "https://atcoder.jp"

func RequestScheduledContests() ([]*common.Contest, error) {
	bodyHTML, err := common.RequestHTTP(ATCODER_URL)
	if err != nil {
		return nil, err
	}

	root := soup.HTMLParse(string(bodyHTML))
	upcomingContestsDiv := root.Find("div", "id", "contest-table-upcoming")
	if upcomingContestsDiv.Error != nil {
		return nil, upcomingContestsDiv.Error
	}

	contestsBody := upcomingContestsDiv.Find("tbody")
	if contestsBody.Error != nil {
		return nil, contestsBody.Error
	}

	contests := make([]*common.Contest, 0)
	for _, contestInfo := range contestsBody.FindAll("tr") {
		nodes := contestInfo.FindAll("td")
		if len(nodes) != 2 {
			continue
		}

		contestA := nodes[1].Find("a")
		if contestA.Error != nil {
			continue
		}
		url, ok := contestA.Attrs()["href"]
		if !ok {
			continue
		}

		start, err := parseContestStart(nodes[0].FullText())
		if err != nil {
			continue
		}
		duration, err := parseContestDuration(ATCODER_URL + url)
		if err != nil {
			continue
		}

		contests = append(contests, &common.Contest{
			Title:    contestA.Text(),
			Start:    start,
			Duration: duration,
			Platform: common.PLATFORM_ATCODER,
		})
	}
	return contests, nil
}
