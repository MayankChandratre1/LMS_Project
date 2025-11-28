import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { FaArrowLeft, FaPlus, FaTrash, FaEdit } from 'react-icons/fa'
import { getQuizzesByCourse, deleteQuiz } from '../../redux/slices/QuizSlice'

const QuizList = () => {
  const { name, id: courseId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { quizzes = [], isLoading } = useSelector((state) => state.quiz || {}) // Fallback to empty array if quizzes is undefined

  useEffect(() => {
    dispatch(getQuizzesByCourse(courseId))
  }, [dispatch, courseId])

  const handleDelete = async (quizId) => {
    const response = await dispatch(deleteQuiz(quizId))
    if (response?.payload) {
      dispatch(getQuizzesByCourse(courseId))
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8'>
      <div className='flex items-center gap-4 mb-6'>
        <button
          onClick={() => navigate(-1)}
          className='flex items-center gap-2 text-white hover:text-yellow-400 transition-colors duration-300 bg-gray-800/50 px-4 py-2 rounded-lg'
        >
          <FaArrowLeft className='text-lg' />
          Back
        </button>
        <h1 className='text-3xl font-bold text-white'>Quizzes for {name}</h1>
      </div>
      <div className='flex justify-end mb-6'>
        <button
          onClick={() => navigate(`/course/${name}/${courseId}/quizes/add`)}
          className='flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-400 transition-all'
        >
          <FaPlus />
          Add Quiz
        </button>
      </div>
      {isLoading ? (
        <p className='text-gray-300'>Loading quizzes...</p>
      ) : quizzes.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {quizzes.map((quiz) => (
            <div
              key={quiz._id}
              className='bg-gray-800 p-4 rounded-lg shadow-lg hover:bg-gray-700 transition-all'
            >
              <h2 className='text-xl font-bold text-white mb-2'>{quiz.title}</h2>
              <p className='text-gray-400 mb-4'>{quiz.description}</p>
              <div className='flex justify-between items-center'>
                <button
                  onClick={() =>
                    navigate(`/admin/${name}/${courseId}/quizes/${quiz._id}`)
                  }
                  className='flex items-center gap-2 text-blue-500 hover:text-blue-400'
                >
                  <FaEdit />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(quiz._id)}
                  className='flex items-center gap-2 text-red-500 hover:text-red-400'
                >
                  <FaTrash />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className='text-gray-300'>No quizzes available for this course.</p>
      )}
    </div>
  )
}

export default QuizList