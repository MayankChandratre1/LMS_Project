import React, { FC, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaTrash, FaEdit, FaPlay, FaClipboardList, FaHome, FaBook } from "react-icons/fa";
import { getQuizzesByCourse, deleteQuiz } from "../../../redux/slices/QuizSlice";
import HomeLayout from "../../../layouts/HomeLayout";

const QuizPerCourse = () => {
  const { name, id: courseId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { quizzes = [], isLoading } = useSelector((s) => s.quiz || {});
  const { role } = useSelector((s) => s.auth || {});

  useEffect(() => {
    if (courseId) dispatch(getQuizzesByCourse(courseId));
  }, [dispatch, courseId]);

  const onDelete = async (quizId) => {
    const res = await dispatch(deleteQuiz(quizId));
    if (res?.payload) dispatch(getQuizzesByCourse(courseId));
  };

  return (
    <HomeLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <button onClick={() => navigate('/')} className="hover:text-yellow-400 flex items-center gap-1">
              <FaHome /> Home
            </button>
            <span>/</span>
            <button onClick={() => navigate('/courses')} className="hover:text-yellow-400 flex items-center gap-1">
              <FaBook /> Courses
            </button>
            <span>/</span>
            <span className="text-white">{name || 'Course'}</span>
            <span>/</span>
            <span className="text-white">Quizzes</span>
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors px-4 py-2 rounded-lg bg-gray-800/50"
            >
              <FaArrowLeft />
              Back
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Quizzes for {name}</h1>
              <p className="text-gray-400 text-sm mt-1">
                {isLoading ? "Loading..." : `${quizzes.length} quiz${quizzes.length !== 1 ? 'es' : ''} available`}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/profile/submissions')}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg flex items-center gap-2 font-semibold"
            >
              <FaClipboardList />
              My Submissions
            </button>

            {role === "ADMIN" && (
              <button
                onClick={() => navigate(`/course/${name}/${courseId}/quizes/add`)}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-500 hover:to-green-400 transition-all shadow-lg font-semibold"
              >
                + Create Quiz
              </button>
            )}
          </div>
        </div>

        {/* Quiz List */}
        {isLoading ? (
          <div className="text-center text-gray-300 py-12">Loading quizzes...</div>
        ) : quizzes.length === 0 ? (
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-12 text-center">
            <div className="text-gray-300 text-lg mb-4">No quizzes available for this course yet.</div>
            {role === "ADMIN" && (
              <button
                onClick={() => navigate(`/course/${name}/${courseId}/quizes/add`)}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-400 transition-colors font-semibold"
              >
                Create First Quiz
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((q) => (
              <div
                key={q._id}
                className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-2xl border border-gray-700 p-6 hover:border-gray-600 transition-all hover:shadow-xl"
              >
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-white mb-2">{q.title}</h2>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{q.description}</p>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{q.questions?.length || 0} questions</span>
                    <span>•</span>
                    <span>{new Date(q.createdAt || "").toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => navigate(`/course/${name}/${courseId}/quizes/${q._id}/take`)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all shadow-lg"
                  >
                    <FaPlay />
                    Take Quiz
                  </button>

                  {role === "ADMIN" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/admin/${name}/${courseId}/quizes/${q._id}`)}
                        className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                      >
                        <FaEdit />
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(q._id)}
                        className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                      >
                        <FaTrash />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </HomeLayout>
  );
};

export default QuizPerCourse;
