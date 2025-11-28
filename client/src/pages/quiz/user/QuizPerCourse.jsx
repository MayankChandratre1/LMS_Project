import React, { FC, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaTrash, FaEdit, FaPlay } from "react-icons/fa";
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors px-4 py-2 rounded-lg bg-gray-800/50"
          >
            <FaArrowLeft />
            Back
          </button>
          <h1 className="text-3xl font-bold text-white">Quizzes</h1>
        </div>

        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-300">{isLoading ? "Loading quizzes..." : `${quizzes.length} quiz(es)`}</p>

          {/* quick link to user's submissions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/profile/submissions')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
            >
              My Submissions
            </button>
          </div>

          {role === "ADMIN" && (
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/course/${name}/${courseId}/quizes/add`)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-400"
              >
                Create Quiz
              </button>
              <button
                onClick={() => navigate(`/course/${name}/${courseId}/quizes`)}
                className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:from-yellow-400"
              >
                Manage Quizzes
              </button>
            </div>
          )}
        </div>

        {isLoading ? null : quizzes.length === 0 ? (
          <div className="text-center text-gray-300 py-12">No quizzes available for this course.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((q) => (
              <div key={q._id} className="bg-gray-800 p-4 rounded-lg shadow-lg hover:bg-gray-700 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">{q.title}</h2>
                    <p className="text-gray-400 text-sm mb-2">{q.description}</p>
                    <p className="text-xs text-gray-500">Created: {new Date(q.createdAt || "").toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => navigate(`/course/${name}/${courseId}/quizes/${q._id}/take`)}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md flex items-center gap-2 text-sm"
                    >
                      <FaPlay /> Take
                    </button>

                    {role === "ADMIN" && (
                      <>
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/admin/${name}/${courseId}/quizes/${q._id}`)}
                            className="px-3 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-md text-sm flex items-center gap-2"
                          >
                            <FaEdit /> Edit
                          </button>
                          <button
                            onClick={() => onDelete(q._id)}
                            className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md text-sm flex items-center gap-2"
                          >
                            <FaTrash /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                {/* small footer */}
                <div className="flex justify-between items-center mt-3">
                  <div className="text-xs text-gray-400">Questions: {q.questions?.length || 0}</div>
                  <div className="text-xs text-gray-400">Course: {name}</div>
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
