// ============================================================================
// JWT AUTH CONTEXT — NOT WIRED UP YET
// ----------------------------------------------------------------------------
// This is the real auth flow to switch to once the FastAPI backend exposes
// /api/auth/login (and ideally /api/auth/refresh). Everything below is
// written and ready but commented out, because App.tsx currently uses
// RoleContext's plain dropdown instead (per your instruction — "keep RBAC
// as a role-dropdown until there's a real backend to authenticate against").
//
// TO ACTIVATE LATER:
//   1. Uncomment everything in this file.
//   2. In main.tsx, wrap <App /> with <AuthProvider> (outermost, before
//      RoleProvider) instead of relying on RoleProvider's local dropdown.
//   3. In App.tsx, replace the role-dropdown-only gate with:
//        const { user, loading } = useAuth();
//        if (loading) return <FullScreenSpinner />;
//        if (!user) return <LoginScreen />;
//   4. Derive `role` in RoleContext from `user.role` (decoded JWT claim)
//      instead of local useState, and drop the <select> in Sidebar.tsx.
//   5. In api/client.ts, uncomment the Authorization header line in
//      apiFetch() so every request carries the bearer token.
// ============================================================================

// import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
// import type { Role } from "../types";
//
// interface AuthUser {
//   username: string;
//   role: Role;
//   district?: string; // for district-scoped roles
// }
//
// interface LoginResponse {
//   access_token: string;
//   refresh_token?: string;
//   token_type: "bearer";
// }
//
// interface AuthContextValue {
//   user: AuthUser | null;
//   loading: boolean;
//   error: string | null;
//   login: (username: string, password: string) => Promise<void>;
//   logout: () => void;
// }
//
// const AuthContext = createContext<AuthContextValue | null>(null);
// const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";
// const TOKEN_KEY = "access_token";
//
// function decodeJwt(token: string): AuthUser {
//   // Minimal JWT payload decode — no verification (the backend already
//   // verified the signature; the client only needs the claims to render).
//   const payload = JSON.parse(atob(token.split(".")[1]));
//   return { username: payload.sub, role: payload.role, district: payload.district };
// }
//
// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<AuthUser | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//
//   // On mount: if a token is already in storage, restore the session
//   // without forcing a re-login (until it's rejected by the backend).
//   useEffect(() => {
//     const token = localStorage.getItem(TOKEN_KEY);
//     if (token) {
//       try {
//         setUser(decodeJwt(token));
//       } catch {
//         localStorage.removeItem(TOKEN_KEY);
//       }
//     }
//     setLoading(false);
//   }, []);
//
//   async function login(username: string, password: string) {
//     setError(null);
//     const res = await fetch(`${API_BASE}/auth/login`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ username, password }),
//     });
//     if (!res.ok) {
//       setError(res.status === 401 ? "Incorrect username or password." : "Login failed — try again.");
//       throw new Error("login_failed");
//     }
//     const data: LoginResponse = await res.json();
//     localStorage.setItem(TOKEN_KEY, data.access_token);
//     setUser(decodeJwt(data.access_token));
//   }
//
//   function logout() {
//     localStorage.removeItem(TOKEN_KEY);
//     setUser(null);
//   }
//
//   return (
//     <AuthContext.Provider value={{ user, loading, error, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }
//
// export function useAuth() {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used within AuthProvider");
//   return ctx;
// }

export {};
