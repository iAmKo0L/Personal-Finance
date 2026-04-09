export function formatCurrency(value, currency = 'VND') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

export function monthToLabel(month) {
  const [y, m] = String(month).split('-');
  return `${m}/${y}`;
}

export function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}
