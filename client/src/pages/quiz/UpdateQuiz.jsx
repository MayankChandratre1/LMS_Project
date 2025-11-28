import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FaArrowLeft } from 'react-icons/fa'
import { getQuizById, updateQuiz } from '../../redux/slices/QuizSlice'

const UpdateQuiz = () => {
  const { name, courseId, quizId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { quizDetails, isLoading } = useSelector((state) => state.quiz || {})

  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    questions: [
      {
        question: '',
        options: ['', '', '', ''],
        correctOption: 0,
        timeout: 30,
      },
    ],
  })

  useEffect(() => {
    dispatch(getQuizById(quizId))
  }, [dispatch, quizId])

  useEffect(() => {
    if (quizDetails) {
      setQuizData({
        title: quizDetails.title || '',
        description: quizDetails.description || '',
        questions: quizDetails.questions || [
          {
            question: '',
            options: ['', '', '', ''],
            correctOption: 0,
            timeout: 30,
          },
        ],
      })
    }
  }, [quizDetails])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setQuizData((prev) => ({ ...prev, [name]: value }))
  }

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...quizData.questions]
    updatedQuestions[index][field] = value
    setQuizData((prev) => ({ ...prev, questions: updatedQuestions }))
  }

  const addQuestion = () => {
    setQuizData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question: '',
          options: ['', '', '', ''],
          correctOption: 0,
          timeout: 30,
        },
      ],
    }))
  }

  const removeQuestion = (index) => {
    if (quizData.questions.length > 1) {
      const updatedQuestions = quizData.questions.filter((_, i) => i !== index)
      setQuizData((prev) => ({ ...prev, questions: updatedQuestions }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const response = await dispatch(updateQuiz({ quizId, data: quizData }))
    if (response?.payload) {
      toast.success('Quiz updated successfully!')
      navigate(`/course/${name}/${courseId}/quizes`)
    }
  }

  if (isLoading || !quizDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <p className="text-gray-300 text-xl">Loading quiz...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors duration-300 bg-gray-800/50 px-4 py-2 rounded-lg"
        >
          <FaArrowLeft className="text-lg" />
          Back
        </button>
        <h1 className="text-3xl font-bold text-white">
          Update Quiz for {name}
        </h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-300 mb-2">Quiz Title</label>
          <input
            type="text"
            name="title"
            value={quizData.title}
            onChange={handleInputChange}
            className="w-full p-3 rounded-lg bg-gray-800 text-white"
            placeholder="Enter quiz title"
            required
          />
        </div>
        <div>
          <label className="block text-gray-300 mb-2">Description</label>
          <textarea
            name="description"
            value={quizData.description}
            onChange={handleInputChange}
            className="w-full p-3 rounded-lg bg-gray-800 text-white"
            placeholder="Enter quiz description"
            required
          />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Questions</h2>
          {quizData.questions.map((question, index) => (
            <div
              key={index}
              className="mb-6 p-4 bg-gray-800 rounded-lg relative"
            >
              <div className="flex justify-between items-center mb-2">
                <label className="block text-gray-300">
                  Question {index + 1}
                </label>
                {quizData.questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    className="text-red-500 hover:text-red-400 text-sm"
                  >
                    Remove Question
                  </button>
                )}
              </div>
              <input
                type="text"
                value={question.question}
                onChange={(e) =>
                  handleQuestionChange(index, 'question', e.target.value)
                }
                className="w-full p-3 rounded-lg bg-gray-700 text-white mb-4"
                placeholder="Enter question"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                {question.options.map((option, optIndex) => (
                  <input
                    key={optIndex}
                    type="text"
                    value={option}
                    onChange={(e) =>
                      handleQuestionChange(index, `options`, [
                        ...question.options.slice(0, optIndex),
                        e.target.value,
                        ...question.options.slice(optIndex + 1),
                      ])
                    }
                    className="p-3 rounded-lg bg-gray-700 text-white"
                    placeholder={`Option ${optIndex + 1}`}
                    required
                  />
                ))}
              </div>
              <div className="mt-4">
                <label className="block text-gray-300 mb-2">Correct Option</label>
                <select
                  value={question.correctOption}
                  onChange={(e) =>
                    handleQuestionChange(index, 'correctOption', parseInt(e.target.value))
                  }
                  className="w-full p-3 rounded-lg bg-gray-700 text-white"
                >
                  {question.options.map((_, optIndex) => (
                    <option key={optIndex} value={optIndex}>
                      Option {optIndex + 1}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-4">
                <label className="block text-gray-300 mb-2">Timeout (seconds)</label>
                <input
                  type="number"
                  value={question.timeout}
                  onChange={(e) =>
                    handleQuestionChange(index, 'timeout', parseInt(e.target.value))
                  }
                  className="w-full p-3 rounded-lg bg-gray-700 text-white"
                  min="10"
                  max="300"
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addQuestion}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-all"
          >
            Add Question
          </button>
        </div>
        <div className="flex gap-4">
          <button
            type="submit"
            className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-400 transition-all"
          >
            Update Quiz
          </button>
          <button
            type="button"
            onClick={() => navigate(`/course/${name}/${courseId}/quizes`)}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-400 transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default UpdateQuiz