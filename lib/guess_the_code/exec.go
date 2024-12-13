package guess_the_code

import (
	"bytes"
	"errors"
	"math/rand/v2"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
)

func ExecuteCode(code string, a, b, c string) (string, error) {
	testingId := rand.IntN(1e9)
	testingFile := filepath.Join(testingDirectory, strconv.Itoa(testingId)+".py")

	file, err := os.OpenFile(testingFile, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0660)
	if err != nil {
		return "", err
	}
	defer file.Close()

	if _, err := file.WriteString(code); err != nil {
		return "", err
	}

	command := exec.Command(
		"python3",
		filepath.Join(testingDirectory, "main.py"),
		strconv.Itoa(testingId),
		a, b, c,
	)

	var stdout bytes.Buffer
	var stderr bytes.Buffer
	command.Stdout = &stdout
	command.Stderr = &stderr

	if err := command.Run(); err != nil {
		return "", errors.New(stderr.String())
	}

	if err := os.Remove(testingFile); err != nil {
		return "", err
	}

	return stdout.String(), nil
}
