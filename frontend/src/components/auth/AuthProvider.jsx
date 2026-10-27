import { useCallback, useEffect, useMemo, useState } from "react";
import { api, setUnauthorizedHandler } from "../../services/api";
import { AuthContext } from "../../hooks/useAuth";
import { saveActiveConversationId } from "../../hooks/activeConversationStore";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore the session from the cookie on page load.
  useEffect(() => {
    let cancelled = false;

    api
      .getCurrentUser()
      .catch(() => null)
      .then((currentUser) => {
        if (cancelled) return;
        setUser(currentUser);
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Any API call rejected for an expired session logs the user out locally.
  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    return () => setUnauthorizedHandler(() => {});
  }, []);

  const signup = useCallback(async (details) => {
    setUser(await api.signup(details));
  }, []);

  const login = useCallback(async (credentials) => {
    setUser(await api.login(credentials));
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      // Don't reopen this user's conversation for whoever logs in next.
      saveActiveConversationId(null);
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(async (details) => {
    setUser(await api.updateProfile(details));
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, signup, login, logout, updateProfile }),
    [user, isLoading, signup, login, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
