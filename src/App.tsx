import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { AdminRoute } from "./auth/AdminRoute";
import { GuestRoute } from "./auth/GuestRoute";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { RegisterRoute } from "./auth/RegisterRoute";
import { AppShell } from "./components/AppShell";
import { PublicShell } from "./components/PublicShell";
import { AccountPage } from "./pages/AccountPage";
import { ArticlePage } from "./pages/ArticlePage";
import { EditorPage } from "./pages/EditorPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { FrontPage } from "./pages/FrontPage";
import { HomePage } from "./pages/HomePage";
import { JournalistPublicPage } from "./pages/JournalistPublicPage";
import { JournalistsPage } from "./pages/JournalistsPage";
import { LoginPage } from "./pages/LoginPage";
import { NewsroomPage } from "./pages/NewsroomPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RegisterPage } from "./pages/RegisterPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { SettingsPage } from "./pages/SettingsPage";
import { UserDetailPage } from "./pages/UserDetailPage";
import { UsersPage } from "./pages/UsersPage";
import { VerifyJournalistsPage } from "./pages/VerifyJournalistsPage";

function LegacyJournalistRedirect() {
  const { id } = useParams();
  return <Navigate to={id ? `/profesionales/${id}` : "/profesionales"} replace />;
}

export function App() {
  return (
    <Routes>
      <Route element={<PublicShell />}>
        <Route path="/" element={<FrontPage />} />
        <Route path="/categoria/:slug" element={<FrontPage />} />
        <Route path="/nota/:slug" element={<ArticlePage />} />
        <Route path="/profesionales" element={<JournalistsPage />} />
        <Route path="/profesionales/:id" element={<JournalistPublicPage />} />
        <Route path="/periodistas" element={<Navigate to="/profesionales" replace />} />
        <Route path="/periodistas/:id" element={<LegacyJournalistRedirect />} />
      </Route>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route element={<RegisterRoute />}>
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/app" element={<HomePage />} />
          <Route path="/app/profile" element={<ProfilePage />} />
          <Route path="/app/profile/editar" element={<ProfilePage />} />
          <Route path="/app/account" element={<AccountPage />} />
          <Route path="/app/redaccion" element={<NewsroomPage />} />
          <Route path="/app/redaccion/:id" element={<EditorPage />} />
          <Route element={<AdminRoute />}>
            <Route path="/app/users" element={<UsersPage />} />
            <Route path="/app/users/:id" element={<UserDetailPage />} />
            <Route path="/app/settings" element={<SettingsPage />} />
            <Route path="/admin/verify-journalists" element={<VerifyJournalistsPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
