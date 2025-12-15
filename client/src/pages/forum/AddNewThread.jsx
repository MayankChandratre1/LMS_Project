import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { FaImage, FaTimes, FaPlus } from 'react-icons/fa'
import HomeLayout from '../../layouts/HomeLayout'
import Particle from '../../components/Particle'
import option1 from '../../assets/json/option1.json'
import { createThread } from '../../redux/slices/ForumSlice'
import { getAllCourse } from '../../redux/slices/CourseSlice'

const AddNewThread = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { courseData } = useSelector((state) => state?.course || {})
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    courseId: '',
    tags: ''
  })
  const [images, setImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])

  useEffect(() => {
    dispatch(getAllCourse())
  }, [dispatch])

  const categories = [
    { value: 'general', label: 'General Discussion' },
    { value: 'course-help', label: 'Course Help' },
    { value: 'career', label: 'Career Advice' },
    { value: 'technical', label: 'Technical Questions' },
    { value: 'announcements', label: 'Announcements' },
    { value: 'off-topic', label: 'Off Topic' }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    if (images.length + files.length > 5) {
      alert('Maximum 5 images allowed')
      return
    }

    setImages(prev => [...prev, ...files])

    // Create previews
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Title and content are required')
      return
    }

    setIsLoading(true)

    try {
      const submitData = new FormData()
      submitData.append('title', formData.title)
      submitData.append('content', formData.content)
      submitData.append('category', formData.category)
      if (formData.courseId) submitData.append('courseId', formData.courseId)
      
      // Parse tags from comma-separated string
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      submitData.append('tags', JSON.stringify(tagsArray))

      // Append images
      images.forEach(image => {
        submitData.append('images', image)
      })

      const result = await dispatch(createThread(submitData)).unwrap()
      navigate(`/forum/thread/${result._id}`)
    } catch (error) {
      console.error('Error creating thread:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <HomeLayout>
      <div className="relative min-h-screen">
        <Particle option={option1} className="absolute inset-0 opacity-10" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Create New Thread</h1>
            <p className="text-gray-300">Share your question or start a discussion</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="What's your question or topic?"
                className="w-full bg-gray-800/70 text-white placeholder-gray-400 rounded-xl px-4 py-3 border border-gray-600/50 focus:border-blue-500/50 focus:outline-none"
                required
                minLength={5}
                maxLength={200}
              />
              <p className="text-gray-400 text-sm mt-1">{formData.title.length}/200 characters</p>
            </div>

            {/* Category & Course */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white font-semibold mb-2">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800/70 text-white rounded-xl px-4 py-3 border border-gray-600/50 focus:border-blue-500/50 focus:outline-none"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Related Course (Optional)
                </label>
                <select
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800/70 text-white rounded-xl px-4 py-3 border border-gray-600/50 focus:border-blue-500/50 focus:outline-none"
                >
                  <option value="">None</option>
                  {courseData?.map(course => (
                    <option key={course._id} value={course._id}>{course.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Content <span className="text-red-400">*</span>
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Describe your question or topic in detail... (Tip: Type '/answer' to get AI assistance)"
                className="w-full bg-gray-800/70 text-white placeholder-gray-400 rounded-xl px-4 py-3 border border-gray-600/50 focus:border-blue-500/50 focus:outline-none resize-none"
                rows="8"
                required
                minLength={10}
                maxLength={5000}
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-gray-400 text-sm">{formData.content.length}/5000 characters</p>
                <p className="text-blue-400 text-sm">💡 Type /answer to get AI help</p>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Tags (Optional)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="Separate tags with commas (e.g., react, javascript, hooks)"
                className="w-full bg-gray-800/70 text-white placeholder-gray-400 rounded-xl px-4 py-3 border border-gray-600/50 focus:border-blue-500/50 focus:outline-none"
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Images (Optional, max 5)
              </label>
              <div className="space-y-4">
                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FaTimes className="text-sm" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                {images.length < 5 && (
                  <label className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 border border-gray-600/50 rounded-lg cursor-pointer transition-all">
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
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/forum')}
                className="flex-1 px-6 py-3 bg-gray-700/50 hover:bg-gray-700/70 text-gray-300 border border-gray-600/50 rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <FaPlus />
                    Create Thread
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </HomeLayout>
  )
}

export default AddNewThread
