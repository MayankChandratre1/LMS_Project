import { useEffect } from "react";
import { FaBook, FaClock, FaTrophy, FaPlay, FaCheckCircle } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";

import Footer from '../../components/Footer';
import { getDashboardData } from "../../redux/slices/ProgressSlice";

function Dashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { dashboard } = useSelector((state) => state.progress);
    const { data: user } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(getDashboardData());
    }, [dispatch]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="container mx-auto px-6 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Welcome back, {user?.fullName}! 👋
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Continue your learning journey and track your progress
                    </p>
                </div>

                {/* Header Actions - Added My Threads button */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex gap-3">
                        <Link to="/profile" className="px-4 py-2 rounded-lg bg-gray-800/50 text-white">Profile</Link>
                        <Link to="/courses" className="px-4 py-2 rounded-lg bg-yellow-500 text-black">Browse Courses</Link>
                        <Link to="/forum/my-threads" className="px-4 py-2 rounded-lg bg-blue-500 text-white">My Threads</Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <FaBook className="text-3xl text-blue-400" />
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
                                            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                                                <div 
                                                    className={`h-2 rounded-full transition-all duration-300 ${
                                                        course.isCompleted ? 'bg-green-500' : 'bg-yellow-500'
                                                    }`}
                                                    style={{ width: `${course.totalProgress}%` }}
                                                ></div>
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
                                <FaBook className="text-6xl text-gray-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">No enrolled courses yet</h3>
                                <p className="text-gray-400 mb-4">Start your learning journey by enrolling in a course</p>
                                <button 
                                    onClick={() => navigate('/courses')}
                                    className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black rounded-xl font-semibold transition-all duration-300"
                                >
                                    Browse Courses
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default Dashboard;
