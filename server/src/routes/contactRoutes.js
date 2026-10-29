const { Router } = require('express');

const contactController = require('../controllers/contactController');

const contactRoutes = Router();

// Rota pública usada pelo formulário de contato da landing page.
contactRoutes.post('/', contactController.sendContactEmail);

module.exports = contactRoutes;