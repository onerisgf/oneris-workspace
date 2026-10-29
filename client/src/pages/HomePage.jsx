import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginModal } from '../components/LoginModal';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { sendContactMessage } from '../services/contactService';
import './HomePage.css';

const goodThingsPosts = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=600&auto=format&fit=crop&q=80',
        tag: 'Produtividade',
        title: 'Organize suas tarefas diárias com prioridades claras e maximize seu foco.',
        desc: 'Dividir grandes metas em subtarefas acionáveis reduz a fricção cognitiva e acelera entregas.',
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&auto=format&fit=crop&q=80',
        tag: 'Disciplina',
        title: 'Concluir tarefas gera impulso e clareza mental para novos desafios.',
        desc: 'Visualizar seu progresso em tempo real fortalece a consistência e a satisfação no trabalho.',
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
        tag: 'Planejamento',
        title: 'Diferencie o que é urgente do que é essencial para atingir seus objetivos.',
        desc: 'A matriz de priorização mantém você focado no que constrói valor a longo prazo.',
    },
];

export function HomePage() {
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
    });
    const [contactStatus, setContactStatus] = useState('');
    const [isSendingContact, setIsSendingContact] = useState(false);

    function handleContactChange(event) {
        const { name, value } = event.target;

        setContactForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));
    }

    async function handleContactSubmit(event) {
        event.preventDefault();

        setContactStatus('');
        setIsSendingContact(true);

        try {
            await sendContactMessage(contactForm);

            setContactStatus('Mensagem enviada com sucesso! Obrigado pelo contato.');
            setContactForm({
                name: '',
                email: '',
                phone: '',
                message: '',
            });
        } catch (error) {
            setContactStatus(error.message || 'Erro ao enviar mensagem. Tente novamente mais tarde.');
        } finally {
            setIsSendingContact(false);
        }
    }

    function handleGoToTodoList() {
        if (isAuthenticated) {
            navigate('/todos');
            return;
        }

        setIsLoginModalOpen(true);
    }

    function handleLogout() {
        logout();
        navigate('/');
    }

    return (
        <>
            <main className="home-page">
                <section className="hero-section">
                    <header className="site-header">
                        <button
                            className="brand"
                            type="button"
                            onClick={() => navigate('/')}
                            aria-label="Ir para início"
                        >
                            <span className="brand-symbol">&lt;</span>
                            <span className="brand-text">OnPlan Work</span>
                        </button>

                        <div className="header-actions">
                            <button
                                type="button"
                                className="theme-toggle-btn"
                                onClick={toggleTheme}
                                aria-label="Alternar tema"
                                title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
                            >
                                {theme === 'dark' ? '☀️ Claro' : '🌙 Escuro'}
                            </button>

                            {isAuthenticated ? (
                                <div className="header-user">
                                    <span className="user-greeting">Olá, {user?.name?.split(' ')[0]}</span>
                                    <button
                                        type="button"
                                        className="btn-workspace-link"
                                        onClick={() => navigate('/todos')}
                                    >
                                        Meu Workspace
                                    </button>
                                    <button type="button" className="login-button logout-btn" onClick={handleLogout}>
                                        Sair
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    className="login-button"
                                    onClick={() => setIsLoginModalOpen(true)}
                                >
                                    Entrar
                                </button>
                            )}
                        </div>
                    </header>

                    <div className="hero-content">
                        <div className="hero-text">
                            <div className="hero-badge">
                                <span>✦ Desenvolvido por Oneris Grünewald</span>
                            </div>

                            <h1>
                                Organize
                                <span>sua rotina diária</span>
                            </h1>

                            <p className="hero-lead">
                                OnPlan Work é o hub completo para gerenciar suas tarefas com foco,
                                prioridades ágeis, prazos e métricas de produtividade em tempo real.
                            </p>

                            <div className="hero-cta-group">
                                <button type="button" className="primary-button" onClick={handleGoToTodoList}>
                                    {isAuthenticated ? 'Abrir meu Workspace →' : 'Começar agora →'}
                                </button>
                                <a
                                    href="https://github.com/onerisgf"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="secondary-button"
                                >
                                    GitHub @onerisgf
                                </a>
                            </div>
                        </div>

                        <div className="hero-image-area" aria-hidden="true">
                            <div className="green-shape"></div>
                            <img
                                src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=700&auto=format&fit=crop&q=80"
                                alt="Ambiente de trabalho moderno"
                                className="hero-image"
                            />
                        </div>
                    </div>

                    <a href="#todo-intro" className="scroll-indicator" aria-label="Rolar para baixo">
                        ↓
                    </a>
                </section>

                <section id="todo-intro" className="todo-intro-section">
                    <h2>Gestão de Tarefas Inteligente</h2>
                    <p>
                        Arraste e solte para redefinir prioridades, adicione prazos, consulte métricas em tempo real e mantenha seu fluxo de trabalho alinhado.
                    </p>
                </section>

                <section className="todo-preview-section" aria-label="Prévia da Lista de Tarefas">
                    <article className="preview-card preview-card-todo">
                        <div className="preview-card-bar orange"></div>

                        <div className="card-header-flex">
                            <div>
                                <h3>Pendentes</h3>
                                <p>Foco e execução estratégica.</p>
                            </div>
                            <span className="badge-preview-count">5 tarefas</span>
                        </div>

                        <ul>
                            <li className="highlight">
                                <span className="preview-bullet">●</span>
                                <div>
                                    <strong>Finalizar arquitetura da aplicação</strong>
                                    <span className="mini-tag tag-high">Alta prioridade</span>
                                </div>
                            </li>
                            <li>
                                <span className="preview-bullet">●</span>
                                <div>
                                    <span>Desenvolver dashboard de produtividade</span>
                                    <span className="mini-tag tag-med">Média</span>
                                </div>
                            </li>
                            <li>
                                <span className="preview-bullet">●</span>
                                <div>
                                    <span>Reordenação inteligente via drag-and-drop</span>
                                    <span className="mini-tag tag-low">Baixa</span>
                                </div>
                            </li>
                            <li>
                                <span className="preview-bullet">●</span>
                                <div>
                                    <span>Filtros avançados e busca textual</span>
                                </div>
                            </li>
                        </ul>

                        <button type="button" onClick={handleGoToTodoList}>
                            Acessar Lista Completa
                        </button>
                    </article>

                    <article className="preview-card preview-card-done">
                        <div className="preview-card-bar green"></div>

                        <div className="card-header-flex">
                            <div>
                                <h3>Concluídas</h3>
                                <p>Resultados entregues com sucesso!</p>
                            </div>
                            <span className="badge-preview-count done">✓ 100%</span>
                        </div>

                        <ul>
                            <li>
                                <span className="preview-check">✓</span>
                                <span>Configuração do banco PostgreSQL</span>
                            </li>
                            <li>
                                <span className="preview-check">✓</span>
                                <span>Autenticação segura via JWT e bcrypt</span>
                            </li>
                            <li>
                                <span className="preview-check">✓</span>
                                <span>Integração de Dark Mode & Light Mode</span>
                            </li>
                            <li>
                                <span className="preview-check">✓</span>
                                <span>Deploy e testes de API concluídos</span>
                            </li>
                        </ul>

                        <button type="button" onClick={handleGoToTodoList}>
                            Ver Histórico
                        </button>
                    </article>
                </section>

                <section className="good-things-section">
                    <div className="good-things-background">
                        <h2>Pilares de Produtividade</h2>
                    </div>

                    <div className="good-things-carousel" aria-label="Artigos de Produtividade">
                        {goodThingsPosts.map((post) => (
                            <article className="post-card" key={post.id}>
                                <img src={post.image} alt={post.title} loading="lazy" />

                                <div className="post-card-content">
                                    <span className="post-tag">{post.tag}</span>
                                    <h3>{post.title}</h3>
                                    <p className="post-desc">{post.desc}</p>
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="carousel-dots" aria-hidden="true">
                        <span className="active"></span>
                        <span></span>
                        <span></span>
                    </div>
                </section>

                <section className="contact-section">
                    <div className="contact-intro">
                        <div className="contact-badge">Contato Direto</div>
                        <h2>
                            Vamos construir algo
                            <br />
                            <strong>extraordinário juntos?</strong>
                        </h2>
                        <p>
                            Este projeto faz parte do portfólio de engenharia de <strong>Oneris Grünewald</strong>.
                            Fique à vontade para enviar uma mensagem ou trocar ideias sobre tecnologia e desenvolvimento de software.
                        </p>
                        <div className="direct-links">
                            <a href="mailto:onerisgrunewald@gmail.com" className="contact-link-pill">
                                ✉ onerisgrunewald@gmail.com
                            </a>
                            <a
                                href="https://github.com/onerisgf"
                                target="_blank"
                                rel="noreferrer"
                                className="contact-link-pill"
                            >
                                🐙 GitHub @onerisgf
                            </a>
                        </div>
                    </div>

                    <form className="contact-card" onSubmit={handleContactSubmit}>
                        <div className="contact-title">
                            <span className="contact-icon">✉</span>
                            <h2>
                                ENVIE UMA
                                <br />
                                <strong>MENSAGEM</strong>
                            </h2>
                        </div>

                        <label htmlFor="contact-name">Seu nome</label>
                        <input
                            id="contact-name"
                            name="name"
                            value={contactForm.name}
                            onChange={handleContactChange}
                            placeholder="Como prefere ser chamado?"
                            required
                        />

                        <div className="contact-grid">
                            <div>
                                <label htmlFor="contact-email">Seu e-mail*</label>
                                <input
                                    id="contact-email"
                                    name="email"
                                    type="email"
                                    value={contactForm.email}
                                    onChange={handleContactChange}
                                    placeholder="exemplo@dominio.com"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="contact-phone">Telefone / WhatsApp</label>
                                <input
                                    id="contact-phone"
                                    name="phone"
                                    value={contactForm.phone}
                                    onChange={handleContactChange}
                                    placeholder="(99) 99999-9999"
                                    required
                                />
                            </div>
                        </div>

                        <label htmlFor="contact-message">Mensagem*</label>
                        <textarea
                            id="contact-message"
                            name="message"
                            value={contactForm.message}
                            onChange={handleContactChange}
                            placeholder="Escreva sua mensagem aqui..."
                            required
                        ></textarea>

                        <button type="submit" disabled={isSendingContact} className="contact-submit-btn">
                            {isSendingContact ? 'ENVIANDO MENSAGEM...' : 'ENVIAR AGORA'}
                        </button>

                        {contactStatus && (
                            <p className="contact-status">
                                {contactStatus}
                            </p>
                        )}
                    </form>
                </section>
            </main>

            <footer className="site-footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <span className="brand-symbol">&lt;</span>
                        <strong>OnPlan Work</strong>
                    </div>
                    <p className="footer-author">
                        Criado e desenvolvido exclusivamente por <strong>Oneris Grünewald</strong>.
                    </p>
                    <div className="footer-links">
                        <a href="mailto:onerisgrunewald@gmail.com">onerisgrunewald@gmail.com</a>
                        <span>•</span>
                        <a href="https://github.com/onerisgf" target="_blank" rel="noreferrer">
                            github.com/onerisgf
                        </a>
                    </div>
                    <small>© 2026 OnPlan Work. Todos os direitos reservados.</small>
                </div>
            </footer>

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onSuccess={() => navigate('/todos')}
            />
        </>
    );
}