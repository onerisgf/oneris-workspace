import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
    closestCenter,
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
    createTask,
    deleteTask,
    deleteTasksByStatus,
    getTasks,
    reorderTasks,
    updateTask,
} from '../services/taskService';
import './TodoPage.css';

const CATEGORIES = ['Geral', 'Trabalho', 'Estudos', 'Pessoal', 'Urgente', 'Projetos'];

function parseSubtasks(subtasks) {
    if (Array.isArray(subtasks)) return subtasks;
    if (typeof subtasks === 'string') {
        try {
            const parsed = JSON.parse(subtasks);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }
    return [];
}

function SortableTaskItem({ task, children }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <li
            ref={setNodeRef}
            style={style}
            className={isDragging ? 'task-item task-item-dragging' : 'task-item'}
        >
            <button
                type="button"
                className="task-drag-handle"
                aria-label="Arrastar para reordenar prioridade"
                {...attributes}
                {...listeners}
            >
                ⋮⋮
            </button>

            {children}
        </li>
    );
}

export function TodoPage() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Formulário de nova tarefa
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState('MEDIUM');
    const [newTaskCategory, setNewTaskCategory] = useState('Geral');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');

    // Filtros e busca
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPriority, setFilterPriority] = useState('ALL');
    const [filterCategory, setFilterCategory] = useState('ALL');

    // Edição inline de título
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editingTitle, setEditingTitle] = useState('');

    // Gaveta/detalhes expandidos de subtarefas
    const [expandedTaskId, setExpandedTaskId] = useState(null);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [editingDescription, setEditingDescription] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    async function loadTasks() {
        try {
            setIsLoading(true);
            setError('');

            const response = await getTasks();
            const loaded = response.tasks || [];

            // Mescla com metadados do cache local se necessário para resiliência
            const cacheKey = `oneris_meta_${user?.id || 'anon'}`;
            const localMeta = JSON.parse(localStorage.getItem(cacheKey) || '{}');

            const enhanced = loaded.map((t) => {
                const meta = localMeta[t.id] || {};
                return {
                    ...t,
                    priority: t.priority || meta.priority || 'MEDIUM',
                    category: t.category || meta.category || 'Geral',
                    dueDate: t.dueDate || meta.dueDate || null,
                    description: t.description || meta.description || '',
                    subtasks: parseSubtasks(t.subtasks || meta.subtasks || []),
                };
            });

            setTasks(enhanced);
        } catch (err) {
            setError(err.message || 'Erro ao carregar tarefas');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadTasks();
    }, []);

    // Sincroniza metadados estendidos no localStorage para máxima resiliência
    function syncLocalMeta(taskId, data) {
        try {
            const cacheKey = `oneris_meta_${user?.id || 'anon'}`;
            const localMeta = JSON.parse(localStorage.getItem(cacheKey) || '{}');
            localMeta[taskId] = { ...(localMeta[taskId] || {}), ...data };
            localStorage.setItem(cacheKey, JSON.stringify(localMeta));
        } catch {
            // falha silenciosa se localStorage não estiver disponível
        }
    }

    // Filtragem de tarefas
    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const matchesSearch =
                searchTerm.trim() === '' ||
                task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (task.category && task.category.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesPriority =
                filterPriority === 'ALL' || task.priority === filterPriority;

            const matchesCategory =
                filterCategory === 'ALL' || task.category === filterCategory;

            return matchesSearch && matchesPriority && matchesCategory;
        });
    }, [tasks, searchTerm, filterPriority, filterCategory]);

    const todoTasks = useMemo(
        () => filteredTasks.filter((task) => !task.done),
        [filteredTasks]
    );

    const doneTasks = useMemo(
        () => filteredTasks.filter((task) => task.done),
        [filteredTasks]
    );

    // Métricas do Dashboard de Produtividade
    const metrics = useMemo(() => {
        const total = tasks.length;
        const doneCount = tasks.filter((t) => t.done).length;
        const pendingCount = total - doneCount;
        const completionRate = total > 0 ? Math.round((doneCount / total) * 100) : 0;
        const highPriorityCount = tasks.filter((t) => !t.done && t.priority === 'HIGH').length;

        return {
            total,
            doneCount,
            pendingCount,
            completionRate,
            highPriorityCount,
        };
    }, [tasks]);

    function handleLogout() {
        logout();
        navigate('/');
    }

    async function handleCreateTask(event) {
        event.preventDefault();

        if (!newTaskTitle.trim()) {
            return;
        }

        const taskData = {
            title: newTaskTitle.trim(),
            priority: newTaskPriority,
            category: newTaskCategory,
            dueDate: newTaskDueDate || null,
            subtasks: [],
        };

        try {
            const response = await createTask(taskData);
            const created = response.task || {
                id: Date.now(),
                ...taskData,
                done: false,
                position: tasks.length + 1,
            };

            const fullTask = {
                ...created,
                priority: created.priority || newTaskPriority,
                category: created.category || newTaskCategory,
                dueDate: created.dueDate || (newTaskDueDate || null),
                subtasks: parseSubtasks(created.subtasks || []),
            };

            syncLocalMeta(fullTask.id, {
                priority: fullTask.priority,
                category: fullTask.category,
                dueDate: fullTask.dueDate,
                subtasks: fullTask.subtasks,
            });

            setTasks((current) => [...current, fullTask]);
            setNewTaskTitle('');
            setNewTaskDueDate('');
        } catch (err) {
            setError(err.message || 'Erro ao criar tarefa');
        }
    }

    async function handleToggleTask(task) {
        const newDone = !task.done;
        try {
            const response = await updateTask(task.id, {
                done: newDone,
            });

            setTasks((current) =>
                current.map((t) =>
                    t.id === task.id ? { ...t, done: newDone, ...(response.task || {}) } : t
                )
            );
        } catch (err) {
            setError(err.message || 'Erro ao atualizar status da tarefa');
        }
    }

    function handleStartEditing(task) {
        setEditingTaskId(task.id);
        setEditingTitle(task.title);
    }

    async function handleSaveEditing(task) {
        if (!editingTitle.trim() || editingTitle.trim() === task.title) {
            setEditingTaskId(null);
            setEditingTitle('');
            return;
        }

        try {
            await updateTask(task.id, {
                title: editingTitle.trim(),
            });

            setTasks((current) =>
                current.map((t) =>
                    t.id === task.id ? { ...t, title: editingTitle.trim() } : t
                )
            );
        } catch (err) {
            setError(err.message || 'Erro ao editar tarefa');
        } finally {
            setEditingTaskId(null);
            setEditingTitle('');
        }
    }

    function handleEditingKeyDown(event, task) {
        if (event.key === 'Enter') {
            handleSaveEditing(task);
        }
        if (event.key === 'Escape') {
            setEditingTaskId(null);
            setEditingTitle('');
        }
    }

    async function handleDeleteTask(taskId) {
        try {
            await deleteTask(taskId);
            setTasks((current) => current.filter((t) => t.id !== taskId));
            if (expandedTaskId === taskId) {
                setExpandedTaskId(null);
            }
        } catch (err) {
            setError(err.message || 'Erro ao excluir tarefa');
        }
    }

    async function handleEraseAll(done) {
        try {
            await deleteTasksByStatus(done);
            setTasks((current) => current.filter((t) => t.done !== done));
        } catch (err) {
            setError(err.message || 'Erro ao limpar tarefas');
        }
    }

    async function handleDragEnd(event) {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = todoTasks.findIndex((task) => task.id === active.id);
        const newIndex = todoTasks.findIndex((task) => task.id === over.id);

        if (oldIndex === -1 || newIndex === -1) return;

        const reorderedTodoTasks = arrayMove(todoTasks, oldIndex, newIndex);
        const doneTasksCurrent = tasks.filter((task) => task.done);

        const updatedTasks = [...reorderedTodoTasks, ...doneTasksCurrent];
        setTasks(updatedTasks);

        try {
            await reorderTasks(reorderedTodoTasks.map((t) => t.id));
        } catch (err) {
            setError(err.message || 'Erro ao salvar reordenação');
            loadTasks();
        }
    }

    // Gerenciamento de Subtarefas e Anotações
    function toggleExpandedTask(task) {
        if (expandedTaskId === task.id) {
            setExpandedTaskId(null);
        } else {
            setExpandedTaskId(task.id);
            setEditingDescription(task.description || '');
            setNewSubtaskTitle('');
        }
    }

    async function handleAddSubtask(task) {
        if (!newSubtaskTitle.trim()) return;

        const currentSubtasks = parseSubtasks(task.subtasks);
        const newSub = {
            id: Date.now(),
            title: newSubtaskTitle.trim(),
            done: false,
        };

        const updatedList = [...currentSubtasks, newSub];

        setTasks((current) =>
            current.map((t) => (t.id === task.id ? { ...t, subtasks: updatedList } : t))
        );
        setNewSubtaskTitle('');
        syncLocalMeta(task.id, { subtasks: updatedList });

        try {
            await updateTask(task.id, { subtasks: JSON.stringify(updatedList) });
        } catch {
            // sincronizado localmente
        }
    }

    async function handleToggleSubtask(task, subtaskId) {
        const currentSubtasks = parseSubtasks(task.subtasks);
        const updatedList = currentSubtasks.map((s) =>
            s.id === subtaskId ? { ...s, done: !s.done } : s
        );

        setTasks((current) =>
            current.map((t) => (t.id === task.id ? { ...t, subtasks: updatedList } : t))
        );
        syncLocalMeta(task.id, { subtasks: updatedList });

        try {
            await updateTask(task.id, { subtasks: JSON.stringify(updatedList) });
        } catch {
            // sincronizado localmente
        }
    }

    async function handleDeleteSubtask(task, subtaskId) {
        const currentSubtasks = parseSubtasks(task.subtasks);
        const updatedList = currentSubtasks.filter((s) => s.id !== subtaskId);

        setTasks((current) =>
            current.map((t) => (t.id === task.id ? { ...t, subtasks: updatedList } : t))
        );
        syncLocalMeta(task.id, { subtasks: updatedList });

        try {
            await updateTask(task.id, { subtasks: JSON.stringify(updatedList) });
        } catch {
            // sincronizado localmente
        }
    }

    async function handleSaveDescription(task) {
        setTasks((current) =>
            current.map((t) => (t.id === task.id ? { ...t, description: editingDescription } : t))
        );
        syncLocalMeta(task.id, { description: editingDescription });

        try {
            await updateTask(task.id, { description: editingDescription });
        } catch {
            // sincronizado localmente
        }
    }

    function formatDueDate(dateString) {
        if (!dateString) return null;
        try {
            const date = new Date(dateString);
            const now = new Date();
            now.setHours(0, 0, 0, 0);

            const target = new Date(date);
            target.setHours(0, 0, 0, 0);

            const isPast = target < now;
            const isToday = target.getTime() === now.getTime();

            const formatted = date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
            });

            return {
                text: formatted,
                isPast,
                isToday,
            };
        } catch {
            return null;
        }
    }

    function renderTaskCard(task) {
        const isEditing = editingTaskId === task.id;
        const isExpanded = expandedTaskId === task.id;
        const subtasks = parseSubtasks(task.subtasks);
        const completedSubtasks = subtasks.filter((s) => s.done).length;
        const dueInfo = formatDueDate(task.dueDate);

        const priorityLabel =
            task.priority === 'HIGH' ? 'Alta' : task.priority === 'LOW' ? 'Baixa' : 'Média';
        const priorityClass =
            task.priority === 'HIGH' ? 'tag-high' : task.priority === 'LOW' ? 'tag-low' : 'tag-med';

        return (
            <div className="task-row-container" key={task.id}>
                <div className="task-main-row">
                    <button
                        type="button"
                        className={task.done ? 'task-check task-check-done' : 'task-check'}
                        aria-label={task.done ? 'Marcar como pendente' : 'Marcar como concluída'}
                        onClick={() => handleToggleTask(task)}
                    />

                    <div className="task-title-group">
                        {isEditing ? (
                            <input
                                className="task-edit-input"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onBlur={() => handleSaveEditing(task)}
                                onKeyDown={(e) => handleEditingKeyDown(e, task)}
                                autoFocus
                            />
                        ) : (
                            <div className="task-title-meta">
                                <span
                                    className={task.done ? 'task-title task-title-done' : 'task-title'}
                                    onClick={() => handleStartEditing(task)}
                                    title="Clique para editar"
                                >
                                    {task.title}
                                </span>

                                <div className="task-badges">
                                    <span className={`task-badge ${priorityClass}`}>
                                        {priorityLabel}
                                    </span>

                                    {task.category && (
                                        <span className="task-badge tag-category">
                                            {task.category}
                                        </span>
                                    )}

                                    {dueInfo && (
                                        <span
                                            className={`task-badge ${
                                                dueInfo.isPast && !task.done
                                                    ? 'tag-due-past'
                                                    : dueInfo.isToday && !task.done
                                                        ? 'tag-due-today'
                                                        : 'tag-due'
                                            }`}
                                        >
                                            📅 {dueInfo.isPast && !task.done ? 'Atrasada: ' : ''}
                                            {dueInfo.isToday && !task.done ? 'Hoje: ' : ''}
                                            {dueInfo.text}
                                        </span>
                                    )}

                                    {subtasks.length > 0 && (
                                        <span className="task-badge tag-subtasks-count">
                                            ✓ {completedSubtasks}/{subtasks.length}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="task-actions">
                        <button
                            type="button"
                            className={`task-action-btn ${isExpanded ? 'active' : ''}`}
                            onClick={() => toggleExpandedTask(task)}
                            title="Ver subtarefas e notas"
                            aria-label="Subtarefas"
                        >
                            📋
                        </button>

                        <button
                            type="button"
                            className="task-action-btn delete-btn"
                            onClick={() => handleDeleteTask(task.id)}
                            title="Excluir tarefa"
                            aria-label="Excluir tarefa"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {isExpanded && (
                    <div className="task-details-drawer">
                        <div className="drawer-section">
                            <label className="drawer-label">Anotações / Descrição:</label>
                            <textarea
                                className="drawer-textarea"
                                value={editingDescription}
                                onChange={(e) => setEditingDescription(e.target.value)}
                                onBlur={() => handleSaveDescription(task)}
                                placeholder="Adicione notas, links ou detalhes adicionais..."
                            />
                        </div>

                        <div className="drawer-section">
                            <label className="drawer-label">
                                Subtarefas ({completedSubtasks}/{subtasks.length}):
                            </label>

                            {subtasks.length > 0 && (
                                <ul className="subtasks-list">
                                    {subtasks.map((sub) => (
                                        <li key={sub.id} className="subtask-item">
                                            <input
                                                type="checkbox"
                                                checked={sub.done}
                                                onChange={() => handleToggleSubtask(task, sub.id)}
                                                className="subtask-checkbox"
                                            />
                                            <span className={sub.done ? 'subtask-done' : ''}>
                                                {sub.title}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteSubtask(task, sub.id)}
                                                className="subtask-delete"
                                            >
                                                ✕
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <div className="subtask-add-form">
                                <input
                                    type="text"
                                    placeholder="Nova etapa/subtarefa..."
                                    value={newSubtaskTitle}
                                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddSubtask(task);
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => handleAddSubtask(task)}
                                    className="btn-add-subtask"
                                >
                                    + Adicionar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <main className="todo-page">
            <header className="todo-header">
                <button
                    type="button"
                    className="brand"
                    onClick={() => navigate('/')}
                    aria-label="Voltar para início"
                >
                    <span className="brand-symbol">&lt;</span>
                    <span className="brand-text">OnPlan Work</span>
                </button>

                <div className="todo-user-area">
                    <button
                        type="button"
                        className="theme-toggle-btn"
                        onClick={toggleTheme}
                        aria-label="Alternar tema"
                    >
                        {theme === 'dark' ? '☀️ Claro' : '🌙 Escuro'}
                    </button>

                    <div className="user-profile-badge">
                        <span className="user-avatar">{user?.name?.charAt(0) || 'O'}</span>
                        <span className="user-name">{user?.name || 'Oneris'}</span>
                    </div>

                    <button type="button" className="logout-button" onClick={handleLogout}>
                        Sair
                    </button>
                </div>
            </header>

            {/* Dashboard de Métricas de Produtividade */}
            <section className="productivity-dashboard">
                <div className="metric-card">
                    <span className="metric-label">Total de Tarefas</span>
                    <strong className="metric-val">{metrics.total}</strong>
                </div>

                <div className="metric-card">
                    <span className="metric-label">Pendentes</span>
                    <strong className="metric-val text-pending">{metrics.pendingCount}</strong>
                </div>

                <div className="metric-card">
                    <span className="metric-label">Concluídas</span>
                    <strong className="metric-val text-done">{metrics.doneCount}</strong>
                </div>

                <div className="metric-card metric-progress-card">
                    <div className="metric-header-flex">
                        <span className="metric-label">Taxa de Conclusão</span>
                        <strong className="metric-val text-rate">{metrics.completionRate}%</strong>
                    </div>
                    <div className="metric-bar-bg">
                        <div
                            className="metric-bar-fill"
                            style={{ width: `${metrics.completionRate}%` }}
                        />
                    </div>
                </div>

                <div className="metric-card">
                    <span className="metric-label">Alta Prioridade</span>
                    <strong className="metric-val text-urgent">{metrics.highPriorityCount}</strong>
                </div>
            </section>

            {/* Toolbar de Busca e Filtros */}
            <section className="todo-toolbar">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Buscar por título, nota ou categoria..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            className="clear-search-btn"
                            onClick={() => setSearchTerm('')}
                        >
                            ✕
                        </button>
                    )}
                </div>

                <div className="filters-group">
                    <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="filter-select"
                        aria-label="Filtrar por prioridade"
                    >
                        <option value="ALL">Todas as Prioridades</option>
                        <option value="HIGH">🔴 Alta Prioridade</option>
                        <option value="MEDIUM">🟡 Média Prioridade</option>
                        <option value="LOW">🔵 Baixa Prioridade</option>
                    </select>

                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="filter-select"
                        aria-label="Filtrar por categoria"
                    >
                        <option value="ALL">Todas as Categorias</option>
                        {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                                🏷️ {cat}
                            </option>
                        ))}
                    </select>

                    {(searchTerm || filterPriority !== 'ALL' || filterCategory !== 'ALL') && (
                        <button
                            type="button"
                            className="btn-reset-filters"
                            onClick={() => {
                                setSearchTerm('');
                                setFilterPriority('ALL');
                                setFilterCategory('ALL');
                            }}
                        >
                            Limpar filtros
                        </button>
                    )}
                </div>
            </section>

            {error && <p className="todo-error">{error}</p>}

            {/* Quadro de Tarefas */}
            <div className="todo-board">
                {/* Coluna To-do (Pendentes) */}
                <article className="task-card">
                    <div className="task-card-bar task-card-bar-orange"></div>

                    <div className="task-card-header">
                        <h2>A Fazer</h2>
                        <span className="counter-pill">{todoTasks.length}</span>
                    </div>
                    <p className="task-card-subtitle">
                        Organize suas ações por prioridade e mantenha o ritmo.
                    </p>

                    {/* Formulário de Criação de Tarefa */}
                    <form onSubmit={handleCreateTask} className="task-create-form">
                        <div className="form-main-input">
                            <input
                                placeholder="O que precisa ser feito agora?"
                                value={newTaskTitle}
                                onChange={(event) => setNewTaskTitle(event.target.value)}
                                autoFocus
                            />
                            <button type="submit" className="btn-add-task">
                                Adicionar
                            </button>
                        </div>

                        <div className="form-options-row">
                            <div className="option-item">
                                <label>Prioridade:</label>
                                <select
                                    value={newTaskPriority}
                                    onChange={(e) => setNewTaskPriority(e.target.value)}
                                >
                                    <option value="HIGH">🔴 Alta</option>
                                    <option value="MEDIUM">🟡 Média</option>
                                    <option value="LOW">🔵 Baixa</option>
                                </select>
                            </div>

                            <div className="option-item">
                                <label>Categoria:</label>
                                <select
                                    value={newTaskCategory}
                                    onChange={(e) => setNewTaskCategory(e.target.value)}
                                >
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="option-item">
                                <label>Prazo:</label>
                                <input
                                    type="date"
                                    value={newTaskDueDate}
                                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </form>

                    {isLoading ? (
                        <p className="task-feedback">Carregando suas tarefas...</p>
                    ) : todoTasks.length === 0 ? (
                        <div className="task-empty-state">
                            <span>✨</span>
                            <p>Tudo limpo! Nenhuma tarefa pendente no momento.</p>
                        </div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={todoTasks.map((task) => task.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <ul className="task-list">
                                    {todoTasks.map((task) => (
                                        <SortableTaskItem key={task.id} task={task}>
                                            {renderTaskCard(task)}
                                        </SortableTaskItem>
                                    ))}
                                </ul>
                            </SortableContext>
                        </DndContext>
                    )}

                    <button
                        type="button"
                        className="erase-button"
                        disabled={todoTasks.length === 0}
                        onClick={() => handleEraseAll(false)}
                    >
                        Limpar todas as pendentes
                    </button>
                </article>

                {/* Coluna Done (Concluídas) */}
                <article className="task-card">
                    <div className="task-card-bar task-card-bar-green"></div>

                    <div className="task-card-header">
                        <h2>Concluídas</h2>
                        <span className="counter-pill done">{doneTasks.length}</span>
                    </div>
                    <p className="task-card-subtitle">
                        Excelente trabalho! Cada item concluído aproxima você do seu objetivo.
                    </p>

                    {isLoading ? (
                        <p className="task-feedback">Carregando tarefas...</p>
                    ) : doneTasks.length === 0 ? (
                        <div className="task-empty-state">
                            <span>🎯</span>
                            <p>Nenhuma tarefa concluída ainda nesta visão.</p>
                        </div>
                    ) : (
                        <ul className="task-list">
                            {doneTasks.map((task) => (
                                <li key={task.id} className="task-item">
                                    <span className="task-drag-placeholder">✓</span>
                                    {renderTaskCard(task)}
                                </li>
                            ))}
                        </ul>
                    )}

                    <button
                        type="button"
                        className="erase-button"
                        disabled={doneTasks.length === 0}
                        onClick={() => handleEraseAll(true)}
                    >
                        Limpar histórico de concluídas
                    </button>
                </article>
            </div>
        </main>
    );
}