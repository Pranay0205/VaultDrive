-- name: CreateFileAccessKey :one
INSERT INTO file_access_keys (file_id, user_id, wrapped_key)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetFileAccessKey :one
SELECT * FROM file_access_keys
WHERE file_id = $1 AND user_id = $2;

-- name: DeleteFileAccessKey :exec
DELETE FROM file_access_keys
WHERE file_id = $1 AND user_id = $2;
