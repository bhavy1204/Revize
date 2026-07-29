import React, { useState } from "react";
import ApiCLient from "../utils/api.js";

const apiClient = new ApiCLient();

const QuizModal = ({ taskId, revisionIndex, onClose, onPassed }) => {
  const [questions, setQuestions] = useState(null);
  const [selected, setSelected] = useState({}); // { questionId: selectedIndex }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { score, passed }
  const [error, setError] = useState("");

  React.useEffect(() => {
    const start = async () => {
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
      const res = await apiClient.submitRevisionQuiz(taskId, revisionIndex, answers);
      setResult(res.data);
      if (res.data.passed) {
        onPassed();
      }
    } catch (err) {
      setError(err.message || "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[85vh] overflow-y-auto p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Revision Quiz</h2>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>

        {loading && <p>Loading quiz...</p>}
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        {!loading && questions && !result && (
          <>
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div key={q._id} className="border rounded p-3">
                  <p className="font-medium mb-2">{idx + 1}. {q.question}</p>
                  <div className="space-y-1">
                    {q.options.map((opt, i) => (
                      <label key={i} className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name={q._id}
                          checked={selected[q._id] === i}
                          onChange={() => handleSelect(q._id, i)}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded"
            >
              {submitting ? "Submitting..." : "Submit Answers"}
            </button>
          </>
        )}

        {result && (
          <div className="text-center py-6">
            <p className="text-2xl font-bold mb-2">{result.score}/6</p>
            <p className={result.passed ? "text-green-600" : "text-red-600"}>
              {result.passed ? "Passed! Revision marked complete." : "Not passed — need at least 4 correct."}
            </p>
            <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-200 rounded">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizModal;

