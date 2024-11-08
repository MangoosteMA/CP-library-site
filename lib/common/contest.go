package common

import "time"

type Contest struct {
	Title    string
	Start    time.Time
	Duration time.Duration
	Platform Platform
}

func (contest *Contest) End() time.Time {
	return contest.Start.Add(contest.Duration)
}
