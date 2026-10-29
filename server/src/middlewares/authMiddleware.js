const jwt = require('jsonwebtoken');

// Middleware responsável por proteger rotas privadas.
// Ele valida o token JWT enviado no header Authorization.
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: 'Token not provided'
    });
  }

  const [, token] = authHeader.split(' ');

  if (!token) {
    return res.status(401).json({
      message: 'Invalid token format'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Salva o ID do usuário na request para ser usado nos controllers.
    req.userId = decoded.userId;

    return next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired token'
    });
  }
}

module.exports = authMiddleware;