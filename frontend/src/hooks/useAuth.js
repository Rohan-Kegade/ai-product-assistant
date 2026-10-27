import { createContext, useContext } from "react";

// Provided by AuthProvider: { user, isLoading, signup, login, logout,
// updateProfile }.
// `user` is null when logged out; `isLoading` is true until the session
// check on page load finishes.
export const AuthContext = createContext(null);

export function useAuth() {
  const auth = useContext(AuthContext);

  if (!auth) throw new Error("useAuth must be used inside AuthProvider");

  return auth;
}
