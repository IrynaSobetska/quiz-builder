export type QuestionType = "BOOLEAN" | "INPUT" | "CHECKBOX";

export type CheckboxOption = {
  id: string;
  label: string;
};

export type QuizQuestion = {
  id?: string;
  type: QuestionType;
  prompt: string;
  position?: number;
  options?: CheckboxOption[] | null;
  answer: boolean | string | string[];
};

export type QuizSummary = {
  id: string;
  title: string;
  questionCount: number;
  createdAt?: string;
};

export type QuizDetail = {
  id: string;
  title: string;
  questions: QuizQuestion[];
  createdAt?: string;
  updatedAt?: string;
};

export type CreateQuizPayload = {
  title: string;
  questions: Array<{
    type: QuestionType;
    prompt: string;
    options?: CheckboxOption[];
    answer: boolean | string | string[];
  }>;
};
