import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import AlertBanner from '../components/AlertBanner';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProfilePage() {
  const { token, user, setUser } = useAuth();
  const [profile, setProfile] = useState({ fullName: '' });
  const [settings, setSettings] = useState({ defaultCurrency: 'USD', monthlySpendingLimit: 0 });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const currentUser = await api.getUserProfile(token);
        setUser(currentUser);
        setProfile({ fullName: currentUser.fullName || '' });
        setSettings(currentUser.settings || { defaultCurrency: 'USD', monthlySpendingLimit: 0 });
      } catch (error) {
        setStatus({ type: 'error', message: error.message || 'Failed to load profile' });
      } finally {
        setLoading(false);
      }
    })();
  }, [token, setUser]);

  async function saveProfile(e) {
    e.preventDefault();
    try {
      setSavingProfile(true);
      if (!profile.fullName.trim()) {
        setStatus({ type: 'error', message: 'Full name is required' });
        return;
      }
      const updated = await api.updateUserProfile(token, { fullName: profile.fullName.trim() });
      setUser(updated);
      setStatus({ type: 'info', message: 'Profile updated successfully' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to update profile' });
    } finally {
      setSavingProfile(false);
    }
  }

  async function saveSettings(e) {
    e.preventDefault();
    try {
      setSavingSettings(true);
      const rawLimit = String(settings.monthlySpendingLimit ?? '').replace(/,/g, '');
      const monthlySpendingLimit = Math.max(0, Number.parseFloat(rawLimit) || 0);
      const payload = {
        defaultCurrency: String(settings.defaultCurrency || 'USD').trim(),
        monthlySpendingLimit
      };
      const updated = await api.updateUserSettings(token, payload);
      setUser(updated);
      setStatus({ type: 'info', message: 'Financial settings updated successfully' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to update settings' });
    } finally {
      setSavingSettings(false);
    }
  }

  if (loading) return <LoadingSpinner text="Loading profile..." />;

  return (
    <div className="grid gap-16">
      <AlertBanner type={status.type || 'info'} message={status.message} />
      <form className="card form-grid" onSubmit={saveProfile}>
        <h3>Profile</h3>
        <p className="muted">Manage your basic account information.</p>
        <label>Full name<input value={profile.fullName} onChange={(e) => setProfile({ fullName: e.target.value })} required /></label>
        <label>Email<input value={user?.email || ''} disabled /></label>
        <button className="btn btn-primary" disabled={savingProfile}>{savingProfile ? 'Saving...' : 'Save profile'}</button>
      </form>

      <form className="card form-grid" onSubmit={saveSettings}>
        <h3>Financial Settings</h3>
        <p className="muted">Default currency and spending limit for dashboard calculations.</p>
        <label>Default currency<select value={settings.defaultCurrency} onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}><option>USD</option><option>VND</option><option>EUR</option></select></label>
        <label>Monthly spending limit<input type="number" value={settings.monthlySpendingLimit} onChange={(e) => setSettings({ ...settings, monthlySpendingLimit: e.target.value })} /></label>
        <button className="btn btn-primary" disabled={savingSettings}>{savingSettings ? 'Saving...' : 'Save settings'}</button>
      </form>
    </div>
  );
}
