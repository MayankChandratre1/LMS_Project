import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { FaThumbsUp, FaThumbsDown, FaReply, FaImage, FaTimes, FaRobot, FaUser, FaEye, FaClock, FaTag } from 'react-icons/fa'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import HomeLayout from '../../layouts/HomeLayout'
import Particle from '../../components/Particle'
import option1 from '../../assets/json/option1.json'
import { getThreadById, addReply, voteThread, voteReply, generateAIResponse } from '../../redux/slices/ForumSlice'

const ThreadDetails = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { currentThread } = useSelector((state) => state?.forum || {})
  const currentUser = useSelector((state) => state?.auth?.data)
  const [replyContent, setReplyContent] = useState('')
  const [replyImages, setReplyImages] = useState([])
  const [replyPreviews, setReplyPreviews] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (id) {
      dispatch(getThreadById(id))
    }
  }, [dispatch, id])

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return new Date(date).toLocaleDateString()
  }

  const handleVote = async (voteType) => {
    try {
      await dispatch(voteThread({ threadId: id, voteType }))
      dispatch(getThreadById(id))
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  const handleReplyVote = async (replyId, voteType) => {
    try {
      await dispatch(voteReply({ threadId: id, replyId, voteType }))
      dispatch(getThreadById(id))
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    if (replyImages.length + files.length > 3) {
      alert('Maximum 3 images allowed')
      return
    }

    setReplyImages(prev => [...prev, ...files])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => setReplyPreviews(prev => [...prev, reader.result])
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    setReplyImages(prev => prev.filter((_, i) => i !== index))
    setReplyPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmitReply = async (e) => {
    e.preventDefault()
    if (!replyContent.trim()) return

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('content', replyContent)
      replyImages.forEach(image => formData.append('images', image))

      await dispatch(addReply({ threadId: id, formData })).unwrap()
      setReplyContent('')
      setReplyImages([])
      setReplyPreviews([])
      dispatch(getThreadById(id))
    } catch (error) {
      console.error('Error adding reply:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGenerateAI = async () => {
    try {
      await dispatch(generateAIResponse(id)).unwrap()
      dispatch(getThreadById(id))
    } catch (error) {
      console.error('Error generating AI response:', error)
    }
  }

  const hasUserVoted = (votes, userId) => {
    return votes?.some(voteId => voteId.toString() === userId)
  }

  // Markdown styling configuration
  const markdownComponents = {
    h1: ({ node, ...props }) => <h1 className="text-3xl font-bold text-white mb-4 mt-6" {...props} />,
    h2: ({ node, ...props }) => <h2 className="text-2xl font-bold text-white mb-3 mt-5" {...props} />,
    h3: ({ node, ...props }) => <h3 className="text-xl font-bold text-white mb-2 mt-4" {...props} />,
    p: ({ node, ...props }) => <p className="text-gray-300 mb-3 leading-relaxed" {...props} />,
    ul: ({ node, ...props }) => <ul className="list-disc list-inside text-gray-300 mb-3 ml-4" {...props} />,
    ol: ({ node, ...props }) => <ol className="list-decimal list-inside text-gray-300 mb-3 ml-4" {...props} />,
    li: ({ node, ...props }) => <li className="mb-1" {...props} />,
    a: ({ node, ...props }) => <a className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer" {...props} />,
    code: ({ node, inline, ...props }) => 
     (
        <code className="bg-gray-700/50 text-yellow-400 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
      ), 
    pre: ({ node, ...props }) => <pre className="mb-3 overflow-x-auto" {...props} />,
    blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-400 mb-3" {...props} />,
    table: ({ node, ...props }) => <table className="min-w-full border border-gray-700 mb-3" {...props} />,
    th: ({ node, ...props }) => <th className="border border-gray-700 px-4 py-2 bg-gray-800 text-white" {...props} />,
    td: ({ node, ...props }) => <td className="border border-gray-700 px-4 py-2 text-gray-300" {...props} />,
    strong: ({ node, ...props }) => <strong className="text-white font-bold" {...props} />,
    em: ({ node, ...props }) => <em className="text-gray-300 italic" {...props} />,
    hr: ({ node, ...props }) => <hr className="border-gray-700 my-4" {...props} />,
  }

  if (!currentThread) {
    return (
      <HomeLayout>
        <div className="relative min-h-screen flex items-center justify-center">
          <Particle option={option1} className="absolute inset-0 opacity-10" />
          <div className="relative z-10 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-300 text-lg">Loading thread...</p>
          </div>
        </div>
      </HomeLayout>
    )
  }

  return (
    <HomeLayout>
      <div className="relative min-h-screen">
        <Particle option={option1} className="absolute inset-0 opacity-10" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">
          {/* Thread */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 mb-6">
            {/* Thread Header */}
            <div className="flex items-start gap-4 mb-6">
              <img
                src={currentThread.userId?.avatar?.secure_url || 'https://ui-avatars.com/api/?name=User'}
                alt={currentThread.userId?.fullName}
                className="w-16 h-16 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {currentThread.isPinned && <span className="text-yellow-400">📌</span>}
                  <h1 className="text-3xl font-bold text-white">{currentThread.title}</h1>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>{currentThread.userId?.fullName}</span>
                  <span>•</span>
                  <span>{formatTimeAgo(currentThread.createdAt)}</span>
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                    {currentThread.category}
                  </span>
                  {currentThread.isClosed && (
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
                      Closed
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Thread Content with Markdown */}
            <div className="mb-6 prose prose-invert max-w-none overflow-x-auto">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]} 
                rehypePlugins={[rehypeRaw]}
                components={markdownComponents}
              >
                {currentThread.content}
              </ReactMarkdown>
            </div>

            {/* Thread Images */}
            {currentThread.images && currentThread.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {currentThread.images.map((img, i) => (
                  <img key={i} src={img.secure_url} alt={`Thread image ${i + 1}`} className="w-full h-48 object-cover rounded-lg" />
                ))}
              </div>
            )}

            {/* Tags */}
            {currentThread.tags && currentThread.tags.length > 0 && (
              <div className="flex items-center gap-2 mb-6">
                {currentThread.tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-800/50 text-gray-400 rounded-full text-sm flex items-center gap-1">
                    <FaTag className="text-xs" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Thread Stats & Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-700/50">
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <FaEye />
                  <span>{currentThread.views} views</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaReply />
                  <span>{currentThread.replies?.length || 0} replies</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleVote(hasUserVoted(currentThread.upvotes, currentUser?._id) ? 'remove' : 'upvote')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    hasUserVoted(currentThread.upvotes, currentUser?._id)
                      ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                  }`}
                >
                  <FaThumbsUp />
                  <span>{currentThread.upvotes?.length || 0}</span>
                </button>
                <button
                  onClick={() => handleVote(hasUserVoted(currentThread.downvotes, currentUser?._id) ? 'remove' : 'downvote')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    hasUserVoted(currentThread.downvotes, currentUser?._id)
                      ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                  }`}
                >
                  <FaThumbsDown />
                  <span>{currentThread.downvotes?.length || 0}</span>
                </button>
                <button
                  onClick={handleGenerateAI}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/30 transition-all"
                >
                  <FaRobot />
                  <span>Ask AI</span>
                </button>
              </div>
            </div>
          </div>

          {/* Replies Section */}
          <div className="space-y-4 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Replies ({currentThread.replies?.length || 0})
            </h2>

            {currentThread.replies?.map((reply, index) => (
              <div key={reply._id || index} className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 max-w-full">
                <div className="flex items-start gap-4">
                  <img
                    src={reply.userId?.avatar?.secure_url || 'https://ui-avatars.com/api/?name=User'}
                    alt={reply.userId?.fullName}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-white font-semibold">{reply.userId?.fullName}</span>
                      <span className="text-gray-400 text-sm">{formatTimeAgo(reply.createdAt)}</span>
                      {reply.isEdited && <span className="text-gray-500 text-xs italic">(edited)</span>}
                    </div>
                    
                    {/* Reply Content with Markdown */}
                    <div className="prose prose-invert max-w-3xl mb-4">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]} 
                        rehypePlugins={[rehypeRaw]}
                        components={markdownComponents}
                      >
                        {reply.content}
                      </ReactMarkdown>
                    </div>

                    {reply.images && reply.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                        {reply.images.map((img, i) => (
                          <img key={i} src={img.secure_url} alt={`Reply image ${i + 1}`} className="w-full h-32 object-cover rounded-lg" />
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleReplyVote(reply._id, hasUserVoted(reply.upvotes, currentUser?._id) ? 'remove' : 'upvote')}
                        className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-all ${
                          hasUserVoted(reply.upvotes, currentUser?._id)
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                        }`}
                      >
                        <FaThumbsUp className="text-xs" />
                        <span>{reply.upvotes?.length || 0}</span>
                      </button>
                      <button
                        onClick={() => handleReplyVote(reply._id, hasUserVoted(reply.downvotes, currentUser?._id) ? 'remove' : 'downvote')}
                        className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-all ${
                          hasUserVoted(reply.downvotes, currentUser?._id)
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                        }`}
                      >
                        <FaThumbsDown className="text-xs" />
                        <span>{reply.downvotes?.length || 0}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Reply Form */}
          {!currentThread.isClosed && (
            <form onSubmit={handleSubmitReply} className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Add Your Reply</h3>
              
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Share your thoughts... (Supports Markdown formatting: **bold**, *italic*, `code`, etc. | Tip: Type '/answer' to get AI assistance)"
                className="w-full bg-gray-800/70 text-white placeholder-gray-400 rounded-xl px-4 py-3 border border-gray-600/50 focus:border-blue-500/50 focus:outline-none resize-none mb-4"
                rows="6"
                required
              />

              {/* Markdown Help */}
              <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-blue-400 text-xs font-semibold mb-1">💡 Markdown supported:</p>
                <div className="text-gray-400 text-xs grid grid-cols-2 md:grid-cols-4 gap-2">
                  <span>**bold**</span>
                  <span>*italic*</span>
                  <span>`code`</span>
                  <span>[link](url)</span>
                  <span>- list</span>
                  <span>1. ordered</span>
                  <span>&gt; quote</span>
                  <span>```code block```</span>
                </div>
              </div>

              {replyPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {replyPreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4">
                {replyImages.length < 3 && (
                  <label className="cursor-pointer px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 rounded-lg flex items-center gap-2 transition-all">
                    <FaImage />
                    <span>Add Images</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                )}
                
                <button
                  type="submit"
                  disabled={isSubmitting || !replyContent.trim()}
                  className="ml-auto px-6 py-2 bg-blue-500 hover:bg-blue-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Posting...
                    </>
                  ) : (
                    <>
                      <FaReply />
                      Post Reply
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </HomeLayout>
  )
}

export default ThreadDetails
