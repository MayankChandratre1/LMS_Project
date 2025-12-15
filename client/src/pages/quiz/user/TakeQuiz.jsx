import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaClock, FaCheckCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import { getQuizById } from "../../../redux/slices/QuizSlice";
import { submitQuiz } from "../../../redux/slices/QuizSubmissionsSlice";
import HomeLayout from "../../../layouts/HomeLayout";

export default function TakeQuiz() {
  const { name, id: courseId, quizId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { quizDetails, isLoading } = useSelector((s) => s.quiz || {});
  const userId = useSelector((s) => s.auth?.data?._id);

  const questions = quizDetails?.questions || [];

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(() => questions.map(() => null));
  const [timeLeft, setTimeLeft] = useState(0);
  const [questionTimers, setQuestionTimers] = useState({}); // Track time left for each question
  const [expiredQuestions, setExpiredQuestions] = useState(new Set()); // Track which questions have expired
  const timeSpentRef = useRef(() => Array(questions.length).fill(0));
  const startRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // refresh local state when quiz details arrive
  useEffect(() => {
    if (quizId) dispatch(getQuizById(quizId));
  }, [dispatch, quizId]);

  useEffect(() => {
    if (questions.length) {
      setSelected(Array(questions.length).fill(null));
      timeSpentRef.current = Array(questions.length).fill(0);
      startRef.current = Date.now();
      // Initialize timers for all questions
      const initialTimers = {};
      questions.forEach((q, idx) => {
        initialTimers[idx] = q.timeout || 30;
      });
      setQuestionTimers(initialTimers);
      setTimeLeft(questions[0]?.timeout || 30);
    }
  }, [quizDetails]);

  // Timer effect - runs for each question
  useEffect(() => {
    if (!questions[current]) return;

    // Set time for current question from stored timer or default
    const storedTime = questionTimers[current];
    if (storedTime !== undefined) {
      setTimeLeft(storedTime);
    }

    // Clear any existing timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    // Start countdown
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;

        // Stop at 0, don't go negative
        if (newTime <= 0) {
          clearInterval(timerIntervalRef.current);

          // Only trigger if not already expired
          if (!expiredQuestions.has(current)) {
            handleTimeExpired();
          }
          return 0;
        }

        // Update stored timer for this question
        setQuestionTimers(timers => ({
          ...timers,
          [current]: newTime
        }));

        return newTime;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [current, questions, questionTimers, expiredQuestions]);

  const handleTimeExpired = () => {
    recordElapsed();

    // Mark question as expired (visual indicator only, no toast)
    setExpiredQuestions(prev => new Set([...prev, current]));
  };

  function recordElapsed() {
    if (!startRef.current) startRef.current = Date.now();
    const now = Date.now();
    const elapsed = Math.round((now - startRef.current) / 1000);
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

  const handleJumpToQuestion = (index) => {
    recordElapsed();
    setCurrent(index);
  };

  const handleAutoSubmit = async () => {
    recordElapsed();

    const answers = questions.map((q, idx) => ({
      questionId: q._id,
      selectedOption: selected[idx] !== null ? selected[idx] : 0, // Default to 0 if unanswered
      timeTaken: timeSpentRef.current[idx] || 0,
    }));

    const res = await dispatch(submitQuiz({ quizId, answers }));
    if (res?.payload) {
      toast.success(res.payload?.message || "Quiz submitted");
      navigate(`/profile/submissions/${res.payload.submission._id}`);
    } else {
      toast.error("Submission failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    recordElapsed();

    // Basic validation: ensure all questions answered
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
      // Navigate to submission details instead of quiz list
      navigate(`/profile/submissions/${res.payload.submission._id}`);
    } else {
      toast.error("Submission failed");
    }
  };

  if (isLoading || !quizDetails) {
    return (
      <HomeLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
          <p className="text-gray-300">Loading quiz...</p>
        </div>
      </HomeLayout>
    );
  }

  const q = questions[current];
  const progress = ((current + 1) / questions.length) * 100;
  const answeredCount = selected.filter((s) => s !== null).length;
  const timePercent = q ? (timeLeft / q.timeout) * 100 : 100;

  return (
    <HomeLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors px-4 py-2 rounded-lg bg-gray-800/50"
          >
            <FaArrowLeft />
            Back
          </button>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-white">{quizDetails.title}</h1>
            <p className="text-sm text-gray-400">{quizDetails.description}</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700 sticky top-4">
              <h3 className="text-lg font-semibold text-white mb-4">Questions</h3>
              <div className="grid grid-cols-5 lg:grid-cols-3 gap-2">
                {questions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleJumpToQuestion(idx)}
                    className={`w-12 h-12 rounded-lg flex items-center justify-center font-semibold transition-all ${current === idx
                      ? "bg-yellow-500 text-black"
                      : selected[idx] !== null
                        ? "bg-green-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-gray-300">Current</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-600 rounded"></div>
                  <span className="text-gray-300">Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-700 rounded"></div>
                  <span className="text-gray-300">Unanswered</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Quiz Area */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Timer and Question Info */}
              <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-2xl p-6 border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-gray-300">
                    Question {current + 1} of {questions.length}
                  </div>

                  {/* Countdown Timer */}
                  <div className="flex items-center gap-3">
                    <FaClock className={`text-xl ${timePercent < 25 ? 'text-red-400 animate-pulse' : 'text-blue-400'}`} />
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${timeLeft === 0 ? 'text-red-500' : timePercent < 25 ? 'text-red-400' : 'text-white'}`}>
                        {timeLeft === 0 ? "TIME'S UP" : `${timeLeft}s`}
                      </div>
                      <div className="text-xs text-gray-400">Time left</div>
                    </div>
                  </div>
                </div>

                {/* Timer Progress Bar */}
                <div className="bg-gray-700 rounded-full h-2 overflow-hidden mb-6">
                  <div
                    className={`h-full transition-all duration-1000 ${timePercent < 25 ? 'bg-red-500' : timePercent < 50 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                    style={{ width: `${timePercent}%` }}
                  />
                </div>

                {/* Question */}
                <h2 className="text-xl md:text-2xl font-semibold text-white mb-6">{q?.question}</h2>

                {/* Options */}
                <div className="grid grid-cols-1 gap-3">
                  {q?.options?.map((opt, idx) => (
                    <label
                      key={idx}
                      className={`group p-4 rounded-xl border-2 transition-all ${expiredQuestions.has(current)
                        ? "bg-gray-700/30 border-gray-600 text-gray-500 cursor-not-allowed opacity-60"
                        : selected[current] === idx
                          ? "bg-gradient-to-r from-yellow-500 to-yellow-600 border-yellow-500 text-black shadow-lg scale-[1.02] cursor-pointer"
                          : "bg-gray-800/50 border-gray-600 text-gray-200 hover:border-gray-500 hover:bg-gray-800 cursor-pointer"
                        }`}
                    >
                      <input
                        type="radio"
                        name={`q-${current}`}
                        checked={selected[current] === idx}
                        onChange={() => handleSelect(idx)}
                        disabled={expiredQuestions.has(current)}
                        className="hidden"
                      />
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${selected[current] === idx
                            ? "bg-black/20 text-black"
                            : "bg-gray-700 text-gray-300 group-hover:bg-gray-600"
                            }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <div className="flex-1 text-base font-medium">{opt}</div>
                        {selected[current] === idx && (
                          <FaCheckCircle className="text-2xl text-black" />
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center gap-4">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={current === 0}
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                >
                  ← Previous
                </button>

                <div className="flex gap-3">
                  {current < questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 transition-colors"
                    >
                      Next →
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg font-semibold hover:from-green-500 hover:to-green-400 transition-all shadow-lg"
                    >
                      Submit Quiz
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
