export type Role = "USER" | "ADMIN";

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

