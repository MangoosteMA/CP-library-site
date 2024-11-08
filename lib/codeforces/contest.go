package codeforces

type CodeforcesContest struct {
	Id               int    `json:"id"`
	Name             string `json:"name"`
	DurationSeconds  int64  `json:"durationSeconds"`
	StartTimeSeconds int64  `json:"startTimeSeconds"`
}
