const { Router } = require('express');

const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const authRoutes = Router();

// Rota pública para cadastro de novos usuários.
authRoutes.post('/register', authController.register);

// Rota pública para login e geração do token JWT.
authRoutes.post('/login', authController.login);

// Rota privada para recuperar os dados do usuário autenticado.
authRoutes.get('/me', authMiddleware, authController.me);

module.exports = authRoutes;