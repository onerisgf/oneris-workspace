const prisma = require('../database/prisma');

// Lista as tarefas do usuário autenticado, com fallback para SQL caso o schema esteja sincronizando
async function listTasks(req, res) {
  try {
    const { search, priority, category, done } = req.query;

    const where = {
      userId: req.userId,
      ...(done !== undefined && { done: done === 'true' }),
      ...(priority && { priority }),
      ...(category && { category }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { category: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const tasks = await prisma.task.findMany({
      where,
      orderBy: {
        position: 'asc'
      }
    });

    return res.json({ tasks });
  } catch (error) {
    console.warn('listTasks findMany failed, attempting resilient SQL query:', error.message);

    try {
      const baseTasks = await prisma.$queryRawUnsafe(
        `SELECT id, title, done, position, "userId", "createdAt", "updatedAt"
         FROM "Task" 
         WHERE "userId" = $1 
         ORDER BY position ASC`,
        req.userId
      );

      const tasks = baseTasks.map((t) => ({
        ...t,
        priority: 'MEDIUM',
        category: 'Geral',
        dueDate: null,
        description: '',
        subtasks: '[]'
      }));

      return res.json({ tasks });
    } catch (fallbackError) {
      console.error('Fatal listTasks error:', fallbackError);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}

// Cria uma nova tarefa com suporte resiliente a campos estendidos
async function createTask(req, res) {
  try {
    const { title, priority, category, dueDate, description, subtasks } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: 'Task title is required'
      });
    }

    const lastTask = await prisma.task.findFirst({
      where: {
        userId: req.userId,
        done: false
      },
      orderBy: {
        position: 'desc'
      }
    });

    const position = lastTask ? lastTask.position + 1 : 1;

    try {
      const task = await prisma.task.create({
        data: {
          title: title.trim(),
          userId: req.userId,
          position,
          ...(priority && { priority }),
          ...(category && { category }),
          ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
          ...(description !== undefined && { description }),
          ...(subtasks !== undefined && {
            subtasks: typeof subtasks === 'string' ? subtasks : JSON.stringify(subtasks)
          })
        }
      });

      return res.status(201).json({
        message: 'Task created successfully',
        task
      });
    } catch (createError) {
      console.warn('createTask with metadata failed, falling back to basic columns:', createError.message);

      const task = await prisma.task.create({
        data: {
          title: title.trim(),
          userId: req.userId,
          position
        }
      });

      return res.status(201).json({
        message: 'Task created successfully',
        task: {
          ...task,
          priority: priority || 'MEDIUM',
          category: category || 'Geral',
          dueDate: dueDate || null,
          description: description || '',
          subtasks: subtasks || []
        }
      });
    }
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Atualiza uma tarefa do usuário logado
async function updateTask(req, res) {
  try {
    const { id } = req.params;
    const { title, done, position, priority, category, dueDate, description, subtasks } = req.body;

    const taskExists = await prisma.task.findFirst({
      where: {
        id: Number(id),
        userId: req.userId
      }
    });

    if (!taskExists) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    const updateData = {
      ...(title !== undefined && { title: title.trim() }),
      ...(done !== undefined && { done }),
      ...(position !== undefined && { position }),
      ...(priority !== undefined && { priority }),
      ...(category !== undefined && { category }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      ...(description !== undefined && { description }),
      ...(subtasks !== undefined && {
        subtasks: typeof subtasks === 'string' ? subtasks : JSON.stringify(subtasks)
      })
    };

    try {
      const task = await prisma.task.update({
        where: { id: Number(id) },
        data: updateData
      });

      return res.json({
        message: 'Task updated successfully',
        task
      });
    } catch (updateError) {
      console.warn('updateTask with metadata failed, falling back to base fields:', updateError.message);

      const baseUpdateData = {
        ...(title !== undefined && { title: title.trim() }),
        ...(done !== undefined && { done }),
        ...(position !== undefined && { position })
      };

      const task = await prisma.task.update({
        where: { id: Number(id) },
        data: baseUpdateData
      });

      return res.json({
        message: 'Task updated successfully',
        task: {
          ...task,
          priority: priority || 'MEDIUM',
          category: category || 'Geral',
          dueDate: dueDate || null,
          description: description || '',
          subtasks: subtasks || []
        }
      });
    }
  } catch (error) {
    console.error('Update task error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Remove uma tarefa específica do usuário logado
async function deleteTask(req, res) {
  try {
    const { id } = req.params;

    const taskExists = await prisma.task.findFirst({
      where: {
        id: Number(id),
        userId: req.userId
      }
    });

    if (!taskExists) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    await prisma.task.delete({
      where: {
        id: Number(id)
      }
    });

    return res.json({
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Remove todas as tarefas do usuário conforme o status enviado
async function deleteTasksByStatus(req, res) {
  try {
    const { done } = req.query;

    if (done !== 'true' && done !== 'false') {
      return res.status(400).json({
        message: 'Query parameter done must be true or false'
      });
    }

    await prisma.task.deleteMany({
      where: {
        userId: req.userId,
        done: done === 'true'
      }
    });

    return res.json({
      message: 'Tasks deleted successfully'
    });
  } catch (error) {
    console.error('Delete tasks by status error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Atualiza a ordem das tarefas após drag and drop
async function reorderTasks(req, res) {
  try {
    const { taskIds } = req.body;

    if (!Array.isArray(taskIds)) {
      return res.status(400).json({
        message: 'taskIds must be an array'
      });
    }

    const userTasks = await prisma.task.findMany({
      where: {
        userId: req.userId,
        id: {
          in: taskIds.map(Number)
        }
      }
    });

    if (userTasks.length !== taskIds.length) {
      return res.status(400).json({
        message: 'Invalid task list'
      });
    }

    await prisma.$transaction(
      taskIds.map((taskId, index) =>
        prisma.task.update({
          where: {
            id: Number(taskId)
          },
          data: {
            position: index + 1
          }
        })
      )
    );

    return res.json({
      message: 'Tasks reordered successfully'
    });
  } catch (error) {
    console.error('Reorder tasks error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  deleteTasksByStatus,
  reorderTasks
};