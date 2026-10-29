import { apiRequest } from './api';

// Busca todas as tarefas do usuário autenticado, com suporte a filtros e busca.
export function getTasks(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.priority) query.append('priority', params.priority);
  if (params.category) query.append('category', params.category);
  if (params.done !== undefined) query.append('done', params.done);

  const queryString = query.toString();
  return apiRequest(queryString ? `/tasks?${queryString}` : '/tasks');
}

// Cria uma nova tarefa (aceita string de título ou objeto completo de atributos).
export function createTask(taskInput) {
  const payload = typeof taskInput === 'string' ? { title: taskInput } : taskInput;

  return apiRequest('/tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Atualiza título, status ou posição da tarefa.
export function updateTask(id, data) {
  return apiRequest(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// Remove uma tarefa específica.
export function deleteTask(id) {
  return apiRequest(`/tasks/${id}`, {
    method: 'DELETE',
  });
}

// Remove tarefas por status: done=true ou done=false.
export function deleteTasksByStatus(done) {
  return apiRequest(`/tasks?done=${done}`, {
    method: 'DELETE',
  });
}

// Persiste a nova ordem das tarefas após drag and drop.
export function reorderTasks(taskIds) {
  return apiRequest('/tasks/reorder', {
    method: 'PATCH',
    body: JSON.stringify({ taskIds }),
  });
}