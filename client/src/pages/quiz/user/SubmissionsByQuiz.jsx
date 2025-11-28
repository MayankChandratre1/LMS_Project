import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaEye, FaRedo } from "react-icons/fa";
import { getSubmissionsByQuiz } from "../../../redux/slices/QuizSubmissionsSlice";

export default function SubmissionsByQuiz() {
  const { quizId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { submissions = [], isLoading } = useSelector((s) => s.quizSubmissions || {});

  useEffect(() => {
    if (quizId) dispatch(getSubmissionsByQuiz(quizId));
  }, [dispatch, quizId]);

  const stats = useMemo(() => {
    const total = submissions.length;
    const scores = submissions.map(s => s.score || 0);
    const high = scores.length ? Math.max(...scores) : 0;
    const avg = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length * 100)/100 : 0;
    return { total, high, avg };
  }, [submissions]);

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="px-3 py-2 bg-gray-800/50 rounded-lg text-white"> <FaArrowLeft /> Back</button>
          <h1 className="text-2xl font-bold text-white">Submissions for Quiz {String(quizId).slice(0,8)}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700">
            <div className="text-sm text-gray-300">Total submissions</div>
            <div className="text-2xl font-bold text-white mt-2">{stats.total}</div>
          </div>
          <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700">
            <div className="text-sm text-gray-300">Highest score</div>
            <div className="text-2xl font-bold text-white mt-2">{stats.high}</div>
            <div className="text-xs text-gray-400 mt-1">Average: {stats.avg}</div>
          </div>
          <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700">
            <div className="text-sm text-gray-300">Latest attempt</div>
            <div className="text-xs text-gray-400 mt-2">{submissions[0]?.attemptedAt ? new Date(submissions[0].attemptedAt).toLocaleString() : '—'}</div>
          </div>
        </div>

        <div className="space-y-4">
          {isLoading && <div className="text-gray-300">Loading submissions...</div>}
          {!isLoading && submissions.length === 0 && (
            <div className="p-6 rounded-lg bg-gray-800/50 border border-gray-700 text-center text-gray-300">No submissions yet</div>
          )}

          {submissions.map(sub => {
            const userLabel = sub.userId && typeof sub.userId === 'object' ? (sub.userId.fullName || sub.userId.email || String(sub.userId._id).slice(0,8)) : (sub.userId || "Unknown");
            const timeTotal = (sub.answers || []).reduce((a,b)=>a + (b.timeTaken||0), 0);
            return (
              <div key={sub._id} className="p-4 rounded-lg bg-gray-800/50 border border-gray-700 flex justify-between items-center">
                <div>
                  <div className="text-white font-semibold">{userLabel}</div>
                  <div className="text-sm text-gray-400">{sub.attemptedAt ? new Date(sub.attemptedAt).toLocaleString() : '—'}</div>
                  <div className="text-xs text-gray-400 mt-1">Time spent: {timeTotal}s • {sub.correctAnswers}/{sub.totalQuestions} correct</div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xl font-bold text-white">{sub.score}</div>
                  <button onClick={() => navigate(`/profile/submissions/${sub._id}`)} className="px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2">
                    <FaEye /> View
                  </button>
                  <button onClick={() => navigate(`/course/-/${sub.courseId}/quizes/${sub.quizId}/take`)} className="px-3 py-2 rounded-md bg-yellow-500 text-black">
                    <FaRedo /> Retake
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
