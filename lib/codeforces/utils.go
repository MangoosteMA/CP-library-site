package codeforces

import (
	"encoding/json"
	"errors"
	"fmt"

	"cp-library-site/lib/common"
)

const CODEFORCES_API_URL = "https://codeforces.com/api"

func requestAPI(method string, out any) error {
	body, err := common.RequestHTTP(fmt.Sprintf("%s/%s", CODEFORCES_API_URL, method))
	if err != nil {
		return err
	}

	var result map[string]any
	if err := json.Unmarshal(body, &result); err != nil {
		return err
	}

	if _, ok := result["result"]; !ok {
		return errors.New("response doesn't contain \"result\" field")
	}
	if status, ok := result["status"]; !ok || status != "OK" {
		return errors.New("response \"status\" field is missing or it is not OK")
	}

	encoded, err := json.Marshal(result["result"])
	if err != nil {
		return err
	}
	return json.Unmarshal(encoded, out)
}
