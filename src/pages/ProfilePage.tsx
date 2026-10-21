import { useEffect, useState, type FormEvent } from "react";
import { displayName, emptyProfile, profileFromUser, profilePayload, verificationLabel } from "../api/types";
import { mediaUrl } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Field } from "../components/AuthForm";
import { ProfileFields } from "../components/ProfileFields";
import { VerifiedBadge } from "../components/VerifiedBadge";

export function ProfilePage() {
  const { user, updateProfile, updateAvatar } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [xUrl, setXUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [profile, setProfile] = useState(emptyProfile);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setBio(user.bio ?? "");
    setSpecialty(user.specialty ?? "");
    setXUrl(user.xUrl ?? "");
    setInstagramUrl(user.instagramUrl ?? "");
    setFacebookUrl(user.facebookUrl ?? "");
    setProfile(profileFromUser(user));
  }, [user]);

  if (!user) {
    return null;
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setSaving(true);
    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        ...profilePayload(profile),
        bio: bio.trim() || null,
        specialty: specialty.trim() || null,
        xUrl: xUrl.trim(),
        instagramUrl: instagramUrl.trim(),
        facebookUrl: facebookUrl.trim(),
      });
      setNotice("Perfil actualizado");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron guardar los datos");
    } finally {
      setSaving(false);
    }
  }

  const photo = mediaUrl(user.avatarUrl);

  return (
    <>
      <section className="session-card profile-hero">
        <div className="profile-hero-row">
          {photo ? (
            <img className="avatar-photo xl" src={photo} alt="" />
          ) : (
            <span className="avatar xl" aria-hidden>
              {(user.firstName?.[0] ?? "").toUpperCase()}
              {(user.lastName?.[0] ?? "").toUpperCase()}
            </span>
          )}
          <div>
            <h1>
              {displayName(user)}
              {user.role === "JOURNALIST" && user.verificationStatus === "APPROVED" ? <VerifiedBadge /> : null}
            </h1>
            <p className="lede">{user.email}</p>
            {user.role === "JOURNALIST" && user.verificationStatus !== "APPROVED" && user.verificationStatus !== "NONE" ? (
              <span className="pill off">{verificationLabel(user.verificationStatus)}</span>
            ) : null}
          </div>
        </div>
      </section>

      <form className="session-card" onSubmit={onSave}>
        <h2>Datos personales</h2>
        <p className="lede">Estos datos son tuyos. El email se gestiona con el administrador si necesitás cambiarlo.</p>
        {error ? <p className="alert">{error}</p> : null}
        {notice ? <p className="alert ok">{notice}</p> : null}
        {user.role === "JOURNALIST" ? (
          <>
            <h2>Descripción</h2>
            <p className="lede">Se ve en tu perfil público. Es libre: dónde trabajás, hobbies o lo que quieras contar.</p>
            <label className="field" htmlFor="profileBio">
              <span className="field-label">Texto</span>
              <textarea
                id="profileBio"
                value={bio}
                maxLength={4000}
                rows={6}
                placeholder="Contá lo que quieras."
                onChange={(event) => setBio(event.target.value)}
              />
            </label>
            <Field id="profileSpecialty" label="Especialidad" value={specialty} onChange={setSpecialty} required={false} />
            <h2>Redes</h2>
            <p className="lede">Opcional. Pegá el usuario o el enlace del perfil. Si lo dejás vacío, no se muestra.</p>
            <Field id="profileX" label="X" value={xUrl} onChange={setXUrl} required={false} placeholder="@usuario" />
            <Field
              id="profileInstagram"
              label="Instagram"
              value={instagramUrl}
              onChange={setInstagramUrl}
              required={false}
              placeholder="@usuario"
            />
            <Field
              id="profileFacebook"
              label="Facebook"
              value={facebookUrl}
              onChange={setFacebookUrl}
              required={false}
              placeholder="@usuario o el enlace"
            />
          </>
        ) : null}
        <div className="form-grid">
          <Field
            id="profileFirstName"
            label="Nombre"
            value={firstName}
            onChange={setFirstName}
            autoComplete="given-name"
          />
          <Field
            id="profileLastName"
            label="Apellido"
            value={lastName}
            onChange={setLastName}
            autoComplete="family-name"
          />
        </div>
        <p className="profile-kicker lede">Contacto y domicilio</p>
        <ProfileFields idPrefix="profile" values={profile} onChange={setProfile} />
        <label className="field" htmlFor="avatar">
          <span className="field-label">Foto</span>
          <input
            id="avatar"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) {
                return;
              }
              setError(null);
              setNotice(null);
              updateAvatar(file)
                .then(() => setNotice("Foto actualizada"))
                .catch((err: unknown) => setError(err instanceof Error ? err.message : "No se pudo subir la foto"));
            }}
          />
        </label>
        <div className="form-actions">
          <button className="btn-primary btn-inline" type="submit" disabled={saving}>
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </>
  );
}
