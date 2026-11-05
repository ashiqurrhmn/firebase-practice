import { useState } from 'react';
import type { FormEvent } from 'react';

interface SignUpFormProps {
  error: string;
  submitting: boolean;
  onSubmit: (name: string, email: string, password: string) => Promise<void>;
  onSwitchToSignIn: () => void;
}

function SignUpForm({
  error,
  submitting,
  onSubmit,
  onSwitchToSignIn,
}: SignUpFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(name, email, password);
    setPassword('');
  }

  return (
    <section className="card">
      <p className="eyebrow">Firebase practice</p>
      <h1>Create an account</h1>
      <p className="intro">Create your test account and Firebase profile.</p>

      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>
          Display name
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>

        <button className="primary-button" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Sign up'}
        </button>
      </form>

      <button
        className="text-button"
        type="button"
        onClick={onSwitchToSignIn}
      >
        Already have an account? Sign in
      </button>
    </section>
  );
}

export default SignUpForm;
