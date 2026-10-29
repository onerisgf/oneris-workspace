import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './LoginModal.css';

export function LoginModal({ isOpen, onClose, onSuccess }) {
    const { login, register } = useAuth();

    const [mode, setMode] = useState('login');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isLoginMode = mode === 'login';

    useEffect(() => {
        function handleEsc(event) {
            if (event.key === 'Escape') {
                onClose();
            }
        }

        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
        }

        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((currentData) => ({
            ...currentData,
            [name]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setError('');
        setIsSubmitting(true);

        try {
            if (isLoginMode) {
                await login({
                    email: formData.email,
                    password: formData.password,
                });
            } else {
                await register({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                });
            }

            onSuccess?.();
            onClose();
        } catch (err) {
            setError(err.message || 'Erro na autenticação. Verifique seus dados.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="auth-modal-overlay" onClick={onClose}>
            <div
                className="auth-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="auth-modal-title"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="auth-modal-close"
                    type="button"
                    onClick={onClose}
                    aria-label="Fechar"
                >
                    ✕
                </button>

                <div className="auth-modal-brand-side">
                    <div className="brand-logo-badge">
                        <span className="brand-symbol">&lt;</span>
                        <span className="brand-name">OnPlan Work</span>
                    </div>
                    <p className="brand-tagline">
                        Gestão ágil de tarefas, foco em prioridades e métricas de desempenho.
                    </p>
                    <div className="brand-features-list">
                        <div className="feature-item">✓ Reordenação Drag & Drop</div>
                        <div className="feature-item">✓ Métricas em Tempo Real</div>
                        <div className="feature-item">✓ Prazos e Subtarefas</div>
                    </div>
                </div>

                <div className="auth-modal-content">
                    <h2 id="auth-modal-title">
                        {isLoginMode ? 'Entrar' : 'Cadastre-se'}
                    </h2>

                    <p className="auth-modal-subtitle">
                        {isLoginMode
                            ? 'Acesse seu OnPlan Work'
                            : 'Crie sua conta para começar'}
                    </p>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {!isLoginMode && (
                            <div className="form-field">
                                <label htmlFor="auth-name">Nome completo</label>
                                <input
                                    id="auth-name"
                                    name="name"
                                    type="text"
                                    placeholder="Ex: Oneris Grünewald"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required={!isLoginMode}
                                />
                            </div>
                        )}

                        <div className="form-field">
                            <label htmlFor="auth-email">E-mail</label>
                            <input
                                id="auth-email"
                                name="email"
                                type="email"
                                placeholder="seu.email@exemplo.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="auth-password">Senha</label>
                            <input
                                id="auth-password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                            />
                        </div>

                        {error && <p className="auth-error">{error}</p>}

                        <button
                            className="auth-submit"
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? 'Autenticando...'
                                : isLoginMode
                                    ? 'Acessar Workspace'
                                    : 'Criar minha conta'}
                        </button>
                    </form>

                    <button
                        className="auth-switch"
                        type="button"
                        onClick={() => {
                            setError('');
                            setMode(isLoginMode ? 'register' : 'login');
                        }}
                    >
                        {isLoginMode
                            ? 'Não tem uma conta? Crie uma agora'
                            : 'Já possui conta? Fazer login'}
                    </button>
                </div>
            </div>
        </div>
    );
}