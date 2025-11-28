import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FaGraduationCap, FaBookOpen, FaClock, FaTrophy, FaCheckCircle, FaPlay } from 'react-icons/fa'

import HomeLayout from '../../layouts/HomeLayout'
import { getAllCourse } from '../../redux/slices/CourseSlice'
import { getDashboardData } from '../../redux/slices/ProgressSlice'
import { getUserSubmissions } from '../../redux/slices/QuizSubmissionsSlice'
import CourseCard from './CourseCard';
import { useNavigate } from 'react-router-dom'

function CourseList() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    // default to dashboard when user is logged in
    const authUser = useSelector((state) => state.auth?.data || {});
    const isLoggedIn = authUser && Object.keys(authUser).length > 0;
    const [activeTab, setActiveTab] = useState(isLoggedIn ? 'dashboard' : 'courses');

    const { courseData } = useSelector((state) => state?.course)
    const { dashboard } = useSelector((state) => state.progress);
    const { data: user } = useSelector((state) => state.auth);

    async function loadCourses() {
        await dispatch(getAllCourse())
    }

    async function loadDashboard() {
        if (isLoggedIn) {
            await dispatch(getDashboardData())
            await dispatch(getUserSubmissions())
        }
    }

    useEffect(() => {
        loadCourses()
        loadDashboard()
    }, [])

    const renderDashboard = () => (
        <div className="max-w-7xl mx-auto px-6">
            {/* Welcome Section */}
            

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <FaBookOpen className="text-3xl text-blue-400" />
                        <span className="text-2xl font-bold text-white">
                            {dashboard?.totalCourses || 0}
                        </span>
                    </div>
                    <p className="text-blue-200 font-semibold">Total Courses</p>
                    <p className="text-gray-400 text-sm">Enrolled courses</p>
                </div>

                <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <FaCheckCircle className="text-3xl text-green-400" />
                        <span className="text-2xl font-bold text-white">
                            {dashboard?.completedCourses || 0}
                        </span>
                    </div>
                    <p className="text-green-200 font-semibold">Completed</p>
                    <p className="text-gray-400 text-sm">Finished courses</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <FaPlay className="text-3xl text-yellow-400" />
                        <span className="text-2xl font-bold text-white">
                            {dashboard?.inProgressCourses || 0}
                        </span>
                    </div>
                    <p className="text-yellow-200 font-semibold">In Progress</p>
                    <p className="text-gray-400 text-sm">Active learning</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <FaClock className="text-3xl text-purple-400" />
                        <span className="text-2xl font-bold text-white">
                            {dashboard?.totalTimeSpent || 0}m
                        </span>
                    </div>
                    <p className="text-purple-200 font-semibold">Time Spent</p>
                    <p className="text-gray-400 text-sm">Total learning time</p>
                </div>
            </div>

            {/* Recent Courses - Full Width */}
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <FaTrophy className="text-yellow-500" />
                    Recent Courses
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dashboard?.recentCourses?.length > 0 ? (
                        dashboard.recentCourses.map((course) => (
                            <div 
                                key={course._id}
                                className="group bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-xl p-4 cursor-pointer transition-all duration-300"
                                onClick={() => navigate(`/course/${course.courseId.title}/${course.courseId._id}/lectures`, { 
                                    state: course.courseId 
                                })}
                            >
                                <div className="flex flex-col gap-4">
                                    <img 
                                        src={course.courseId.thumbnail.secure_url}
                                        alt={course.courseId.title}
                                        className="w-full h-32 rounded-lg object-cover"
                                    />
                                    <div>
                                        <h4 className="font-semibold text-white capitalize group-hover:text-yellow-400 transition-colors mb-1">
                                            {course.courseId.title}
                                        </h4>
                                        <p className="text-gray-400 text-sm mb-3">
                                            {course.courseId.category}
                                        </p>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-gray-300">Progress</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-300">{course.totalProgress}%</span>
                                                {course.isCompleted && (
                                                    <FaCheckCircle className="text-green-500" />
                                                )}
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-800/60 rounded-full h-3 mb-2 border border-gray-700/50">
                                            <div 
                                                className={`h-3 rounded-full transition-all duration-500 relative overflow-hidden ${
                                                    course.isCompleted 
                                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                                                        : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                                                }`}
                                                style={{ width: `${course.totalProgress}%` }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                                            </div>
                                        </div>
                                        <p className="text-gray-400 text-sm">
                                            {course.totalTimeSpent}m spent
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <FaBookOpen className="text-6xl text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">No enrolled courses yet</h3>
                            <p className="text-gray-400 mb-4">Start your learning journey by enrolling in a course</p>
                            <button 
                                onClick={() => setActiveTab('courses')}
                                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black rounded-xl font-semibold transition-all duration-300"
                            >
                                Browse Courses
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderCourses = () => (
        <div className='max-w-7xl mx-auto px-6'>
            {courseData?.length > 0 ? (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'>
                    {courseData.map((course) => (
                        <CourseCard key={course._id} data={course} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <FaBookOpen className="text-6xl text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-xl">No courses available at the moment</p>
                </div>
            )}
        </div>
    );

    return (
        <HomeLayout>
            <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16'>
                {/* Header Section */}
                <div className='text-center mb-16 px-6'>
                    <div className="inline-flex items-center px-4 py-2 bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-full mb-6">
                        <FaGraduationCap className="text-yellow-500 mr-2 text-sm" />
                        <span className="text-yellow-400 text-sm font-medium">Learning Platform</span>
                    </div>
                    
                    {isLoggedIn ? (
                        <>
                            <h1 className='font-bold lg:text-6xl md:text-5xl text-3xl text-white mb-4 leading-tight'>
                                Welcome back, <span className='text-yellow-500'>{authUser.fullName?.split(' ')[0] || authUser.email}</span>
                            </h1>
                            <p className='text-gray-300 lg:text-xl text-lg max-w-3xl mx-auto leading-relaxed'>
                                Continue learning — your dashboard shows enrolled courses, progress and recent activity.
                            </p>
                        </>
                    ) : (
                        <>
                            <h1 className='font-bold lg:text-6xl md:text-5xl text-3xl text-white mb-4 leading-tight'>
                                {activeTab === 'dashboard' ? (
                                    <>Your Learning <span className='text-yellow-500'>Dashboard</span></>
                                ) : (
                                    <>Explore Premium <span className='text-yellow-500'>Courses</span></>
                                )}
                            </h1>
                            <p className='text-gray-300 lg:text-xl text-lg max-w-3xl mx-auto leading-relaxed'>
                                {activeTab === 'dashboard' 
                                    ? 'Track your progress and continue your learning journey with personalized insights.'
                                    : 'Master in-demand skills with courses crafted by industry experts and trusted by thousands of professionals worldwide.'
                                }
                            </p>
                        </>
                    )}

                    {/* Tab Navigation */}
                    <div className="flex justify-center mt-8">
                        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-1">
                            <button 
                                onClick={() => setActiveTab('dashboard')}
                                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                                    activeTab === 'dashboard' 
                                        ? 'bg-yellow-500 text-black' 
                                        : 'text-gray-300 hover:text-white'
                                }`}
                            >
                                Dashboard
                            </button>
                            <button 
                                onClick={() => setActiveTab('courses')}
                                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                                    activeTab === 'courses' 
                                        ? 'bg-yellow-500 text-black' 
                                        : 'text-gray-300 hover:text-white'
                                }`}
                            >
                                All Courses
                            </button>
                        </div>
                    </div>

                    {/* Stats - only show for courses tab */}
                    {activeTab === 'courses' && (
                        <div className="flex justify-center gap-8 mt-8 flex-wrap">
                            <div className="text-center">
                                <p className="text-yellow-500 font-bold text-2xl">{courseData?.length || 0}+</p>
                                <p className="text-gray-400 text-sm">Expert Courses</p>
                            </div>
                            <div className="text-center">
                                <p className="text-yellow-500 font-bold text-2xl">50K+</p>
                                <p className="text-gray-400 text-sm">Students Enrolled</p>
                            </div>
                            <div className="text-center">
                                <p className="text-yellow-500 font-bold text-2xl">4.9★</p>
                                <p className="text-gray-400 text-sm">Average Rating</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content based on active tab */}
                {isLoggedIn && activeTab === 'dashboard' ? renderDashboard() : renderCourses()}
             </div>
         </HomeLayout>
     )
 }
 
 export default CourseList
