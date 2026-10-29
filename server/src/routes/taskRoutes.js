const { Router } = require('express');

const taskController = require('../controllers/taskController');
const authMiddleware = require('../middlewares/authMiddleware');

const taskRoutes = Router();

// Todas as rotas de tarefas são privadas.
// O usuário só pode acessar tarefas vinculadas ao próprio login.
taskRoutes.use(authMiddleware);

taskRoutes.get('/', taskController.listTasks);
taskRoutes.post('/', taskController.createTask);
taskRoutes.patch('/reorder', taskController.reorderTasks);
taskRoutes.patch('/:id', taskController.updateTask);
taskRoutes.delete('/:id', taskController.deleteTask);
taskRoutes.delete('/', taskController.deleteTasksByStatus);

module.exports = taskRoutes;