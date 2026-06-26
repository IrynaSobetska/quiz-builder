import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ReadOnlyQuestion from "@/components/ReadOnlyQuestion";
import { getQuizById } from "@/services/quizApi";
import type { QuizDetail } from "@/services/quiz";

export default function QuizDetailPage() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : null;
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuiz = async (quizId: string) => {
      try {
        setError(null);
        setQuiz(await getQuizById(quizId));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load quiz");
      } finally {
        setIsLoading(false);
      }
    };

    if (!router.isReady) {
      return;
    }

    if (!id) {
      return;
    }

    void loadQuiz(id);
  }, [id, router.isReady]);

  if (router.isReady && !id) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Quiz id is missing
        </div>
        <Link className="text-sm font-medium text-[#303742] underline" href="/quizzes">
          Back to quizzes
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-md border border-[#8FABD4] bg-white p-6 text-sm text-[#303742]">
        Loading quiz...
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error ?? "Quiz not found"}
        </div>
        <Link className="text-sm font-medium text-[#303742] underline" href="/quizzes">
          Back to quizzes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link className="text-sm font-medium text-[#303742] underline" href="/quizzes">
            Back to quizzes
          </Link>
          <h1 className="mt-3 text-2xl font-semibold">{quiz.title}</h1>
          <p className="mt-1 text-sm text-[#303742]">
            {quiz.questions.length} {quiz.questions.length === 1 ? "question" : "questions"}
          </p>
        </div>
        <Link
          className="inline-flex h-10 items-center justify-center rounded-md bg-[#4A70A9] px-4 text-sm font-medium text-white hover:bg-[#3f6194]"
          href="/create"
        >
          Create Quiz
        </Link>
      </div>

      <div className="space-y-4">
        {quiz.questions
          .slice()
          .sort((first, second) => (first.position ?? 0) - (second.position ?? 0))
          .map((question, index) => (
            <section
              className="rounded-md border border-[#8FABD4] bg-white p-4"
              key={question.id ?? index}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-base font-semibold">Question {index + 1}</h2>
                <span className="w-fit rounded-md bg-[#8FABD4]/20 px-2 py-1 text-xs font-medium text-[#303742]">
                  {question.type}
                </span>
              </div>
              <p className="mt-3 text-sm text-black">{question.prompt}</p>
              <ReadOnlyQuestion question={question} />
            </section>
          ))}
      </div>
    </div>
  );
}
