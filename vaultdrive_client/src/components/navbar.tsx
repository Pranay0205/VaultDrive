import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ThemeToggle } from "./theme-toggle";

interface NavbarProps {
  children: React.ReactNode;
}

export default function Navbar({ children }: NavbarProps) {
  const navigate = useNavigate();

  // Initialize state from localStorage
  const getInitialAuthState = () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      return {
        isLoggedIn: true,
        user: JSON.parse(userData) as { username: string; email: string },
      };
    }
    return { isLoggedIn: false, user: null };
  };

  const [isLoggedIn, setIsLoggedIn] = useState(getInitialAuthState().isLoggedIn);
  const [user, setUser] = useState<{ username: string; email: string } | null>(getInitialAuthState().user);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    navigate("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <>
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold text-primary">VaultDrive</h1>
            <ul className="flex gap-6">
              <li>
                <a href="/" className="hover:text-primary transition-colors">
                  Home
                </a>
              </li>
              {isLoggedIn && (
                <li>
                  <a href="/files" className="hover:text-primary transition-colors">
                    Files
                  </a>
                </li>
              )}
              <li>
                <a href="/about" className="hover:text-primary transition-colors">
                  About
                </a>
              </li>
            </ul>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {isLoggedIn && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <span className="text-sm font-medium">Hi, {user.username}</span>
                    <Avatar>
                      <AvatarImage src="" alt={user.username} />
                      <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/files")}>My Files</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={handleLogin}>Login</Button>
            )}
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </>
  );
}
