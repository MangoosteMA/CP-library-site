package guess_the_code

import (
	"bytes"
	"errors"
	"io"
	"math/rand/v2"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
)

func generateAndCreateRandomPythonFile(content string) (string, error) {
	testingId := rand.IntN(1e9)
	filename := filepath.Join(testingDirectory, strconv.Itoa(testingId)+".py")

	file, err := os.OpenFile(filename, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0660)
	if err != nil {
		return "", err
	}
	defer file.Close()

	if _, err := file.WriteString(content); err != nil {
		return "", err
	}

	return filename, nil
}

func execute(command *exec.Cmd, testsDescribtor io.Reader) (string, error) {
	var stdout bytes.Buffer
	var stderr bytes.Buffer
	command.Stdin = testsDescribtor
	command.Stdout = &stdout
	command.Stderr = &stderr

	if err := command.Run(); err != nil {
		return "", errors.New(stderr.String())
	}

	return stdout.String(), nil
}

func fileBaseName(filename string) string {
	filename = filepath.Base(filename)
	return filename[:len(filename)-len(filepath.Ext(filename))]
}

func ExecuteCodeMany(code string, args []string) ([]string, error) {
	testingFile, err := generateAndCreateRandomPythonFile(code)
	if err != nil {
		return []string{}, err
	}

	// TODO: run this script with isolate
	command := exec.Command(
		"python3",
		"-B",
		filepath.Join(testingDirectory, "main.py"),
		fileBaseName(testingFile),
	)
	command.Args = append(command.Args, args...)

	output, err := execute(command, nil)
	if err != nil {
		return []string{}, err
	}

	if err := os.Remove(testingFile); err != nil {
		return []string{}, err
	}

	output = strings.TrimSpace(output)
	return strings.Split(output, "\n"), nil
}

func ExecuteCode(code string, a, b, c string) (string, error) {
	result, err := ExecuteCodeMany(code, []string{a, b, c})
	if err != nil {
		return "", err
	}

	return result[0], nil
}

func ExecuteCheckFunction(userCode, mainCode, testsDescribtor string) (string, error) {
	userFile, err := generateAndCreateRandomPythonFile(userCode)
	if err != nil {
		return "", err
	}

	mainFile, err := generateAndCreateRandomPythonFile(mainCode)
	if err != nil {
		return "", err
	}

	command := exec.Command(
		"python3",
		"-B",
		filepath.Join(testingDirectory, "test.py"),
		fileBaseName(userFile),
		fileBaseName(mainFile),
	)

	_, err = execute(command, strings.NewReader(testsDescribtor))

	if err2 := os.Remove(userFile); err2 != nil {
		return "", err
	}

	if err2 := os.Remove(mainFile); err2 != nil {
		return "", err
	}

	if err != nil {
		return "", err
	}

	return "OK", nil
}
