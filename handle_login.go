package main

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/Pranay0205/VaultDrive/auth"
	"github.com/Pranay0205/VaultDrive/internal/database"
)

func (cfg *ApiConfig) handlerLogin(w http.ResponseWriter, r *http.Request) {
	type parameters struct {
		Password string `json:"password"`
		Email    string `json:"email"`
	}
	type response struct {
		database.User
		Token        string `json:"token"`
		RefreshToken string `json:"refresh_token"`
	}

	decoder := json.NewDecoder(r.Body)
	params := parameters{}
	err := decoder.Decode(&params)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't decode parameters", err)
		return
	}

	user, err := cfg.dbQueries.GetUserByEmail(r.Context(),params.Email)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, "Incorrect email or password", err)
		return
	}

	match, err := auth.CheckPasswordHash(params.Password, user.PasswordHash)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, "Incorrect email or password", err)
		return
	}
	if !match {
		respondWithError(w, http.StatusUnauthorized, "Incorrect email or password", nil)
		return
	}

	accessToken, err := auth.MakeJWT(
		user.ID,
		cfg.jwtSecret,
		time.Hour*24*30,
	)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't create access JWT", err)
		return
	}

	refreshToken, err := auth.MakeRefreshToken()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't create refresh token", err)
		return
	}

	_, err = cfg.dbQueries.CreateRefreshToken(r.Context(),database.CreateRefreshTokenParams{
		UserID:    user.ID,
		Token:     refreshToken,
		ExpiresAt: time.Now().UTC().Add(time.Hour * 24 * 60),
	})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Couldn't save refresh token", err)
		return
	}

	respondWithJSON(w, http.StatusOK, response{
		User:         user,
		Token:        accessToken,
		RefreshToken: refreshToken,
	})
	"context"
	"encoding/json"
	"log"
	"net/http"

	"github.com/Pranay0205/VaultDrive/auth"
)

func (cfg *ApiConfig) handleLogin(w http.ResponseWriter, req *http.Request) {
	var user struct {
		Username string `json:"username"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	err := json.NewDecoder(req.Body).Decode(&user)

	if err != nil {
		log.Println("Error parsing the request body: %w", err)
		http.Error(w, "Error parsing the request body", http.StatusInternalServerError)
		return
	}

	dbUser, err := cfg.dbQueries.GetUserByEmail(context.Background(), user.Email)

	if err != nil {
		log.Println("Error getting the user from database: %w", err)
		http.Error(w, "Error getting the user", http.StatusInternalServerError)
		return
	}

	err = auth.CheckPasswordHash(dbUser.PasswordHash, user.Password)

	log.Println("User retrieved from database:", dbUser.Email, dbUser.PasswordHash[:5]+"...", user.Password[:5]+"...")

	if err != nil {
		log.Printf("Error verifying password: %v", err)
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{"user_id": dbUser.ID, "message": "Login successful"})

}
