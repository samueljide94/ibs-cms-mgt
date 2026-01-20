import { useState } from "react";
import { LoginScreen } from "@/components/LoginScreen";
import { SearchScreen } from "@/components/SearchScreen";
import { AuthState } from "@/types/client";

export const ExtensionPopup = () => {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
  });

  const handleLogin = (username: string) => {
    setAuth({
      isAuthenticated: true,
      user: { username, role: "support" },
    });
  };

  const handleLogout = () => {
    setAuth({
      isAuthenticated: false,
      user: null,
    });
  };

  return (
    <div className="w-[360px] h-[540px] bg-background rounded-2xl shadow-2xl overflow-hidden border border-border/50">
      {!auth.isAuthenticated ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <SearchScreen
          username={auth.user?.username || "User"}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
};
