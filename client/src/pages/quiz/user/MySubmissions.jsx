import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaRedo, FaChartLine, FaTrophy, FaClock } from "react-icons/fa";
import { getUserSubmissions, getSubmissionById } from "../../../redux/slices/QuizSubmissionsSlice";
import HomeLayout from "../../../layouts/HomeLayout";

const Sparkline = ({ values = [] }) => {
  if (!values.length) return <div className="text-xs text-gray-400">No data</div>;
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-1 h-8">
      {values.map((v, i) => (
        <div
          key={i}
          style={{ height: `${(v / max) * 100}%` }}
          className={`w-1.5 rounded-sm ${v >= (max * 0.9) ? 'bg-yellow-400' : 'bg-green-400'}`}
          title={`${v}`}
        />
      ))}
    </div>
  );
};

export default function MySubmissions() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { submissions = [], isLoading } = useSelector((s) => s.quizSubmissions || {});
  const user = useSelector((s) => s.auth?.data);

  useEffect(() => {
    dispatch(getUserSubmissions());
  }, [dispatch]);

  const grouped = useMemo(() => {
    const map = {};
    submissions.forEach((s) => {
      // normalize quiz id and capture title if populated
      const rawQuiz = s.quizId;
      const qId = rawQuiz && typeof rawQuiz === "object" ? (rawQuiz._id || String(rawQuiz)) : rawQuiz;
      const qTitle = rawQuiz && typeof rawQuiz === "object" ? rawQuiz.title : null;

      map[qId] = map[qId] || { rawQuiz, quizId: qId, quizTitle: qTitle, items: [] };
      map[qId].items.push(s);
    });

    return Object.values(map).map(({ quizId, quizTitle, items }) => {
      const sorted = items.sort((a,b) => new Date(b.attemptedAt) - new Date(a.attemptedAt));
      const scores = sorted.map(i => i.score || 0);
      const highScore = Math.max(...scores, 0);
      const lastAttempt = sorted[0]?.attemptedAt;
      const avg = Math.round((scores.reduce((a,b)=>a+b,0) / scores.length) * 100) / 100 || 0;
      const trend = scores.slice(0,6).reverse();
      const courseId = sorted[0]?.courseId && typeof sorted[0].courseId === 'object' ? (sorted[0].courseId._id || sorted[0].courseId) : sorted[0]?.courseId;
      return { quizId, quizTitle, courseId, items: sorted, scores, highScore, lastAttempt, avg, trend };
    });
  }, [submissions]);

  const overall = useMemo(() => {
    const total = submissions.length;
    const avg = total ? Math.round((submissions.reduce((a,b)=>a+(b.score||0),0) / total) * 100) / 100 : 0;
    const high = submissions.length ? Math.max(...submissions.map(s => s.score || 0)) : 0;
    return { total, avg, high };
  }, [submissions]);

  const handleRetake = (quizId, courseId) => {
    // name param can be omitted or replaced with placeholder; router accepts it
    navigate(`/course/-/${courseId}/quizes/${quizId}/take`);
  };

  const handleView = (submissionId) => {
    // open full submission detail (we can route to a not-yet-created page or show details)
    dispatch(getSubmissionById(submissionId));
    navigate(`/profile/submissions/${submissionId}`); // if detail route exists later
  };

  return (
    <HomeLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white hover:text-yellow-400 px-4 py-2 bg-gray-800/50 rounded-lg">
              <FaArrowLeft /> Back
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">My Quiz Submissions</h1>
              <p className="text-gray-400 text-sm">
                Overview of your quiz attempts, high scores and trends.
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm text-gray-300">Total Attempts</div>
                  <div className="text-2xl font-bold text-white">{overall.total}</div>
                </div>
                <FaChartLine className="text-3xl text-yellow-400"/>
              </div>
              <div className="text-xs text-gray-400 mt-2">Keep practicing to improve your score.</div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm text-gray-300">Average Score</div>
                  <div className="text-2xl font-bold text-white">{overall.avg}</div>
                </div>
                <FaTrophy className="text-3xl text-green-400"/>
              </div>
              <div className="text-xs text-gray-400 mt-2">Average across all your attempts.</div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm text-gray-300">Personal Best</div>
                  <div className="text-2xl font-bold text-white">{overall.high}</div>
                </div>
                <FaClock className="text-3xl text-blue-400"/>
              </div>
              <div className="text-xs text-gray-400 mt-2">Your highest score so far.</div>
            </div>
          </div>

          {/* Submissions list */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {grouped.length === 0 && !isLoading && (
              <div className="col-span-full bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center">
                <div className="text-gray-300 mb-2">No submissions yet</div>
                <button onClick={() => navigate('/courses')} className="px-4 py-2 bg-yellow-500 rounded-lg text-black">Explore Courses</button>
              </div>
            )}

            {grouped.map(group => (
              <div key={group.quizId} className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-2xl border border-gray-700 p-5">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {group.quizTitle ? group.quizTitle : `Quiz ${String(group.quizId).slice(0,8)}`}
                    </h3>
                    <div className="text-sm text-gray-400 mt-1">{group.items[0]?.courseId ? `Course: ${group.items[0].courseId}` : ''}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-gray-400">Attempts</div>
                    <div className="text-lg font-bold text-white">{group.items.length}</div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-sm text-gray-300 mb-2">High score</div>
                    <div className="flex items-center gap-3">
                      <div className="text-3xl font-bold text-white">{group.highScore}</div>
                      <div className="text-xs text-gray-400">Avg: {group.avg}</div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">Last: {group.lastAttempt ? new Date(group.lastAttempt).toLocaleString() : '-'}</div>
                  </div>

                  <div className="w-28">
                    <Sparkline values={group.trend} />
                  </div>
                </div>

                <div className="mt-4 flex justify-between items-center gap-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleRetake(group.quizId, group.courseId)} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 text-sm">
                      <FaRedo /> Retake
                    </button>

                    <button onClick={() => navigate(`/profile/submissions/quiz/${group.quizId}`)} className="px-3 py-2 rounded-lg bg-gray-700/60 hover:bg-gray-700 text-white text-sm">
                      View Attempts
                    </button>
                  </div>

                  <div className="text-xs text-gray-400">Top: {group.highScore}</div>
                </div>
              </div>
            ))}
          </div>

          {/* latest submissions timeline */}
          <div className="mt-8 bg-gray-800/40 rounded-2xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent submissions</h3>
            <div className="space-y-3">
              {submissions.slice().sort((a,b)=> new Date(b.attemptedAt) - new Date(a.attemptedAt)).slice(0,8).map(s => {
                const rawQuiz = s.quizId;
                const qId = rawQuiz && typeof rawQuiz === "object" ? (rawQuiz._id || String(rawQuiz)) : rawQuiz;
                const qTitle = rawQuiz && typeof rawQuiz === "object" ? rawQuiz.title : null;
                const quizLabel = qTitle ? qTitle : String(qId).slice(0,8);
                return (
                 <div key={s._id} className="flex justify-between items-center gap-4 bg-gray-900/30 border border-gray-700 rounded-lg p-3">
                   <div>
                    <div className="text-sm text-gray-300">Quiz {quizLabel}</div>
                     <div className="text-xs text-gray-400 mt-1">{s.attemptedAt ? new Date(s.attemptedAt).toLocaleString() : '—'}</div>
                   </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-semibold text-white">{s.score}/{s.totalQuestions}</div>
                    <div>
                      <button onClick={() => handleView(s._id)} className="px-3 py-1 rounded-md bg-gray-700/60 text-sm text-white">Details</button>
                    </div>
                  </div>
                </div>
                )})}
            </div>
          </div>

        </div>
      </div>
    </HomeLayout>
  );
}
