import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {  FaTrash, FaEye, FaThumbsUp, FaReply, FaPlus, FaComments } from 'react-icons/fa'
import HomeLayout from '../../layouts/HomeLayout'
import Particle from '../../components/Particle'
import option1 from '../../assets/json/option1.json'
import { getAllThreads, deleteThread } from '../../redux/slices/ForumSlice'

const MyThreads = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { threads, isLoading } = useSelector((state) => state?.forum || {})
  const currentUser = useSelector((state) => state?.auth?.data)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [threadToDelete, setThreadToDelete] = useState(null)

  useEffect(() => {
    dispatch(getAllThreads({ page: 1, limit: 100, sort: '-createdAt' }))
  }, [dispatch])

  // Filter threads by current user
  const myThreads = threads?.filter(thread => thread.userId?._id === currentUser?._id) || []

  const handleDeleteClick = (thread) => {
    setThreadToDelete(thread)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (threadToDelete) {
      await dispatch(deleteThread(threadToDelete._id))
      setShowDeleteModal(false)
      setThreadToDelete(null)
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
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">My Threads</h1>
              <p className="text-gray-300">Manage your forum discussions</p>
            </div>
            <button
              onClick={() => navigate('/forum/new')}
              className="bg-blue-500 hover:bg-blue-400 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2"
            >
              <FaPlus />
              <span>New Thread</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Threads</p>
                  <p className="text-3xl font-bold text-white mt-1">{myThreads.length}</p>
                </div>
                <FaComments className="text-4xl text-blue-400" />
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Views</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {myThreads.reduce((sum, t) => sum + (t.views || 0), 0)}
                  </p>
                </div>
                <FaEye className="text-4xl text-green-400" />
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Replies</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {myThreads.reduce((sum, t) => sum + (t.replies?.length || 0), 0)}
                  </p>
                </div>
                <FaReply className="text-4xl text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Threads List */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
              <p className="text-gray-300 mt-4">Loading your threads...</p>
            </div>
          ) : myThreads.length > 0 ? (
            <div className="space-y-4">
              {myThreads.map((thread) => (
                <div
                  key={thread._id}
                  className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 hover:border-blue-500/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 cursor-pointer" onClick={() => navigate(`/forum/thread/${thread._id}`)}>
                      {/* Thread Title */}
                      <div className="flex items-center gap-2 mb-2">
                        {thread.isPinned && <span className="text-yellow-400">📌</span>}
                        <h3 className="text-white font-semibold text-lg hover:text-blue-400 transition-colors">
                          {thread.title}
                        </h3>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                          {thread.category}
                        </span>
                        {thread.isClosed && (
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
                            Closed
                          </span>
                        )}
                      </div>

                      {/* Thread Preview */}
                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                        {thread.content}
                      </p>

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
                        <span>•</span>
                        <span>{formatTimeAgo(thread.createdAt)}</span>
                        {thread.isEdited && (
                          <span className="text-xs italic">(edited)</span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                     
                      <button
                        onClick={() => handleDeleteClick(thread)}
                        className="p-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
                        title="Delete thread"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50">
              <FaComments className="text-6xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-4">You haven't created any threads yet</p>
              <button
                onClick={() => navigate('/forum/new')}
                className="bg-blue-500 hover:bg-blue-400 text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                Create Your First Thread
              </button>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-gray-800 rounded-2xl p-6 mx-4 max-w-md w-full border border-gray-700/50 shadow-2xl">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                  <FaTrash className="text-red-400 text-2xl" />
                </div>
                
                <h3 className="text-xl font-bold text-white">Delete Thread</h3>
                
                <p className="text-gray-300">
                  Are you sure you want to delete "{threadToDelete?.title}"? This action cannot be undone.
                </p>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-700/50 hover:bg-gray-700/70 text-gray-300 border border-gray-600/50 hover:border-gray-500/50 rounded-lg transition-all duration-300"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </HomeLayout>
  )
}

export default MyThreads
