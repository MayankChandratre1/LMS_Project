import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FaPaperPlane, FaRobot, FaUser, FaClock, FaBook, FaLightbulb, FaTrash, FaTimes } from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import HomeLayout from '../../layouts/HomeLayout'
import Particle from '../../components/Particle'
import option1 from '../../assets/json/option1.json'
import { getChatHistory, chatWithAI, deleteChatHistory } from '../../redux/slices/ChatSlice'
import { getAllCourse } from '../../redux/slices/CourseSlice'

const Chat = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const chatState = useSelector((state) => state?.chat)
  const { courseData } = useSelector((state) => state?.course || {})
  const { chatHistory = [], isLoading: storeLoading, error } = chatState || {}
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showClearDialog, setShowClearDialog] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    console.log('Dispatching getChatHistory...'); // Debug log
    dispatch(getChatHistory())
    // Fetch course data for course recommendations
    dispatch(getAllCourse())
  }, [dispatch])

  // useEffect(() => {
  //   console.log('Chat state updated:', chatState); // Debug log
  //   console.log('Chat history:', chatHistory); // Debug log
  //   scrollToBottom()
  // }, [chatHistory, chatState])

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return

    const userMessage = message
    setMessage('')
    setIsLoading(true)

    try {
      await dispatch(chatWithAI(userMessage))
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const findCourseDetails = (courseId) => {
    return courseData?.find(course => course._id === courseId)
  }

  const handleCourseNavigation = (courseId) => {
    const courseDetails = findCourseDetails(courseId)
    if (courseDetails) {
      navigate('/course/description', { state: { ...courseDetails } })
    } else {
      // Fallback to courses page if course not found
      navigate('/courses')
    }
  }

  const renderAIResponse = (responseString) => {
    try {
      const response = JSON.parse(responseString)
      
      switch (response.intent) {
        case 'ROADMAP':
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-yellow-400">
                <FaLightbulb />
                <span className="font-semibold">Learning Roadmap</span>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-gray-300 mb-4">
                  Total Estimated Duration: <span className="text-yellow-400 font-bold">{response.totalEstimatedDuration_in_hours || response.totalEstimatedDuration} hours</span>
                </p>
                <div className="space-y-3">
                  {response.steps?.map((step, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                      <div className="w-6 h-6 bg-yellow-500 text-black font-bold text-sm rounded-full flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">{step.title}</h4>
                        <p className="text-gray-300 text-sm mt-1">{step.description}</p>
                        <div className="flex items-center gap-1 mt-2 text-yellow-400 text-xs">
                          <FaClock />
                          <span>{step.duration_in_hours || step.duration} hours</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )

        case 'COURSE':
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-yellow-400">
                <FaBook />
                <span className="font-semibold">Recommended Courses</span>
              </div>
              {response.courses?.length > 0 ? (
                <div className="grid gap-3">
                  {response.courses.map((course) => {
                    const courseDetails = findCourseDetails(course.id)
                    return (
                      <div key={course.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30 hover:border-yellow-500/50 transition-all cursor-pointer"
                           onClick={() => handleCourseNavigation(course.id)}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {course.thumbnailUrl && (
                              <img 
                                src={course.thumbnailUrl} 
                                alt={course.title}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            )}
                            <div>
                              <h4 className="text-white font-semibold">{course.title}</h4>
                              <p className="text-yellow-400 font-bold">
                                {course.price ? `$${course.price}` : 'Free'}
                              </p>
                              {courseDetails && (
                                <p className="text-gray-400 text-xs mt-1">
                                  {courseDetails.numberOfLectures} lectures • {courseDetails.category}
                                </p>
                              )}
                            </div>
                          </div>
                          <button 
                            className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold transition-all"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCourseNavigation(course.id)
                            }}
                          >
                            View Course
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-gray-300">No courses found matching your query.</p>
                  <Link 
                    to="/courses"
                    className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                  >
                    <FaBook />
                    <span>Browse all courses instead</span>
                  </Link>
                </div>
              )}
            </div>
          )

        case 'DOUBT':
          return (
            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-600/30">
              <p className="text-gray-200">{response.response}</p>
              {response.isCodeQuery && (
                <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-400 text-sm">
                    💡 For code-specific queries, please contact our support team for detailed assistance.
                  </p>
                </div>
              )}
            </div>
          )

        default:
          return <p className="text-gray-300">{response.response || responseString}</p>
      }
    } catch (error) {
      console.error('Error parsing AI response:', error)
      return <p className="text-gray-300">{responseString}</p>
    }
  }

  const handleClearHistory = async () => {
    try {
      await dispatch(deleteChatHistory())
      setShowClearDialog(false)
    } catch (error) {
      console.error('Error clearing chat history:', error)
    }
  }

  if (storeLoading && chatHistory.length === 0) {
    return (
      <HomeLayout>
        <div className="relative min-h-screen flex items-center justify-center">
          <Particle option={option1} className="absolute inset-0 opacity-10" />
          <div className="relative z-10 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-gray-300 text-lg">Loading chat history...</p>
          </div>
        </div>
      </HomeLayout>
    )
  }

  return (
    <HomeLayout>
      <div className="relative min-h-screen">
        <Particle option={option1} className="absolute inset-0 opacity-10" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-full mb-4">
              <FaRobot className="text-yellow-500 mr-2" />
              <span className="text-yellow-400 font-medium">AI Learning Assistant</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
              Chat with Our <span className="text-yellow-500">AI Tutor</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Get instant help with course recommendations, learning roadmaps, and study guidance
            </p>
          </div>

          {/* Chat Container */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden shadow-2xl">
            {/* Chat Header with Clear History Button */}
            {chatHistory.length > 0 && (
              <div className="flex justify-between items-center p-4 border-b border-gray-700/50">
                <div className="flex items-center gap-2">
                  <FaRobot className="text-yellow-400" />
                  <span className="text-gray-300 font-medium">Chat History</span>
                </div>
                <button
                  onClick={() => setShowClearDialog(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 hover:border-red-500/50 rounded-lg transition-all duration-300 text-sm"
                >
                  <FaTrash className="text-xs" />
                  <span>Clear History</span>
                </button>
              </div>
            )}

            {/* Chat Messages */}
            <div className="h-96 lg:h-[500px] overflow-y-auto p-6 space-y-4">
              {chatHistory.length === 0 ? (
                <div className="text-center py-12">
                  <FaRobot className="text-6xl text-yellow-500/50 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">
                    {storeLoading ? 'Loading your chat history...' : 'Start a conversation! Ask me about courses, learning paths, or any study-related questions.'}
                  </p>
                  {!storeLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-4xl mx-auto">
                      <div 
                        className="bg-gray-800/50 p-4 rounded-lg border border-gray-600/30 hover:border-yellow-500/50 cursor-pointer transition-all"
                        onClick={() => setMessage("Show me React courses")}
                      >
                        <p className="text-yellow-400 font-semibold mb-2">Try asking:</p>
                        <p className="text-gray-300 text-sm">"Show me React courses"</p>
                      </div>
                      <div 
                        className="bg-gray-800/50 p-4 rounded-lg border border-gray-600/30 hover:border-yellow-500/50 cursor-pointer transition-all"
                        onClick={() => setMessage("How should I learn web development?")}
                      >
                        <p className="text-yellow-400 font-semibold mb-2">Get roadmaps:</p>
                        <p className="text-gray-300 text-sm">"How should I learn web development?"</p>
                      </div>
                      <div 
                        className="bg-gray-800/50 p-4 rounded-lg border border-gray-600/30 hover:border-yellow-500/50 cursor-pointer transition-all"
                        onClick={() => setMessage("What's the difference between React and Angular?")}
                      >
                        <p className="text-yellow-400 font-semibold mb-2">Ask doubts:</p>
                        <p className="text-gray-300 text-sm">"What's the difference between React and Angular?"</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                chatHistory.map((chat, index) => (
                  <div key={chat._id || index} className={`flex ${chat.isUser ? 'justify-end' : 'justify-start'} mb-4`}>
                    <div className={`max-w-[80%] ${chat.isUser ? 'order-2' : 'order-1'}`}>
                      <div className={`flex items-start gap-3 ${chat.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          chat.isUser ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-yellow-400'
                        }`}>
                          {chat.isUser ? <FaUser className="text-sm" /> : <FaRobot className="text-sm" />}
                        </div>
                        <div className={`rounded-2xl px-4 py-3 ${
                          chat.isUser 
                            ? 'bg-yellow-500 text-black' 
                            : 'bg-gray-800/70 text-white border border-gray-600/50'
                        }`}>
                          {chat.isUser ? (
                            <p>{chat.text}</p>
                          ) : (
                            renderAIResponse(chat.response)
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-700 text-yellow-400 flex items-center justify-center">
                      <FaRobot className="text-sm" />
                    </div>
                    <div className="bg-gray-800/70 rounded-2xl px-4 py-3 border border-gray-600/50">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
                        <span className="text-gray-300">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-700/50 p-6">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about courses, learning paths, or study tips..."
                    className="w-full bg-gray-800/70 text-white placeholder-gray-400 rounded-xl px-4 py-3 pr-12 border border-gray-600/50 focus:border-yellow-500/50 focus:outline-none resize-none"
                    rows="2"
                    disabled={isLoading}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isLoading}
                  className="bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-black px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center"
                >
                  <FaPaperPlane className="text-lg" />
                </button>
              </div>
            </div>
          </div>

          {/* Clear History Confirmation Dialog */}
          {showClearDialog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-gray-800 rounded-2xl p-6 mx-4 max-w-md w-full border border-gray-700/50 shadow-2xl">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                    <FaTrash className="text-red-400 text-2xl" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white">Clear Chat History</h3>
                  
                  <p className="text-gray-300">
                    Are you sure you want to delete your entire chat history? This action cannot be undone.
                  </p>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowClearDialog(false)}
                      className="flex-1 px-4 py-2 bg-gray-700/50 hover:bg-gray-700/70 text-gray-300 border border-gray-600/50 hover:border-gray-500/50 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <FaTimes className="text-sm" />
                      Cancel
                    </button>
                    
                    <button
                      onClick={handleClearHistory}
                      disabled={storeLoading}
                      className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <FaTrash className="text-sm" />
                      {storeLoading ? 'Clearing...' : 'Clear All'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </HomeLayout>
  )
}

export default Chat