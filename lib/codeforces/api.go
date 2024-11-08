package codeforces

import (
	"time"

	"cp-library-site/lib/common"
)

func RequestContests() ([]*common.Contest, error) {
	var cfContests []*CodeforcesContest
	err := requestAPI("contest.list", &cfContests)
	if err != nil {
		return nil, err
	}

	parsedContests := make([]*common.Contest, 0, len(cfContests))
	for _, cfContest := range cfContests {
		start := time.Unix(cfContest.StartTimeSeconds, 0)
		duration := time.Duration(cfContest.DurationSeconds * int64(time.Second))

		parsedContests = append(parsedContests, &common.Contest{
			Title:    cfContest.Name,
			Start:    start,
			Duration: duration,
			Platform: common.PLATFORM_CODEFORCES,
		})
	}
	return parsedContests, nil
}

func RequestScheduledContests() ([]*common.Contest, error) {
	contests, err := RequestContests()
	if err != nil {
		return nil, err
	}

	scheduledContests := make([]*common.Contest, 0)
	now := time.Now().UTC()
	for _, contest := range contests {
		if now.Before(contest.Start.Add(contest.Duration)) {
			scheduledContests = append(scheduledContests, contest)
		}
	}
	return scheduledContests, nil
}
