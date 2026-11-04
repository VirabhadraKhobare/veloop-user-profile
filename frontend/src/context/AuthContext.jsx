import { useCallback, useMemo, useState } from "react";
import { authApi } from "../services/api";
import AuthContext from "./auth-context";

export function AuthProvider({ children, initialUser = null }) {
  const [user, setUser] = useState(initialUser);

  const signIn = useCallback(async (credentials) => {
    const response = await authApi.login(credentials);
    const nextUser = response.data.data;
    setUser(nextUser);
    return nextUser;
  }, []);

  const signOut = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, setUser, signIn, signOut, isAuthenticated: Boolean(user) }),
    [signIn, signOut, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
