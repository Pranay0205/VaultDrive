package main

import (
	"encoding/json"
	"net/http"
)

func (cfg *ApiConfig) handlerCreateFiles(w http.ResponseWriter, r *http.Request) {

	type uploadFileRequest struct {
		FileName string `json:"file_name"`
		FilePath string `json:"file_path"`
		Size     int64  `json:"size"`
	}

	err := json.NewDecoder(r.Body).Decode(&uploadFileRequest{})
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if err != nil {
		http.Error(w, "Error creating file record", http.StatusInternalServerError)
		return
	}

}
