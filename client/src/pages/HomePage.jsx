import { Link } from "react-router-dom"
import { FaPlay, FaStar, FaUsers, FaGraduationCap } from 'react-icons/fa'
import HomeImage from "../assets/Images/homeImage.png"
import option1 from '../assets/json/option1.json'
import Particle from "../components/Particle"
import HomeLayout from "../layouts/HomeLayout"
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDashboardData } from "../redux/slices/ProgressSlice";
import { getUserSubmissions } from "../redux/slices/QuizSubmissionsSlice";
import { getAllCourse } from "../redux/slices/CourseSlice";

const HomePage = () => {
    const dispatch = useDispatch();
    const auth = useSelector((s) => s.auth?.data || {});
    // consider user logged in only when auth object has keys (not null or empty object)
    const isLoggedIn = auth && Object.keys(auth).length > 0;
    const dashboard = useSelector((s) => s.progress?.dashboard);
    const submissions = useSelector((s) => s.quizSubmissions?.submissions || []);
    const courses = useSelector((s) => s.course?.courseData || []);

    useEffect(() => {
        if (isLoggedIn) {
            dispatch(getDashboardData());
            dispatch(getUserSubmissions());
            dispatch(getAllCourse());
        }
    }, [isLoggedIn]);

    // small helper to render a tiny sparkline using numbers array
    const Spark = ({ values = [] }) => {
        if (!values.length) return <div className="text-xs text-gray-400">No data</div>;
        const mx = Math.max(...values, 1);
        return (
            <div className="flex items-end gap-1 h-10">
                {values.map((v, i) => (
                    <div key={i} title={String(v)} style={{ height: `${(v / mx) * 100}%` }} className={`w-1.5 rounded-sm ${v >= mx * 0.9 ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
                ))}
            </div>
        );
    };

    // If user is logged in show dashboard
    if (isLoggedIn) {
        const recentCourses = dashboard?.recentCourses || [];
        const recentSub = submissions.slice().sort((a,b)=> new Date(b.attemptedAt) - new Date(a.attemptedAt)).slice(0,6);
        const totalCourses = dashboard?.totalCourses ?? courses?.length ?? 0;
        const completed = dashboard?.completedCourses ?? 0;
        const completedPercent = totalCourses > 0 ? Math.round((completed / totalCourses) * 100) : 0;
        const completedFinal = completedPercent > 100 ? 100 : completedPercent;
        const timeSpent = dashboard?.totalTimeSpent ?? 0;

        return (
            <HomeLayout>
                <div className="min-h-screen py-12">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex items-center justify-between gap-6 mb-8">
                            <div className="space-y-1">
                                <h2 className="text-3xl font-bold text-white">Welcome back, {auth.fullName?.split(' ')[0] || auth.email} 👋</h2>
                                <p className="text-gray-400">Quick overview of your learning — jump back in or try a quiz.</p>
                            </div>
                            <div className="flex gap-3">
                                <Link to="/profile" className="px-4 py-2 rounded-lg bg-gray-800/50 text-white">Profile</Link>
                                <Link to="/courses" className="px-4 py-2 rounded-lg bg-yellow-500 text-black">Browse Courses</Link>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50">
                                <div className="text-sm text-gray-300">Enrolled Courses</div>
                                <div className="text-3xl font-bold text-white mt-2">{totalCourses}</div>
                                <div className="text-xs text-gray-400 mt-3">Continue where you left off</div>
                                <div className="mt-4 flex gap-2">
                                    {recentCourses.slice(0,3).map((c) => (
                                        <button key={c._id} onClick={() => window.location.href = `/course/${c.courseId.title}/${c.courseId._id}/lectures`} className="text-xs px-3 py-1 bg-gray-700/60 rounded-full text-white">{c.courseId.title.slice(0,18)}</button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50">
                                <div className="text-sm text-gray-300">Learning Progress</div>
                                <div className="flex items-baseline justify-between gap-6 mt-2">
                                    <div>
                                        <div className="text-3xl font-bold text-white">{completedFinal}%</div>
                                        <div className="text-xs text-gray-400">Completed</div>
                                    </div>
                                    <div className="text-sm text-gray-400">Total time</div>
                                    <div className="text-2xl font-semibold text-white">{timeSpent}m</div>
                                </div>
                                <div className="mt-4 w-full bg-gray-800/60 rounded-full h-3 border border-gray-700/50">
                                    <div style={{ width: `${completedFinal}%` }} className="h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500"></div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50">
                                <div className="text-sm text-gray-300">Recent Activity</div>
                                <div className="mt-3 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-300">Quiz attempts</div>
                                        <div className="text-sm text-white font-bold">{submissions.length}</div>
                                    </div>
                                    <Spark values={recentSub.map(s => s.score || 0)} />
                                    <div className="mt-4 flex gap-2">
                                        <button onClick={() => window.location.href = '/profile/submissions'} className="px-4 py-2 rounded-lg bg-blue-600 text-white">My Submissions</button>
                                        <button onClick={() => window.location.href = '/courses'} className="px-4 py-2 rounded-lg bg-yellow-500 text-black">Find Course</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent quizzes + submissions */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-gray-700/50">
                                <h3 className="text-xl text-white font-semibold mb-3">Recent courses you're on</h3>
                                <div className="space-y-3">
                                    {recentCourses.length ? recentCourses.map(rc => (
                                        <div key={rc._id} className="flex items-center justify-between gap-3 p-3 bg-gray-900/40 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <img src={rc.courseId.thumbnail.secure_url} className="w-12 h-12 rounded-md object-cover" alt="" />
                                                <div>
                                                    <div className="text-sm text-white font-semibold">{rc.courseId.title}</div>
                                                    <div className="text-xs text-gray-400">{rc.totalProgress}% complete</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => window.location.href = `/course/${rc.courseId.title}/${rc.courseId._id}/lectures`} className="px-3 py-1 rounded-md bg-yellow-500 text-black text-sm">Continue</button>
                                            </div>
                                        </div>
                                    )) : <div className="text-gray-300">No recent courses</div>}
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-gray-700/50">
                                <h3 className="text-xl text-white font-semibold mb-3">Recent quiz attempts</h3>
                                <div className="space-y-3">
                                    {recentSub.length ? recentSub.map(s => (
                                        <div key={s._id} className="flex items-center justify-between gap-3 p-3 bg-gray-900/40 rounded-lg">
                                            <div>
                                                <div className="text-sm text-white font-semibold">{s.quizId?.title || `Quiz ${String(s.quizId || '').slice(0,6)}`}</div>
                                                <div className="text-xs text-gray-400">Score: {s.score}/{s.totalQuestions} • {s.attemptedAt ? new Date(s.attemptedAt).toLocaleString() : '-'}</div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => window.location.href = `/course/${name || '-'}/${s.courseId}/quizes/${s.quizId}/take`} className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm">Retake</button>
                                                <button onClick={() => window.location.href = `/profile/submissions/${s._id}`} className="px-3 py-1 rounded-md bg-gray-700/60 text-white text-sm">View</button>
                                            </div>
                                        </div>
                                    )) : <div className="text-gray-300">No recent quiz attempts</div>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </HomeLayout>
        )
    }
    return (
        <HomeLayout>
            <div className="relative min-h-screen py-10">
                <Particle option={option1} className="absolute inset-0 opacity-20" />
                <div className="relative z-10 flex lg:px-12 px-6 pb-8 lg:pb-0 flex-col lg:flex-row justify-center items-center min-h-screen">
                    <div className="lg:px-4 md:px-4 space-y-8 lg:w-1/2 max-w-2xl">
                        {/* Badge */}
                        <div className="inline-flex items-center px-4 py-2 bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-full">
                            <FaStar className="text-yellow-500 mr-2 text-sm" />
                            <span className="text-yellow-400 text-sm font-medium">Premium Online Education Platform</span>
                        </div>

                        {/* Main Heading */}
                        <h1 className="lg:text-7xl text-4xl text-white font-bold leading-tight">
                            Master New Skills with 
                            <span className="text-yellow-500 block lg:inline"> Expert-Led Courses</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-gray-300 lg:text-xl text-lg leading-relaxed">
                            Join thousands of learners advancing their careers through our comprehensive, 
                            industry-relevant courses designed by professionals.
                        </p>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-6 py-4">
                            <div className="flex items-center gap-2">
                                <FaUsers className="text-yellow-500 text-xl" />
                                <div>
                                    <p className="text-white font-bold text-lg">15,000+</p>
                                    <p className="text-gray-400 text-sm">Active Students</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <FaGraduationCap className="text-yellow-500 text-xl" />
                                <div>
                                    <p className="text-white font-bold text-lg">500+</p>
                                    <p className="text-gray-400 text-sm">Expert Courses</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <FaStar className="text-yellow-500 text-xl" />
                                <div>
                                    <p className="text-white font-bold text-lg">4.8/5</p>
                                    <p className="text-gray-400 text-sm">Student Rating</p>
                                </div>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex gap-6 lg:flex-row md:flex-row flex-col items-center pt-4">
                            <Link to={'/courses'} className="w-full lg:w-fit">
                                <button className="w-full lg:w-52 py-4 px-6 lg:text-lg font-semibold bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl transition-all duration-300 shadow-xl hover:shadow-yellow-500/30 flex items-center justify-center gap-3">
                                    <FaPlay className="text-sm" />
                                    Start Learning 
                                </button>
                            </Link>
                            <Link to={'/contact'} className="w-full lg:w-fit">
                                <button className="w-full lg:w-52 py-4 px-6 lg:text-lg font-semibold bg-transparent text-white border-2 border-yellow-500/50 hover:border-yellow-400 hover:bg-yellow-500/10 backdrop-blur-sm rounded-xl transition-all duration-300">
                                    Get Free Demo
                                </button>
                            </Link>
                        </div>

                        {/* Trust Indicators */}
                        <div className="flex items-center gap-4 pt-6">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-3 border-gray-800 bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center text-black font-bold text-xs">
                                        {String.fromCharCode(64 + i)}
                                    </div>
                                ))}
                            </div>
                            <div>
                                <p className="text-gray-300 text-sm">Join <span className="text-yellow-400 font-bold">15,000+</span> successful learners</p>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <FaStar key={i} className="text-yellow-400 text-xs" />
                                    ))}
                                    <span className="text-gray-400 text-xs ml-1">4.9 out of 5</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Image Section */}
                    <div className="lg:w-1/2 flex justify-center items-center relative mt-10 lg:mt-0">
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-400/10 to-transparent rounded-3xl blur-3xl"></div>
                        <div className="relative bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50">
                            <img 
                                src={HomeImage} 
                                alt="Online Learning Platform" 
                                className="w-full h-auto object-contain drop-shadow-2xl" 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </HomeLayout>
    )
}

export default HomePage
