import type { ProfileForm } from "../api/types";
import { Field } from "./AuthForm";

const today = new Date().toISOString().slice(0, 10);

export function ProfileFields({
  idPrefix,
  values,
  onChange,
}: {
  idPrefix: string;
  values: ProfileForm;
  onChange: (next: ProfileForm) => void;
}) {
  function set(key: keyof ProfileForm, value: string) {
    onChange({ ...values, [key]: value });
  }

  return (
    <div className="form-grid">
      <Field
        id={`${idPrefix}Document`}
        label="DNI / Documento"
        value={values.documentNumber}
        onChange={(value) => set("documentNumber", value)}
        autoComplete="off"
        required={false}
      />
      <Field
        id={`${idPrefix}Phone`}
        label="Celular"
        type="tel"
        value={values.phone}
        onChange={(value) => set("phone", value)}
        autoComplete="tel"
        required={false}
      />
      <Field
        id={`${idPrefix}BirthDate`}
        label="Fecha de nacimiento"
        type="date"
        value={values.birthDate}
        onChange={(value) => set("birthDate", value)}
        autoComplete="bday"
        required={false}
        max={today}
      />
      <Field
        id={`${idPrefix}Street`}
        label="Domicilio"
        value={values.street}
        onChange={(value) => set("street", value)}
        autoComplete="street-address"
        required={false}
      />
      <Field
        id={`${idPrefix}City`}
        label="Ciudad"
        value={values.city}
        onChange={(value) => set("city", value)}
        autoComplete="address-level2"
        required={false}
      />
      <Field
        id={`${idPrefix}Province`}
        label="Provincia"
        value={values.province}
        onChange={(value) => set("province", value)}
        autoComplete="address-level1"
        required={false}
      />
      <Field
        id={`${idPrefix}PostalCode`}
        label="Código postal"
        value={values.postalCode}
        onChange={(value) => set("postalCode", value)}
        autoComplete="postal-code"
        required={false}
      />
    </div>
  );
}
