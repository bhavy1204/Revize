import React, { useState, useEffect } from "react";
import ApiCLient from "../utils/api.js";

const apiClient = new ApiCLient();

const QuizModal = ({ taskId, revisionIndex, onClose, onPassed }) => {
  const [questions, setQuestions] = useState(null);
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    const start = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await apiClient.startRevisionQuiz(taskId, revisionIndex);
        setQuestions(res.data.questions);
      } catch (err) {
        setError(err.message || "Failed to start quiz");
      } finally {
        setLoading(false);
      }
    };
    start();
  }, [taskId, revisionIndex]);

  const handleSelect = (questionId, optionIndex) => {
    setSelected((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async () => {
    if (Object.keys(selected).length < questions.length) {
      setError("Please answer all questions before submitting");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const answers = questions.map((q) => ({
        questionId: q._id,
        selectedIndex: selected[q._id],
      }));
      const res = await apiClient.submitRevisionQuiz(
        taskId,
        revisionIndex,
        answers,
      );
      setResult(res.data);
      if (res.data.passed) onPassed();
    } catch (err) {
      setError(err.message || "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = questions ? Object.keys(selected).length : 0;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-neutral-900 border border-neutral-800 rounded-t-2xl sm:rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-neutral-800 sticky top-0 bg-neutral-900 z-10">
          <div>
            <h2 className="text-base font-semibold text-neutral-50">
              Revision Quiz
            </h2>
            {questions && !result && (
              <p className="text-xs text-neutral-500 mt-0.5">
                {answeredCount}/{questions.length} answered
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-200 transition w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-800"
          >
            ✕
          </button>
        </div>

        <div className="p-5">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-neutral-500">Loading quiz...</p>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2 mb-4">
              {error}
            </div>
          )}

          {!loading && questions && !result && (
            <>
              {/* Progress bar */}
              <div className="w-full h-1 bg-neutral-800 rounded-full mb-5 overflow-hidden">
                <div
                  className="h-full bg-violet-600 transition-all duration-300"
                  style={{
                    width: `${(answeredCount / questions.length) * 100}%`,
                  }}
                />
              </div>

              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <div
                    key={q._id}
                    className="border border-neutral-800 rounded-xl p-4 bg-neutral-950/50"
                  >
                    <p className="text-sm font-medium text-neutral-100 mb-3">
                      <span className="text-neutral-500 mr-1.5">
                        {idx + 1}.
                      </span>
                      {q.question}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt, i) => {
                        const isSelected = selected[q._id] === i;
                        return (
                          <label
                            key={i}
                            className={`flex items-center gap-2.5 text-sm rounded-lg px-3 py-2.5 cursor-pointer transition border ${
                              isSelected
                                ? "bg-violet-600/15 border-violet-600 text-neutral-50"
                                : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                            }`}
                          >
                            <input
                              type="radio"
                              name={q._id}
                              checked={isSelected}
                              onChange={() => handleSelect(q._id, i)}
                              className="accent-violet-600 w-4 h-4 shrink-0"
                            />
                            {opt}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="mt-5 w-full bg-violet-600 hover:bg-violet-500 active:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-3 rounded-xl transition"
              >
                {submitting ? "Submitting..." : "Submit Answers"}
              </button>
            </>
          )}

          {result && (
            <div className="text-center py-8">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold ${
                  result.passed
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-red-500/15 text-red-400"
                }`}
              >
                {result.score}/{questions.length}
              </div>
              <p
                className={`text-sm font-medium ${result.passed ? "text-emerald-400" : "text-red-400"}`}
              >
                {result.passed
                  ? "Passed! Revision marked complete."
                  : "Not passed — need at least 4 correct."}
              </p>
              <button
                onClick={onClose}
                className="mt-5 px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm rounded-xl transition"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizModal;

