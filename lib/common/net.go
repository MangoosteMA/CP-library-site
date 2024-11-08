package common

import (
	"errors"
	"io"
	"net/http"
	"time"
)

var httpClient http.Client = http.Client{Timeout: 10 * time.Second}

func RequestHTTP(url string) ([]byte, error) {
	response, err := httpClient.Get(url)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		return nil, errors.New("response code is not 200")
	}
	return io.ReadAll(response.Body)
}
