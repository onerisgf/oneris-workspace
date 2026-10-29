const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

// Cliente simples para centralizar as chamadas HTTP da aplicação.
// Ele adiciona automaticamente o token JWT quando existir no localStorage.
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || 'Request error');
  }

  return data;
}