import { useState } from 'react';
import type { FormEvent } from 'react';

interface SignInFormProps {
  error: string;
  submitting: boolean;
  onSubmit: (email: string, password: string) => Promise<void>;
  onSwitchToSignUp: () => void;
}

function SignInForm({
  error,
  submitting,
  onSubmit,
  onSwitchToSignUp,
}: SignInFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(email, password);
    setPassword('');
  }

  return (
    <section className="card">
      <p className="eyebrow">Firebase practice</p>
      <h1>Welcome back</h1>
      <p className="intro">Sign in to view your live Firebase profile.</p>

      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit}>
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
            autoComplete="current-password"
            minLength={6}
            required
          />
        </label>

        <button className="primary-button" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <button
        className="text-button"
        type="button"
        onClick={onSwitchToSignUp}
      >
        Need an account? Sign up
      </button>
    </section>
  );
}

export default SignInForm;
