package main

import (
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
