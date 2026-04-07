import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    const nextErrors = {};
    const fullName = form.fullName.trim();
    const email = form.email.trim();
    if (!fullName) nextErrors.fullName = 'Full name is required';
    if (!email) nextErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = 'Email format is invalid';
    if (!form.password) nextErrors.password = 'Password is required';
    else if (form.password.length < 8) nextErrors.password = 'Password must be at least 8 characters';
    if (!form.confirmPassword) nextErrors.confirmPassword = 'Please confirm password';
    else if (form.confirmPassword !== form.password) nextErrors.confirmPassword = 'Passwords do not match';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submit(e) {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password
      });
      nav('/dashboard');
    } catch (err) {
      setSubmitError(err.message || 'Register failed');
    }
    finally { setLoading(false); }
  }

  return (
    <div className="auth-wrap">
      <form className="card auth-card" onSubmit={submit}>
        <h2>Create account</h2>
        <p className="muted">Start tracking income, expenses, and budgets in one place.</p>
        {submitError && <p className="text-danger">{submitError}</p>}
        <label>
          Full name
          <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Your full name" />
          {errors.fullName && <span className="field-error">{errors.fullName}</span>}
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </label>
        <label>
          Password
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters" />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </label>
        <label>
          Confirm password
          <input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Re-enter password" />
          {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
        </label>
        <button className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Register'}</button>
        <p>Already have account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
}
