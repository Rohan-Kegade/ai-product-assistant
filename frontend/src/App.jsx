import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AuthProvider } from "./components/auth/AuthProvider";
import {
  RedirectIfAuthenticated,
  RequireAuth,
} from "./components/auth/RouteGuards";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { ChatPage } from "./pages/ChatPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={
              <RedirectIfAuthenticated>
                <LoginPage />
              </RedirectIfAuthenticated>
            }
          />
          <Route
            path="/signup"
            element={
              <RedirectIfAuthenticated>
                <SignupPage />
              </RedirectIfAuthenticated>
            }
          />
          <Route
            path="/app"
            element={
              <RequireAuth>
                <ChatPage />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
