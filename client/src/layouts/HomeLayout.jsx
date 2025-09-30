import Cookies from 'js-cookie'
import { FiMenu } from 'react-icons/fi'
import { FaRobot, FaComments } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useLocation } from 'react-router-dom'

import Footer from '../components/Footer'
import { logout } from '../redux/slices/AuthSlice';

function HomeLayout({ children }) {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const isLoggedIn = useSelector((state) => state?.auth?.isLoggedIn);
    const role = useSelector((state) => state?.auth?.role);
    const avatar = useSelector((state) => state?.auth?.data?.avatar?.secure_url)
    const name = useSelector((state) => state?.auth?.data?.name)
    const firstName = name ? name.split(' ')[0] : '';
    
    // Don't show the chatbot icon on the chat page itself
    const isOnChatPage = location.pathname === '/chat';
    
    async function onLogout() {
        await dispatch(logout())
        Cookies.remove('authToken')
    }

    const handleChatNavigation = () => {
        if (isLoggedIn) {
            navigate('/chat');
        } else {
            navigate('/login');
        }
    };

    return (
        <div className='relative'>
            <div className="drawer bg-gradient-to-tr from-gray-900  to-gray-800">
                <label htmlFor="my-drawer-2"></label>
                <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
                <div className="p-5">
                    <label htmlFor="my-drawer-2" className="drawer-button cursor-pointer">
                        <FiMenu size={"30px"} />
                    </label>
                </div>
                <div className="drawer-side z-50">
                    <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
                    <ul className="menu p-4 pt-12 gap-8 w-60 lg:w-80 min-h-full bg-base-200 text-base-content text-xl">
                        {
                            isLoggedIn && (
                                <div className='rounded-full flex gap-4 items-center px-4 w-full'>
                                    <img src={avatar} alt="profile photo" className='w-12 h-12 rounded-full' />
                                    <p className='text-yellow-400 italic'>hello <br /> <span className='font-semibold capitalize text-white'>{firstName}</span></p>
                                </div>
                            )
                        }
                        {isLoggedIn && role === 'ADMIN' && (
                            <li><Link to={'/admin/dashboard'}>Admin DashBoard</Link></li>
                        )}
                        <li><Link to={'/'}>Home</Link></li>
                        <li><Link to={'/courses'}>All Courses</Link></li>
                        <li><Link to={'/contact'}>Contact Us</Link></li>
                        <li><Link to={'/about'}>About Us</Link></li>
                        {!isLoggedIn && (
                            <div className='w-full absolute bottom-12 px-4 left-0 flex flex-col gap-4 justify-center items-center'>
                                <Link to={'/login'} className='w-full'>
                                    <button className='btn-primary py-2 w-full font-semibold rounded-md '>
                                        LogIn
                                    </button>
                                </Link>
                                <Link to={'/signup'} className='w-full'>
                                    <button className='btn-secondary py-2 w-full font-semibold rounded-md '>
                                        SignUp
                                    </button>
                                </Link>
                            </div>
                        )}
                        {isLoggedIn && (
                            <>
                                <li>
                                    <Link to={'/chat'} className='w-full'>
                                        Chat
                                    </Link>
                                </li>
                                <li>
                                    <Link to={'/profile'} className='w-full'>
                                        Profile
                                    </Link>
                                </li>
                                <div onClick={onLogout} className='w-full absolute bottom-12 left-0 px-4'>
                                    <button className='btn-secondary py-2 w-full font-semibold rounded-md '>
                                        LogOut
                                    </button>
                                </div>
                            </>
                        )}
                    </ul>
                </div>
            </div>
            
            {children}
            
            {/* Floating Chatbot Icon */}
            {!isOnChatPage && (
                <div className="fixed bottom-16 right-16 z-40">
                    <button
                        onClick={handleChatNavigation}
                        className="group relative bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black p-4 rounded-full shadow-2xl hover:shadow-yellow-500/30 transition-all duration-300 transform hover:scale-110 active:scale-95"
                    >
                        {/* Pulse Animation */}
                        <div className="absolute inset-0 bg-yellow-500 rounded-full animate-ping opacity-20"></div>
                        
                        {/* Main Icon */}
                        <div className="relative">
                            <FaRobot className="text-4xl text-yellow-800 hover:text-yellow-950" />
                        </div>
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full right-0 mb-3 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap border border-gray-600/50 backdrop-blur-sm">
                            {isLoggedIn ? 'Chat with AI Tutor' : 'Login to Chat'}
                            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                        </div>
                        
                        {/* Notification Badge (optional - you can add unread count here) */}
                        {isLoggedIn && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                        )}
                    </button>
                    
                    {/* Alternative floating chat bubble design */}
                    {/* Uncomment this section if you prefer a chat bubble style
                    <div className="relative">
                        <button
                            onClick={handleChatNavigation}
                            className="group bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black px-4 py-3 rounded-full shadow-2xl hover:shadow-yellow-500/30 transition-all duration-300 flex items-center gap-2"
                        >
                            <FaComments className="text-xl" />
                            <span className="font-semibold text-sm">Ask AI</span>
                        </button>
                        
                        <div className="absolute bottom-full right-0 mb-3 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                            {isLoggedIn ? 'Get instant help from our AI tutor' : 'Login to access AI chat'}
                        </div>
                    </div>
                    */}
                </div>
            )}
            
            <Footer />
        </div>
    )
}

export default HomeLayout