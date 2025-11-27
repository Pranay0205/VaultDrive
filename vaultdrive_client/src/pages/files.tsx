import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Upload, Download, File, Trash2, AlertCircle, Lock, Key } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  generateSalt,
  deriveKeyFromPassword,
  encryptFile,
  decryptFile,
  arrayBufferToBase64,
  base64ToArrayBuffer,
} from "../utils/crypto";

interface FileData {
  id: string;
  filename: string;
  file_size: number;
  created_at: string;
  metadata: string;
}

export default function Files() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Password-based encryption states
  const [encryptionPassword, setEncryptionPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordAction, setPasswordAction] = useState<"upload" | "download" | null>(null);
  const [pendingDownload, setPendingDownload] = useState<{ fileId: string; filename: string; metadata: string } | null>(
    null
  );

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchFiles = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8080/files", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate("/login");
          return;
        }
        throw new Error("Failed to fetch files");
      }

      const data = await response.json();
      setFiles(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file to upload");
      return;
    }

    // Request password for encryption
    setPasswordAction("upload");
    setShowPasswordModal(true);
  };

  const performUpload = async (password: string) => {
    if (!selectedFile) return;

    setUploading(true);
    setError("");

    try {
      // 1. Generate salt for this file
      const salt = generateSalt();

      // 2. Derive encryption key from password + salt
      const encryptionKey = await deriveKeyFromPassword(password, salt, 100000);

      // 3. Encrypt the file
      const { encryptedData, iv } = await encryptFile(selectedFile, encryptionKey);

      // 4. Prepare FormData with encrypted file
      const formData = new FormData();
      const encryptedBlob = new Blob([encryptedData], {
        type: "application/octet-stream",
      });
      formData.append("file", encryptedBlob, selectedFile.name);

      // 5. Add encryption metadata (salt and IV needed for decryption)
      formData.append("iv", arrayBufferToBase64(iv));
      formData.append("salt", arrayBufferToBase64(salt));
      formData.append("algorithm", "AES-256-GCM");

      // 6. Upload to server
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8080/files/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate("/login");
          return;
        }
        throw new Error("Failed to upload file");
      }

      // Clear selected file and refresh list
      setSelectedFile(null);
      const fileInput = document.getElementById("file-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      await fetchFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (fileId: string, filename: string, metadata: string) => {
    // Request password for decryption
    setPendingDownload({ fileId, filename, metadata });
    setPasswordAction("download");
    setShowPasswordModal(true);
  };

  const performDownload = async (password: string) => {
    if (!pendingDownload) return;

    try {
      // 1. Fetch encrypted file from server
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8080/files/download?id=${pendingDownload.fileId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate("/login");
          return;
        }
        throw new Error("Failed to download file");
      }

      // 2. Get metadata from response header or use stored metadata
      let metadataStr = response.headers.get("X-File-Metadata");
      if (!metadataStr) {
        metadataStr = pendingDownload.metadata;
      }

      // 3. Parse metadata to get salt and IV
      const metadataObj = JSON.parse(metadataStr);
      const salt = new Uint8Array(base64ToArrayBuffer(metadataObj.salt));
      const iv = new Uint8Array(base64ToArrayBuffer(metadataObj.iv));

      // 4. Derive encryption key from password + salt
      const encryptionKey = await deriveKeyFromPassword(password, salt, 100000);

      // 5. Get encrypted data
      const encryptedBlob = await response.blob();
      const encryptedData = await encryptedBlob.arrayBuffer();

      // 6. Decrypt the file
      const decryptedData = await decryptFile(encryptedData, encryptionKey, iv);

      // 7. Create blob and trigger download
      const decryptedBlob = new Blob([decryptedData]);
      const url = window.URL.createObjectURL(decryptedBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = pendingDownload.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setPendingDownload(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download or decrypt file. Check your password.");
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Files</h1>
          <p className="text-muted-foreground">Upload, download, and manage your files securely</p>
        </div>

        {/* Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload File</CardTitle>
            <CardDescription>Select a file from your device to upload to VaultDrive</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  id="file-input"
                  type="file"
                  onChange={handleFileSelect}
                  className="flex-1 text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer"
                />
                <Button onClick={handleUpload} disabled={!selectedFile || uploading} className="gap-2">
                  <Upload className="w-4 h-4" />
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Files List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Files</CardTitle>
            <CardDescription>
              {loading ? "Loading files..." : `${files.length} file${files.length !== 1 ? "s" : ""} stored`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading your files...</div>
            ) : files.length === 0 ? (
              <div className="text-center py-12">
                <File className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No files uploaded yet</p>
                <p className="text-sm text-muted-foreground mt-2">Upload your first file to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <File className="w-5 h-5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.filename}</p>
                        <div className="flex gap-3 text-sm text-muted-foreground">
                          <span>{formatFileSize(file.file_size)}</span>
                          <span>•</span>
                          <span>{formatDate(file.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(file.id, file.filename, file.metadata)}
                        className="gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  {passwordAction === "upload" ? "Encrypt File" : "Decrypt File"}
                </CardTitle>
                <CardDescription>
                  {passwordAction === "upload"
                    ? "Enter a password to encrypt your file. Remember this password to decrypt it later."
                    : "Enter the password you used to encrypt this file."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Encryption Password
                  </label>
                  <input
                    type="password"
                    value={encryptionPassword}
                    onChange={(e) => setEncryptionPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && encryptionPassword) {
                        handlePasswordSubmit();
                      }
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setEncryptionPassword("");
                      setPasswordAction(null);
                      setPendingDownload(null);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handlePasswordSubmit} disabled={!encryptionPassword} className="flex-1">
                    {passwordAction === "upload" ? "Encrypt & Upload" : "Decrypt & Download"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );

  async function handlePasswordSubmit() {
    if (!encryptionPassword) return;

    setShowPasswordModal(false);
    const password = encryptionPassword;
    setEncryptionPassword("");

    if (passwordAction === "upload") {
      await performUpload(password);
    } else if (passwordAction === "download") {
      await performDownload(password);
    }

    setPasswordAction(null);
  }
}
