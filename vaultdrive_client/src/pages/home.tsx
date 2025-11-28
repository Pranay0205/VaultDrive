import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Shield, Lock, Database, Github, FileUp, Key } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="flex items-center justify-center mb-4">
            <img src="/icons/vault.png" alt="Vault icon by juicy_fish from Flaticon" className="w-20 h-20" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">VaultDrive</h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            A secure file storage system built with Go, React, and PostgreSQL. Demonstrates modern web architecture with
            JWT authentication and encrypted file handling.
          </p>

          <div className="flex gap-3 justify-center pt-4">
            <Button
              variant="default"
              className="gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white"
              onClick={() => window.open("https://github.com/Pranay0205/VaultDrive", "_blank")}
            >
              <Github className="w-4 h-4" />
              View on GitHub
            </Button>
            <Button
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 dark:text-blue-400"
            >
              Try Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Core Features</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="font-semibold mb-2">Secure Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  JWT-based auth with bcrypt password hashing and refresh token rotation
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                  <FileUp className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="font-semibold mb-2">File Management</h3>
                <p className="text-sm text-muted-foreground">
                  Upload, download, and manage files with metadata tracking and version control
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="font-semibold mb-2">Data Protection</h3>
                <p className="text-sm text-muted-foreground">
                  Files stored securely with proper access controls and encryption at rest
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Technology Stack</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Backend */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                    <Database className="w-5 h-5 text-cyan-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Backend</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Go (Golang) - REST API server</li>
                      <li>• PostgreSQL - Relational database</li>
                      <li>• SQLC - Type-safe SQL queries</li>
                      <li>• Goose - Database migrations</li>
                      <li>• JWT - Token-based authentication</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Frontend */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Key className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Frontend</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• React 18 - UI framework</li>
                      <li>• TypeScript - Type safety</li>
                      <li>• Vite - Build tool</li>
                      <li>• Tailwind CSS - Styling</li>
                      <li>• shadcn/ui - Component library</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Project Info */}
      <section className="container mx-auto px-4 py-16 mb-12">
        <div className="max-w-3xl mx-auto">
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">About This Project</h2>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  VaultDrive is a full-stack web application developed as a college project to demonstrate modern
                  software development practices and security implementations.
                </p>
                <p>
                  The system implements user authentication, file upload/download functionality, and proper database
                  management using industry-standard tools and frameworks.
                </p>
                <p className="pt-2">
                  <strong className="text-foreground">Key Learning Outcomes:</strong> RESTful API design, secure
                  authentication flows, database schema design, React state management, and deployment practices.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
