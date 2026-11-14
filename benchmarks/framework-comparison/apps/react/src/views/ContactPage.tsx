import { useState, type FormEvent } from 'react';
import { validateContact } from '../../../../shared/catalog-utils.mjs';

export default function ContactPage() {
  const [values, setValues] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  function update(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateContact(values);
    setErrors(nextErrors);
    setSuccess(Object.keys(nextErrors).length === 0);
  }
  return (
    <main className="page-shell"><h1>Contact us</h1><p className="page-intro">Send a note to the catalog team.</p>
      <form className="contact-form" noValidate onSubmit={submit}>
        <div className="field"><label htmlFor="contact-name">Name</label><input id="contact-name" data-testid="contact-name" name="name" value={values.name} onChange={(event) => update('name', event.target.value)} />{errors.name && <span className="error" data-testid="field-error">{errors.name}</span>}</div>
        <div className="field"><label htmlFor="contact-email">Email</label><input id="contact-email" data-testid="contact-email" name="email" type="email" value={values.email} onChange={(event) => update('email', event.target.value)} />{errors.email && <span className="error" data-testid="field-error">{errors.email}</span>}</div>
        <div className="field"><label htmlFor="contact-message">Message</label><textarea id="contact-message" data-testid="contact-message" name="message" value={values.message} onChange={(event) => update('message', event.target.value)} />{errors.message && <span className="error" data-testid="field-error">{errors.message}</span>}</div>
        <button className="button" data-testid="contact-submit" type="submit">Send message</button>
        {success && <p className="success" data-testid="form-success" role="status">Message sent. Thank you!</p>}
      </form>
    </main>
  );
}
