export type Role = "READER" | "JOURNALIST" | "ADMIN";
export type VerificationStatus = "NONE" | "PENDING" | "APPROVED" | "REJECTED";
export type ArticleStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface ProfileFields {
  documentNumber?: string | null;
  phone?: string | null;
  birthDate?: string | null;
  street?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
}

export interface User extends ProfileFields {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  enabled?: boolean;
  lockedUntil?: string | null;
  createdAt: string;
  lastLoginAt: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  specialty?: string | null;
  xUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  verificationStatus: VerificationStatus;
  username?: string | null;
}

export interface ProfileForm {
  documentNumber: string;
  phone: string;
  birthDate: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
}

export function emptyProfile(): ProfileForm {
  return {
    documentNumber: "",
    phone: "",
    birthDate: "",
    street: "",
    city: "",
    province: "",
    postalCode: "",
  };
}

export function profileFromUser(user: ProfileFields): ProfileForm {
  return {
    documentNumber: user.documentNumber ?? "",
    phone: user.phone ?? "",
    birthDate: user.birthDate ?? "",
    street: user.street ?? "",
    city: user.city ?? "",
    province: user.province ?? "",
    postalCode: user.postalCode ?? "",
  };
}

export function profilePayload(profile: ProfileForm): ProfileFields {
  return {
    documentNumber: profile.documentNumber.trim() || null,
    phone: profile.phone.trim() || null,
    birthDate: profile.birthDate || null,
    street: profile.street.trim() || null,
    city: profile.city.trim() || null,
    province: profile.province.trim() || null,
    postalCode: profile.postalCode.trim() || null,
  };
}

export function displayName(user: Pick<User, "firstName" | "lastName">) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
}

export function roleLabel(role: Role) {
  if (role === "ADMIN") {
    return "Administrador";
  }
  if (role === "JOURNALIST") {
    return "Periodista";
  }
  return "Lector";
}

export function verificationLabel(status: VerificationStatus) {
  if (status === "PENDING") {
    return "Pendiente de verificación";
  }
  if (status === "APPROVED") {
    return "Verificado";
  }
  if (status === "REJECTED") {
    return "Rechazado";
  }
  return "Sin verificación";
}

export function canPublish(user: Pick<User, "role" | "verificationStatus">) {
  return user.role === "JOURNALIST" && user.verificationStatus === "APPROVED";
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  active: boolean;
}

export interface ArticleSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  publishedAt: string | null;
  categoryName: string;
  categorySlug: string;
  authorId: string;
  authorName: string;
  viewCount: number;
  authorUsername?: string | null;
}

export function journalistPath(person: { id: string; username?: string | null }) {
  const handle = person.username?.trim().replace(/^@/, "");
  return `/periodistas/${handle || person.id}`;
}

export function formatViews(count: number | null | undefined) {
  const value = count ?? 0;
  const label = compactCount(value);
  return value === 1 ? `${label} vista` : `${label} vistas`;
}

function compactCount(value: number) {
  if (value < 1000) {
    return String(value);
  }
  const units = [
    { limit: 1_000_000_000, suffix: "B" },
    { limit: 1_000_000, suffix: "M" },
    { limit: 1000, suffix: "k" },
  ];
  const unit = units.find((item) => value >= item.limit) ?? units[units.length - 1];
  const scaled = value / unit.limit;
  const digits = scaled >= 10 ? 0 : 1;
  const factor = 10 ** digits;
  const truncated = Math.floor(scaled * factor) / factor;
  return `${truncated}${unit.suffix}`;
}

export interface Article extends ArticleSummary {
  content: string;
  status: ArticleStatus;
  createdAt: string;
  updatedAt: string;
  categoryId: string;
  authorSpecialty: string | null;
}

export interface JournalistCard {
  id: string;
  firstName: string;
  lastName: string;
  username?: string | null;
  bio: string | null;
  specialty: string | null;
  avatarUrl: string | null;
  xUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  followers: number;
  subscribers: number;
}

export interface JournalistProfile extends JournalistCard {
  following: boolean;
  subscribed: boolean;
  articleCount?: number;
  articles: ArticleSummary[];
}

export interface RelationState {
  following: boolean;
  followers: number;
  subscribed: boolean;
  subscribers: number;
}

export interface JournalistApplication {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  specialty: string | null;
  bio: string | null;
  verificationStatus: VerificationStatus;
  hasDocument: boolean;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  articleTitle: string;
  articleSlug: string;
  authorName: string;
  read: boolean;
  createdAt: string;
}

export interface ArticleDraft {
  title: string;
  content: string;
  excerpt: string;
  categoryId: string;
}

export interface UserPage {
  items: User[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface ApiError {
  error: string;
  message: string;
}

export interface PublicSettings {
  allowPublicRegistration: boolean;
  passwordMinLength: number;
  passwordMaxLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireDigit: boolean;
}

export interface AppSettings extends PublicSettings {
  maxFailedAttempts: number;
  lockDurationMinutes: number;
  updatedAt?: string | null;
}

export function passwordPolicyHint(settings: Pick<
  PublicSettings,
  | "passwordMinLength"
  | "passwordMaxLength"
  | "passwordRequireUppercase"
  | "passwordRequireLowercase"
  | "passwordRequireDigit"
>) {
  const parts = [`entre ${settings.passwordMinLength} y ${settings.passwordMaxLength} caracteres`];
  const needs: string[] = [];
  if (settings.passwordRequireUppercase) {
    needs.push("mayúscula");
  }
  if (settings.passwordRequireLowercase) {
    needs.push("minúscula");
  }
  if (settings.passwordRequireDigit) {
    needs.push("un número");
  }
  if (needs.length > 0) {
    parts.push(`con ${needs.join(", ")}`);
  }
  return parts.join(", ");
}

