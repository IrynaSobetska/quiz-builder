import type { QuizQuestion } from "@/services/quiz";

type ReadOnlyQuestionProps = {
  question: QuizQuestion;
};

export default function ReadOnlyQuestion({ question }: ReadOnlyQuestionProps) {
  if (question.type === "BOOLEAN") {
    return (
      <div className="mt-3 flex gap-2 text-sm">
        {[true, false].map((value) => (
          <span
            className={`rounded-md border px-3 py-2 ${
              question.answer === value
                ? "border-[#4A70A9] bg-[#4A70A9]/50 text-black"
                : "border-[#8FABD4] bg-white text-[#303742]"
            }`}
            key={String(value)}
          >
            {value ? "True" : "False"}
          </span>
        ))}
      </div>
    );
  }

  if (question.type === "INPUT") {
    return (
      <p className="mt-3 rounded-md border border-[#8FABD4] bg-white px-3 py-2 text-sm text-[#303742]">
        {String(question.answer)}
      </p>
    );
  }

  const answers = Array.isArray(question.answer) ? question.answer : [];

  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      {(question.options ?? []).map((option) => {
        const isCorrect = answers.includes(option.id);

        return (
          <div
            className={`rounded-md border px-3 py-2 text-sm ${
              isCorrect
                ? "border-[#4A70A9] bg-[#4A70A9]/50 text-black"
                : "border-[#8FABD4] bg-white text-[#303742]"
            }`}
            key={option.id}
          >
            {option.label}
          </div>
        );
      })}
    </div>
  );
}
