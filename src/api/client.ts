import type {
  ApiError,
  AppNotification,
  AppSettings,
  Article,
  ArticleDraft,
  ArticleSummary,
  AdminOverview,
  AuthResponse,
  AuthorStats,
  Category,
  JournalistApplication,
  JournalistCard,
  JournalistProfile,
  ProfileFields,
  PublicSettings,
  RelationState,
  Role,
  User,
  UserPage,
  VerificationStatus,
} from "./types";

function resolveApiUrl(): string {
  const runtime = window.__APP_CONFIG__?.API_URL?.trim();
  if (runtime) {
    return runtime.replace(/\/$/, "");
  }
  const fromEnv = import.meta.env.VITE_API_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  return "";
}

export function mediaUrl(path: string | null | undefined) {
  if (!path) {
    return null;
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${resolveApiUrl()}${path}`;
}

async function parseError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiError;
    return body.message || body.error || "Ocurrió un error inesperado";
  } catch {
    return "Ocurrió un error inesperado";
  }
}

export class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshing: Promise<boolean> | null = null;

  constructor() {
    this.refreshToken = sessionStorage.getItem("refreshToken");
  }

  setSession(auth: AuthResponse | null) {
    if (!auth) {
      this.accessToken = null;
      this.refreshToken = null;
      sessionStorage.removeItem("refreshToken");
      return;
    }
    this.accessToken = auth.accessToken;
    this.refreshToken = auth.refreshToken;
    sessionStorage.setItem("refreshToken", auth.refreshToken);
  }

  hasRefreshToken() {
    return Boolean(this.refreshToken);
  }

  async register(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    profile: ProfileFields = {}
  ): Promise<AuthResponse> {
    const auth = await this.request<AuthResponse>("/api/auth/register", {
      method: "POST",
      auth: false,
      body: { firstName, lastName, email, password, ...profile },
    });
    this.setSession(auth);
    return auth;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const auth = await this.request<AuthResponse>("/api/auth/login", {
      method: "POST",
      auth: false,
      body: { email, password },
    });
    this.setSession(auth);
    return auth;
  }

  async refresh(): Promise<AuthResponse | null> {
    if (!this.refreshToken) {
      return null;
    }
    const auth = await this.request<AuthResponse>("/api/auth/refresh", {
      method: "POST",
      auth: false,
      body: { refreshToken: this.refreshToken },
    });
    this.setSession(auth);
    return auth;
  }

  async logout() {
    const token = this.refreshToken;
    this.setSession(null);
    if (!token) {
      return;
    }
    try {
      await this.request("/api/auth/logout", {
        method: "POST",
        auth: false,
        body: { refreshToken: token },
      });
    } catch {
      // La sesión local ya quedó limpia.
    }
  }

  me() {
    return this.request<User>("/api/auth/me");
  }

  changePassword(currentPassword: string, newPassword: string) {
    return this.request("/api/auth/change-password", {
      method: "POST",
      body: { currentPassword, newPassword },
    });
  }

  forgotPassword(email: string) {
    return this.request<{ message: string }>("/api/auth/forgot-password", {
      method: "POST",
      auth: false,
      body: { email },
    });
  }

  resetPassword(token: string, newPassword: string) {
    return this.request<{ message: string }>("/api/auth/reset-password", {
      method: "POST",
      auth: false,
      body: { token, newPassword },
    });
  }

  updateProfile(
    input: {
      firstName: string;
      lastName: string;
      bio?: string | null;
      specialty?: string | null;
      xUrl?: string | null;
      instagramUrl?: string | null;
      facebookUrl?: string | null;
      username?: string | null;
    } & ProfileFields
  ) {
    return this.request<User>("/api/auth/me", {
      method: "PATCH",
      body: input,
    });
  }

  listUsers(params: {
    q?: string;
    page?: number;
    size?: number;
    enabled?: boolean;
    role?: Role;
  } = {}) {
    const query = new URLSearchParams();
    if (params.q?.trim()) {
      query.set("q", params.q.trim());
    }
    if (params.page != null) {
      query.set("page", String(params.page));
    }
    if (params.size != null) {
      query.set("size", String(params.size));
    }
    if (params.enabled != null) {
      query.set("enabled", String(params.enabled));
    }
    if (params.role) {
      query.set("role", params.role);
    }
    const qs = query.toString();
    return this.request<UserPage>(`/api/users${qs ? `?${qs}` : ""}`);
  }

  getUser(id: string) {
    return this.request<User>(`/api/users/${id}`);
  }

  createUser(
    input: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      role: Role;
      username?: string | null;
    } & ProfileFields
  ) {
    return this.request<User>("/api/users", {
      method: "POST",
      body: input,
    });
  }

  updateUser(
    id: string,
    input: { firstName?: string; lastName?: string; role?: Role; enabled?: boolean } & ProfileFields
  ) {
    return this.request<User>(`/api/users/${id}`, {
      method: "PATCH",
      body: input,
    });
  }

  deleteUser(id: string) {
    return this.request(`/api/users/${id}`, { method: "DELETE" });
  }

  getPublicSettings() {
    return this.request<PublicSettings>("/api/settings/public", { auth: false });
  }

  getSettings() {
    return this.request<AppSettings>("/api/settings");
  }

  updateSettings(input: {
    allowPublicRegistration: boolean;
    maxFailedAttempts: number;
    lockDurationMinutes: number;
    passwordMinLength: number;
    passwordMaxLength: number;
    passwordRequireUppercase: boolean;
    passwordRequireLowercase: boolean;
    passwordRequireDigit: boolean;
  }) {
    return this.request<AppSettings>("/api/settings", {
      method: "PATCH",
      body: input,
    });
  }

  registerJournalist(form: FormData) {
    return this.request<AuthResponse>("/api/auth/register-journalist", {
      method: "POST",
      auth: false,
      form,
    }).then((auth) => {
      this.setSession(auth);
      return auth;
    });
  }

  updateAvatar(file: File) {
    const form = new FormData();
    form.set("file", file);
    return this.request<User>("/api/auth/me/avatar", { method: "POST", form });
  }

  listCategories() {
    return this.request<Category[]>("/api/categories", { auth: false });
  }

  listArticles(category?: string, auth = false) {
    const query = category ? `?category=${encodeURIComponent(category)}` : "";
    return this.request<ArticleSummary[]>(`/api/articles${query}`, { auth });
  }

  getArticleBySlug(slug: string) {
    return this.request<Article>(`/api/articles/slug/${encodeURIComponent(slug)}`, { auth: false });
  }

  recordView(slug: string, visitorId: string) {
    return this.request<{ viewCount: number }>(`/api/articles/slug/${encodeURIComponent(slug)}/view`, {
      method: "POST",
      body: { visitorId },
    });
  }

  myArticles() {
    return this.request<Article[]>("/api/articles/mine");
  }

  authorStats() {
    return this.request<AuthorStats>("/api/articles/stats");
  }

  adminAuthorStats(id: string) {
    return this.request<AuthorStats>(`/api/admin/journalists/${id}/stats`);
  }

  adminOverview() {
    return this.request<AdminOverview>("/api/admin/overview");
  }

  getArticle(id: string) {
    return this.request<Article>(`/api/articles/${id}`);
  }

  createArticle(input: ArticleDraft) {
    return this.request<Article>("/api/articles", { method: "POST", body: input });
  }

  updateArticle(id: string, input: Partial<ArticleDraft>) {
    return this.request<Article>(`/api/articles/${id}`, { method: "PUT", body: input });
  }

  publishArticle(id: string) {
    return this.request<Article>(`/api/articles/${id}/publish`, { method: "POST" });
  }

  archiveArticle(id: string) {
    return this.request<Article>(`/api/articles/${id}/archive`, { method: "POST" });
  }

  uploadCover(id: string, file: File) {
    const form = new FormData();
    form.set("file", file);
    return this.request<Article>(`/api/articles/${id}/cover`, { method: "POST", form });
  }

  listJournalists() {
    return this.request<JournalistCard[]>("/api/journalists", { auth: false });
  }

  getJournalist(id: string) {
    return this.request<JournalistProfile>(`/api/journalists/${id}`);
  }

  follow(id: string) {
    return this.request<RelationState>(`/api/journalists/${id}/follow`, { method: "POST" });
  }

  unfollow(id: string) {
    return this.request<RelationState>(`/api/journalists/${id}/follow`, { method: "DELETE" });
  }

  subscribe(id: string) {
    return this.request<RelationState>(`/api/journalists/${id}/subscribe`, { method: "POST" });
  }

  unsubscribe(id: string) {
    return this.request<RelationState>(`/api/journalists/${id}/subscribe`, { method: "DELETE" });
  }

  replaceDegree(file: File) {
    const form = new FormData();
    form.set("degree", file);
    return this.request<User>("/api/journalists/me/degree", { method: "POST", form });
  }

  listApplications(status: VerificationStatus = "PENDING") {
    return this.request<JournalistApplication[]>(`/api/admin/journalists?status=${status}`);
  }

  approveJournalist(id: string) {
    return this.request<JournalistApplication>(`/api/admin/journalists/${id}/approve`, { method: "POST" });
  }

  rejectJournalist(id: string) {
    return this.request<JournalistApplication>(`/api/admin/journalists/${id}/reject`, { method: "POST" });
  }

  degreeDocument(id: string) {
    return this.requestBlob(`/api/admin/journalists/${id}/document`);
  }

  adminArticles() {
    return this.request<ArticleSummary[]>("/api/admin/articles");
  }

  adminArchiveArticle(id: string) {
    return this.request<ArticleSummary>(`/api/admin/articles/${id}/archive`, { method: "POST" });
  }

  adminCategories() {
    return this.request<Category[]>("/api/admin/categories");
  }

  createCategory(name: string) {
    return this.request<Category>("/api/admin/categories", { method: "POST", body: { name } });
  }

  updateCategory(id: string, input: { name?: string; active?: boolean }) {
    return this.request<Category>(`/api/admin/categories/${id}`, { method: "PATCH", body: input });
  }

  listNotifications() {
    return this.request<AppNotification[]>("/api/notifications");
  }

  markNotificationRead(id: string) {
    return this.request<AppNotification>(`/api/notifications/${id}/read`, { method: "POST" });
  }

  private async requestBlob(path: string): Promise<Blob> {
    const response = await this.send(path, { method: "GET", auth: true, retry: true });
    if (!response.ok) {
      throw new Error(await parseError(response));
    }
    return response.blob();
  }

  private async request<T>(
    path: string,
    options: {
      method?: string;
      body?: unknown;
      form?: FormData;
      auth?: boolean;
      retry?: boolean;
    } = {}
  ): Promise<T> {
    const response = await this.send(path, options);
    if (!response.ok) {
      throw new Error(await parseError(response));
    }
    if (response.status === 204) {
      return undefined as T;
    }
    const text = await response.text();
    return text ? (JSON.parse(text) as T) : (undefined as T);
  }

  private async send(
    path: string,
    options: {
      method?: string;
      body?: unknown;
      form?: FormData;
      auth?: boolean;
      retry?: boolean;
    }
  ): Promise<Response> {
    const { method = "GET", body, form, auth = true, retry = true } = options;
    const headers: Record<string, string> = {};
    let payload: BodyInit | undefined;
    if (form) {
      payload = form;
    } else if (body !== undefined) {
      headers["Content-Type"] = "application/json";
      payload = JSON.stringify(body);
    }
    if (auth && this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${resolveApiUrl()}${path}`, {
      method,
      headers,
      body: payload,
    });

    if (response.status === 401 && auth && retry && this.refreshToken) {
      const ok = await this.refreshOnce();
      if (ok) {
        return this.send(path, { ...options, retry: false });
      }
    }
    return response;
  }

  private refreshOnce() {
    if (!this.refreshing) {
      this.refreshing = this.refresh()
        .then((auth) => Boolean(auth))
        .catch(() => {
          this.setSession(null);
          return false;
        })
        .finally(() => {
          this.refreshing = null;
        });
    }
    return this.refreshing;
  }
}

export const api = new ApiClient();
