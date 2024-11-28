package views

import (
	"errors"
	"fmt"
	"net/http"
	"os"

	"cp-library-site/lib/logger"
	"cp-library-site/lib/users"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

const SESSION_USER_ID = "id"

func mergeArguments(dest, src *gin.H) {
	for key, value := range *src {
		(*dest)[key] = value
	}
}

func htmlResponse(ctx *gin.Context, template string, args *gin.H) {
	user := sessionUser(ctx)

	var computedArgs *gin.H
	if user != nil {
		computedArgs = &gin.H{
			"loggedIn": true,
			"admin":    user.Role == users.ROLE_ADMIN,
			"username": user.Login,
		}
	} else {
		computedArgs = &gin.H{
			"loggedIn": false,
		}
	}

	if args != nil {
		mergeArguments(computedArgs, args)
	}
	ctx.HTML(http.StatusOK, template, computedArgs)
}

func abort(ctx *gin.Context, status int, message string) {
	if status != http.StatusOK {
		logger.Warn("aborting request with status %d and message: \"%s\"", status, message)
	}
	ctx.String(status, message)
}

func sendFile(ctx *gin.Context, filePath string) {
	if _, err := os.Stat(filePath); errors.Is(err, os.ErrNotExist) {
		abort(ctx, http.StatusNotFound, fmt.Sprintf("File %s not found", filePath))
		return
	}

	ctx.File(filePath)
}

func createNewUserSession(ctx *gin.Context, user *users.User) error {
	session := sessions.Default(ctx)
	session.Set(SESSION_USER_ID, user.ID)

	if err := session.Save(); err != nil {
		return err
	}

	logger.Info("new session created. Id: %d, login: %s", user.ID, user.Login)
	return nil
}

func sessionUser(ctx *gin.Context) *users.User {
	session := sessions.Default(ctx)
	id := session.Get(SESSION_USER_ID)

	switch value := id.(type) {
	case uint:
		user := users.FindUserById(value)
		if user == nil {
			LogOut(ctx)
		}
		return user
	default:
		return nil
	}
}

func isAdmin(ctx *gin.Context) bool {
	user := sessionUser(ctx)
	return user != nil && user.Role == users.ROLE_ADMIN
}

func ensureIsAdmin(ctx *gin.Context) bool {
	admin := isAdmin(ctx)
	if !admin {
		abort(ctx, http.StatusForbidden, "Action is only allowed for admins")
	}
	return admin
}
