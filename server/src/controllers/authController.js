const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../database/prisma');

// Cria um novo usuário com senha criptografada.
// O e-mail é único para evitar múltiplas contas com o mesmo acesso.
async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must have at least 6 characters'
      });
    }

    const userAlreadyExists = await prisma.user.findUnique({
      where: { email }
    });

    if (userAlreadyExists) {
      return res.status(409).json({
        message: 'Email already registered'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });

    return res.status(201).json({
      message: 'User created successfully',
      user
    });
  } catch (error) {
    console.error('Register error:', error);

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
}

// Valida as credenciais do usuário e retorna um token JWT.
// O token será usado pelo front-end para acessar rotas protegidas.
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
}

// Retorna os dados do usuário autenticado.
// Essa rota será útil para manter a sessão ativa no front-end.
async function me(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.userId
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    return res.json({
      user
    });
  } catch (error) {
    console.error('Me error:', error);

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
}

module.exports = {
  register,
  login,
  me
};