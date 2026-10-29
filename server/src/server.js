require('dotenv').config();

const app = require('./app');
const prisma = require('./database/prisma');

const PORT = process.env.PORT || 3333;

// Sincroniza automaticamente as novas colunas no PostgreSQL (Neon) sem exigir comandos manuais
async function bootstrapDatabase() {
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "priority" TEXT NOT NULL DEFAULT 'MEDIUM';
      ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT 'Geral';
      ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "dueDate" TIMESTAMP(3);
      ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "description" TEXT;
      ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "subtasks" TEXT DEFAULT '[]';
    `);
    console.log('Database columns synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing database columns:', error);
  }
}

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await bootstrapDatabase();
});