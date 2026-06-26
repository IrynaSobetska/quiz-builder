import type { CreateQuizPayload, QuizDetail, QuizSummary } from "@/services/quiz";

const API_BASE_URL = "/api";

const parseResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "message" in data
        ? String(data.message)
        : "Request failed";
    throw new Error(message);
  }

  return data as T;
};

export const getQuizzes = async () => {
  const response = await fetch(`${API_BASE_URL}/quizzes`, {
    cache: "no-store",
  });
  return parseResponse<QuizSummary[]>(response);
};

export const getQuizById = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/quizzes/${id}`, {
    cache: "no-store",
  });
  return parseResponse<QuizDetail>(response);
};

export const createQuiz = async (payload: CreateQuizPayload) => {
  const response = await fetch(`${API_BASE_URL}/quizzes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return parseResponse<QuizDetail | QuizSummary>(response);
};

export const deleteQuiz = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/quizzes/${id}`, {
    method: "DELETE",
  });
  return parseResponse<{ success: boolean }>(response);
};
