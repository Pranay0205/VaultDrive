package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
)
func (cfg *ApiConfig) getUserByUsernameHandler(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")

	if username == "" {
		http.Error(w, "Username is required", http.StatusBadRequest)
		return
	}

	user, err := cfg.dbQueries.GetUserByUsername(context.Background(), username)
	if err != nil {
		log.Printf("Error retrieving user: %v", err)
		return
	}

	log.Printf("Retrieved user: %+v", user)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(user)
}

func (cfg *ApiConfig) getUserByEmailHandler(w http.ResponseWriter, r *http.Request) {
	email:=r.URL.Query().Get("email")

	if email == "" {
		http.Error(w, "Username is required", http.StatusBadRequest)
		return
	}
	user, err := cfg.dbQueries.GetUserByEmail(context.Background(), email)
	if err != nil {
		log.Printf("Error retrieving user: %v", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(user)
}
