import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('12345678');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    const nextErrors = {};
    const emailTrimmed = email.trim();
    if (!emailTrimmed) nextErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(emailTrimmed)) nextErrors.email = 'Email format is invalid';
    if (!password) nextErrors.password = 'Password is required';
    else if (password.length < 8) nextErrors.password = 'Password must be at least 8 characters';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submit(e) {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim(), password);
      nav('/dashboard');
    } catch (err) {
      setSubmitError(err.message || 'Login failed');
    } finally { setLoading(false); }
  }

  return (
    <div className="auth-wrap">
      <form className="card auth-card" onSubmit={submit}>
        <h2>Welcome back</h2>
        <p className="muted">Sign in to continue managing your personal finance.</p>
        {submitError && <p className="text-danger">{submitError}</p>}
        <label>
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="you@example.com"
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </label>
        <label>
          Password
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Enter your password"
          />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </label>
        <button className="btn btn-primary" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
        <p>New user? <Link to="/register">Create account</Link></p>
      </form>
    </div>
  );
}
