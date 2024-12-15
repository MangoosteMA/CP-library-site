package guess_the_code

import (
	"bytes"
	"errors"
	"math/rand/v2"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
)

func ExecuteCodeMany(code string, args []string) ([]string, error) {
	testingId := rand.IntN(1e9)
	testingFile := filepath.Join(testingDirectory, strconv.Itoa(testingId)+".py")

	file, err := os.OpenFile(testingFile, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0660)
	if err != nil {
		return []string{}, err
	}
	defer file.Close()

	if _, err := file.WriteString(code); err != nil {
		return []string{}, err
	}

	// TODO: run this script with isolate
	command := exec.Command(
		"python3",
		"-B",
		filepath.Join(testingDirectory, "main.py"),
		strconv.Itoa(testingId),
	)
	command.Args = append(command.Args, args...)

	var stdout bytes.Buffer
	var stderr bytes.Buffer
	command.Stdout = &stdout
	command.Stderr = &stderr

	if err := command.Run(); err != nil {
		return []string{}, errors.New(stderr.String())
	}

	if err := os.Remove(testingFile); err != nil {
		return []string{}, err
	}

	output := strings.TrimSpace(stdout.String())
	return strings.Split(output, "\n"), nil
}

func ExecuteCode(code string, a, b, c string) (string, error) {
	result, err := ExecuteCodeMany(code, []string{a, b, c})
	if err != nil {
		return "", err
	}

	return result[0], nil
}
