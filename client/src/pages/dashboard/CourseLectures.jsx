import { useEffect, useState } from "react";
import { FaArrowLeft, FaPlay, FaPause, FaBookOpen, FaClock, FaUsers } from "react-icons/fa";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import Switch from "react-switch";

import Footer from '../../components/Footer'
import { deleteLecture, getLectures } from "../../redux/slices/LectureSlice";

function CourseLectures() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { state } = useLocation();
    const { lectures } = useSelector((state) => state.lecture);
    const [currentVideo, setCurrentVideo] = useState(0);
    const [autoPlay, setAutoPlay] = useState(localStorage.getItem("autoPlay") === "true");
    const { role } = useSelector((state) => state.auth);

    const handleVideoEnded = () => {
        if (autoPlay && currentVideo < lectures.length - 1) {
            setCurrentVideo(currentVideo + 1);
        }
    };

    const toggleAutoPlay = () => {
        const newValue = !autoPlay;
        setAutoPlay(newValue);
        localStorage.setItem("autoPlay", newValue.toString());
    };

    async function fetchData() {
        await dispatch(getLectures(state?._id));
    }

    async function deleteHandle(cid, lectureId) {
        const data = { cid, lectureId };
        const res = await dispatch(deleteLecture(data));
        if (res?.payload?.success) {
            if (lectures) {
                setCurrentVideo(0)
            }
        }
    }

    function handleClick(idx) {
        setCurrentVideo(idx)
    }

    const splitParagraph = (paragraph) => {
        if (!paragraph) return null;
        const sentences = paragraph.split('.');
        return (
            <ul className="space-y-3">
                {sentences.filter(sentence => sentence.trim()).map((sentence, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-300">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="capitalize leading-relaxed">{sentence.trim()}</span>
                    </li>
                ))}
            </ul>
        );
    }

    useEffect(() => {
        if (!state) {
            navigate("/courses");
        } else {
            fetchData();
        }
    }, []);

    useEffect(() => {
        if (lectures && currentVideo !== undefined) {
            document.title = `${lectures[currentVideo]?.title} - Learning Management System`;
        }
    }, [lectures, currentVideo]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {lectures?.length > 0 ? (
                <div className="flex lg:flex-row flex-col min-h-screen">
                    {/* Main Video Section */}
                    <div className="lg:w-[70%] flex flex-col">
                        {/* Header Bar */}
                        <div className="bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-sm border-b border-gray-700/50 px-6 py-4 sticky top-0 z-20">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-6">
                                    <button 
                                        onClick={() => navigate(-1)}
                                        className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors duration-300 bg-gray-800/50 px-4 py-2 rounded-lg"
                                    >
                                        <FaArrowLeft className="text-lg" />
                                        <span className="hidden md:block">Back</span>
                                    </button>
                                    <div>
                                        <p className="text-white font-semibold">
                                            {lectures[currentVideo]?.title}
                                        </p>
                                        <p className="text-gray-400 text-sm">
                                            Lecture {currentVideo + 1} of {lectures.length}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <span className="text-white text-sm font-medium hidden md:block">Autoplay</span>
                                    <Switch
                                        onChange={toggleAutoPlay}
                                        checked={autoPlay}
                                        height={24}
                                        width={48}
                                        uncheckedIcon={false}
                                        checkedIcon={false}
                                        onColor="#eab308"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Video Player */}
                        <div className="flex-1 p-6">
                            <div className="mb-8">
                                <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
                                    {lectures.length > 0 && currentVideo !== undefined && (
                                        <video 
                                            key={lectures[currentVideo]?.lecture?.secure_url} 
                                            controls 
                                            autoPlay={autoPlay} 
                                            controlsList="nodownload" 
                                            disablePictureInPicture 
                                            onEnded={handleVideoEnded} 
                                            className="w-full aspect-video object-cover"
                                        >
                                            <source src={lectures[currentVideo]?.lecture?.secure_url} type="video/mp4" />
                                        </video>
                                    )}
                                </div>
                            </div>

                            {/* Course Overview */}
                            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <FaBookOpen className="text-yellow-500 text-xl" />
                                    <h2 className="text-white font-bold text-2xl">Overview</h2>
                                </div>
                                {splitParagraph(lectures[currentVideo]?.description)}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:w-[30%] bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-sm border-l border-gray-700/50">
                        {/* Course Header */}
                        <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-black p-6 sticky top-0 z-10">
                            <h1 className="font-bold text-xl capitalize text-center">
                                {state?.title}
                            </h1>
                            <div className="flex justify-center items-center gap-4 mt-3">
                                <div className="flex items-center gap-1 text-sm">
                                    <FaPlay className="text-xs" />
                                    <span>{lectures.length} lectures</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm">
                                    <FaClock className="text-xs" />
                                    <span>~{lectures.length * 15}min</span>
                                </div>
                            </div>
                        </div>

                        {/* Add Lecture Button */}
                        {role === "ADMIN" && (
                            <div className="p-4 border-b border-gray-700/50">
                                <button 
                                    onClick={() => navigate(`/course/${state?.title}/${state?._id}/lectures/addlecture`, { state: state })}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-green-400 hover:from-green-400 hover:to-green-300 text-white rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    <FiPlus className="text-lg" />
                                    Add New Lecture
                                </button>
                            </div>
                        )}

                        {/* Lectures List */}
                        <div className="flex-1 overflow-y-auto max-h-[calc(100vh-200px)]">
                            <div className="p-4 space-y-3">
                                {lectures.map((lecture, idx) => (
                                    <div 
                                        key={lecture._id}
                                        className={`group relative bg-gradient-to-r ${
                                            idx === currentVideo 
                                                ? 'from-yellow-500/20 to-yellow-400/20 border-yellow-500/50' 
                                                : 'from-gray-800/40 to-gray-900/40 border-gray-700/50 hover:border-gray-600/50'
                                        } backdrop-blur-sm border rounded-xl p-4 cursor-pointer transition-all duration-300`}
                                        onClick={() => handleClick(idx)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                    idx === currentVideo ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-white'
                                                }`}>
                                                    <span className="text-xs font-bold">{idx + 1}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className={`font-semibold capitalize ${
                                                        idx === currentVideo ? 'text-yellow-400' : 'text-white'
                                                    } group-hover:text-yellow-400 transition-colors duration-300`}>
                                                        {lecture?.title}
                                                    </h3>
                                                    <p className="text-gray-400 text-sm">
                                                        Lecture {idx + 1}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {role === "ADMIN" && (
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/course/${state?.title}/${state?._id}/lectures/editlecture`, { state: lectures[idx] });
                                                        }}
                                                        className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors duration-300"
                                                    >
                                                        <FiEdit className="text-sm" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteHandle(state?._id, lecture?._id);
                                                        }}
                                                        className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors duration-300"
                                                    >
                                                        <FiTrash2 className="text-sm" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="min-h-screen flex flex-col items-center justify-center px-6">
                    <div className="text-center bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-12 max-w-md">
                        <FaBookOpen className="text-6xl text-gray-600 mx-auto mb-6" />
                        <h1 className="font-bold text-3xl text-white mb-4 capitalize">
                            {state?.title}
                        </h1>
                        <p className="text-gray-400 mb-8">
                            No lectures available yet. Start building your course content.
                        </p>
                        {role === "ADMIN" && (
                            <button 
                                onClick={() => navigate(`/course/${state?.title}/${state?._id}/lectures/addlecture`, { state: state })}
                                className="py-3 px-6 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 mx-auto"
                            >
                                <FiPlus className="text-lg" />
                                Add First Lecture
                            </button>
                        )}
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
}

export default CourseLectures;
