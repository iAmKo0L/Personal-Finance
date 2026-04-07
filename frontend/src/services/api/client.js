const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

function toQueryString(params = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      q.set(key, value);
    }
  });
  const str = q.toString();
  return str ? `?${str}` : '';
}

function getStoredToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('token') || '';
}

function resolveToken(token) {
  return token || getStoredToken();
}

export class ApiError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export async function request(path, options = {}) {
  const {
    method = 'GET',
    token,
    params,
    body,
    headers = {}
  } = options;

  const authToken = resolveToken(token);
  const response = await fetch(`${API_BASE_URL}${path}${toQueryString(params)}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {})
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(data.message || 'Request failed', response.status, data.details || null);
  }

  return data;
}

export async function requestWithFallback(paths, options = {}) {
  let lastError;
  for (const path of paths) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await request(path, options);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new ApiError('Request failed', 500);
}
