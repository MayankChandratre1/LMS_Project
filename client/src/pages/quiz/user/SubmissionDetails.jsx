import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { getSubmissionById } from "../../../redux/slices/QuizSubmissionsSlice";

export default function SubmissionDetails() {
  const { submissionId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { submissionDetails, isLoading } = useSelector((s) => s.quizSubmissions || {});

  useEffect(() => {
    if (submissionId) dispatch(getSubmissionById(submissionId));
  }, [dispatch, submissionId]);

  if (isLoading || !submissionDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-gray-300">Loading submission...</div>
      </div>
    );
  }

  const userLabel = submissionDetails.userId && typeof submissionDetails.userId === 'object'
    ? (submissionDetails.userId.fullName || submissionDetails.userId.email || String(submissionDetails.userId._id).slice(0,8))
    : (submissionDetails.userId || "Unknown");

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-4xl mx-auto bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate(-1)} className="px-3 py-2 bg-gray-800/50 rounded-lg text-white">
            <FaArrowLeft /> Back
          </button>
          <div>
            <h2 className="text-xl font-bold text-white">Submission details</h2>
            <div className="text-sm text-gray-400">User: {userLabel} • Score: {submissionDetails.score}/{submissionDetails.totalQuestions}</div>
          </div>
        </div>

        <div className="mt-4 border-t border-gray-700 pt-4 space-y-4">
          {submissionDetails.answers?.map((ans, idx) => {
            const correct = ans.isCorrect;
            return (
              <div key={idx} className="p-4 bg-gray-900/40 rounded-lg border border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-gray-300 font-semibold">Q: {ans.questionText || (ans.questionId || '').slice?.(0,8)}</div>
                    <div className="text-sm text-gray-400 mt-2">Selected: {typeof ans.selectedOption === 'number' ? `Option ${ans.selectedOption + 1}` : String(ans.selectedOption)}</div>
                    {ans.options && (
                      <div className="mt-2 text-xs text-gray-400">
                        {ans.options.map((o, i) => (
                          <div key={i} className={`flex items-center gap-2 ${i === ans.selectedOption ? 'text-white' : 'text-gray-400'}`}>
                            <div className="w-4">{String.fromCharCode(65 + i)}.</div>
                            <div>{o}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center gap-2 ${correct ? 'text-green-400' : 'text-red-400'}`}>
                      {correct ? <FaCheckCircle /> : <FaTimesCircle />}
                      <div className="text-sm">{correct ? 'Correct' : 'Wrong'}</div>
                    </div>
                    <div className="text-xs text-gray-400 mt-2">Time: {ans.timeTaken || 0}s</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-400">Attempted: {submissionDetails.attemptedAt ? new Date(submissionDetails.attemptedAt).toLocaleString() : '-'}</div>
          <div className="text-sm text-gray-300">Correct answers: {submissionDetails.correctAnswers} / {submissionDetails.totalQuestions}</div>
        </div>
      </div>
    </div>
  );
}
