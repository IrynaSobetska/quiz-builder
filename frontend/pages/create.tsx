import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { createQuiz } from "@/services/quizApi";
import type { CheckboxOption, CreateQuizPayload, QuestionType } from "@/services/quiz";

type DraftQuestion = {
  type: QuestionType;
  prompt: string;
  answer: boolean | string | string[];
  options: CheckboxOption[];
};

const createDraftQuestion = (): DraftQuestion => ({
  type: "BOOLEAN",
  prompt: "",
  answer: true,
  options: [
    { id: "option-1", label: "Option 1" },
    { id: "option-2", label: "Option 2" },
  ],
});

const toOptionId = () => `option-${Date.now()}`;

export default function CreateQuizPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<DraftQuestion[]>([createDraftQuestion()]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canRemoveQuestion = questions.length > 1;

  const payload = useMemo<CreateQuizPayload>(
    () => ({
      title: title.trim(),
      questions: questions.map((question) => ({
        type: question.type,
        prompt: question.prompt.trim(),
        ...(question.type === "CHECKBOX" ? { options: question.options } : {}),
        answer: question.answer,
      })),
    }),
    [questions, title],
  );

  const updateQuestion = (index: number, update: Partial<DraftQuestion>) => {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question, currentIndex) =>
        currentIndex === index ? { ...question, ...update } : question,
      ),
    );
  };

  const changeQuestionType = (index: number, type: QuestionType) => {
    const answerByType: Record<QuestionType, boolean | string | string[]> = {
      BOOLEAN: true,
      INPUT: "",
      CHECKBOX: [],
    };

    updateQuestion(index, {
      type,
      answer: answerByType[type],
    });
  };

  const updateOption = (questionIndex: number, optionIndex: number, label: string) => {
    const question = questions[questionIndex];

    if (!question) {
      return;
    }

    const options = question.options.map((option, currentIndex) =>
      currentIndex === optionIndex ? { ...option, label } : option,
    );

    updateQuestion(questionIndex, { options });
  };

  const addOption = (questionIndex: number) => {
    const question = questions[questionIndex];

    if (!question) {
      return;
    }

    updateQuestion(questionIndex, {
      options: [
        ...question.options,
        { id: toOptionId(), label: `Option ${question.options.length + 1}` },
      ],
    });
  };

  const removeOption = (questionIndex: number, optionId: string) => {
    const question = questions[questionIndex];

    if (!question || question.options.length <= 2) {
      return;
    }

    updateQuestion(questionIndex, {
      options: question.options.filter((option) => option.id !== optionId),
      answer: Array.isArray(question.answer)
        ? question.answer.filter((answerId) => answerId !== optionId)
        : question.answer,
    });
  };

  const toggleCheckboxAnswer = (questionIndex: number, optionId: string) => {
    const question = questions[questionIndex];

    if (!question || !Array.isArray(question.answer)) {
      return;
    }

    updateQuestion(questionIndex, {
      answer: question.answer.includes(optionId)
        ? question.answer.filter((answerId) => answerId !== optionId)
        : [...question.answer, optionId],
    });
  };

  const validate = () => {
    if (!payload.title) {
      return "Quiz title is required";
    }

    for (const [index, question] of payload.questions.entries()) {
      if (!question.prompt) {
        return `Question ${index + 1} prompt is required`;
      }

      if (
        question.type === "INPUT" &&
        typeof question.answer === "string" &&
        !question.answer.trim()
      ) {
        return `Question ${index + 1} answer is required`;
      }

      if (
        question.type === "CHECKBOX" &&
        Array.isArray(question.answer) &&
        question.answer.length === 0
      ) {
        return `Question ${index + 1} needs at least one correct answer`;
      }
    }

    return null;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      const createdQuiz = await createQuiz(payload);
      void router.push(`/quizzes/${createdQuiz.id}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not create quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={(event) => void handleSubmit(event)}>
      <div>
        <h1 className="text-2xl font-semibold">Create Quiz</h1>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="rounded-md border border-[#8FABD4] bg-white p-4">
        <label className="block text-sm font-medium text-black" htmlFor="quiz-title">
          Quiz title
        </label>
        <input
          className="mt-2 h-11 w-full rounded-md border border-[#8FABD4] px-3 text-sm focus:border-[#4A70A9]"
          id="quiz-title"
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Write title"
          value={title}
        />
      </section>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <section className="rounded-md border border-[#8FABD4] bg-white p-4" key={index}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-semibold">Question {index + 1}</h2>
              <div className="flex gap-2">
                <select
                  className="h-9 rounded-md border border-[#8FABD4] px-2 text-sm"
                  onChange={(event) =>
                    changeQuestionType(index, event.target.value as QuestionType)
                  }
                  value={question.type}
                >
                  <option value="BOOLEAN">Boolean</option>
                  <option value="INPUT">Input</option>
                  <option value="CHECKBOX">Checkbox</option>
                </select>
                <button
                  className="h-9 rounded-md border border-[#8FABD4] px-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!canRemoveQuestion}
                  onClick={() =>
                    setQuestions((current) =>
                      current.filter((_, currentIndex) => currentIndex !== index),
                    )
                  }
                  type="button"
                >
                  Remove
                </button>
              </div>
            </div>

            <label className="mt-4 block text-sm font-medium text-black">
              Prompt
              <input
                className="mt-2 h-11 w-full rounded-md border border-[#8FABD4] px-3 text-sm"
                onChange={(event) => updateQuestion(index, { prompt: event.target.value })}
                placeholder="Write the question"
                value={question.prompt}
              />
            </label>

            {question.type === "BOOLEAN" ? (
              <div className="mt-4 flex gap-4 text-sm">
                {[true, false].map((value) => (
                  <label className="flex items-center gap-2" key={String(value)}>
                    <input
                      checked={question.answer === value}
                      name={`boolean-${index}`}
                      onChange={() => updateQuestion(index, { answer: value })}
                      type="radio"
                    />
                    {value ? "True" : "False"}
                  </label>
                ))}
              </div>
            ) : null}

            {question.type === "INPUT" ? (
              <label className="mt-4 block text-sm font-medium text-black">
                Expected answer
                <input
                  className="mt-2 h-11 w-full rounded-md border border-[#8FABD4] px-3 text-sm"
                  onChange={(event) => updateQuestion(index, { answer: event.target.value })}
                  placeholder="Short answer"
                  value={typeof question.answer === "string" ? question.answer : ""}
                />
              </label>
            ) : null}

            {question.type === "CHECKBOX" ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-black">Options</p>
                  <button
                    className="h-9 rounded-md border border-[#8FABD4] px-3 text-sm font-medium"
                    onClick={() => addOption(index)}
                    type="button"
                  >
                    Add option
                  </button>
                </div>
                {question.options.map((option, optionIndex) => (
                  <div className="flex items-center gap-2" key={option.id}>
                    <input
                      checked={
                        Array.isArray(question.answer) && question.answer.includes(option.id)
                      }
                      onChange={() => toggleCheckboxAnswer(index, option.id)}
                      type="checkbox"
                    />
                    <input
                      className="h-10 min-w-0 flex-1 rounded-md border border-[#8FABD4] px-3 text-sm"
                      onChange={(event) => updateOption(index, optionIndex, event.target.value)}
                      value={option.label}
                    />
                    <button
                      className="h-10 rounded-md border border-[#8FABD4] px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={question.options.length <= 2}
                      onClick={() => removeOption(index, option.id)}
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <button
          className="h-10 rounded-md border border-[#8FABD4] px-4 text-sm font-medium hover:bg-[#8FABD4]/20"
          onClick={() => setQuestions((current) => [...current, createDraftQuestion()])}
          type="button"
        >
          Add Question
        </button>
        <button
          className="h-10 rounded-md bg-[#4A70A9] px-4 text-sm font-medium text-white hover:bg-[#3f6194] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Saving..." : "Save Quiz"}
        </button>
      </div>
    </form>
  );
}
