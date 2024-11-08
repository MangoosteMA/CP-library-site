package views

import (
	"encoding/json"
	"errors"
	"fmt"
	"html/template"
	"net/http"
	"os"
	"strings"

	"cp-library-site/contests_parser"
	"cp-library-site/lib/logger"
	"cp-library-site/lib/papers"
	"cp-library-site/lib/users"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

func HomepageGET(ctx *gin.Context) {
	htmlResponse(ctx, "home_page.html", nil)
}

func LogOut(ctx *gin.Context) {
	session := sessions.Default(ctx)
	session.Delete(SESSION_USER_ID)
	session.Save()
	abort(ctx, http.StatusOK, "OK")
}

func LogSecretsGET(ctx *gin.Context) {
	if !ensureIsAdmin(ctx) {
		return
	}
	ctx.String(http.StatusOK, users.SecretsInfo())
}

func LoginPageGET(ctx *gin.Context) {
	htmlResponse(ctx, "login_page.html", nil)
}

func LoginPagePOST(ctx *gin.Context) {
	login := ctx.PostForm("login")
	password := ctx.PostForm("password")

	user, err := users.FindUser(login, password)
	if err != nil {
		abort(ctx, http.StatusBadRequest, err.Error())
		return
	}

	if err := createNewUserSession(ctx, user); err != nil {
		abort(ctx, http.StatusBadRequest, err.Error())
		return
	}

	abort(ctx, http.StatusOK, "OK")
}

func RegisterPageGET(ctx *gin.Context) {
	htmlResponse(ctx, "register_page.html", nil)
}

func RegisterPagePOST(ctx *gin.Context) {
	login := ctx.PostForm("login")
	password := ctx.PostForm("password")
	rpassword := ctx.PostForm("rpassword")
	secret := ctx.PostForm("secret")

	if password != rpassword {
		abort(ctx, http.StatusBadRequest, "passwords do not match")
		return
	}

	if err := users.ValidatePassword(password); err != nil {
		abort(ctx, http.StatusBadRequest, err.Error())
		return
	}

	role, err := users.GetUserRole(secret)
	if err != nil {
		abort(ctx, http.StatusBadRequest, err.Error())
		return
	}

	user, err := users.RegisterUser(login, password, role)
	if err != nil {
		abort(ctx, http.StatusBadRequest, err.Error())
		return
	}

	if err := createNewUserSession(ctx, user); err != nil {
		abort(ctx, http.StatusBadRequest, err.Error())
		return
	}

	abort(ctx, http.StatusOK, "OK")
}

func GraphEditorPageGET(ctx *gin.Context) {
	htmlResponse(ctx, "graph_editor.html", nil)
}

func ImagesGET(ctx *gin.Context) {
	filePath := "data/images/" + ctx.Param("image")
	if _, err := os.Stat(filePath); errors.Is(err, os.ErrNotExist) {
		abort(ctx, http.StatusNotFound, fmt.Sprintf("File %s not found", filePath))
		return
	}

	ctx.File(filePath)
}

func ScheduledContestsGET(ctx *gin.Context) {
	contests := make([]map[string]any, 0)

	for _, contest := range contests_parser.GetScheduledContestsList() {
		contests = append(contests, map[string]any{
			"title":    contest.Title,
			"start":    contest.Start.Unix(),
			"duration": contest.Duration.Seconds(),
			"platform": contest.Platform.String(),
		})
	}

	ctx.JSON(http.StatusOK, gin.H{
		"contests": contests,
	})
}

func libGET(ctx *gin.Context, container *papers.PapersContainer) {
	var config []byte
	var err error

	if isAdmin(ctx) {
		config, err = container.GetConfig()
	} else {
		config, err = container.GetDraftsFreeConfig()
	}

	if err != nil {
		abort(ctx, http.StatusBadRequest, "Did not parse papers config")
		return
	}

	htmlResponse(ctx, "library_page.html", &gin.H{
		"config": template.HTML(string(config)),
	})
}

func libPUT(ctx *gin.Context, container *papers.PapersContainer) {
	if !ensureIsAdmin(ctx) {
		return
	}

	configContent, err := ctx.GetRawData()
	if err != nil {
		abort(ctx, http.StatusBadRequest, fmt.Sprintf("[libPUT] failed to read config. Reason: %s", err))
		return
	}

	if err := container.UpdateConfig(string(configContent)); err != nil {
		message := fmt.Sprintf("[libPUT] failed to update config. Reason: %s", err)
		logger.Error(message)
		abort(ctx, http.StatusBadRequest, message)
		return
	}

	logger.Info("libarary config is successfully updated. New config: %s", string(configContent))
	abort(ctx, http.StatusOK, "OK")
}

func LibAlgoGET(ctx *gin.Context) {
	libGET(ctx, papers.AlgoContainer)
}

func LibAlgoPUT(ctx *gin.Context) {
	libPUT(ctx, papers.AlgoContainer)
}

func LibDevGET(ctx *gin.Context) {
	libGET(ctx, papers.DevContainer)
}

func LibDevPUT(ctx *gin.Context) {
	libPUT(ctx, papers.DevContainer)
}

func libFileInfoGET(ctx *gin.Context, container *papers.PapersContainer) {
	name := ctx.Param("html")
	htmlSource, err := container.GetHTML(name)
	if err != nil {
		abort(ctx, http.StatusNotFound, "File not found")
		return
	}

	args := &gin.H{
		"fileInfo": template.HTML(htmlSource),
	}

	if isAdmin(ctx) {
		paper, err := container.ReadPaper(name)
		if err != nil {
			abort(ctx, http.StatusInternalServerError, fmt.Sprintf("Failed to read paper %s", name))
			return
		}

		mergeArguments(args, &gin.H{
			"htmlName":   name,
			"fileName":   paper.Name,
			"filePath":   strings.Join(paper.ParentFolders, "/"),
			"mtexSource": template.HTML(string(paper.MtexSource)),
		})
	}

	htmlResponse(ctx, "library_file_info.html", args)
}

func libFileInfoPUT(ctx *gin.Context, container *papers.PapersContainer) {
	if !ensureIsAdmin(ctx) {
		return
	}

	mtexContent, err := ctx.GetRawData()
	if err != nil {
		abort(ctx, http.StatusBadRequest, fmt.Sprintf("[libFileInfoPUT] failed to read mtex. Reason: %s", err))
		return
	}

	name := ctx.Param("html")
	if err := container.UpdateMtex(name, mtexContent); err != nil {
		message := fmt.Sprintf("[libFileInfoPUT] failed to update mtex. Reason: %s", err)
		logger.Error(message)
		abort(ctx, http.StatusBadRequest, message)
		return
	}

	logger.Info("mtex source of %s is successfully updated", name)
	libFileInfoGET(ctx, container)
}

func libFileInfoPATCH(ctx *gin.Context, container *papers.PapersContainer) {
	if !ensureIsAdmin(ctx) {
		return
	}

	content, err := ctx.GetRawData()
	if err != nil {
		abort(ctx, http.StatusBadRequest, fmt.Sprintf("[libFileInfoPATCH] failed to read request's body. Reason: %s", err))
		return
	}

	var args papers.RenameArguments
	if err := json.Unmarshal(content, &args); err != nil {
		abort(ctx, http.StatusBadRequest, fmt.Sprintf("[libFileInfoPATCH] failed to parse request body. Reason: %s", err))
		return
	}

	name := ctx.Param("html")
	if err := container.RenamePaper(name, &args); err != nil {
		message := fmt.Sprintf("[libFileInfoPATCH] failed to rename paper. Reason: %s", err)
		logger.Error(message)
		abort(ctx, http.StatusInternalServerError, message)
		return
	}

	logger.Info("renamed paper %s", name)
	abort(ctx, http.StatusOK, "OK")
}

func LibAlgoFileInfoGET(ctx *gin.Context) {
	libFileInfoGET(ctx, papers.AlgoContainer)
}

func LibAlgoFileInfoPUT(ctx *gin.Context) {
	libFileInfoPUT(ctx, papers.AlgoContainer)
}

func LibAlgoFileInfoPATCH(ctx *gin.Context) {
	libFileInfoPATCH(ctx, papers.AlgoContainer)
}

func LibDevFileInfoGET(ctx *gin.Context) {
	libFileInfoGET(ctx, papers.DevContainer)
}

func LibDevFileInfoPUT(ctx *gin.Context) {
	libFileInfoPUT(ctx, papers.DevContainer)
}

func LibDevFileInfoPATCH(ctx *gin.Context) {
	libFileInfoPATCH(ctx, papers.DevContainer)
}
