# OnPlan Work

> Plataforma moderna de gestão ágil de tarefas, produtividade pessoal e acompanhamento de métricas em tempo real.

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
- **Interface Responsiva & Acessível:** Layout fluido adaptável a dispositivos móveis, tablets e desktops.

---

## 🛠️ Tecnologias

### Front-end
- **React 19**
- **Vite**
- **JavaScript (ES Modules)**
- **CSS3 Moderno** (design tokens, variáveis de tema e animações)
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
