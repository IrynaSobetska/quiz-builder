import type { NextFunction, Request, Response } from 'express';
import { QuestionType } from '@prisma/client';
import type { Prisma, Question } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

type CheckboxOption = {
  id: string;
  label: string;
};

type CreateQuestionBody = {
  type?: string;
  prompt?: string;
  options?: unknown;
  answer?: unknown;
};

type CreateQuizBody = {
  title?: string;
  questions?: CreateQuestionBody[];
};

const isCheckboxOption = (option: unknown): option is CheckboxOption => {
  if (!option || typeof option !== 'object') {
    return false;
  }

  const candidate = option as Partial<CheckboxOption>;
  return (
    typeof candidate.id === 'string' && typeof candidate.label === 'string'
  );
};

const validateCreateQuizBody = (body: CreateQuizBody) => {
  if (!body.title?.trim()) {
    return 'Quiz title is required';
  }

  if (!Array.isArray(body.questions) || body.questions.length === 0) {
    return 'At least one question is required';
  }

  for (const [index, question] of body.questions.entries()) {
    if (!question.prompt?.trim()) {
      return `Question ${index + 1} prompt is required`;
    }

    if (!question.type || !(question.type in QuestionType)) {
      return `Question ${index + 1} type is invalid`;
    }

    if (
      question.type === QuestionType.BOOLEAN &&
      typeof question.answer !== 'boolean'
    ) {
      return `Question ${index + 1} answer must be true or false`;
    }

    if (
      question.type === QuestionType.INPUT &&
      typeof question.answer !== 'string'
    ) {
      return `Question ${index + 1} answer must be text`;
    }

    if (question.type === QuestionType.CHECKBOX) {
      if (!Array.isArray(question.options) || question.options.length < 2) {
        return `Question ${index + 1} must have at least two options`;
      }

      if (!question.options.every(isCheckboxOption)) {
        return `Question ${index + 1} options are invalid`;
      }

      if (!Array.isArray(question.answer) || question.answer.length === 0) {
        return `Question ${index + 1} must have at least one correct answer`;
      }

      const optionIds = new Set(question.options.map((option) => option.id));
      const allAnswersExist = question.answer.every(
        (answer) => typeof answer === 'string' && optionIds.has(answer),
      );

      if (!allAnswersExist) {
        return `Question ${index + 1} answers must match existing option ids`;
      }
    }
  }

  return null;
};

const buildQuestionCreateInput = (
  question: CreateQuestionBody,
  position: number,
): Prisma.QuestionCreateWithoutQuizInput => {
  const baseQuestion = {
    type: question.type as QuestionType,
    prompt: question.prompt!.trim(),
    position,
  };

  if (question.type === QuestionType.CHECKBOX) {
    return {
      ...baseQuestion,
      options: question.options as Prisma.InputJsonValue,
      answer: question.answer as Prisma.InputJsonValue,
    };
  }

  return {
    ...baseQuestion,
    answer: question.answer as Prisma.InputJsonValue,
  };
};

export const createQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const body = req.body as CreateQuizBody;
    const validationError = validateCreateQuizBody(body);

    if (validationError) {
      res.status(400).json({ message: validationError });
      return;
    }

    const quiz = await prisma.quiz.create({
      data: {
        title: body.title!.trim(),
        questions: {
          create: body.questions!.map(buildQuestionCreateInput),
        },
      },
      include: {
        questions: true,
      },
    });

    res.status(201).json({
      id: quiz.id,
      title: quiz.title,
      questionCount: quiz.questions.length,
    });
  } catch (error) {
    next(error);
  }
};
export const getQuizzes = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });

    res.json(
      quizzes.map((quiz) => ({
        id: quiz.id,
        title: quiz.title,
        questionCount: quiz._count.questions,
        createdAt: quiz.createdAt,
      })),
    );
  } catch (error) {
    next(error);
  }
};
export const getQuizById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      res.status(400).json({ message: 'Quiz id is required' });
      return;
    }

    const quiz = (await prisma.quiz.findUnique({
      where: {
        id,
      },
      include: {
        questions: {
          orderBy: {
            position: 'asc',
          },
        },
      },
    })) as Prisma.QuizGetPayload<{ include: { questions: true } }> | null;

    if (!quiz) {
      res.status(404).json({ message: 'Quiz not found' });
      return;
    }

    res.json({
      id: quiz.id,
      title: quiz.title,
      questions: quiz.questions.map((question: Question) => ({
        id: question.id,
        type: question.type,
        prompt: question.prompt,
        position: question.position,
        options: question.options,
        answer: question.answer,
      })),
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};
export const deleteQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      res.status(400).json({ message: 'Quiz id is required' });
      return;
    }

    const quiz = await prisma.quiz.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!quiz) {
      res.status(404).json({ message: 'Quiz not found' });
      return;
    }

    await prisma.quiz.delete({
      where: {
        id,
      },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
