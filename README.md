# OnPlan Work — Gestão Ágil de Tarefas & Produtividade Pessoal

[![React](https://img.shields.io/badge/React-19-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20(Neon)-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://neon.tech/)
[![ORM](https://img.shields.io/badge/ORM-Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Design](https://img.shields.io/badge/Design-Mobile--First-059669?style=flat-square)](#)
[![Deploy Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://onplan-work.vercel.app)
[![API Render](https://img.shields.io/badge/API-Render-46E3B7?style=flat-square&logo=render&logoColor=black)](https://onplan-work-api.onrender.com)

<p align="center">
  <b>Plataforma Full Stack e Mobile-First projetada para transformar a rotina diária em um fluxo contínuo de realizações, integrando reordenação drag & drop inteligente com métricas de desempenho e foco ágil em tempo real.</b>
  <br><br>
  🌐 <b>Aplicação Online:</b> <a href="https://onplan-work.vercel.app">https://onplan-work.vercel.app</a> &nbsp;|&nbsp; ⚡ <b>API Status:</b> <a href="https://onplan-work-api.onrender.com/health">onplan-work-api.onrender.com</a>
</p>

---

Desenvolvido por **Oneris Grünewald**  
- **GitHub:** [@onerisgf](https://github.com/onerisgf)  
- **E-mail:** [onerisgrunewald@gmail.com](mailto:onerisgrunewald@gmail.com)  

---

## 🚀 Sobre o Projeto

O **OnPlan Work** é uma aplicação Full Stack projetada para transformar a rotina diária em um fluxo contínuo de realizações. Criado com uma arquitetura modular, visual refinado e experiência interativa, o projeto combina o poder do drag-and-drop com métricas de desempenho, subtarefas e categorização inteligente.

### 🌟 Destaques & Funcionalidades

- **Autenticação Segura:** Cadastro e login com JWT e criptografia de senhas com `bcryptjs`.
- **Dashboard de Produtividade:** Acompanhe em tempo real o volume de tarefas, taxa percentual de conclusão (com barra de progresso visual) e contador de prioridades altas.
- **Reordenação Drag & Drop:** Reordene suas prioridades de forma fluida usando `@dnd-kit`.
- **Classificação por Prioridades:** Atribua níveis de urgência (🔴 Alta, 🟡 Média, 🔵 Baixa) com identificação visual instantânea.
- **Categorização & Tags:** Separe atividades por áreas (*Trabalho*, *Estudos*, *Pessoal*, *Urgente*, *Projetos*).
- **Controle de Prazos (Due Dates):** Defina datas de entrega com avisos visuais de tarefas com prazo para hoje ou em atraso.
- **Subtarefas & Checklist:** Divida grandes tarefas em etapas menores com checklist interativo e contador de progresso.
- **Anotações & Notas:** Espaço dedicado para descrições detalhadas, links e instruções em cada tarefa.
- **Busca em Tempo Real e Filtros:** Localize qualquer item instantaneamente por título, categoria ou notas, com filtros combinados.
- **Dark Mode & Light Mode:** Suporte completo a tema escuro e claro, com alternância instantânea e persistência no navegador.
- **Formulário de Contato:** Integração de envio de mensagens com Nodemailer.
- **Arquitetura Mobile-First:** Desenvolvido nativamente com foco em dispositivos móveis (smartphones), alvos de toque otimizados, ausência de overflow horizontal e adaptação fluida para tablets e desktops.

---

## 🛠️ Tecnologias

### Front-end
- **React 19**
- **Vite**
- **JavaScript (ES Modules)**
- **CSS3 Moderno Mobile-First** (design tokens, variáveis de tema, media queries progressivas e animações)
- **React Router DOM** (roteamento declarativo e rotas protegidas)
- **DnD Kit** (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`)

### Back-end
- **Node.js** com **Express**
- **Prisma ORM** (modelagem e migrations)
- **PostgreSQL** (Neon Database)
- **JSON Web Token (JWT)**
- **bcryptjs**
- **Nodemailer** (envio de e-mails)

---

## 📁 Estrutura do Repositório

```text
onplan-work/
├── client/                     # Aplicação Frontend SPA (React + Vite)
│   ├── public/                 # Favicon e assets públicos
│   └── src/
│       ├── components/         # Modais e componentes reutilizáveis
│       ├── contexts/           # AuthContext e ThemeContext
│       ├── pages/              # HomePage e TodoPage (Workspace)
│       ├── routes/             # Rotas públicas e PrivateRoute
│       └── services/           # Clientes HTTP (API, Auth, Tasks, Contact)
│
├── server/                     # API Backend (Node.js + Express + Prisma)
│   ├── prisma/                 # Schema do Prisma e Migrations
│   └── src/
│       ├── controllers/        # Controladores (Auth, Tasks, Contact)
│       ├── database/           # Instância e conexão Prisma Client
│       ├── middlewares/        # Validação de token JWT
│       └── routes/             # Definição das rotas REST
│
└── README.md                   # Documentação oficial
```

---

## 💻 Como Rodar Localmente

### Pré-requisitos
- Node.js (versão 18+)
- npm ou yarn

### 1. Clonar o repositório
```bash
git clone https://github.com/onerisgf/onplan-work.git
cd onplan-work
```

### 2. Configurar e rodar o Back-end
```bash
cd server
npm install
npx prisma generate
npm run dev
```

#### Variáveis de Ambiente do Servidor (`server/.env`):
```env
DATABASE_URL="postgresql://usuario:senha@host:5432/banco?sslmode=require"
JWT_SECRET="seu_jwt_secret_super_seguro"
PORT=3333
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT=2525
SMTP_USER="seu_usuario_smtp"
SMTP_PASS="sua_senha_smtp"
MAIL_FROM="contato@onplanwork.com"
MAIL_TO="onerisgrunewald@gmail.com"
FRONTEND_URL="http://localhost:5173"
```

### 3. Configurar e rodar o Front-end
Em outro terminal:
```bash
cd client
npm install
npm run dev
```

Acesse no navegador: `http://localhost:5173`

---

## 👤 Autor

**Oneris Grünewald**
- GitHub: [@onerisgf](https://github.com/onerisgf)
- E-mail: [onerisgrunewald@gmail.com](mailto:onerisgrunewald@gmail.com)

---

© 2026 OnPlan Work. Todos os direitos reservados.
