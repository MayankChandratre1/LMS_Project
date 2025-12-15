import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaCheckCircle, FaTimesCircle, FaHome, FaClipboardList } from "react-icons/fa";
import { getSubmissionById } from "../../../redux/slices/QuizSubmissionsSlice";
import { getQuizById } from "../../../redux/slices/QuizSlice";
import HomeLayout from "../../../layouts/HomeLayout";

export default function SubmissionDetails() {
  const { submissionId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { submissionDetails, isLoading: submissionLoading } = useSelector((s) => s.quizSubmissions || {});
  const { quizDetails, isLoading: quizLoading } = useSelector((s) => s.quiz || {});

  useEffect(() => {
    if (submissionId) {
      dispatch(getSubmissionById(submissionId));
    }
  }, [dispatch, submissionId]);

  // Fetch quiz details when submission is loaded
  useEffect(() => {
    if (submissionDetails?.quizId) {
      const quizId = typeof submissionDetails.quizId === 'object'
        ? submissionDetails.quizId._id
        : submissionDetails.quizId;
      if (quizId) {
        dispatch(getQuizById(quizId));
      }
    }
  }, [dispatch, submissionDetails]);

  if (submissionLoading || quizLoading || !submissionDetails) {
    return (
      <HomeLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-gray-300">Loading submission...</div>
        </div>
      </HomeLayout>
    );
  }

  const userLabel = submissionDetails.userId && typeof submissionDetails.userId === 'object'
    ? (submissionDetails.userId.fullName || submissionDetails.userId.email || String(submissionDetails.userId._id).slice(0, 8))
    : (submissionDetails.userId || "Unknown");

  // Get quiz questions from quizDetails
  const questions = quizDetails?.questions || [];

  return (
    <HomeLayout>
      <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Breadcrumb */}
        <div className="mb-4 max-w-5xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <button onClick={() => navigate('/')} className="hover:text-yellow-400 flex items-center gap-1">
              <FaHome /> Home
            </button>
            <span>/</span>
            <button onClick={() => navigate('/profile/submissions')} className="hover:text-yellow-400 flex items-center gap-1">
              <FaClipboardList /> My Submissions
            </button>
            <span>/</span>
            <span className="text-white">Details</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto bg-gray-800/50 border border-gray-700 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => navigate('/profile/submissions')} className="px-3 py-2 bg-gray-800/50 rounded-lg text-white hover:text-yellow-400 flex items-center gap-2">
              <FaArrowLeft /> Back
            </button>
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold text-white">Submission Details</h2>
              <div className="text-sm text-gray-400 mt-1">User: {userLabel}</div>
            </div>
          </div>

          {/* Score Summary */}
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-xl p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">Your Score</div>
                <div className="text-4xl font-bold text-white">
                  {submissionDetails.score} / {submissionDetails.totalQuestions}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400 mb-1">Percentage</div>
                <div className="text-3xl font-bold text-green-400">
                  {Math.round((submissionDetails.score / submissionDetails.totalQuestions) * 100)}%
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400 mb-1">Correct Answers</div>
                <div className="text-3xl font-bold text-yellow-400">
                  {submissionDetails.correctAnswers}
                </div>
              </div>
            </div>
          </div>

          {/* Answers Breakdown */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white mb-4">Answer Breakdown</h3>
            {submissionDetails.answers?.map((ans, idx) => {
              const correct = ans.isCorrect;
              // Find the corresponding question from quiz details
              const question = questions.find(q => q._id === ans.questionId);
              const questionText = question?.question || ans.questionText || `Question ${idx + 1}`;
              const options = question?.options || ans.options || [];
              const correctOptionIndex = question?.correctOption;

              return (
                <div key={idx} className={`p-4 rounded-lg border-2 ${correct ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 font-semibold mb-2">Question {idx + 1}</div>
                      <div className="text-base text-gray-200 font-medium mb-3">{questionText}</div>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center gap-2 text-lg font-semibold mb-2 ${correct ? 'text-green-400' : 'text-red-400'}`}>
                        {correct ? <FaCheckCircle /> : <FaTimesCircle />}
                        <div>{correct ? 'Correct' : 'Wrong'}</div>
                      </div>
                      <div className="text-xs text-gray-400">Time: {ans.timeTaken || 0}s</div>
                    </div>
                  </div>

                  {/* Options Display */}
                  {options.length > 0 && (
                    <div className="space-y-2 text-sm">
                      {options.map((opt, i) => {
                        const isUserAnswer = i === ans.selectedOption;
                        const isCorrectAnswer = i === correctOptionIndex;

                        return (
                          <div
                            key={i}
                            className={`flex items-center gap-3 p-3 rounded ${isCorrectAnswer
                                ? 'bg-green-700/30 border border-green-500/50'
                                : isUserAnswer
                                  ? 'bg-red-700/30 border border-red-500/50'
                                  : 'bg-gray-800/30'
                              }`}
                          >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isCorrectAnswer
                                ? 'bg-green-500 text-white'
                                : isUserAnswer
                                  ? 'bg-red-500 text-white'
                                  : 'bg-gray-700 text-gray-300'
                              }`}>
                              {String.fromCharCode(65 + i)}
                            </div>
                            <div className="flex-1 text-gray-200">{opt}</div>

                            {/* Show badges for correct answer and user's answer */}
                            <div className="flex items-center gap-2">
                              {isCorrectAnswer && (
                                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                                  Correct Answer
                                </span>
                              )}
                              {isUserAnswer && !isCorrectAnswer && (
                                <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                                  Your Answer
                                </span>
                              )}
                              {isUserAnswer && isCorrectAnswer && (
                                <FaCheckCircle className="text-green-400 text-xl" />
                              )}
                              {isUserAnswer && !isCorrectAnswer && (
                                <FaTimesCircle className="text-red-400 text-xl" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-6 bg-gray-900/40 border border-gray-700 rounded-xl p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 text-sm">
              <div className="text-gray-400">
                Attempted: {submissionDetails.attemptedAt ? new Date(submissionDetails.attemptedAt).toLocaleString() : '-'}
              </div>
              <button
                onClick={() => navigate('/profile/submissions')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-semibold"
              >
                View All Submissions
              </button>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
