export default function AlertBanner({ type = 'info', message }) {
  if (!message) return null;
  return <div className={`alert-banner ${type}`}>{message}</div>;
}
