import { apiRequest } from './api';

// Envia os dados do formulário de contato para a API.
export function sendContactMessage({ name, email, phone, message }) {
  return apiRequest('/contact', {
    method: 'POST',
    body: JSON.stringify({
      name,
      email,
      phone,
      message,
    }),
  });
}