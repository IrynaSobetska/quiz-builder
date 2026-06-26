import Link from "next/link";
import { useEffect, useState } from "react";
import { deleteQuiz, getQuizzes } from "@/services/quizApi";
import type { QuizSummary } from "@/services/quiz";

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        setError(null);
        setQuizzes(await getQuizzes());
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load quizzes");
      } finally {
        setIsLoading(false);
      }
    };

    void loadQuizzes();
  }, []);

  const handleDelete = async (quiz: QuizSummary) => {
    const previousQuizzes = quizzes;
    setQuizzes((currentQuizzes) =>
      currentQuizzes.filter((currentQuiz) => currentQuiz.id !== quiz.id),
    );

    try {
      await deleteQuiz(quiz.id);
    } catch (deleteError) {
      setQuizzes(previousQuizzes);
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete quiz");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">Quizzes</h1>
        </div>
        <Link
          className="inline-flex h-10 items-center justify-center rounded-md bg-[#4A70A9] px-4 text-sm font-medium text-white hover:bg-[#3f6194]"
          href="/create"
        >
          Create Quiz
        </Link>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-md border border-[#8FABD4] bg-white p-6 text-sm text-[#303742]">
          Loading quizzes...
        </div>
      ) : null}

      {!isLoading && quizzes.length === 0 ? (
        <div className="rounded-md bg-white p-8 text-center">
          <h2 className="text-base font-semibold">No quizzes yet</h2>
        </div>
      ) : null}

      {quizzes.length > 0 ? (
        <div className="space-y-3">
          {quizzes.map((quiz) => (
            <div
              className="flex items-center justify-between gap-4 rounded-md border border-[#8FABD4] bg-white px-4 py-4"
              key={quiz.id}
            >
              <Link className="min-w-0 flex-1" href={`/quizzes/${quiz.id}`}>
                <h2 className="truncate text-sm font-semibold text-black">{quiz.title}</h2>
                <p className="mt-1 text-sm text-[#303742]">
                  {quiz.questionCount} {quiz.questionCount === 1 ? "question" : "questions"}
                </p>
              </Link>
              <button
                className="h-9 rounded-md border border-[#8FABD4] px-3 text-sm font-medium text-[#303742] hover:bg-[#8FABD4]/20"
                onClick={() => void handleDelete(quiz)}
                type="button"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
