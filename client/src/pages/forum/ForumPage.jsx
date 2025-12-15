import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { FaComments, FaFire, FaPlus, FaSearch, FaEye, FaThumbsUp, FaReply, FaFilter, FaTag } from 'react-icons/fa'
import HomeLayout from '../../layouts/HomeLayout'
import Particle from '../../components/Particle'
import option1 from '../../assets/json/option1.json'
import { getAllThreads, searchThreads, getThreadsByCategory } from '../../redux/slices/ForumSlice'

const ForumPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const forumState = useSelector((state) => state?.forum)
  const { threads = [], isLoading = false, pagination = { currentPage: 1, totalPages: 1, total: 0 } } = forumState || {}
  const { isLoggedIn } = useSelector((state) => state?.auth || {})
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('-createdAt')

  const categories = [
    { value: 'all', label: 'All Topics', icon: '🌐' },
    { value: 'general', label: 'General', icon: '💬' },
    { value: 'course-help', label: 'Course Help', icon: '📚' },
    { value: 'career', label: 'Career', icon: '💼' },
    { value: 'technical', label: 'Technical', icon: '⚙️' },
    { value: 'announcements', label: 'Announcements', icon: '📢' },
    { value: 'off-topic', label: 'Off Topic', icon: '🎯' }
  ]

  useEffect(() => {
    console.log('Forum state:', forumState); // Debug log
    loadThreads()
  }, [dispatch, selectedCategory, sortBy])

  const loadThreads = (page = 1) => {
    if (selectedCategory === 'all') {
      dispatch(getAllThreads({ page, limit: 20, sort: sortBy }))
    } else {
      dispatch(getThreadsByCategory({ category: selectedCategory, page, limit: 20 }))
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      dispatch(searchThreads({ query: searchQuery, page: 1, limit: 20 }))
    } else {
      loadThreads()
    }
  }

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <HomeLayout>
      <div className="relative min-h-screen">
        <Particle option={option1} className="absolute inset-0 opacity-10" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded-full mb-4">
              <FaComments className="text-blue-500 mr-2" />
              <span className="text-blue-400 font-medium">Community Forum</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
              Discussion <span className="text-blue-500">Forum</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Ask questions, share knowledge, and connect with fellow learners
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search discussions..."
                  className="w-full bg-gray-800/70 text-white placeholder-gray-400 rounded-xl px-4 py-3 pl-12 border border-gray-600/50 focus:border-blue-500/50 focus:outline-none"
                />
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </form>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {isLoggedIn && (
                <>
                  <button
                    onClick={() => navigate('/forum/new')}
                    className="bg-blue-500 hover:bg-blue-400 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <FaPlus />
                    <span>New Thread</span>
                  </button>
                  <button
                    onClick={() => navigate('/forum/my-threads')}
                    className="bg-gray-800/70 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 border border-gray-600/50"
                  >
                    My Threads
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 sticky top-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <FaFilter className="text-blue-400" />
                  Categories
                </h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                        selectedCategory === cat.value
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                      }`}
                    >
                      <span className="mr-2">{cat.icon}</span>
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Sort */}
                <div className="mt-6">
                  <h3 className="text-white font-semibold mb-4">Sort By</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-gray-800/70 text-white rounded-lg px-4 py-2 border border-gray-600/50 focus:border-blue-500/50 focus:outline-none"
                  >
                    <option value="-createdAt">Latest</option>
                    <option value="-views">Most Viewed</option>
                    <option value="-upvotes">Most Upvoted</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Thread List */}
            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
                  <p className="text-gray-300 mt-4">Loading threads...</p>
                </div>
              ) : threads?.length > 0 ? (
                <div className="space-y-4">
                  {threads.map((thread) => (
                    <div
                      key={thread._id}
                      onClick={() => navigate(`/forum/thread/${thread._id}`)}
                      className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 hover:border-blue-500/50 transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        {/* User Avatar */}
                        <img
                          src={thread.userId?.avatar?.secure_url || 'https://ui-avatars.com/api/?name=User'}
                          alt={thread.userId?.fullName}
                          className="w-12 h-12 rounded-full"
                        />

                        <div className="flex-1">
                          {/* Thread Header */}
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {thread.isPinned && (
                                  <span className="text-yellow-400">📌</span>
                                )}
                                <h3 className="text-white font-semibold text-lg hover:text-blue-400 transition-colors">
                                  {thread.title}
                                </h3>
                              </div>
                              <div className="flex items-center gap-3 text-sm text-gray-400">
                                <span>{thread.userId?.fullName}</span>
                                <span>•</span>
                                <span>{formatTimeAgo(thread.createdAt)}</span>
                                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                                  {thread.category}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Thread Content Preview */}
                          <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                            {thread.content}
                          </p>

                          {/* Tags */}
                          {thread.tags && thread.tags.length > 0 && (
                            <div className="flex items-center gap-2 mb-3">
                              {thread.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-gray-800/50 text-gray-400 rounded text-xs flex items-center gap-1"
                                >
                                  <FaTag className="text-xs" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Thread Stats */}
                          <div className="flex items-center gap-6 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                              <FaThumbsUp className="text-green-400" />
                              <span>{thread.upvotes?.length || 0}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaReply className="text-blue-400" />
                              <span>{thread.replies?.length || 0} replies</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaEye className="text-gray-400" />
                              <span>{thread.views || 0} views</span>
                            </div>
                            {thread.isClosed && (
                              <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                                Closed
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50">
                  <FaComments className="text-6xl text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No threads found</p>
                  {isLoggedIn && (
                    <button
                      onClick={() => navigate('/forum/new')}
                      className="mt-4 bg-blue-500 hover:bg-blue-400 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                    >
                      Start a New Discussion
                    </button>
                  )}
                </div>
              )}

              {/* Pagination */}
              {pagination?.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => loadThreads(page)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        pagination.currentPage === page
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  )
}

export default ForumPage
