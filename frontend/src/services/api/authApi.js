import { request, requestWithFallback } from './client';

export const authApi = {
  register(payload) {
    return request('/api/auth/register', { method: 'POST', body: payload });
  },

  login(payload) {
    return request('/api/auth/login', { method: 'POST', body: payload });
  },

  getMe(token) {
    return requestWithFallback(['/api/auth/users/me', '/api/users/me', '/api/auth/me'], { token });
  },

  updateMe(payload, token) {
    return requestWithFallback(
      ['/api/auth/users/me', '/api/users/me', '/api/auth/profile'],
      { method: 'PUT', token, body: payload }
    );
  },

  updateSettings(payload, token) {
    return requestWithFallback(
      ['/api/auth/users/settings', '/api/users/settings', '/api/auth/settings'],
      { method: 'PUT', token, body: payload }
    );
  }
};
