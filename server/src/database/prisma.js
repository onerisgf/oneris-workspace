const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

// Adapter necessário no Prisma 7 para conectar o Prisma Client ao PostgreSQL.
// A URL vem do .env e aponta para o banco online criado no Neon.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

// Instância única do Prisma Client usada por toda a API.
// Centralizar a conexão evita múltiplas conexões desnecessárias com o banco.
const prisma = new PrismaClient({
  adapter
});

module.exports = prisma;