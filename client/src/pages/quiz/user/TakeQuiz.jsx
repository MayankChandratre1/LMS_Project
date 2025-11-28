import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { toast } from "react-toastify";
import { getQuizById } from "../../../redux/slices/QuizSlice";
import { submitQuiz } from "../../../redux/slices/QuizSubmissionsSlice";

export default function TakeQuiz() {
  const { name, id: courseId, quizId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { quizDetails, isLoading } = useSelector((s) => s.quiz || {});
  const userId = useSelector((s) => s.auth?.data?._id);

  const questions = quizDetails?.questions || [];

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(() => questions.map(() => null));
  const timeSpentRef = useRef(() => Array(questions.length).fill(0));
  const startRef = useRef(null);

  // refresh local state when quiz details arrive
  useEffect(() => {
    if (quizId) dispatch(getQuizById(quizId));
  }, [dispatch, quizId]);

  useEffect(() => {
    if (questions.length) {
      setSelected(Array(questions.length).fill(null));
      // initialize per-question time storage
      timeSpentRef.current = Array(questions.length).fill(0);
      startRef.current = Date.now();
    }
  }, [quizDetails]);

  // when current question changes, accumulate time for previous and restart timer
  useEffect(() => {
    if (!startRef.current) startRef.current = Date.now();
    return () => {};
  }, [current]);

  function recordElapsed() {
    if (!startRef.current) startRef.current = Date.now();
    const now = Date.now();
    const elapsed = Math.round((now - startRef.current) / 1000); // seconds
    timeSpentRef.current[current] = (timeSpentRef.current[current] || 0) + elapsed;
    startRef.current = Date.now();
  }

  const handleSelect = (idx) => {
    setSelected((prev) => {
      const copy = [...prev];
      copy[current] = idx;
      return copy;
    });
  };

  const handleNext = () => {
    recordElapsed();
    if (current < questions.length - 1) setCurrent((c) => c + 1);
  };

  const handlePrev = () => {
    recordElapsed();
    if (current > 0) setCurrent((c) => c - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // finalize timing for current question
    recordElapsed();

    // basic validation: ensure all questions answered
    const unanswered = selected.findIndex((s) => s === null);
    if (unanswered !== -1) {
      toast.error(`Please answer question ${unanswered + 1} before submitting`);
      setCurrent(unanswered);
      return;
    }

    const answers = questions.map((q, idx) => ({
      questionId: q._id,
      selectedOption: selected[idx],
      timeTaken: timeSpentRef.current[idx] || 0,
    }));

    const res = await dispatch(submitQuiz({ quizId, answers }));
    if (res?.payload) {
      toast.success(res.payload?.message || "Quiz submitted");
      // navigate to course quiz list (view)
      navigate(`/course/${name}/${courseId}/quizes/view`);
    } else {
      toast.error("Submission failed");
    }
  };

  if (isLoading || !quizDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <p className="text-gray-300">Loading quiz...</p>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors px-4 py-2 rounded-lg bg-gray-800/50"
        >
          <FaArrowLeft />
          Back
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">{quizDetails.title}</h1>
          <p className="text-sm text-gray-400">{quizDetails.description}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6 bg-gray-800/50 p-6 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-300">Question {current + 1} / {questions.length}</div>
          <div className="text-sm text-gray-400">Estimated timeout: {q?.timeout || 0}s</div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-3">{q?.question}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {q?.options?.map((opt, idx) => (
              <label
                key={idx}
                className={`p-3 rounded-md cursor-pointer border ${
                  selected[current] === idx ? "bg-yellow-500 text-black border-yellow-500" : "bg-gray-700 border-gray-600 text-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name={`q-${current}`}
                  checked={selected[current] === idx}
                  onChange={() => handleSelect(idx)}
                  className="hidden"
                />
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm">
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <div className="text-sm">{opt}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button type="button" onClick={handlePrev} disabled={current === 0} className="px-4 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50">
              Previous
            </button>
            <button type="button" onClick={handleNext} disabled={current === questions.length - 1} className="px-4 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50">
              Next
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-300">Answered: {selected.filter((s) => s !== null).length}/{questions.length}</div>
            <button type="submit" className="px-4 py-2 bg-green-500 text-black rounded-md font-semibold">
              Submit Quiz
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
