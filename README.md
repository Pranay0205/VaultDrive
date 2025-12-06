<<<<<<< HEAD
# VaultDrive

A secure, self-hosted file storage backend written in Go. Think of it like a personal Dropbox, but with a heavy focus on encryption and privacy.

## What it does

VaultDrive handles the heavy lifting for a secure file sharing system. It's designed to work with a frontend that handles client-side encryption, while the backend manages storage, authentication, and key exchange.

**Key Features:**

- **User Auth**: Secure signup/login with JWTs and automatic RSA key generation.
- **Encrypted Storage**: Files are stored on disk, but the backend only sees encrypted blobs. We store the metadata (IV, salt) so the client can decrypt it.
- **Secure Sharing**: Share files with other users without revealing your password or the raw file key. We use a "wrapped key" system (encrypting the file key with the recipient's public key).
- **Access Control**: Revoke access to shared files instantly.

## Tech Stack

- **Language**: Go (Golang)
- **Database**: PostgreSQL
- **ORM-ish**: sqlc (for type-safe SQL queries)
- **Auth**: JWT + Refresh Tokens

## Setup

1.  **Clone the repo**

    ```bash
    git clone https://github.com/Pranay0205/VaultDrive.git
    cd VaultDrive
    ```

2.  **Database**
    Make sure you have PostgreSQL running. Create a database named `vaultdrive` (or whatever you prefer).

3.  **Environment Variables**
    Create a `.env` file in the root:

    ```env
    PORT=8080
    DB_URL=postgres://user:password@localhost:5432/vaultdrive?sslmode=disable
    JWT_SECRET=your-super-secret-key-change-this
    ```

4.  **Run it**
    ```bash
    go run main.go
    ```

## API Endpoints

Here's a quick look at what you can hit:

- `POST /register` - Create account & generate keys
- `POST /login` - Get tokens & your encrypted private key
- `POST /files/upload` - Upload a file (multipart)
- `GET /files` - List your files
- `GET /files/{id}/download` - Download file stream
- `POST /files/{id}/share` - Share with another user
- `DELETE /files/{id}/revoke/{user_id}` - Revoke access

## Security Architecture

VaultDrive is built on a **Zero-Knowledge** architecture. The server acts as a blind storage provider; it never sees your files in plaintext, nor does it have access to the keys required to decrypt them.

### 1. Cryptographic Primitives

We use industry-standard algorithms to ensure data safety:

- **File Encryption:** AES-256-GCM (Authenticated Encryption).
- **Key Derivation:** PBKDF2 (SHA-256, 100,000 iterations) with unique salts.
- **Key Exchange:** RSA-2048 (for sharing file keys between users).

### 2. The Encryption Workflow (Upload)

When a user uploads a file, the following happens entirely in the **browser**:

1.  **Key Generation:** A random 32-byte AES key is generated.
2.  **Encryption:** The file is encrypted using this key via AES-GCM. This produces the `Ciphertext`, an `IV` (Initialization Vector), and an `Auth Tag`.
3.  **Key Wrapping:** The AES key itself is encrypted (wrapped) using the user's own Public Key (or derived from their password for personal files).
4.  **Storage:** The browser sends the `Ciphertext`, `IV`, `Salt`, and `Wrapped Key` to the server. The server stores these blobs without knowing what they contain.

### 3. Secure File Sharing

Sharing is done without re-encrypting the entire file:

1.  **Key Retrieval:** The owner's client retrieves the file's encrypted AES key and decrypts it locally.
2.  **Public Key Fetch:** The client fetches the **Recipient's Public Key** from the server.
3.  **Re-wrapping:** The client encrypts the file's AES key using the Recipient's Public Key.
4.  **Access Grant:** This new "Wrapped Key" is sent to the server and stored in the `file_access_keys` table, granting the recipient cryptographic access to the file.

### 4. Access Revocation

Revoking access is immediate and cryptographic:

- The owner requests revocation for a specific user.
- The server performs a **hard delete** of the specific row in the `file_access_keys` table containing that user's wrapped key.
- **Result:** Even if the user has the encrypted file blob, they no longer have the key required to decrypt it. Access is effectively lost.
=======
<div align="center">
    <img src="screenshots/logo.svg" alt="VaultDrive Logo" width="120">
    <h1>VaultDrive</h1>
    <p><em>Your Personal Zero-Knowledge Cloud Storage</em></p>
    <p>
        <img src="https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white" alt="Go">
        <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
        <img src="https://img.shields.io/badge/AES--256--GCM-Encrypted-green?style=for-the-badge" alt="Encrypted">
    </p>
</div>

<br>

A secure, self-hosted file storage backend written in Go. Think of it like a personal Dropbox, but with a heavy focus on encryption and privacy.

![Landing Page Of VaultDrive](screenshots/image.png)

## Features

### 🔐 User Authentication

Secure signup/login with JWTs and automatic RSA key generation.

### 💾 Encrypted Storage

Files are stored on disk, but the backend only sees encrypted blobs. We store the metadata (IV, salt) so the client can decrypt it.

### 🤝 Secure Sharing

Share files with other users without revealing your password or the raw file key. We use a "wrapped key" system (encrypting the file key with the recipient's public key).

### 🛡️ Access Control

Revoke access to shared files instantly.

## Tech Stack

- **Language**: Go (Golang)
- **Database**: PostgreSQL
- **ORM-ish**: sqlc (for type-safe SQL queries)
- **Auth**: JWT + Refresh Tokens

## Quick Start

1.  **Clone the repo**

    ```bash
    git clone https://github.com/Pranay0205/VaultDrive.git
    cd VaultDrive
    ```

2.  **Database**
    Make sure you have PostgreSQL running. Create a database named `vaultdrive` (or whatever you prefer).

3.  **Environment Variables**
    Create a `.env` file in the root:

    ```env
    PORT=8080
    DB_URL=postgres://user:password@localhost:5432/vaultdrive?sslmode=disable
    JWT_SECRET=your-super-secret-key-change-this
    ```

4.  **Run it**
    ```bash
    go run main.go
    ```

## API Endpoints

- `POST /register` - Create account & generate keys
- `POST /login` - Get tokens & your encrypted private key
- `POST /files/upload` - Upload a file (multipart)
- `GET /files` - List your files
- `GET /files/{id}/download` - Download file stream
- `POST /files/{id}/share` - Share with another user
- `DELETE /files/{id}/revoke/{user_id}` - Revoke access

## Security Architecture

VaultDrive is built on a **Zero-Knowledge** architecture. The server acts as a blind storage provider; it never sees your files in plaintext, nor does it have access to the keys required to decrypt them.

### Cryptographic Primitives

- **File Encryption:** AES-256-GCM (Authenticated Encryption)
- **Key Derivation:** PBKDF2 (SHA-256, 100,000 iterations) with unique salts
- **Key Exchange:** RSA-2048 (for sharing file keys between users)

### How It Works

**Upload:** Files are encrypted client-side with AES-256-GCM before upload. The server only stores encrypted blobs.

**Sharing:** File keys are re-wrapped with the recipient's public key, enabling secure sharing without re-encryption.

**Revocation:** Access is revoked by deleting the wrapped key from the database, making the file immediately inaccessible.
>>>>>>> 7998dc32783a4570aea4cc93ecb40b4c323a1db5
