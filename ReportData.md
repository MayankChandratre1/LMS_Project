# Learning Management System — Project Report

## Abstract
The Learning Management System (LMS) is a full-featured web application designed to provide a seamless online learning experience. Developed using the MERN stack with Tailwind CSS and DaisyUI for styling, the platform enables users to access a variety of courses, participate in engaging lectures, and manage subscriptions securely. With robust authentication, media handling via Cloudinary, and subscription management through Razorpay, the LMS meets the needs of learners, educators, and administrators.

## Technologies Used
(As referenced from the package.json files)
- **Backend**: Node.js, Express.js, MongoDB (via Mongoose), Razorpay, Cloudinary, bcryptjs, jsonwebtoken, multer, nodemailer
- **Frontend**: React, Redux Toolkit, Axios, Tailwind CSS, DaisyUI

## Features
(Refer to README.md) TODO: ( Add Screenshots for each feature from deployed app )
- **User Authentication & Authorization**: Sign up, login, logout, profile management with role-based access.
- **Course Management**: Create, edit, delete courses; manage lectures and media uploads.
- **Media Handling**: Upload and manage course media using Cloudinary.
- **Subscription Management**: Purchase and verify subscriptions via Razorpay.
- **Responsive Design**: Modern, interactive UI featuring particle backgrounds and glassmorphism effects.
- **Dashboards**: Separate interfaces for administrators and general users.

## Authentication
(See authMiddleware.js, userController.js, AxiosInstance.js)
- **Client-Side**:  
  - *AxiosInstance.js* configures Axios with a base URL and `withCredentials=true` so that HTTP-only cookies are included in requests.
- **Server-Side**:  
  - *authMiddleware.js* verifies JWT tokens from HTTP-only cookies, ensuring only authenticated users access protected routes, and enforces role-based and subscription-based access.  
  - *userController.js* implements user registration, login, logout, password reset, and profile updates using JWT for secure session management. Upon successful login or signup, a token is generated and sent as an HTTP-only cookie.

## Payments
(See Checkout.jsx, paymentController.js)
- **Client-Side (Checkout.jsx)**:  
  - Initiates subscription purchase by dispatching actions to fetch the Razorpay key and create a subscription bundle.  
  - Opens the Razorpay checkout form with user prefill details. On successful payment, Razorpay returns a payment response which is sent to the server for verification.
- **Server-Side (paymentController.js)**:  
  - Creates Razorpay subscriptions, verifies payment responses by validating the Razorpay signature using a secret key, and updates the user's subscription status upon successful verification.  
  - Manages refund and cancellation processes as necessary.

## Deployment
The application is deployed on Vercel for the frontend, ensuring fast and scalable hosting. The backend is configured to run in a Node.js environment with proper environment variable management (including secure cookies for authentication).

## Conclusion and Future Scope
The project demonstrates a comprehensive LMS solution that effectively integrates user authentication, course management, and secure payment processing. It features a modern, responsive user interface and leverages advanced technologies to deliver a robust educational platform.

### Future Scope and Challenges
- **Future Enhancements**:
  - Incorporate real-time features like live classes and interactive assessments.
  - Expand subscription and pricing models to support multiple tiers and discount options.
  - Enhance reporting and analytical dashboards for instructors and admins.
  - Improve accessibility and add multilingual support (i18n).
- **Challenges**:
  - Ensuring end-to-end security, especially in authentication and payment verification.
  - Managing scalability as user numbers and course content grow.
  - Rigorously testing the platform (unit, integration, and end-to-end) for robustness.
  - Balancing performance with rich interactive UI elements and media content.

This report encapsulates the core design, technology stack, and functional features of the LMS, providing a roadmap for future improvements and scalability.
