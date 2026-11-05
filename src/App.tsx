import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { FirebaseError } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import './App.css';

interface Profile {
  displayName: string;
}

type FormMode = 'sign-up' | 'sign-in';

function getErrorMessage(error: unknown): string {
  if (!(error instanceof FirebaseError)) {
    return 'Something went wrong. Please try again.';
  }

  const messages: Record<string, string> = {
    'auth/weak-password': 'Password must contain at least 6 characters.',
    'auth/email-already-in-use': 'An account already exists with this email.',
    'auth/invalid-credential': 'The email or password is incorrect.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/operation-not-allowed':
      'Email and password authentication is not enabled.',
    'permission-denied': 'Firestore denied access to this profile.',
  };

  const message = messages[error.code] ?? error.message;
  return `${message} (${error.code})`;
}

function App() {
  const [mode, setMode] = useState<FormMode>('sign-up');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [user, setUser] = useState(auth.currentUser);
  const [profile, setProfile] = useState<Profile | null | undefined>();
  const [authLoading, setAuthLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setProfile(undefined);
        setAuthLoading(false);
      },
      (reason) => {
        setError(getErrorMessage(reason));
        setAuthLoading(false);
      },
    );
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    return onSnapshot(
      doc(db, 'users', user.uid),
      (snapshot) => {
        setProfile(
          snapshot.exists() ? (snapshot.data() as Profile) : null,
        );
      },
      (reason) => {
        setError(getErrorMessage(reason));
        setProfile(null);
      },
    );
  }, [user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (mode === 'sign-up') {
        const credential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );

        await setDoc(doc(db, 'users', credential.user.uid), {
          displayName: name.trim(),
          createdAt: serverTimestamp(),
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      setPassword('');
    } catch (reason) {
      setError(getErrorMessage(reason));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignOut() {
    setError('');

    try {
      await signOut(auth);
    } catch (reason) {
      setError(getErrorMessage(reason));
    }
  }

  function switchMode() {
    setMode((currentMode) =>
      currentMode === 'sign-up' ? 'sign-in' : 'sign-up',
    );
    setError('');
    setPassword('');
  }

  if (authLoading) {
    return (
      <main className="app-shell">
        <section className="card">
          <p className="loading">Checking your account...</p>
        </section>
      </main>
    );
  }

  if (user) {
    return (
      <main className="app-shell">
        <section className="card profile-card">
          <p className="eyebrow">Signed in</p>
          <h1>Your profile</h1>

          {error && <p className="error-message">{error}</p>}

          {profile === undefined && (
            <p className="loading">Loading your profile...</p>
          )}

          {profile === null && (
            <p className="error-message">No profile document was found.</p>
          )}

          {profile && (
            <div className="profile-details">
              <div>
                <span>Display name</span>
                <strong>{profile.displayName}</strong>
              </div>

              <div>
                <span>User UID</span>
                <code>{user.uid}</code>
              </div>
            </div>
          )}

          <button
            className="secondary-button"
            type="button"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="card">
        <p className="eyebrow">Firebase practice</p>
        <h1>{mode === 'sign-up' ? 'Create an account' : 'Welcome back'}</h1>

        <p className="intro">
          {mode === 'sign-up'
            ? 'Create your test account and Firebase profile.'
            : 'Sign in to view your live Firebase profile.'}
        </p>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          {mode === 'sign-up' && (
            <label>
              Display name
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>
          )}

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
              autoComplete={
                mode === 'sign-up' ? 'new-password' : 'current-password'
              }
              minLength={6}
              required
            />
          </label>

          <button className="primary-button" disabled={submitting}>
            {submitting
              ? 'Please wait...'
              : mode === 'sign-up'
                ? 'Sign up'
                : 'Sign in'}
          </button>
        </form>

        <button className="text-button" type="button" onClick={switchMode}>
          {mode === 'sign-up'
            ? 'Already have an account? Sign in'
            : 'Need an account? Sign up'}
        </button>
      </section>
    </main>
  );
}

export default App;