import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { emptyProfile, profilePayload, type ProfileForm } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import { AuthForm, Field } from "../components/AuthForm";
import { AuthLayout } from "../components/AuthLayout";
import { ProfileFields } from "../components/ProfileFields";
import { PasswordHint } from "../components/PasswordHint";

type AccountKind = "READER" | "JOURNALIST";

export function RegisterPage() {
  const { register, registerJournalist } = useAuth();
  const navigate = useNavigate();
  const [kind, setKind] = useState<AccountKind | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [bio, setBio] = useState("");
  const [degree, setDegree] = useState<File | null>(null);
  const [profile, setProfile] = useState(emptyProfile);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const handle = username.trim().replace(/^@/, "");
    if (kind === "JOURNALIST" && !handle) {
      setError("Elegí un nombre de usuario");
      return;
    }
    if (kind === "JOURNALIST" && !degree) {
      setError("Adjuntá el título o la matrícula profesional");
      return;
    }
    setSubmitting(true);
    try {
      if (kind === "JOURNALIST") {
        const form = new FormData();
        form.set("firstName", firstName.trim());
        form.set("lastName", lastName.trim());
        form.set("email", email.trim());
        form.set("password", password);
        form.set("username", handle);
        form.set("specialty", specialty.trim());
        form.set("bio", bio.trim());
        appendProfile(form, profile);
        form.set("degree", degree as File);
        await registerJournalist(form);
        navigate("/app/redaccion", { replace: true });
        return;
      }
      await register(firstName.trim(), lastName.trim(), email.trim(), password, profilePayload(profile));
      navigate("/app", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la cuenta");
    } finally {
      setSubmitting(false);
    }
  }

  if (!kind) {
    return (
      <AuthLayout>
        <div className="auth-card">
          <p className="eyebrow">Crear cuenta</p>
          <h1>¿Cómo vas a usar el periódico?</h1>
          <p className="lede">Los lectores entran directo. Quienes publican quedan en revisión: tienen que saber del tema.</p>
          <div className="choice-grid">
            <button type="button" className="choice-card" onClick={() => setKind("READER")}>
              <strong>Lector</strong>
              <span>Seguí profesionales y leé información de quien sabe del tema.</span>
            </button>
            <button type="button" className="choice-card" onClick={() => setKind("JOURNALIST")}>
              <strong>Profesional</strong>
              <span>Publicás sobre lo que sabés, cuando se apruebe tu cuenta.</span>
            </button>
          </div>
          <p className="footer-links">
            ¿Ya tenés cuenta? <Link to="/login">Iniciar sesión</Link>
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthForm
        wide
        title={kind === "JOURNALIST" ? "Cuenta de profesional" : "Cuenta de lector"}
        subtitle={
          kind === "JOURNALIST"
            ? "El documento queda visible solo para quien revisa la solicitud."
            : "Registrate para seguir profesionales y leer información confiable."
        }
        error={error}
        submitting={submitting}
        submitLabel="Registrarme"
        onSubmit={onSubmit}
        footer={
          <>
            ¿Ya tenés cuenta? <Link to="/login">Iniciar sesión</Link>
          </>
        }
      >
        <button type="button" className="text-btn" onClick={() => setKind(null)}>
          ← Cambiar tipo de cuenta
        </button>
        <div className="form-grid">
          <Field id="firstName" label="Nombre" autoComplete="given-name" value={firstName} onChange={setFirstName} />
          <Field id="lastName" label="Apellido" autoComplete="family-name" value={lastName} onChange={setLastName} />
        </div>
        <Field id="email" label="Email" type="email" autoComplete="email" value={email} onChange={setEmail} />
        <Field
          id="password"
          label="Contraseña"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
          extra={
            <button type="button" className="text-btn" onClick={() => setShowPassword((value) => !value)}>
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          }
        />
        <PasswordHint />
        {kind === "JOURNALIST" ? (
          <>
            <Field
              id="username"
              label="Usuario"
              value={username}
              onChange={setUsername}
              placeholder="hugovidela"
              autoComplete="off"
            />
            <p className="lede">Obligatorio y único. El perfil queda en /profesionales/{handlePreview(username)}.</p>
            <Field id="specialty" label="Especialidad" value={specialty} onChange={setSpecialty} />
            <label className="field" htmlFor="bio">
              <span className="field-label">Descripción</span>
              <textarea
                id="bio"
                value={bio}
                maxLength={4000}
                rows={4}
                placeholder="Opcional. Dónde trabajás, hobbies o lo que quieras."
                onChange={(event) => setBio(event.target.value)}
              />
            </label>
            <label className="field" htmlFor="degree">
              <span className="field-label">Título o matrícula</span>
              <input
                id="degree"
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                required
                onChange={(event) => setDegree(event.target.files?.[0] ?? null)}
              />
            </label>
          </>
        ) : null}
        <p className="eyebrow profile-kicker">Datos personales</p>
        <ProfileFields idPrefix="register" values={profile} onChange={setProfile} />
      </AuthForm>
    </AuthLayout>
  );
}

function handlePreview(value: string) {
  return value.trim().replace(/^@/, "") || "usuario";
}

function appendProfile(form: FormData, profile: ProfileForm) {
  const payload = profilePayload(profile);
  for (const [key, value] of Object.entries(payload)) {
    if (value) {
      form.set(key, value);
    }
  }
}
