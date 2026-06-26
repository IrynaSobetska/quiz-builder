import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, QuestionType } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const databaseUrl = process.env['DATABASE_URL'];

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({ adapter });

await prisma.quiz.create({
  data: {
    title: 'Frontend Fundamentals',
    questions: {
      create: [
        {
          type: QuestionType.BOOLEAN,
          prompt: 'CSS stands for Cascading Style Sheets.',
          position: 0,
          answer: true,
        },
        {
          type: QuestionType.INPUT,
          prompt: 'What command installs dependencies?',
          position: 1,
          answer: 'npm install',
        },
        {
          type: QuestionType.CHECKBOX,
          prompt: 'Which are valid HTML elements?',
          position: 2,
          options: [
            { id: 'div', label: 'div' },
            { id: 'section', label: 'section' },
            { id: 'banana', label: 'banana' },
          ],
          answer: ['div', 'section'],
        },
      ],
    },
  },
});

await prisma.$disconnect();

console.log('Sample quiz created');
