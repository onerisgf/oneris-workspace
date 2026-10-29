import { apiRequest } from './api';

// Realiza cadastro de usuário na API.
export function registerUser({ name, email, password }) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });
}

// Realiza login e retorna token + dados do usuário.
export function loginUser({ email, password }) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

// Busca os dados do usuário autenticado com base no JWT salvo.
export function getAuthenticatedUser() {
  return apiRequest('/auth/me');
}