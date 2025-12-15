import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'

import About from './pages/About'
import LogIn from './pages/auth/LogIn'
import RequiredAuth from './pages/auth/RequiredAuth'
import SignUp from './pages/auth/SignUp'
import UnprotectedRoute from './pages/auth/UnprotectedRoute'
import Contact from './pages/Contact'
import CourseDescription from './pages/course/CourseDescription'
import CourseList from './pages/course/CourseList'
import CreateCourse from './pages/course/CreateCourse'
import EditCourse from './pages/course/EditCourse'
import AddCourseLecture from './pages/dashboard/AddCourseLecture'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import CourseLectures from './pages/dashboard/CourseLectures'
import EditCourseLecture from './pages/dashboard/EditCourseLecture'
import HomePage from './pages/HomePage'
import NotFound from './pages/NotFound'
import ChangePassword from './pages/password/ChangePassword'
import ResetPassword from './pages/password/ResetPassword'
import Checkout from './pages/payments/Checkout'
import CheckoutFail from './pages/payments/CheckoutFail'
import CheckoutSuccess from './pages/payments/CheckoutSuccess'
import Profile from './pages/user/Profile'
import Chat from './pages/chat/Chat'
import CreateQuiz from './pages/quiz/CreateQuiz'
import UpdateQuiz from './pages/quiz/UpdateQuiz'
import QuizList from './pages/quiz/QuizList'
import QuizPerCourse from './pages/quiz/user/QuizPerCourse'
import TakeQuiz from './pages/quiz/user/TakeQuiz'
import MySubmissions from './pages/quiz/user/MySubmissions'
import SubmissionsByQuiz from './pages/quiz/user/SubmissionsByQuiz'
import SubmissionDetails from './pages/quiz/user/SubmissionDetails'
import ForumPage from './pages/forum/ForumPage'
import MyThreads from './pages/forum/MyThreads'
import AddNewThread from './pages/forum/AddNewThread'
import ThreadDetails from './pages/forum/ThreadDetails'

function App() {
  const location = useLocation();
  useEffect(() => {
    const setTitle = () => {
      const path = location.pathname;
      if (path === '/') {
        document.title = 'Learning Management System';
      }
      else if (path === '/about') {
        document.title = 'About - Learning Management System';
      } else if (path === '/contact') {
        document.title = 'Contact - Learning Management System';
      } else if (path === '/signup') {
        document.title = 'Sign Up - Learning Management System';
      } else if (path === '/login') {
        document.title = 'Log In - Learning Management System';
      } else if (path === '/courses') {
        document.title = 'All courses - Learning Management System';
      } else if (path === '/course/description') {
        document.title = 'Course description - Learning Management System';
      } else if (path === '/course/create') {
        document.title = 'Create course - Learning Management System';
      } else if (path === '/admin/dashboard') {
        document.title = 'Admin dashboard - Learning Management System';
      } else if (path === '/profile') {
        document.title = 'Profile - Learning Management System';
      } else if (path === '/profile/changePassword') {
        document.title = 'Change Password - Learning Management System';
      } else if (path === '/forum') {
        document.title = 'Forum - Learning Management System';
      } else if (path === '/forum/my-threads') {
        document.title = 'My Threads - Learning Management System';
      } else if (path === '/forum/new') {
        document.title = 'Create Thread - Learning Management System';
      } else if (path.startsWith('/forum/thread/')) {
        document.title = 'Thread Details - Learning Management System';
      } else if (path === '/chat') {
        document.title = 'AI Chat - Learning Management System';
      }
    };

    setTitle();
  }, [location.pathname]);

  return (
    <>
      <Routes>
        <Route path='*' element={<NotFound />} />

        <Route path='/' element={<HomePage />} />

        <Route element={<UnprotectedRoute />}>
          <Route path='/signup' element={<SignUp />} />
          <Route path='/login' element={<LogIn />} />
        </Route>

        <Route path='/reset-password/:resetToken' element={<ResetPassword />} />

        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />

        <Route path='/courses' element={<CourseList />} />
        <Route path='/course/description' element={<CourseDescription />} />
        
        {/* Forum Routes - Public access */}
        <Route path='/forum' element={<ForumPage />} />
        <Route path='/forum/thread/:id' element={<ThreadDetails />} />
        
        <Route element={<RequiredAuth allowedRole={["ADMIN"]} />}>
          <Route path='/course/create' element={<CreateCourse />} />
          <Route path='/course/:name/:id/editCourse' element={<EditCourse />} />
          <Route path='/course/:name/:id/lectures/addlecture' element={<AddCourseLecture />} />
          <Route path='/course/:name/:id/lectures/editlecture' element={<EditCourseLecture />} />
          <Route path='/course/:name/:id/quizes' element={<QuizList />} />
          <Route path='/course/:name/:id/quizes/add' element={<CreateQuiz />} />
          <Route path='/admin/:name/:courseId/quizes/:quizId' element={<UpdateQuiz />} />
          <Route path='/admin/dashboard' element={<AdminDashboard />} />
        </Route>
        
        <Route element={<RequiredAuth allowedRole={["ADMIN", "USER"]} />}>
          <Route path='/profile' element={<Profile />} />
          <Route path='/profile/changePassword' element={<ChangePassword />} />
          <Route path='/course/:name/checkout' element={<Checkout />} />
          <Route path='/course/:name/checkout/success' element={<CheckoutSuccess />} />
          <Route path='/course/:name/checkout/fail' element={<CheckoutFail />} />
          <Route path='/course/:name/:id/lectures' element={<CourseLectures />} />
          <Route path='/course/:name/:id/quizes/view' element={<QuizPerCourse />} />
          <Route path='/course/:name/:id/quizes/:quizId/take' element={<TakeQuiz />} />
          <Route path='/profile/submissions' element={<MySubmissions />} />
          <Route path='/profile/submissions/quiz/:quizId' element={<SubmissionsByQuiz />} />
          <Route path='/profile/submissions/:submissionId' element={<SubmissionDetails />} />
          <Route path='/chat' element={<Chat />} />
          
          {/* Forum Routes - Authenticated users */}
          <Route path='/forum/my-threads' element={<MyThreads />} />
          <Route path='/forum/new' element={<AddNewThread />} />
        </Route>
      </Routes>
    </>
  )
}

export default App