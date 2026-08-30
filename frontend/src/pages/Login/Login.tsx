import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client/react';
import { LOGIN, type LoginData, type LoginVariables } from '../../graphql/auth';
import { getToken, setToken } from '../../auth/token';
import './Login.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  const [login, { loading, error }] = useMutation<LoginData, LoginVariables>(
    LOGIN,
  );

  if (getToken()) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const { data } = await login({
        variables: {
          input: {
            email,
            password,
          },
        },
      });

      if (data?.login.accessToken) {
        setToken(data.login.accessToken);

        const redirect =
          location.state?.from ??
          sessionStorage.getItem('postLoginRedirect') ??
          '/';

        sessionStorage.removeItem('postLoginRedirect');
        navigate(redirect, { replace: true });
      }
    } catch {
      // Ошибка отображается через Apollo error
    }
  }

  return (
    <main className="login terminal-page">
      <div className="terminal login__terminal">
        <header className="terminal__header">
          <span>~/digital-business-card</span>
          <div className="terminal__header-meta">
            <nav
              className="terminal__header-actions"
              aria-label="Page navigation"
            >
              <Link className="terminal-button terminal-button--compact" to="/">
                Home
              </Link>
            </nav>
            <span className="terminal__status" aria-label="Online">
              ●
            </span>
          </div>
        </header>

        <section className="terminal__content login__content">
          <p className="terminal__command">
            <span className="prompt">$</span> login
          </p>

          <h1 className="terminal__title">authenticate</h1>

          <form className="login__form" onSubmit={handleSubmit}>
            <label>
              <span>email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
              />
            </label>

            <label>
              <span>password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
              />
            </label>

            {error && <p className="login__error">authentication failed</p>}

            <button
              className="terminal-button"
              type="submit"
              disabled={loading}
            >
              {loading ? 'authenticating...' : 'authenticate'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
